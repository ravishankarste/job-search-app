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
const TECH_KEYWORDS = [
  // 💻 TECHNOLOGY & ENGINEERING
  'react', 'typescript', 'javascript', 'next.js', 'node.js', 'python', 'java', 'go', 'golang',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'sql', 'nosql', 'mongodb', 'postgresql',
  'graphql', 'rest', 'api', 'microservices', 'devops', 'ci/cd', 'git', 'agile', 'scrum',
  'frontend', 'backend', 'fullstack', 'mobile', 'react native', 'flutter', 'swift', 'kotlin',
  'machine learning', 'ai', 'data science', 'security', 'cybersecurity', 'cloud', 'serverless',
  'testing', 'jest', 'cypress', 'terraform', 'ansible', 'prometheus', 'grafana', 'redis',
  'kafka', 'rabbitmq', 'elasticsearch', 'rust', 'c++', 'c#', 'dotnet', 'django', 'flask',
  'engineer', 'developer', 'automation', 'qa', 'architect', 'full-stack', 'system design',

  // 📈 MARKETING & GROWTH
  'seo', 'sem', 'content marketing', 'digital marketing', 'social media', 'email marketing',
  'crm', 'hubspot', 'salesforce', 'google analytics', 'copywriting', 'growth hacking',
  'performance marketing', 'branding', 'market research', 'e-commerce', 'conversion rate',
  'ppc', 'advertising', 'public relations', 'pr', 'influencer marketing', 'b2b', 'b2c',

  // 💰 SALES & REVENUE
  'sales', 'account management', 'business development', 'pipeline', 'cold calling',
  'lead generation', 'negotiation', 'closing', 'revenue', 'saas sales', 'enterprise sales',
  'customer success', 'crm management', 'forecasting', 'quota', 'prospecting',

  // 🏥 HEALTHCARE & ADMINISTRATION
  'healthcare', 'clinical', 'patient care', 'medical', 'hipaa', 'electronic health records',
  'ehr', 'emr', 'nursing', 'pharmaceutical', 'hospital administration', 'public health',
  'medical billing', 'compliance', 'regulatory', 'healthcare operations', 'telehealth',

  // ⚖️ LEGAL, FINANCE & COMPLIANCE
  'audit', 'finance', 'accounting', 'p&l', 'budgeting', 'financial analysis', 'tax',
  'legal', 'contracts', 'risk management', 'governance', 'regulatory compliance',
  'sox', 'ifrs', 'gaap', 'investment', 'portfolio management', 'banking',

  // 🎨 DESIGN & CREATIVE
  'ux', 'ui', 'user experience', 'user interface', 'figma', 'adobe creative suite',
  'photoshop', 'illustrator', 'product design', 'graphic design', 'prototyping',
  'wireframing', 'visual design', 'typography', 'motion design', 'user research',

  // 👔 LEADERSHIP & OPERATIONS
  'senior', 'junior', 'lead', 'manager', 'director', 'vp', 'cto', 'ceo', 'coo', 'cfo',
  'head of', 'principal', 'staff', 'management', 'leadership', 'strategy', 'operations',
  'project management', 'product management', 'mentoring', 'team building', 'stakeholder',
  'process improvement', 'workflow', 'documentation', 'audit', 'administrative',
  'coordination', 'planning', 'resource allocation', 'international standards',
  'european standards', 'procedures', 'verification', 'validation', 'six sigma', 'lean',

  // 🤝 HUMAN RESOURCES & TALENT
  'recruiting', 'talent acquisition', 'hr', 'human resources', 'onboarding', 'hris',
  'employee relations', 'performance management', 'compensation', 'benefits',
  'diversity', 'inclusion', 'culture', 'training', 'development'
];

// Keyword Weighting Configuration
const KEYWORD_WEIGHTS: Record<string, number> = {
  // Hard Skills / Tech (High Impact)
  'react': 2, 'typescript': 2, 'javascript': 2, 'next.js': 2, 'python': 2, 'java': 2,
  'aws': 2, 'azure': 2, 'gcp': 2, 'kubernetes': 2, 'sql': 2, 'postgresql': 2,
  'compliance': 2, 'regulatory': 2, 'clinical': 2, 'finance': 2, 'audit': 2,

  // Leadership & Seniority (Medium Impact)
  'senior': 1.5, 'manager': 1.5, 'lead': 1.5, 'director': 1.5, 'strategy': 1.5,
  'operations': 1.5, 'project management': 1.5,

  // Tools & Methodologies (Base Impact)
  'agile': 1, 'scrum': 1, 'jira': 1, 'slack': 1, 'git': 1, 'documentation': 1
};

