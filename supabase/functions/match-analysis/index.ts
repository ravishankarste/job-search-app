import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Canonical Skill Schema
interface CanonicalSkill {
  id: string;
  label: string;
  category: "core" | "technical" | "domain" | "tool" | "soft_skill" | "seniority";
  baseWeight: number;
  aliases: string[];
  importanceTier: "critical" | "important" | "nice_to_have";
}

const CANONICAL_SKILLS: CanonicalSkill[] = [
  // 💻 TECHNOLOGY & ENGINEERING
  { id: 'react', label: 'React.js', category: 'tool', baseWeight: 2.0, aliases: ['react', 'react.js', 'reactjs'], importanceTier: 'critical' },
  { id: 'typescript', label: 'TypeScript', category: 'technical', baseWeight: 2.0, aliases: ['typescript', 'ts'], importanceTier: 'critical' },
  { id: 'javascript', label: 'JavaScript', category: 'technical', baseWeight: 2.0, aliases: ['javascript', 'js', 'es6'], importanceTier: 'critical' },
  { id: 'nextjs', label: 'Next.js', category: 'tool', baseWeight: 2.0, aliases: ['next.js', 'nextjs'], importanceTier: 'critical' },
  { id: 'nodejs', label: 'Node.js', category: 'tool', baseWeight: 2.0, aliases: ['node.js', 'nodejs'], importanceTier: 'critical' },
  { id: 'python', label: 'Python', category: 'technical', baseWeight: 2.0, aliases: ['python', 'py'], importanceTier: 'critical' },
  { id: 'java', label: 'Java', category: 'technical', baseWeight: 2.0, aliases: ['java'], importanceTier: 'important' },
  { id: 'golang', label: 'Go (Golang)', category: 'technical', baseWeight: 2.0, aliases: ['go', 'golang'], importanceTier: 'important' },
  { id: 'aws', label: 'AWS Cloud', category: 'tool', baseWeight: 2.0, aliases: ['aws', 'amazon web services'], importanceTier: 'critical' },
  { id: 'azure', label: 'Azure Cloud', category: 'tool', baseWeight: 2.0, aliases: ['azure', 'microsoft azure'], importanceTier: 'important' },
  { id: 'gcp', label: 'GCP Cloud', category: 'tool', baseWeight: 2.0, aliases: ['gcp', 'google cloud platform', 'google cloud'], importanceTier: 'important' },
  { id: 'docker', label: 'Docker Containerization', category: 'tool', baseWeight: 2.0, aliases: ['docker', 'containerization'], importanceTier: 'important' },
  { id: 'kubernetes', label: 'Kubernetes Orchestration', category: 'tool', baseWeight: 2.0, aliases: ['kubernetes', 'k8s'], importanceTier: 'important' },
  { id: 'sql', label: 'SQL / Databases', category: 'technical', baseWeight: 2.0, aliases: ['sql', 'mysql', 'sqlite'], importanceTier: 'critical' },
  { id: 'postgresql', label: 'PostgreSQL', category: 'tool', baseWeight: 2.0, aliases: ['postgresql', 'postgres'], importanceTier: 'important' },
  { id: 'api', label: 'API Development', category: 'technical', baseWeight: 2.0, aliases: ['api', 'apis', 'rest api', 'graphql'], importanceTier: 'important' },
  { id: 'devops', label: 'DevOps / CI-CD', category: 'technical', baseWeight: 2.0, aliases: ['devops', 'ci/cd', 'continuous integration', 'github actions'], importanceTier: 'important' },
  { id: 'agile', label: 'Agile Methodology', category: 'domain', baseWeight: 1.5, aliases: ['agile', 'scrum', 'kanban'], importanceTier: 'important' },
  { id: 'ai_ml', label: 'AI & Machine Learning', category: 'technical', baseWeight: 2.0, aliases: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'nlp', 'llm', 'generative ai', 'chatgpt', 'claude'], importanceTier: 'critical' },
  { id: 'testing', label: 'Software Testing / QA', category: 'technical', baseWeight: 1.5, aliases: ['testing', 'qa', 'jest', 'cypress', 'selenium', 'playwright', 'unit test'], importanceTier: 'important' },
  { id: 'system_design', label: 'System Design / Architecture', category: 'technical', baseWeight: 2.0, aliases: ['system design', 'architecture', 'software design'], importanceTier: 'critical' },

  // 📈 MARKETING & GROWTH
  { id: 'seo_sem', label: 'SEO & Growth Marketing', category: 'technical', baseWeight: 1.5, aliases: ['seo', 'sem', 'growth marketing', 'performance marketing', 'google analytics', 'digital marketing'], importanceTier: 'important' },
  { id: 'crm', label: 'CRM Systems', category: 'tool', baseWeight: 1.5, aliases: ['crm', 'salesforce', 'hubspot'], importanceTier: 'important' },
  { id: 'ecommerce', label: 'E-commerce Management', category: 'domain', baseWeight: 1.8, aliases: ['e-commerce', 'ecommerce', 'shopify', 'online store'], importanceTier: 'important' },

  // 💰 SALES & REVENUE
  { id: 'sales', label: 'Sales & Business Development', category: 'domain', baseWeight: 1.8, aliases: ['sales', 'selling', 'business development', 'closing', 'cold calling', 'account management'], importanceTier: 'critical' },
  { id: 'customer_success', label: 'Customer Success & Support', category: 'domain', baseWeight: 1.5, aliases: ['customer success', 'customer support', 'account management', 'relationship management'], importanceTier: 'important' },

  // 🏥 HEALTHCARE
  { id: 'healthcare', label: 'Healthcare & Patient Administration', category: 'domain', baseWeight: 1.8, aliases: ['healthcare', 'clinical', 'patient care', 'medical', 'hipaa', 'ehr', 'emr'], importanceTier: 'important' },

  // ⚖️ LEGAL & FINANCE
  { id: 'finance_accounting', label: 'Finance & Accounting', category: 'domain', baseWeight: 1.8, aliases: ['finance', 'accounting', 'tax', 'bookkeeping', 'gaap', 'audit', 'financial analysis'], importanceTier: 'critical' },
  { id: 'budgeting_pl', label: 'Budgeting & P&L Management', category: 'domain', baseWeight: 1.8, aliases: ['budgeting', 'p&l', 'p and l', 'profit and loss', 'budget allocation'], importanceTier: 'critical' },
  { id: 'compliance', label: 'Regulatory Compliance & Risk', category: 'domain', baseWeight: 1.5, aliases: ['compliance', 'regulatory compliance', 'regulatory', 'risk management', 'governance'], importanceTier: 'important' },

  // 🎨 DESIGN & CREATIVE
  { id: 'ux_ui', label: 'UX/UI Design', category: 'technical', baseWeight: 1.8, aliases: ['ux', 'ui', 'user experience', 'user interface', 'product design', 'figma', 'wireframing', 'prototyping'], importanceTier: 'critical' },

  // 👔 LEADERSHIP & OPERATIONS
  { id: 'operations', label: 'Business & Team Operations', category: 'domain', baseWeight: 1.8, aliases: ['operations', 'operational excellence', 'ops', 'process improvement', 'efficiency', 'workflow'], importanceTier: 'critical' },
  { id: 'project_mgmt', label: 'Project & Program Management', category: 'domain', baseWeight: 1.5, aliases: ['project management', 'program management', 'project manager', 'pmp'], importanceTier: 'important' },
  { id: 'product_mgmt', label: 'Product Management', category: 'domain', baseWeight: 1.8, aliases: ['product management', 'product manager', 'roadmap'], importanceTier: 'important' },
  { id: 'coordination', label: 'Administration & Coordination', category: 'soft_skill', baseWeight: 1.0, aliases: ['coordination', 'administrative', 'planning', 'scheduling', 'resource allocation', 'calendar management', 'travel coordination'], importanceTier: 'important' },
  { id: 'validation', label: 'Quality Assurance & Validation', category: 'technical', baseWeight: 1.0, aliases: ['validation', 'verification', 'standards compliance', 'quality assurance'], importanceTier: 'important' },
  { id: 'strategy', label: 'Strategic Planning & Execution', category: 'core', baseWeight: 2.0, aliases: ['strategy', 'strategic planning', 'execution', 'business strategy'], importanceTier: 'critical' },

  // 🤝 HUMAN RESOURCES & TALENT
  { id: 'hr_recruiting', label: 'Human Resources & Talent Acquisition', category: 'domain', baseWeight: 1.5, aliases: ['recruiting', 'talent acquisition', 'hr', 'human resources', 'onboarding'], importanceTier: 'important' },

  // 👔 SENIORITY & ROLES
  { id: 'senior', label: 'Senior Experience', category: 'seniority', baseWeight: 1.5, aliases: ['senior', 'director', 'vp', 'cto', 'ceo', 'cfo', 'coo', 'head of', 'principal', 'staff', 'lead', 'manager'], importanceTier: 'critical' },
  { id: 'leadership', label: 'Leadership & People Management', category: 'core', baseWeight: 1.8, aliases: ['leadership', 'management', 'team building', 'mentoring', 'people management', 'stakeholder management'], importanceTier: 'critical' },
  { id: 'culture', label: 'Culture & Collaboration', category: 'soft_skill', baseWeight: 1.0, aliases: ['culture', 'collaboration', 'collaboration skills', 'cross-functional', 'communication', 'teamwork'], importanceTier: 'nice_to_have' }
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

