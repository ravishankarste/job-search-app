import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const openaiKey = Deno.env.get('OPENAI_API_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    if (!openaiKey) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { text, type, id } = await req.json();
    if (!text || !type || !id) {
      throw new Error('text, type, and id are required');
    }

    if (type !== 'resume' && type !== 'job') {
      throw new Error('type must be either "resume" or "job"');
    }

    // 1. Call OpenAI embedding API
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text.substring(0, 8000) // safety limit for input length
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API failed: ${await response.text()}`);
    }

    const resJson = await response.json();
    const embedding = resJson.data?.[0]?.embedding;
    if (!embedding) {
      throw new Error('Failed to retrieve embedding vector from OpenAI');
    }

    // 2. Persist vector in correct database table
    if (type === 'resume') {
      const { error: updateError } = await supabaseAdmin
        .from('resume_versions')
        .update({ 
          embedding,
          embedding_status: 'ready'
        })
        .eq('id', id);
      
      if (updateError) throw updateError;
    } else {
      const { error: updateError } = await supabaseAdmin
        .from('jobs')
        .update({ 
          embedding,
          embedding_status: 'ready'
        })
        .eq('id', id);

      if (updateError) throw updateError;
    }

    return new Response(JSON.stringify({
      id,
      model: "text-embedding-3-small",
      status: "success"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // If we have an id and type, mark status as failed
    try {
      const bodyText = await req.clone().text();
      const parsed = JSON.parse(bodyText);
      const parsedId = parsed.id;
      const parsedType = parsed.type;
      
      if (parsedId && parsedType) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        if (parsedType === 'resume') {
          await supabaseAdmin.from('resume_versions').update({ embedding_status: 'failed' }).eq('id', parsedId);
        } else {
          await supabaseAdmin.from('jobs').update({ embedding_status: 'failed' }).eq('id', parsedId);
        }
      }
    } catch (e) {
      console.warn("Failed to set failure status in database:", e);
    }

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