// Synonym Mapping to handle "Literal vs Meaning" gap (Multi-Industry)
export const SYNONYMS: Record<string, string[]> = {
  // TECHNICAL & DEVOPS
  'ci/cd': ['continuous integration', 'continuous delivery', 'deployment pipeline', 'automated deployment'],
  'aws': ['amazon web services', 'ec2', 's3', 'lambda'],
  'gcp': ['google cloud platform', 'bigquery', 'cloud run'],
  'azure': ['microsoft azure', 'azure devops'],
  'sql': ['database management', 'relational database', 'postgresql', 'mysql', 'querying'],
  'agile': ['scrum master', 'kanban', 'software development lifecycle', 'sdlc', 'sprints'],
  'frontend': ['ui engineering', 'client-side', 'user interface'],
  'backend': ['server-side', 'api development', 'infrastructure engineering'],
  'cybersecurity': ['information security', 'infosec', 'penetration testing', 'threat detection'],

  // PROJECT & OPERATIONS
  'project management': ['managing projects', 'project coordination', 'pm', 'pmo', 'delivery management'],
  'operations': ['ops', 'process improvement', 'operational excellence', 'efficiency'],
  'leadership': ['management', 'team lead', 'mentoring', 'head of'],
  'stakeholder management': ['client relations', 'business communication', 'managing expectations'],

  // FINANCE & LEGAL
  'compliance': ['regulatory standards', 'audit', 'risk management', 'governance'],
  'finance': ['accounting', 'financial analysis', 'budgeting', 'p&l'],
  'data analysis': ['business intelligence', 'bi', 'data visualization', 'analytics'],

  // HEALTHCARE & CLINICAL
  'clinical': ['patient care', 'medical records', 'healthcare administration', 'hospital'],
  'research': ['clinical trials', 'data collection', 'laboratory', 'scientific method'],

  // MARKETING & SALES
  'digital marketing': ['seo', 'sem', 'content strategy', 'social media management'],
  'sales': ['business development', 'account management', 'lead generation', 'revenue growth'],
  'ui/ux': ['user experience', 'user interface design', 'product design', 'wireframing']
};

export const matchAnalysisService = {
  /**
   * Run local regex-based match calculation as a fallback
   */
  calculateLocalMatchScore(jobDescription: string, resumeText: string): MatchScoreResult {
    const jobText = jobDescription.toLowerCase();
    const resText = resumeText.toLowerCase();

    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const foundKeywords = TECH_KEYWORDS.filter(skill => {
      const escapedSkill = escapeRegExp(skill);
      const skillRegex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      const hasSkill = skillRegex.test(jobText);
      
      const synonyms = SYNONYMS[skill] || [];
      const hasSynonym = synonyms.some(syn => {
        const synRegex = new RegExp(`\\b${escapeRegExp(syn)}\\b`, 'i');
        return synRegex.test(jobText);
      });

      return hasSkill || hasSynonym;
    });

    if (foundKeywords.length === 0) {
      return { score: 0, matchingSkills: [], missingSkills: [], weightedDetails: { coreMatches: [], secondaryMatches: [] } };
    }

    const matchingSkills = foundKeywords.filter(skill => {
      const escapedSkill = escapeRegExp(skill);
      const skillRegex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      const hasSkill = skillRegex.test(resText);

      const synonyms = SYNONYMS[skill] || [];
      const hasSynonym = synonyms.some(syn => {
        const synRegex = new RegExp(`\\b${escapeRegExp(syn)}\\b`, 'i');
        return synRegex.test(resText);
      });

      return hasSkill || hasSynonym;
    });

    const missingSkills = foundKeywords.filter(skill => !matchingSkills.includes(skill));

    let totalPossibleWeight = 0;
    let earnedWeight = 0;

    foundKeywords.forEach(skill => {
      const weight = KEYWORD_WEIGHTS[skill.toLowerCase()] || 1;
      totalPossibleWeight += weight;
      if (matchingSkills.includes(skill)) {
        earnedWeight += weight;
      }
    });

    const score = Math.round((earnedWeight / totalPossibleWeight) * 100);

    const coreMatches = matchingSkills.filter(s => (KEYWORD_WEIGHTS[s.toLowerCase()] || 1) >= 1.5);
    const secondaryMatches = matchingSkills.filter(s => (KEYWORD_WEIGHTS[s.toLowerCase()] || 1) < 1.5);

    const warnings: string[] = [];
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
