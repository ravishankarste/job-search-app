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
    const actorId = import.meta.env.VITE_APIFY_ACTOR_ID || 'bebity~linkedin-jobs-scraper';

    if (!token) {
      throw new Error("Missing VITE_APIFY_API_TOKEN in .env file");
    }

    // Convert days to LinkedIn time filter format (seconds)
    // 1 day = 86400, 7 days = 604800
    const seconds = daysAgo * 24 * 60 * 60;
    const timeFilter = `r${seconds}`;

    // Format actor ID for URL (Apify uses ~ instead of / in paths)
    const formattedActorId = actorId.replace('/', '~');

    // This uses the run-sync-get-dataset-items endpoint which waits for the run to finish and returns the data.
    const url = `https://api.apify.com/v2/acts/${formattedActorId}/run-sync-get-dataset-items?token=${token}`;

    // Different Apify actors require completely different input schemas.
    // We dynamically build the payload based on which actor you installed.
    let input: any;

    if (actorId.includes('get-leads')) {
      // Schema for get-leads/linkedin-scraper
      input = {
        mode: "jobs",
        searchQuery: query,
        location: location,
        limit: 10,
        // Most generic scrapers will ignore fields they don't use
        f_TPR: timeFilter 
      };
    } else {
      // Schema for bebity and other standard job scrapers
      input = {
        keyword: query,
        location: location,
        f_TPR: timeFilter,
        limit: 10
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Apify API Error: ${response.status} - ${errorText}`);
    }

    const items = await response.json();

    // Map the raw Apify output to our DiscoveredJob interface
    return items.map((item: any, index: number) => ({
      id: item.id || item.url || `apify-${index}`,
      title: item.title || item.position || 'Unknown Title',
      company_name: item.company || item.companyName || 'Unknown Company',
      location: item.location || 'Remote',
      url: item.url || item.jobUrl || '',
      description: item.description || item.jobDescription || 'No description provided.',
      posted_at: item.postedAt || item.publishedAt || new Date().toISOString(),
      source: 'linkedin',
    }));
  }
};