const getKeywordRegex = (skill: string) => {
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const leading = /^\w/.test(skill) ? '\\b' : '(?<=^|\\s|\\p{P})';
  const trailing = /\w$/.test(skill) ? '\\b' : '(?=$|\\s|\\p{P})';
  return new RegExp(leading + escaped + trailing, 'iu');
};

interface MappingMatch {
  skillId: string;
  weight: number;
  matchedAlias: string;
}

function mapSkills(text: string, skills: CanonicalSkill[]): MappingMatch[] {
  const normalized = normalize(text);
  const matches: MappingMatch[] = [];

  for (const skill of skills) {
    for (const alias of skill.aliases) {
      const regex = getKeywordRegex(alias);
      if (regex.test(normalized)) {
        matches.push({
          skillId: skill.id,
          weight: skill.baseWeight,
          matchedAlias: alias
        });
        break; // Match only the first alias for this node
      }
    }
  }
  return matches;
}

function calculateLocalMatchScore(jobDescription: string, resumeText: string): number {
  const jdSkills = mapSkills(jobDescription, CANONICAL_SKILLS);

  if (jdSkills.length === 0) {
    return 0;
  }

  const resSkills = mapSkills(resumeText, CANONICAL_SKILLS);
  const resSkillIds = new Set(resSkills.map(s => s.skillId));

  const matchedNodes = jdSkills.filter(s => resSkillIds.has(s.skillId));

  let totalPossibleWeight = 0;
  let earnedWeight = 0;

  jdSkills.forEach(s => {
    totalPossibleWeight += s.weight;
  });

  matchedNodes.forEach(s => {
    earnedWeight += s.weight;
  });

  const ratio = earnedWeight / totalPossibleWeight;
  return Math.round(Math.sqrt(ratio) * 100);
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
      const calibrateVectorScore = (rawScore: number) => {
        const min = 22;
        const max = 48;
        const calibrated = ((rawScore - min) / (max - min)) * 100;
        return Math.max(0, Math.min(100, Math.round(calibrated)));
      };

      if (jobId && resumeVersionId) {
        const { data: score, error: rpcError } = await supabaseAdmin.rpc('calculate_match_score', {
          resume_ver_id: resumeVersionId,
          target_job_id: jobId
        });

        if (!rpcError && score !== null) {
          return new Response(JSON.stringify({
            score: calibrateVectorScore(score),
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
