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

    return items.map((item: any, index: number) => ({
      id: item.id || item.url || `indeed-${index}`,
      title: item.positionName || item.title || 'Unknown Title',
      company_name: item.company || 'Unknown Company',
      location: item.location || 'Remote',
      url: item.url || '',
      description: item.description || 'No description provided.',
      posted_at: item.postedAt || new Date().toISOString(),
      source: 'indeed',
    }));
  }
};
