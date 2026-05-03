import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, actorId, input } = await req.json()

    if (!APIFY_API_TOKEN) {
      throw new Error("APIFY_API_TOKEN is not set in Edge Function secrets")
    }

    let url = ""
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

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: response.status,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
