import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- Helper Functions ---

function getCountryCode(query: string, loc: string, explicitCountry?: string): string {
  if (explicitCountry) return explicitCountry.toLowerCase();
  const combined = ((query || '') + ' ' + (loc || '')).toLowerCase();
  if (combined.includes('uk') || combined.includes('london') || combined.includes('gb')) return 'gb';
  if (combined.includes('india') || combined.includes('bengaluru') || combined.includes('hyderabad')) return 'in';
  return 'us';
}

function calculateMatchLabel(title: string, query: string): 'Strong Match' | 'Good Match' {
  if (!query) return 'Good Match';
  const q = query.toLowerCase().split(',')[0].trim(); // Get the core role part
  if (title.toLowerCase().includes(q)) return 'Strong Match';
  return 'Good Match';
}

function extractQueryAndLocation(rawQuery: string, rawLocation: string) {
  let whatQuery = rawQuery || '';
  let whereQuery = rawLocation || '';

  if (!whereQuery && whatQuery.includes(',')) {
    const parts = whatQuery.split(',');
    whereQuery = parts.pop()?.trim() || '';
    whatQuery = parts.join(',').trim();
  } else if (!whereQuery) {
    const match = whatQuery.match(/^(.*?)\s+(?:in|near|around|at)\s+([a-zA-Z][a-zA-Z\s]{0,99})$/i);
    if (match) {
      whatQuery = match[1].trim();
      whereQuery = match[2].trim();
    }
  }
  return { whatQuery, whereQuery };
}

// --- Fetchers ---

async function fetchAdzuna(what: string, where: string, countryCode: string, query: string) {
  try {
    const appId = Deno.env.get('ADZUNA_APP_ID');
    const appKey = Deno.env.get('ADZUNA_APP_KEY');
    if (!appId || !appKey) throw new Error("Missing Adzuna API keys");

    const url = new URL(`https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1`);
    url.searchParams.append('app_id', appId);
    url.searchParams.append('app_key', appKey);
    url.searchParams.append('results_per_page', '10');
    if (what) url.searchParams.append('what', what);
    if (where) url.searchParams.append('where', where);
    url.searchParams.append('sort_by', 'relevance');

    const response = await fetch(url.toString(), { headers: { 'Accept': 'application/json' }});
    if (!response.ok) throw new Error(`Adzuna HTTP ${response.status}`);
    const data = await response.json();

    return (data.results || []).map((job: any) => ({
      id: `adzuna-${job.id}`,
      title: job.title,
      company_name: job.company?.display_name || 'Unknown Company',
      location: job.location?.display_name || 'Remote',
      url: job.redirect_url,
      description: job.description,
      posted_at: job.created,
      source: 'adzuna',
      match_label: calculateMatchLabel(job.title, query)
    }));
  } catch (error: any) {
    console.error("[search-jobs] Adzuna Fetch Error:", error.message);
    throw error;
  }
}

async function fetchSerpApi(what: string, where: string, query: string) {
  try {
    const apiKey = Deno.env.get('SERP_API_KEY');
    if (!apiKey) throw new Error("Missing SERP_API_KEY");

    // SerpApi combines what and where into a single "q" parameter usually
    const q = `${what} ${where}`.trim();
    const url = new URL(`https://serpapi.com/search.json`);
    url.searchParams.append('engine', 'google_jobs');
    url.searchParams.append('q', q);
    url.searchParams.append('api_key', apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`SerpApi HTTP ${response.status}`);
    const data = await response.json();

    return (data.jobs_results || []).map((job: any) => ({
      id: `serp-${job.job_id || Date.now() + Math.random()}`,
      title: job.title,
      company_name: job.company_name || 'Unknown Company',
      location: job.location || 'Remote',
      url: job.share_link || job.related_links?.[0]?.link || '',
      description: job.description || 'No description provided.',
      posted_at: new Date().toISOString(), // Google Jobs API doesn't always give ISO date, sometimes "2 days ago"
      source: 'google_jobs',
      match_label: calculateMatchLabel(job.title, query)
    }));
  } catch (error: any) {
    console.error("[search-jobs] SerpApi Fetch Error:", error.message);
    throw error; // Let Promise.allSettled catch it
  }
}

