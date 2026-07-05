import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Keyword weights and synonyms helper (mirrors matchAnalysisService for consistent fallback fallback)
const TECH_KEYWORDS = [
  'react', 'typescript', 'javascript', 'next.js', 'node.js', 'python', 'java', 'go', 'golang',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'sql', 'nosql', 'mongodb', 'postgresql',
  'graphql', 'rest', 'api', 'microservices', 'devops', 'ci/cd', 'git', 'agile', 'scrum',
  'frontend', 'backend', 'fullstack', 'mobile', 'react native', 'flutter', 'swift', 'kotlin',
  'testing', 'jest', 'cypress', 'terraform', 'redis', 'kafka', 'leadership', 'strategy', 'operations'
];

const KEYWORD_WEIGHTS: Record<string, number> = {
  'react': 2, 'typescript': 2, 'javascript': 2, 'next.js': 2, 'python': 2, 'java': 2,
  'aws': 2, 'azure': 2, 'gcp': 2, 'kubernetes': 2, 'sql': 2, 'postgresql': 2,
  'senior': 1.5, 'manager': 1.5, 'lead': 1.5, 'strategy': 1.5, 'operations': 1.5,
  'agile': 1, 'scrum': 1, 'git': 1, 'documentation': 1
};

function calculateLocalMatchScore(jobDescription: string, resumeText: string) {
  const jobText = jobDescription.toLowerCase();
  const resText = resumeText.toLowerCase();

  const foundKeywords = TECH_KEYWORDS.filter(skill => {
    const skillRegex = new RegExp(`\\b${skill}\\b`, 'i');
    return skillRegex.test(jobText);
  });

  if (foundKeywords.length === 0) {
    return 0;
  }

  const matchingSkills = foundKeywords.filter(skill => {
    const skillRegex = new RegExp(`\\b${skill}\\b`, 'i');
    return skillRegex.test(resText);
  });

  let totalPossibleWeight = 0;
  let earnedWeight = 0;

  foundKeywords.forEach(skill => {
    const weight = KEYWORD_WEIGHTS[skill.toLowerCase()] || 1;
    totalPossibleWeight += weight;
    if (matchingSkills.includes(skill)) {
      earnedWeight += weight;
    }
  });

  return Math.round((earnedWeight / totalPossibleWeight) * 100);
}

async function getLLMMatchAnalysis(prompt: string, groqKey: string, openaiKey: string) {
  const systemPrompt = `You are an expert ATS (Applicant Tracking System) matching engine.
Your task is to analyze the candidate's Resume text against the target Job Description (JD) and produce a structured, high-accuracy compatibility report.

Be semantic and intelligent: do not just match exact keywords. Understand synonyms.

You MUST output your response in the following EXACT JSON format. Do not add any markdown formatting (like \`\`\`json), code blocks, or extra text. Output ONLY the raw JSON string.

JSON Structure:
{
  "matchingSkills": ["React", "TypeScript", "Jest"],
  "missingSkills": ["Playwright", "Docker"],
  "warnings": ["Strategic Gap: This is a high-seniority role. Emphasize your leadership skills."],
  "weightedDetails": {
    "coreMatches": ["React", "TypeScript"],
    "secondaryMatches": ["Jest"]
  }
}`;

  // Try Groq First
  if (groqKey) {
    try {
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        })
      });
      
      if (groqResponse.ok) {
        const data = await groqResponse.json();
        return JSON.parse(data.choices[0].message.content);
      }
    } catch (e) {
      console.warn("Groq failed in match-analysis edge function", e);
    }
  }

  // Fallback to OpenAI
  if (!openaiKey) throw new Error("OpenAI key missing for fallback.");
  
  const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!openaiResponse.ok) {
    throw new Error(`OpenAI failed: ${await openaiResponse.text()}`);
  }

  const data = await openaiResponse.json();
  return JSON.parse(data.choices[0].message.content);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const groqKey = Deno.env.get('GROQ_API_KEY') ?? '';
    const openaiKey = Deno.env.get('OPENAI_API_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json();
    const { 
      mode = 'enrichment', // 'vector' | 'enrichment'
      jobId, 
      resumeVersionId, 
      jobDescription, 
      resumeText 
    } = body;

    // Resolve client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

    // Get Auth user if present
    let user = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser } } = await supabaseAdmin.auth.getUser(token);
      user = authUser;
    }

    // 🛡️ Rate Limit Implementation (Only applied to heavy LLM queries)
    if (mode === 'enrichment') {
      const limit = user ? 15 : 3;
      const { count, error: countError } = await supabaseAdmin
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'match_analysis')
        .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .eq(user ? 'user_id' : 'metadata->>ip', user ? user.id : clientIp);

      if (countError) throw countError;

      if ((count ?? 0) >= limit) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded.", 
          message: `You have exhausted your daily limit of ${limit} scans. Please sign up to increase limits.` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        });
      }
    }

    // Lane A: Vector Match Mode (Stateless Similarity, <100ms)
    if (mode === 'vector') {
      if (jobId && resumeVersionId) {
        const { data: score, error: rpcError } = await supabaseAdmin.rpc('calculate_match_score', {
          resume_ver_id: resumeVersionId,
          target_job_id: jobId
        });

        if (!rpcError && score !== null) {
          return new Response(JSON.stringify({
            score: score,
            confidence_mode: "vector",
            status: "instant",
            warnings: []
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
      }

      // Fallback: If embeddings are missing or it's a guest scan with raw text
      const targetJobText = jobDescription || "";
      const targetResumeText = resumeText || "";
      
      const fallbackScore = calculateLocalMatchScore(targetJobText, targetResumeText);
      return new Response(JSON.stringify({
        score: fallbackScore,
        confidence_mode: "fallback",
        status: "instant",
        warnings: ["⚠️ Displaying a local keyword-matched approximation."]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Lane B: LLM Enrichment Mode (2-4s)
    let finalJobText = jobDescription || "";
    let finalResumeText = resumeText || "";

    // Hydrate texts from database if only IDs were passed in enrichment mode
    if (!finalJobText && jobId) {
      const { data: job } = await supabaseAdmin.from('jobs').select('description').eq('id', jobId).single();
      finalJobText = job?.description || "";
    }
    if (!finalResumeText && resumeVersionId) {
      const { data: version } = await supabaseAdmin.from('resume_versions').select('content').eq('id', resumeVersionId).single();
      finalResumeText = (version?.content as any)?.extractedText || "";
    }

    if (!finalJobText || !finalResumeText) {
      throw new Error('Missing job text or resume text for AI enrichment.');
    }

    const prompt = `JOB DESCRIPTION:\n${finalJobText}\n\nRESUME TEXT:\n${finalResumeText}`;
    const enrichmentResult = await getLLMMatchAnalysis(prompt, groqKey, openaiKey);

    // Log LLM Usage
    await supabaseAdmin.from('usage_logs').insert({
      user_id: user?.id || null,
      action_type: 'match_analysis',
      metadata: { ip: clientIp }
    });

    return new Response(JSON.stringify({
      ...enrichmentResult,
      confidence_mode: "llm",
      status: "enriched"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
