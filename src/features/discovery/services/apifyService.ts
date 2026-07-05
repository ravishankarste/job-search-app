import { supabase } from '../../../lib/supabaseClient';
import { jobService } from '../../jobs/services/jobService';

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
        // Handle search pages with active job selection
        const jobId = urlObj.searchParams.get('currentJobId');
        if (jobId) return `https://www.linkedin.com/jobs/view/${jobId}/`;
      } catch (e) {}
      
      // Handle direct view links with slugs
      const viewMatch = url.match(/\/view\/(\d+)/) || url.match(/\/jobs\/view\/(\d+)/);
      if (viewMatch) return `https://www.linkedin.com/jobs/view/${viewMatch[1]}/`;

      // Handle simple /jobs/ID
      const idMatch = url.match(/\/jobs\/(\d+)/);
      if (idMatch) return `https://www.linkedin.com/jobs/view/${idMatch[1]}/`;
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
      // 1. Catch direct job view slugs
      const slugMatch = url.match(/\/view\/([^\/]+)/) || url.match(/\/jobs\/view\/([^\/]+)/) || url.match(/\/jobs\/([^\/]+)/);
      const slug = slugMatch ? slugMatch[1].split('?')[0] : "";
      
      if (slug && !/^\d+$/.test(slug)) {
        // Handle common LinkedIn slug patterns
        const parts = slug.split('-');
        
        // Pattern: "software-engineer-at-google"
        const atIndex = parts.indexOf('at');
        if (atIndex > 0) {
          details.title = parts.slice(0, atIndex).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
          details.company = parts.slice(atIndex + 1).filter(p => !/^\d+$/.test(p)).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        } else if (parts.length > 2) {
          // Pattern: "software-engineer-google-123"
          // Usually the last part is a number ID, the part before is company
          const lastPartIsId = /^\d+$/.test(parts[parts.length - 1]);
          const companyIndex = lastPartIsId ? parts.length - 2 : parts.length - 1;
          
          details.title = parts.slice(0, companyIndex).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
          details.company = parts[companyIndex].charAt(0).toUpperCase() + parts[companyIndex].slice(1);
        }
      }
    }

    if (url.includes('indeed.com') && url.includes('jk=')) {
      // Indeed usually doesn't put titles in URLs, but we can check if it's there
      const parts = url.split('/').filter(p => p.includes('-jobs'));
      if (parts.length > 0) {
        details.title = parts[0].replace('-jobs', '').split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      }
    }

    return details;
  },

  /**
   * High-Speed Metadata Peek (2-4s)
   * Uses a lightweight scraper to grab OG tags if the primary scrape is pending or failing.
   */
  async peekOgMetadata(url: string): Promise<any> {
    const actorId = 'apify~cheerio-scraper'; 
    const input = {
      startUrls: [{ url }],
      maxPagesPerCrawl: 1,
      pageFunction: `async function pageFunction(context) {
        const { $ } = context;
        const publicTitle = $('.top-card-layout__title').text().trim();
        const publicCompany = $('.topcard__org-name-link').text().trim() || $('.topcard__org-name').text().trim();
        const publicLocation = $('.topcard__flavor--bullet').first().text().trim();
        const publicDescription = $('.description__text').text().trim();

        return {
          title: publicTitle || $('meta[property="og:title"]').attr('content') || $('title').text(),
          company: publicCompany,
          location: publicLocation,
          site: $('meta[property="og:site_name"]').attr('content'),
          description: publicDescription || $('meta[property="og:description"]').attr('content')
        };
      }`
    };

    try {
      // Manual Fetch Bypass: Avoids the automatic broken JWT from supabase-js
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/apify-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          action: 'run-sync',
          actorId,
          input
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        let errMsg = `Gateway Error: ${response.status}`;
        
        if (errData.error) {
          if (typeof errData.error === 'object') {
            if (errData.error.type === 'full-permission-actor-not-approved') {
              errMsg = `Apify Actor Authorization Required: Please open ${errData.error.data?.approvalUrl || 'https://console.apify.com'} in your browser to approve permissions for this scraper under your Apify account.`;
            } else {
              errMsg = errData.error.message || JSON.stringify(errData.error);
            }
          } else {
            errMsg = errData.error;
          }
        }
        throw new Error(errMsg);
      }

      const results = await response.json();
      if (results && results[0]) {
        const rawTitle = results[0].title || "";
        const rawSite = results[0].site || "";
        const scrapedCompany = results[0].company;
        
        // 1. Start with our snippet parser (e.g. "Software Engineer at Google | LinkedIn")
        const parsed = this.parseTitleFromSnippet(rawTitle);
        
        // 2. Override with explicitly scraped company if found
        if (scrapedCompany && scrapedCompany !== 'Unknown Company') {
          parsed.company = scrapedCompany;
        } else if (!parsed.company && rawSite && !rawSite.toLowerCase().includes('linkedin')) {
          // 3. Fallback to site_name (e.g. "Netflix Jobs")
          parsed.company = rawSite;
        }
        
        return {
          ...parsed,
          description: results[0].description
        };
      }
    } catch (e) {
      console.warn("[apifyService] OG Peek failed", e);
    }
    return {};
  },

  /**
   * Search the web for a URL to peek at its title/metadata
   */
  async peekUrlMetadata(url: string): Promise<{ title?: string, company?: string }> {
    // 1. Try High-Speed OG Peek First (More reliable than Google snippet)
    const ogData = await this.peekOgMetadata(url);
    if (ogData.title && ogData.company) return ogData;

    // 2. Fallback to Google Search Peek (Apify) - Only if OG fails
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

    // 0. Sovereign Shield: Check Database Cache First (Rule 3)
    try {
      const existingJob = await jobService.findJobByUrl(cleanUrl);
      if (existingJob) {
        console.info("[apifyService] Sovereign Cache Hit. Serving from Vault.");
        return {
          id: existingJob.id,
          title: existingJob.title,
          company_name: existingJob.company_name,
          location: existingJob.location || 'Remote',
          url: existingJob.url || cleanUrl,
          description: existingJob.description || '',
          posted_at: existingJob.created_at || new Date().toISOString(),
          source: (existingJob.url || '').includes('indeed') ? 'indeed' : 'linkedin',
        };
      }
    } catch (e) {
      console.warn("[apifyService] Cache lookup skipped:", e);
    }

    try {
      let job: any = null;

      // 1. Try Direct Scrape First
      if (cleanUrl.includes('linkedin.com')) {
        job = await this.scrapeSingleLinkedIn(cleanUrl).catch(() => null);
      } else if (cleanUrl.includes('indeed.com')) {
        job = await this.scrapeSingleIndeed(cleanUrl).catch(() => null);
      }

      // 2. High-Speed Fallback: Meta-Pulse (Heuristic Recovery)
      if (!job || !job.title || job.title === 'Unknown Title' || !job.description || job.description === 'No description provided.') {
        const meta = await this.peekOgMetadata(cleanUrl);
        
        // Update job with meta data if it was missing
        if (meta.title && meta.title !== 'Unknown Title') {
          job = {
            id: job?.id || cleanUrl,
            title: meta.title,
            company_name: meta.company || 'Unknown Company',
            location: meta.location || job?.location || 'Remote',
            url: cleanUrl,
            description: meta.description || job?.description || 'No description provided.',
            posted_at: job?.posted_at || new Date().toISOString(),
            source: 'linkedin',
          };
        }

        // 3. The Indeed Pivot: If we still have no description, search Indeed for this job
        if (job && job.title && job.company_name && (!job.description || job.description === 'No description provided.')) {
          console.info(`[apifyService] LinkedIn Void confirmed. Pivoting to Indeed for: ${job.title} at ${job.company_name}`);
          try {
            const indeedResults = await this.fetchIndeed(job.title, job.company_name, 30);
            if (indeedResults && indeedResults.length > 0) {
              // Find the best match on Indeed (simplified)
              const match = indeedResults[0]; 
              job.description = match.description;
              job.location = job.location || match.location;
              console.info("[apifyService] Indeed Recovery Successful.");
            }
          } catch (indeedErr) {
            console.warn("[apifyService] Indeed Pivot failed.", indeedErr);
          }
        }
      }

      if (job && job.title && job.title !== 'Unknown Title') return job;
      
    } catch (err) {
      console.warn("[apifyService] Discovery Void detected. Trying URL heuristics...", err);
    }

    // 3. Last Resort: URL Slug Heuristics (Zero Wait)
    const parsed = this.parseJobDetailsFromUrl(cleanUrl);
    if (parsed.title) {
      return {
        id: cleanUrl,
        title: parsed.title,
        company_name: parsed.company || 'Unknown Company',
        location: 'Remote',
        url: cleanUrl,
        description: 'Auto-extracted from URL.',
        posted_at: new Date().toISOString(),
        source: cleanUrl.includes('linkedin.com') ? 'linkedin' : 'indeed',
      };
    }

    throw new Error("LinkedIn is taking too long to respond. Please fill in the title and company manually—we've saved the link for you!");
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
    const url = item.url || item.jobUrl || '';
    
    // 1. Start with the scraper's direct output
    let title = item.title || item.position;
    let company = item.company || item.companyName;

    // 2. Fallback: If missing, attempt to parse from URL slug (Heuristic Recovery)
    if (!title || !company || title === 'Unknown Title' || company === 'Unknown Company') {
      const parsed = this.parseJobDetailsFromUrl(url);
      if (!title || title === 'Unknown Title') title = parsed.title;
      if (!company || company === 'Unknown Company') company = parsed.company;
    }

    // 3. Final Fallback: Ensure no "Unknown" labels reach the UI
    return {
      id: item.id || url || `linkedin-${index}`,
      title: title || 'Unknown Title',
      company_name: company || 'Unknown Company',
      location: item.location || 'Remote',
      url: url,
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
