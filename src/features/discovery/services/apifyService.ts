import { supabase } from '../../../lib/supabaseClient';

export interface DiscoveredJob {
  id: string;
  title: string;
  company_name: string;
  location: string;
  url: string;
  description: string;
  posted_at: string;
  source: 'linkedin' | 'indeed';
}

export const apifyService = {
  /**
   * Search jobs using Apify (Real Implementation)
   */
  async searchJobs(query: string, location: string, daysAgo: number): Promise<DiscoveredJob[]> {

    try {
      return await this.fetchLinkedIn(query, location, daysAgo);
    } catch (err: any) {
      console.warn("[apifyService] LinkedIn scraper failed, falling back to Indeed...", err.message);
      
      try {
        return await this.fetchIndeed(query, location, daysAgo);
      } catch (fallbackErr: any) {
        console.error("[apifyService] Both sources failed.");
        throw new Error("The discovery service is currently unavailable. Please try again later or add jobs manually to your pipeline.");
      }
    }
  },

  /**
   * Primary Source: LinkedIn Scraper
   */
  async fetchLinkedIn(query: string, location: string, daysAgo: number): Promise<DiscoveredJob[]> {
    const actorId = import.meta.env.VITE_APIFY_ACTOR_ID || 'get-leads/linkedin-scraper';
    const seconds = daysAgo * 24 * 60 * 60;
    const timeFilter = `r${seconds}`;

    const input = actorId.includes('get-leads') 
      ? { mode: "jobs", searchQuery: query, location: location, limit: 10, f_TPR: timeFilter }
      : { keyword: query, location: location, f_TPR: timeFilter, limit: 10 };

    const { data, error } = await supabase.functions.invoke('apify-proxy', {
      body: { 
        action: 'run-sync', 
        actorId, 
        input 
      }
    });

    if (error || !data) {
      throw new Error(`LinkedIn Proxy Error: ${error?.message || 'No data returned'}`);
    }

    const items = data;

    return items.map((item: any, index: number) => ({
      id: item.id || item.url || `linkedin-${index}`,
      title: item.title || item.position || 'Unknown Title',
      company_name: item.company || item.companyName || 'Unknown Company',
      location: item.location || 'Remote',
      url: item.url || item.jobUrl || '',
      description: item.description || item.jobDescription || 'No description provided.',
      posted_at: item.postedAt || item.publishedAt || new Date().toISOString(),
      source: 'linkedin',
    }));
  },

  /**
   * Fallback Source: Indeed Scraper
   */
  async fetchIndeed(query: string, location: string, daysAgo: number): Promise<DiscoveredJob[]> {
    // We use a popular Indeed scraper on Apify as the fallback
    const actorId = 'mishtr~indeed-scraper'; 

    // mishtr/indeed-scraper schema maps dates differently
    let postedAtFilter = "last_7_days";
    if (daysAgo <= 1) postedAtFilter = "last_24_hours";
    else if (daysAgo <= 3) postedAtFilter = "last_3_days";
    else if (daysAgo <= 7) postedAtFilter = "last_7_days";
    else postedAtFilter = "last_14_days";

    const input = {
      position: query,
      location: location,
      maxItems: 10,
      postedAt: postedAtFilter
    };

    const { data, error } = await supabase.functions.invoke('apify-proxy', {
      body: { 
        action: 'run-sync', 
        actorId, 
        input 
      }
    });

    if (error || !data) {
      throw new Error(`Indeed Proxy Error: ${error?.message || 'No data returned'}`);
    }

    const items = data;
    return items.map((item: any, index: number) => this.mapIndeedItem(item, index));
  },

  /**
   * Scrape a single Job URL (LinkedIn or Indeed)
   */
  /**
   * Normalize LinkedIn/Indeed URLs to canonical forms
   */
  normalizeJobUrl(url: string): string {
    if (url.includes('linkedin.com')) {
      try {
        const urlObj = new URL(url);
        const jobId = urlObj.searchParams.get('currentJobId');
        if (jobId) return `https://www.linkedin.com/jobs/view/${jobId}/`;
      } catch (e) {}
      
      const viewMatch = url.match(/\/jobs\/view\/(\d+)/);
      if (viewMatch) return `https://www.linkedin.com/jobs/view/${viewMatch[1]}/`;
    }
    
    if (url.includes('indeed.com')) {
      try {
        const urlObj = new URL(url);
        const jk = urlObj.searchParams.get('jk');
        if (jk) return `https://www.indeed.com/viewjob?jk=${jk}`;
      } catch (e) {}
    }

    return url.split('?')[0]; 
  },

  /**
   * Extract Title/Company from URL slug (0ms wait)
   */
  parseJobDetailsFromUrl(url: string): { title?: string, company?: string } {
    const details: { title?: string, company?: string } = {};
    
    if (url.includes('linkedin.com')) {
      const slug = url.split('/view/')[1] || url.split('/jobs/')[1] || "";
      const cleanSlug = slug.split('?')[0].split('/')[0];
      const parts = cleanSlug.split('-');
      
      const atIndex = parts.indexOf('at');
      if (atIndex > 0) {
        details.title = parts.slice(0, atIndex).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        details.company = parts.slice(atIndex + 1).filter(p => !/^\d+$/.test(p)).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      } else if (parts.length > 2) {
        // Fallback for slugs like 'software-engineer-google'
        details.title = parts.slice(0, -1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        details.company = parts.slice(-1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      }
    }

    if (url.includes('indeed.com')) {
      const slug = url.split('/rc/clk?')[1] || url.split('/viewjob?')[1] || "";
      // Indeed URLs often don't have titles in the slug, so we rely more on the Web Peek here
      if (slug.includes('jk=')) {
        // No title in Indeed slug usually, but we keep the structure
      }
    }

    return details;
  },

  /**
   * Search the web for a URL to peek at its title/metadata
   */
  async peekUrlMetadata(url: string): Promise<{ title?: string, company?: string }> {
    
    // First, try a Zero-Cost Direct Fetch (if allowed by CORS/Target)
    try {
      const direct = await this.directFetchMetadata(url);
      if (direct.title) return direct;
    } catch (e) {
    }

    // Fallback to Google Search Peek (Apify)
    let query = url;
    if (url.includes('linkedin.com/jobs/view/')) {
      const id = url.split('/view/')[1]?.split('/')[0]?.split('?')[0];
      if (id) query = `site:linkedin.com/jobs/view/ ${id}`;
    }

    const actorId = 'apify~google-search-scraper';
    const input = { queries: query, maxPagesPerQuery: 1, resultsPerPage: 1 };

    try {
      const results = await this.runActorAndGetResults(actorId, input);
      if (results && results[0]?.organicResults?.[0]) {
        const fullTitle = results[0].organicResults[0].title || "";
        return this.parseTitleFromSnippet(fullTitle);
      }
    } catch (e) {
      console.warn("Web peek failed", e);
    }
    return {};
  },

  async directFetchMetadata(url: string): Promise<{ title?: string, company?: string }> {
    // Note: This will only work if the target has no CORS or we are in a permissive environment
    // In a browser, this is limited, but we try anyway.
    try {
      await fetch(url, { method: 'GET', mode: 'no-cors' });
      // With no-cors, we can't read the body. So this is mostly for future-proofing or proxy use.
      // For now, we return empty to trigger the search peek.
      return {};
    } catch (e) {
      return {};
    }
  },

  parseTitleFromSnippet(fullTitle: string): { title?: string, company?: string } {

    // Pattern 1: "Job Title at Company | LinkedIn"
    if (fullTitle.includes(' at ') && fullTitle.includes('|')) {
      const mainPart = fullTitle.split('|')[0];
      const [title, company] = mainPart.split(' at ');
      return { title: title.trim(), company: company.trim() };
    }

    // Pattern 2: "Company hiring Job Title in Location..."
    if (fullTitle.toLowerCase().includes(' hiring ')) {
      const parts = fullTitle.split(/ hiring /i);
      const company = parts[0].trim();
      const title = parts[1].split(' in ')[0].split('|')[0].trim();
      return { title, company };
    }

    // Pattern 3: Generic Split "Title - Company"
    const parts = fullTitle.split(' | ')[0].split(' - ');
    return {
      title: parts[0]?.trim(),
      company: parts[1]?.trim() || "Unknown Company"
    };
  },

  async scrapeJobUrl(url: string): Promise<DiscoveredJob> {
    const cleanUrl = this.normalizeJobUrl(url);

    try {
      if (cleanUrl.includes('linkedin.com')) {
        return await this.scrapeSingleLinkedIn(cleanUrl);
      } else if (cleanUrl.includes('indeed.com')) {
        return await this.scrapeSingleIndeed(cleanUrl);
      }
    } catch (err) {
      console.warn("[apifyService] Direct scrape failed/timed out. Falling back to modal.", err);
      throw new Error("LinkedIn is taking too long to respond. Please fill in the title and company manually—we've saved the link for you!");
    }
    throw new Error("Unsupported URL");
  },

  async scrapeSingleLinkedIn(url: string): Promise<DiscoveredJob> {
    const primaryActor = 'curious_coder~linkedin-jobs-scraper';
    const secondaryActor = 'pro_scraper~linkedin-jobs-detail-scraper'; // Fallback
    
    try {
      const input = { urls: [url], maxItems: 1 };
      const items = await this.runActorAndGetResults(primaryActor, input);
      if (items && items.length > 0) return this.mapLinkedInItem(items[0], 0);
    } catch (e) {
      console.warn("[apifyService] Primary LinkedIn scraper failed, trying secondary...", e);
    }

    // Try secondary actor if primary failed
    const secondaryInput = { jobUrls: [url] };
    const secondaryItems = await this.runActorAndGetResults(secondaryActor, secondaryInput);
    if (!secondaryItems || !secondaryItems.length) throw new Error("Could not find job details after two attempts.");
    
    return this.mapLinkedInItem(secondaryItems[0], 0);
  },

  async scrapeSingleIndeed(url: string): Promise<DiscoveredJob> {
    const actorId = 'mishtr~indeed-scraper';
    const input = { startUrls: [{ url }], maxItems: 1 };
    const items = await this.runActorAndGetResults(actorId, input);
    if (!items || !items.length) throw new Error("Could not find job details.");
    return this.mapIndeedItem(items[0], 0);
  },

  async runActorAndGetResults(actorId: string, input: any): Promise<any[]> {
    const { data: runData, error: runError } = await supabase.functions.invoke('apify-proxy', {
      body: { 
        action: 'run-actor', 
        actorId, 
        input 
      }
    });

    if (runError || !runData) {
      throw new Error(`Actor Start Failed: ${runError?.message || 'No data'}`);
    }

    const runId = runData.data.id;
    const defaultDatasetId = runData.data.defaultDatasetId;
    
    // Poll for results (max 3 minutes)
    const startTime = Date.now();
    const timeout = 180000; 
    while (Date.now() - startTime < timeout) {
      const { data: statusData, error: statusError } = await supabase.functions.invoke('apify-proxy', {
        body: { 
          action: 'get-run', 
          input: { runId } 
        }
      });

      if (statusError || !statusData) throw new Error(`Poll Failed: ${statusError?.message}`);
      
      const status = statusData.data.status;
      if (status === 'SUCCEEDED') break;
      if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) throw new Error(`Scraper ${status}`);
      await new Promise(r => setTimeout(r, 3000));
    }

    const { data: itemsData, error: itemsError } = await supabase.functions.invoke('apify-proxy', {
      body: { 
        action: 'get-dataset', 
        input: { datasetId: defaultDatasetId } 
      }
    });

    if (itemsError || !itemsData) throw new Error(`Fetch Dataset Failed: ${itemsError?.message}`);
    return itemsData;
  },

  mapLinkedInItem(item: any, index: number): DiscoveredJob {
    return {
      id: item.id || item.url || `linkedin-${index}`,
      title: item.title || item.position || 'Unknown Title',
      company_name: item.company || item.companyName || 'Unknown Company',
      location: item.location || 'Remote',
      url: item.url || item.jobUrl || '',
      description: item.description || item.jobDescription || 'No description provided.',
      posted_at: item.postedAt || item.publishedAt || new Date().toISOString(),
      source: 'linkedin',
    };
  },

  mapIndeedItem(item: any, index: number): DiscoveredJob {
    return {
      id: item.id || item.url || `indeed-${index}`,
      title: item.positionName || item.title || 'Unknown Title',
      company_name: item.company || 'Unknown Company',
      location: item.location || 'Remote',
      url: item.url || '',
      description: item.description || 'No description provided.',
      posted_at: item.postedAt || new Date().toISOString(),
      source: 'indeed',
    };
  }
};
