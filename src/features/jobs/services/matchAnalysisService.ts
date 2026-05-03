/**
 * Match Analysis Service
 * Calculates the compatibility between a Resume and a Job Description.
 */

// A comprehensive list of tech keywords to look for
// A Universal, Multi-Industry Keyword Library for the ATS Engine
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

export interface MatchScoreResult {
  score: number; // 0-100
  matchingSkills: string[];
  missingSkills: string[];
  weightedDetails?: {
    coreMatches: string[];
    secondaryMatches: string[];
  };
}

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
  'CI/CD': ['continuous integration', 'continuous delivery', 'deployment pipeline', 'automated deployment'],
  'AWS': ['amazon web services', 'ec2', 's3', 'lambda'],
  'GCP': ['google cloud platform', 'bigquery', 'cloud run'],
  'Azure': ['microsoft azure', 'azure devops'],
  'SQL': ['database management', 'relational database', 'postgresql', 'mysql', 'querying'],
  'Agile': ['scrum master', 'kanban', 'software development lifecycle', 'sdlc', 'sprints'],
  'Frontend': ['ui engineering', 'client-side', 'user interface'],
  'Backend': ['server-side', 'api development', 'infrastructure engineering'],
  'Cybersecurity': ['information security', 'infosec', 'penetration testing', 'threat detection'],

  // PROJECT & OPERATIONS
  'Project Management': ['managing projects', 'project coordination', 'pm', 'pmo', 'delivery management'],
  'Operations': ['ops', 'process improvement', 'operational excellence', 'efficiency'],
  'Leadership': ['management', 'team lead', 'mentoring', 'head of'],
  'Stakeholder Management': ['client relations', 'business communication', 'managing expectations'],

  // FINANCE & LEGAL
  'Compliance': ['regulatory standards', 'audit', 'risk management', 'governance'],
  'Finance': ['accounting', 'financial analysis', 'budgeting', 'p&l'],
  'Data Analysis': ['business intelligence', 'bi', 'data visualization', 'analytics'],

  // HEALTHCARE & CLINICAL
  'Clinical': ['patient care', 'medical records', 'healthcare administration', 'hospital'],
  'Research': ['clinical trials', 'data collection', 'laboratory', 'scientific method'],

  // MARKETING & SALES
  'Digital Marketing': ['seo', 'sem', 'content strategy', 'social media management'],
  'Sales': ['business development', 'account management', 'lead generation', 'revenue growth'],
  'UI/UX': ['user experience', 'user interface design', 'product design', 'wireframing']
};

export const matchAnalysisService = {
  /**
   * Calculate a weighted match score between a job description and a resume text
   */
  calculateMatchScore(jobDescription: string, resumeText: string): MatchScoreResult {
    if (!jobDescription || !resumeText) {
      return { score: 0, matchingSkills: [], missingSkills: [], weightedDetails: { coreMatches: [], secondaryMatches: [] } };
    }

    const jobText = jobDescription.toLowerCase();
    const resText = resumeText.toLowerCase();

    // Helper to escape special regex characters
    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    // 1. Identify keywords present in the Job Description (including synonyms)
    const foundKeywords = TECH_KEYWORDS.filter(skill => {
      const escapedSkill = escapeRegExp(skill);
      const skillRegex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      const hasSkill = skillRegex.test(jobText);
      
      // Check synonyms if primary word not found
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

    // 2. See which of those are in the Resume
    const matchingSkills = foundKeywords.filter(skill => {
      const escapedSkill = escapeRegExp(skill);
      const skillRegex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      const hasSkill = skillRegex.test(resText);

      // Check synonyms in resume too
      const synonyms = SYNONYMS[skill] || [];
      const hasSynonym = synonyms.some(syn => {
        const synRegex = new RegExp(`\\b${escapeRegExp(syn)}\\b`, 'i');
        return synRegex.test(resText);
      });

      return hasSkill || hasSynonym;
    });

    const missingSkills = foundKeywords.filter(skill => !matchingSkills.includes(skill));

    // 3. Apply Weighted Scoring
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

    // 4. Categorize for Delta UI
    const coreMatches = matchingSkills.filter(s => (KEYWORD_WEIGHTS[s.toLowerCase()] || 1) >= 1.5);
    const secondaryMatches = matchingSkills.filter(s => (KEYWORD_WEIGHTS[s.toLowerCase()] || 1) < 1.5);

    return {
      score,
      matchingSkills,
      missingSkills,
      weightedDetails: {
        coreMatches,
        secondaryMatches
      }
    };
  }
};