async function fetchJooble(what: string, where: string, query: string) {
  try {
    const apiKey = Deno.env.get('JOOBLE_API_KEY');
    if (!apiKey) throw new Error("Missing JOOBLE_API_KEY (Skipping)");

    const response = await fetch(`https://jooble.org/api/${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: what, location: where, page: 1 })
    });
    
    if (!response.ok) throw new Error(`Jooble HTTP ${response.status}`);
    const data = await response.json();

    return (data.jobs || []).map((job: any) => ({
      id: `jooble-${job.id}`,
      title: job.title,
      company_name: job.company || 'Unknown Company',
      location: job.location || 'Remote',
      url: job.link,
      description: job.snippet,
      posted_at: job.updated || new Date().toISOString(),
      source: 'jooble',
      match_label: calculateMatchLabel(job.title, query)
    }));
  } catch (error: any) {
    console.error("[search-jobs] Jooble Fetch Error:", error.message);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, location, country } = await req.json();
    
    // 1. Init Supabase to check cache
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const cacheKey = ((query || '') + '::' + (location || '') + '::' + (country || '')).toLowerCase();

    // 2. Check Database Cache
    const { data: cachedResult } = await supabase
      .from('discovery_cache')
      .select('results')
      .eq('query_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cachedResult && cachedResult.results && cachedResult.results.length > 0) {
      console.log(`[search-jobs] Serving ⚡ CACHED results for: ${cacheKey}`);
      return new Response(JSON.stringify(cachedResult.results), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 3. Cache Miss - Run Parallel Aggregator
    console.log(`[search-jobs] Cache Miss. Running Multi-Node Aggregator for: ${cacheKey}`);
    const countryCode = getCountryCode(query, location, country);
    const { whatQuery, whereQuery } = extractQueryAndLocation(query, location);

    const [adzunaRes, serpRes, joobleRes] = await Promise.allSettled([
      fetchAdzuna(whatQuery, whereQuery, countryCode, query),
      fetchSerpApi(whatQuery, whereQuery, query),
      fetchJooble(whatQuery, whereQuery, query)
    ]);

    let combinedJobs: any[] = [];

    if (adzunaRes.status === 'fulfilled') combinedJobs = combinedJobs.concat(adzunaRes.value);
    if (serpRes.status === 'fulfilled') combinedJobs = combinedJobs.concat(serpRes.value);
    if (joobleRes.status === 'fulfilled') combinedJobs = combinedJobs.concat(joobleRes.value);

    // 4. Deduplication Engine (O(N^2) but N is small ~30 max)
    const uniqueJobs: any[] = [];
    for (const job of combinedJobs) {
      const isDuplicate = uniqueJobs.some(existing => {
        // Exact same source ID (shouldn't happen unless API is weird)
        if (existing.id === job.id) return true;
        
        // Similar Title + Exact Company Name (Cross-API Duplicate)
        const titleMatch = existing.title.toLowerCase() === job.title.toLowerCase();
        const companyMatch = existing.company_name.toLowerCase() === job.company_name.toLowerCase();
        
        return titleMatch && companyMatch;
      });

      if (!isDuplicate) {
        uniqueJobs.push(job);
      }
    }

    if (uniqueJobs.length === 0) {
      // If all APIs failed or returned 0, throw an error so the frontend catches it
      throw new Error("All discovery nodes failed to find results.");
    }

    // 5. Save to Cache (24 hours TTL)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Fire and forget cache insert (don't await so we don't slow down the response)
    supabase.from('discovery_cache').upsert({
      query_key: cacheKey,
      results: uniqueJobs,
      expires_at: expiresAt.toISOString()
    }).then(({ error }) => {
      if (error) console.error("[search-jobs] Failed to write cache:", error.message);
    });

    return new Response(JSON.stringify(uniqueJobs), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error("[search-jobs] Aggregator Fatal Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
