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
}

export const matchAnalysisService = {
  /**
   * Calculate a match score between a job description and a resume text
   */
  calculateMatchScore(jobDescription: string, resumeText: string): MatchScoreResult {
    if (!jobDescription || !resumeText) {
      return { score: 0, matchingSkills: [], missingSkills: [] };
    }

    const jobText = jobDescription.toLowerCase();
    const resText = resumeText.toLowerCase();

    // Helper to escape special regex characters (like C++)
    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    // 1. Identify which tech keywords are present in the job description
    const foundKeywords = TECH_KEYWORDS.filter(skill => {
      const escapedSkill = escapeRegExp(skill);
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      return regex.test(jobText);
    });

    if (foundKeywords.length === 0) {
      return { score: 0, matchingSkills: [], missingSkills: [] };
    }

    // 2. See which of those found keywords are in the resume
    const matchingSkills = foundKeywords.filter(skill => {
      const escapedSkill = escapeRegExp(skill);
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      return regex.test(resText);
    });

    const missingSkills = foundKeywords.filter(skill => !matchingSkills.includes(skill));

    // 3. Calculate score based on keyword coverage
    // We give a base score for presence and then scale it
    const score = Math.round((matchingSkills.length / foundKeywords.length) * 100);

    return {
      score,
      matchingSkills,
      missingSkills
    };
  }
};
