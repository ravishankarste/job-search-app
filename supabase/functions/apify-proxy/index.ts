import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    // 1. Initialize Supabase with Service Role to bypass RLS for internal checks
    const supabaseAdmin = createClient(SUPABASE_URL!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)
    
    const { action, actorId, input } = await req.json()

    // 0. Permission Check: Allow metadata peeks without full auth to ensure resilience
    const isMetadataPeek = (action === "run-actor" || action === "run-sync") && (actorId === "apify/web-scraper" || actorId === "apify~web-scraper");
    
    let user: any = null;
    if (!isMetadataPeek) {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        throw new Error("Unauthorized: Missing Authorization header")
      }

      const { data: { user: authedUser }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
      if (authError || !authedUser) {
        throw new Error("Unauthorized: You must be logged in to use the discovery engine.")
      }
      user = authedUser;
    }

    // 2. SOVEREIGN SHIELD: Rate Limiting & Caching (Only for Discovery searches)
    if (action === "run-sync" && actorId.includes('scraper')) {
      const { searchQuery, location, f_TPR } = input;
      const daysAgo = f_TPR ? parseInt(f_TPR.replace('r', '')) / (24*60*60) : 7;

      // A. Check Rate Limit (10 searches per hour)
      const { count, error: countError } = await supabaseAdmin
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('action_type', 'discovery')
        .gt('created_at', new Date(Date.now() - 3600000).toISOString());

      if (count !== null && count >= 10) {
        return new Response(JSON.stringify({ error: "Sovereign Shield Active: You have reached your hourly limit for market scans. Please wait a while before searching again to protect project credits." }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        });
      }

      // B. Check Discovery Cache (Last 24 hours)
      const { data: cacheData } = await supabaseAdmin
        .from('discovery_cache')
        .select('results')
        .eq('query', searchQuery.toLowerCase())
        .eq('location', location.toLowerCase())
        .eq('days_ago', daysAgo)
        .gt('created_at', new Date(Date.now() - 86400000).toISOString())
        .maybeSingle();

      if (cacheData) {
        console.log(`[Sovereign Shield] Serving cached results for: ${searchQuery}`);
        return new Response(JSON.stringify(cacheData.results), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }

    if (!APIFY_API_TOKEN) {
      throw new Error("APIFY_API_TOKEN is not set in Edge Function secrets")
    }

    let url = ""
    // ... (rest of URL logic stays same)
    if (action === "run-sync") {
      const formattedActorId = actorId.replace('/', '~')
      url = `https://api.apify.com/v2/acts/${formattedActorId}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`
    } else if (action === "run-actor") {
      const formattedActorId = actorId.replace('/', '~')
      url = `https://api.apify.com/v2/acts/${formattedActorId}/runs?token=${APIFY_API_TOKEN}`
    } else if (action === "get-run") {
      const { runId } = input
      url = `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_API_TOKEN}`
    } else if (action === "get-dataset") {
      const { datasetId } = input
      url = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_API_TOKEN}`
    } else {
      throw new Error(`Unsupported action: ${action}`)
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: action === "get-run" || action === "get-dataset" ? undefined : JSON.stringify(input),
    })

    const data = await response.json()

    // 3. Post-Success: Log Usage & Update Cache
    if (response.ok && action === "run-sync" && actorId.includes('scraper')) {
      const { searchQuery, location, f_TPR } = input;
      const daysAgo = f_TPR ? parseInt(f_TPR.replace('r', '')) / (24*60*60) : 7;

      await Promise.all([
        supabaseAdmin.from('usage_logs').insert({ user_id: user.id, action_type: 'discovery' }),
        supabaseAdmin.from('discovery_cache').insert({
          query: searchQuery.toLowerCase(),
          location: location.toLowerCase(),
          days_ago: daysAgo,
          results: data
        })
      ]);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: response.status,
    })
  } catch (error) {
    const message = error.message;
    let status = 500;
    
    if (message.includes("Unauthorized")) status = 401;
    else if (message.includes("Missing")) status = 400;
    else if (message.includes("APIFY_API_TOKEN")) status = 500;

    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: status,
    })
  }
})
