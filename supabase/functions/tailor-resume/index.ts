import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateTailoredResume(prompt: string, groqKey: string, openaiKey: string) {
  const systemPrompt = "You are an expert ATS resume writer. You will be given a base resume (in JSON format) and a Job Description. Your task is to output a new tailored resume (in the EXACT SAME JSON format). Do NOT hallucinate skills or experience the user doesn't have. Instead, perfectly align the existing experience bullets with the keywords and requirements of the Job Description. Use strong action verbs and metric-driven results. OUTPUT ONLY VALID JSON.";
  
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
      } else {
        console.warn("Groq failed, falling back to OpenAI. Error:", await groqResponse.text());
      }
    } catch (e) {
      console.warn("Groq network error, falling back to OpenAI. Error:", e);
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

    const authHeader = req.headers.get('Authorization')!;
    if (!authHeader) throw new Error('Missing Authorization header');
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) throw new Error('Invalid token or user not found');

    const { resumeId, applicationId } = await req.json();
    if (!resumeId || !applicationId) throw new Error('resumeId and applicationId are required');

    // Fetch Application to get Job ID
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .select('job_id, jobs(*)')
      .eq('id', applicationId)
      .single();
      
    if (appError || !application) throw new Error('Application not found');
    const job = application.jobs;

    // Fetch latest resume version
    const { data: versions, error: versionsError } = await supabaseAdmin
      .from('resume_versions')
      .select('*')
      .eq('resume_id', resumeId)
      .order('version_number', { ascending: false })
      .limit(1);

    if (versionsError || !versions || versions.length === 0) {
      throw new Error('Resume content not found');
    }

    const baseResumeContent = versions[0].content;

    // Generate Tailored Resume
    const prompt = `JOB DESCRIPTION:\nTitle: ${job.title}\nCompany: ${job.company_name}\nDescription: ${job.description}\n\nBASE RESUME JSON:\n${JSON.stringify(baseResumeContent)}\n\nOutput the fully updated, ATS-tailored resume in exactly the same JSON structure.`;
    
    const tailoredContent = await generateTailoredResume(prompt, groqKey, openaiKey);

    // Create New Tailored Resume Record
    const { data: newResume, error: insertResumeError } = await supabaseAdmin
      .from('resumes')
      .insert({
        profile_id: user.id,
        name: `${job.company_name} Tailored Resume - ${job.title}`,
        target_role: job.title,
        is_tailored: true,
        application_id: applicationId
      })
      .select()
      .single();

    if (insertResumeError) throw insertResumeError;

    // Create Resume Version
    const { error: insertVersionError } = await supabaseAdmin
      .from('resume_versions')
      .insert({
        resume_id: newResume.id,
        version_number: 1,
        content: tailoredContent
      });

    if (insertVersionError) throw insertVersionError;

    // Update Application to link the new resume
    await supabaseAdmin
      .from('applications')
      .update({ resume_id: newResume.id })
      .eq('id', applicationId);

    return new Response(JSON.stringify({ success: true, tailoredResumeId: newResume.id }), {
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
