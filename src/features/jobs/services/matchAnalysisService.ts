import { supabase } from '../../../lib/supabaseClient';

export interface MatchScoreResult {
  score: number; // 0-100
  matchingSkills: string[];
  missingSkills: string[];
  warnings?: string[]; // New: For "Reality Check" alerts
  weightedDetails?: {
    coreMatches: string[];
    secondaryMatches: string[];
  };
}

export interface VectorMatchResult {
  score: number;
  confidence_mode: 'vector' | 'fallback';
  status: 'instant';
  warnings?: string[];
}

export interface LLMEnrichmentResult {
  matchingSkills: string[];
  missingSkills: string[];
  warnings?: string[];
  weightedDetails?: {
    coreMatches: string[];
    secondaryMatches: string[];
  };
  confidence_mode: 'llm';
  status: 'enriched';
}

// A comprehensive list of tech keywords to look for (Universal Multi-Industry Library)
export interface CanonicalSkill {
  id: string;
  label: string;
  category: "core" | "technical" | "domain" | "tool" | "soft_skill" | "seniority";
  baseWeight: number;
  aliases: string[];
  importanceTier: "critical" | "important" | "nice_to_have";
}

export const CANONICAL_SKILLS: CanonicalSkill[] = [
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

export function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export const getKeywordRegex = (skill: string) => {
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const leading = /^\w/.test(skill) ? '\\b' : '(?<=^|\\s|\\p{P})';
  const trailing = /\w$/.test(skill) ? '\\b' : '(?=$|\\s|\\p{P})';
  return new RegExp(leading + escaped + trailing, 'iu');
};

export interface MappingMatch {
  skillId: string;
  weight: number;
  matchedAlias: string;
}

export function mapSkills(text: string, skills: CanonicalSkill[]): MappingMatch[] {
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

export const matchAnalysisService = {
  /**
   * Run local regex-based match calculation as a fallback
   */
  calculateLocalMatchScore(jobDescription: string, resumeText: string): MatchScoreResult {
    // 1. Map canonical skills found in the Job Description
    const jdSkills = mapSkills(jobDescription, CANONICAL_SKILLS);

    if (jdSkills.length === 0) {
      return { 
        score: 0, 
        matchingSkills: [], 
        missingSkills: [], 
        weightedDetails: { coreMatches: [], secondaryMatches: [] } 
      };
    }

    // 2. Map canonical skills found in the Resume
    const resSkills = mapSkills(resumeText, CANONICAL_SKILLS);
    const resSkillIds = new Set(resSkills.map(s => s.skillId));

    // 3. Deduplicate matches & gaps
    const matchedNodes = jdSkills.filter(s => resSkillIds.has(s.skillId));
    const missingNodes = jdSkills.filter(s => !resSkillIds.has(s.skillId));

    // 4. Calculate earned vs. possible weights
    let totalPossibleWeight = 0;
    let earnedWeight = 0;

    jdSkills.forEach(s => {
      totalPossibleWeight += s.weight;
    });

    matchedNodes.forEach(s => {
      earnedWeight += s.weight;
    });

    const ratio = earnedWeight / totalPossibleWeight;
    const score = Math.round(Math.sqrt(ratio) * 100);

    // 5. Build clean label arrays for the UI (using the label of the canonical node)
    const matchingSkills = matchedNodes.map(m => {
      const node = CANONICAL_SKILLS.find(s => s.id === m.skillId);
      return node ? node.label : m.skillId;
    });

    const missingSkills = missingNodes.map(m => {
      const node = CANONICAL_SKILLS.find(s => s.id === m.skillId);
      return node ? node.label : m.skillId;
    });

    const coreMatches = matchedNodes
      .filter(m => m.weight >= 1.5)
      .map(m => {
        const node = CANONICAL_SKILLS.find(s => s.id === m.skillId);
        return node ? node.label : m.skillId;
      });

    const secondaryMatches = matchedNodes
      .filter(m => m.weight < 1.5)
      .map(m => {
        const node = CANONICAL_SKILLS.find(s => s.id === m.skillId);
        return node ? node.label : m.skillId;
      });

    // 6. Seniority / Juniority check helpers
    const warnings: string[] = [];
    const jobText = jobDescription.toLowerCase();
    const resText = resumeText.toLowerCase();

    const seniorMarkers = ['director', 'vp', 'head of', 'principal', 'staff', 'lead', 'manager', 'senior'];
    const juniorMarkers = ['junior', 'associate', 'intern', 'entry level', 'grad', 'trainee'];

    const jobIsJunior = juniorMarkers.some(m => jobText.includes(m));
    const resumeIsSenior = seniorMarkers.some(m => resText.includes(m));
    const jobIsSenior = seniorMarkers.some(m => jobText.includes(m));
    const resumeIsJunior = juniorMarkers.some(m => resText.includes(m)) && !resumeIsSenior;

    if (jobIsJunior && resumeIsSenior) {
      warnings.push("Reality Check: You appear overqualified for this role. Hiring managers may fear you'll leave for a higher-paying position.");
    } else if (jobIsSenior && resumeIsJunior) {
      warnings.push("Strategic Gap: This is a high-seniority role. You need to emphasize leadership and strategy, not just execution.");
    }

    return {
      score,
      matchingSkills,
      missingSkills,
      warnings,
      weightedDetails: {
        coreMatches,
        secondaryMatches
      }
    };
  },

  /**
   * Calculate a weighted match score between a job description and a resume text.
   * Invokes LLM match Edge Function, falling back to local heuristic match if rate-limited or offline.
   */
  async calculateMatchScore(jobDescription: string, resumeText: string): Promise<MatchScoreResult> {
    if (!jobDescription || !resumeText) {
      return { score: 0, matchingSkills: [], missingSkills: [], weightedDetails: { coreMatches: [], secondaryMatches: [] } };
    }

    try {
      const { data, error } = await supabase.functions.invoke('match-analysis', {
        body: { jobDescription, resumeText }
      });

      if (error) throw error;
      if (data.error) {
        const err = new Error(data.message || data.error);
        (err as any).status = 429;
        throw err;
      }

      return data;
    } catch (err: any) {
      console.warn("[matchAnalysisService] LLM Match Failed or Rate Limited. Falling back to local keyword approximation. Error:", err);
      
      const localResult = this.calculateLocalMatchScore(jobDescription, resumeText);
      const warnings = localResult.warnings || [];

      if (err.status === 429 || err.message?.includes('limit') || err.message?.includes('Rate limit')) {
        warnings.unshift("⚠️ Rate Limit Active: You've exhausted your daily AI analysis limit. Displaying a keyword-matched approximation.");
      } else {
        warnings.unshift("⚠️ Connection Warning: Failed to reach the AI match engine. Displaying a local keyword-matched approximation.");
      }

      return {
        ...localResult,
        warnings
      };
    }
  },

  /**
   * Perform vector-based similarity scoring (stateless and fast)
   */
  async calculateVectorMatch(params: {
    jobId?: string;
    resumeVersionId?: string;
    jobDescription?: string;
    resumeText?: string;
  }): Promise<VectorMatchResult> {
    try {
      const { data, error } = await supabase.functions.invoke('match-analysis', {
        body: { mode: 'vector', ...params }
      });
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.warn("[matchAnalysisService] Vector Match Failed, falling back to local calculation:", err);
      const localResult = this.calculateLocalMatchScore(params.jobDescription || "", params.resumeText || "");
      return {
        score: localResult.score,
        confidence_mode: "fallback",
        status: "instant",
        warnings: ["⚠️ Displaying a local keyword-matched approximation."]
      };
    }
  },

  /**
   * Lazy fetch of full LLM match enrichment details (gaps, recommendations, warnings)
   */
  async getLLMEnrichment(params: {
    jobId?: string;
    resumeVersionId?: string;
    jobDescription?: string;
    resumeText?: string;
  }): Promise<LLMEnrichmentResult> {
    const { data, error } = await supabase.functions.invoke('match-analysis', {
      body: { mode: 'enrichment', ...params }
    });
    if (error) throw error;
    if (data.error) throw new Error(data.message || data.error);
    return data;
  }
};
