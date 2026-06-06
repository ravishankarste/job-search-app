import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

// Dynamic Adzuna Routing
function getCountryCode(query: string, loc: string, explicitCountry?: string): string {
  if (explicitCountry) return explicitCountry.toLowerCase();
  
  const combined = ((query || '') + ' ' + (loc || '')).toLowerCase();
  if (combined.includes('uk') || combined.includes('london') || combined.includes('gb')) return 'gb';
  if (combined.includes('india') || combined.includes('bengaluru') || combined.includes('hyderabad')) return 'in';
  return 'us'; // Default
}

serve(async (req) => {
  // 1. Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders() });
  }

  try {
    const { query, location, country } = await req.json();

    const appId = Deno.env.get('ADZUNA_APP_ID');
    const appKey = Deno.env.get('ADZUNA_APP_KEY');

    if (!appId || !appKey) {
      throw new Error("Missing Adzuna API keys in environment.");
    }

    // 2. Build the Adzuna API URL
    const countryCode = getCountryCode(query, location, country);
    const url = new URL(`https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1`);
    url.searchParams.append('app_id', appId);
    url.searchParams.append('app_key', appKey);
    url.searchParams.append('results_per_page', '10');

    let whatQuery = query || '';
    let whereQuery = location || '';

    if (!whereQuery) {
      // 1. Check for comma-separated locations (e.g., "Software Engineer, London")
      if (whatQuery.includes(',')) {
        const parts = whatQuery.split(',');
        whereQuery = parts.pop()?.trim() || '';
        whatQuery = parts.join(',').trim();
      } else {
        // 2. Check for natural language location (e.g., "Software Engineer in London")
        const match = whatQuery.match(/^(.*?)\s+(?:in|near|around|at)\s+([a-zA-Z\s]+)$/i);
        if (match) {
          whatQuery = match[1].trim();
          whereQuery = match[2].trim();
        }
      }
    }

    if (whatQuery) url.searchParams.append('what', whatQuery);
    if (whereQuery) url.searchParams.append('where', whereQuery);
    
    // Sort by relevance (default) or date
    url.searchParams.append('sort_by', 'relevance');

    console.log(`[search-jobs] Fetching from Adzuna for query: ${query}, location: ${location}`);

    // 3. Fetch from Adzuna
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error("[search-jobs] Adzuna API error:", response.status, await response.text());
      throw new Error(`Adzuna API returned status: ${response.status}`);
    }

    const data = await response.json();

    // 4. Normalize the data to match our DiscoveredJob interface
    const results = (data.results || []).map((job: any) => ({
      id: `adzuna-${job.id}`,
      title: job.title,
      company_name: job.company?.display_name || 'Unknown Company',
      location: job.location?.display_name || 'Remote',
      url: job.redirect_url,
      description: job.description,
      posted_at: job.created,
      source: 'adzuna',
      match_label: calculateMatchLabel(job, query)
    }));

    return new Response(
      JSON.stringify(results),
      { 
        headers: { 
          ...getCorsHeaders(), 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          ...getCorsHeaders(), 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

function calculateMatchLabel(job: any, query: string): 'Strong Match' | 'Good Match' {
  // A naive ranking: if the title exactly contains the query (case insensitive), it's a Strong Match.
  if (!query) return 'Good Match';
  const jobTitle = job.title?.toLowerCase() || '';
  const q = query.toLowerCase();
  
  // If the query words appear closely in the title, call it a strong match.
  if (jobTitle.includes(q)) return 'Strong Match';
  
  return 'Good Match';
}
