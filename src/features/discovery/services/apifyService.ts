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
    console.log(`[apifyService] Real search for "${query}" in "${location}" (past ${daysAgo} days)`);
    
    const token = import.meta.env.VITE_APIFY_API_TOKEN;
    
    if (!token) {
      throw new Error("Missing VITE_APIFY_API_TOKEN in Github Secrets / .env");
    }

    try {
      console.log("[apifyService] Attempting LinkedIn scraping...");
      return await this.fetchLinkedIn(query, location, daysAgo, token);
    } catch (err: any) {
      console.warn("[apifyService] LinkedIn scraper failed, falling back to Indeed...", err.message);
      
      try {
        console.log("[apifyService] Attempting Indeed scraping...");
        return await this.fetchIndeed(query, location, daysAgo, token);
      } catch (fallbackErr: any) {
        console.error("[apifyService] Both sources failed.");
        throw new Error("Both LinkedIn and Indeed search sources failed. Apify might be out of credits or experiencing downtime.");
      }
    }
  },

  /**
   * Primary Source: LinkedIn Scraper
   */
  async fetchLinkedIn(query: string, location: string, daysAgo: number, token: string): Promise<DiscoveredJob[]> {
    const actorId = import.meta.env.VITE_APIFY_ACTOR_ID || 'get-leads/linkedin-scraper';
    const seconds = daysAgo * 24 * 60 * 60;
    const timeFilter = `r${seconds}`;
    const formattedActorId = actorId.replace('/', '~');
    const url = `https://api.apify.com/v2/acts/${formattedActorId}/run-sync-get-dataset-items?token=${token}`;

    const input = actorId.includes('get-leads') 
      ? { mode: "jobs", searchQuery: query, location: location, limit: 10, f_TPR: timeFilter }
      : { keyword: query, location: location, f_TPR: timeFilter, limit: 10 };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LinkedIn API Error: ${response.status} - ${errorText}`);
    }

    const items = await response.json();

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
  async fetchIndeed(query: string, location: string, daysAgo: number, token: string): Promise<DiscoveredJob[]> {
    // We use a popular Indeed scraper on Apify as the fallback
    const actorId = 'mishtr~indeed-scraper'; 
    const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${token}`;

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

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Indeed API Error: ${response.status} - ${errorText}`);
    }

    const items = await response.json();
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
    const slug = url.split('/view/')[1] || url.split('/jobs/')[1] || "";
    
    if (url.includes('linkedin.com')) {
      const parts = slug.split('-');
      const atIndex = parts.indexOf('at');
      if (atIndex > 0) {
        details.title = parts.slice(0, atIndex).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        details.company = parts.slice(atIndex + 1).filter(p => !/^\d+$/.test(p)).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      }
    }
    return details;
  },

  /**
   * Search the web for a URL to peek at its title/metadata
   */
  async peekUrlMetadata(url: string, token: string): Promise<{ title?: string, company?: string }> {
    console.log(`[apifyService] Peeking web for: ${url}`);
    const actorId = 'apify~google-search-scraper';
    const input = { queries: url, maxPagesPerQuery: 1, resultsPerPage: 1 };

    try {
      const results = await this.runActorAndGetResults(actorId, input, token);
      if (results && results[0]?.organicResults?.[0]) {
        const title = results[0].organicResults[0].title;
        const parts = title.split(' | ')[0].split(' - ');
        return {
          title: parts[0]?.trim(),
          company: parts[1]?.trim() || "Unknown Company"
        };
      }
    } catch (e) {
      console.warn("Web peek failed", e);
    }
    return {};
  },

  async scrapeJobUrl(url: string): Promise<DiscoveredJob> {
    const cleanUrl = this.normalizeJobUrl(url);
    const token = import.meta.env.VITE_APIFY_API_TOKEN;
    if (!token) throw new Error("Missing VITE_APIFY_API_TOKEN");

    try {
      if (cleanUrl.includes('linkedin.com')) {
        return await this.scrapeSingleLinkedIn(cleanUrl, token);
      } else if (cleanUrl.includes('indeed.com')) {
        return await this.scrapeSingleIndeed(cleanUrl, token);
      }
    } catch (err) {
      console.warn("[apifyService] Direct scrape failed/timed out. Falling back to modal.", err);
      throw new Error("LinkedIn is taking too long to respond. Please fill in the title and company manually—we've saved the link for you!");
    }
    throw new Error("Unsupported URL");
  },

  async scrapeSingleLinkedIn(url: string, token: string): Promise<DiscoveredJob> {
    const actorId = 'curious_coder~linkedin-jobs-scraper';
    const input = { urls: [url], maxItems: 1 };
    const items = await this.runActorAndGetResults(actorId, input, token);
    if (!items || !items.length) throw new Error("Could not find job details.");
    return this.mapLinkedInItem(items[0], 0);
  },

  async scrapeSingleIndeed(url: string, token: string): Promise<DiscoveredJob> {
    const actorId = 'mishtr~indeed-scraper';
    const input = { startUrls: [{ url }], maxItems: 1 };
    const items = await this.runActorAndGetResults(actorId, input, token);
    if (!items || !items.length) throw new Error("Could not find job details.");
    return this.mapIndeedItem(items[0], 0);
  },

  async runActorAndGetResults(actorId: string, input: any, token: string): Promise<any[]> {
    const formattedId = actorId.replace('/', '~');
    const runUrl = `https://api.apify.com/v2/acts/${formattedId}/runs?token=${token}`;
    const runRes = await fetch(runUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!runRes.ok) {
      const errorText = await runRes.text();
      throw new Error(`Apify Start Failed: ${runRes.status} - ${errorText}`);
    }

    const { data } = await runRes.json();
    
    // Poll for results (max 3 minutes)
    const startTime = Date.now();
    const timeout = 180000; 
    while (Date.now() - startTime < timeout) {
      const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${data.id}?token=${token}`);
      const { data: statusData } = await statusRes.json();
      if (statusData.status === 'SUCCEEDED') break;
      if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(statusData.status)) throw new Error(`Scraper ${statusData.status}`);
      await new Promise(r => setTimeout(r, 3000));
    }

    const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${data.defaultDatasetId}/items?token=${token}`);
    return await itemsRes.json();
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
