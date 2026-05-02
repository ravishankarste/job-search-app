/**
 * Match Analysis Service
 * Calculates the compatibility between a Resume and a Job Description.
 */

// A comprehensive list of tech keywords to look for
const TECH_KEYWORDS = [
  'react', 'typescript', 'javascript', 'next.js', 'node.js', 'python', 'java', 'go', 'golang',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'sql', 'nosql', 'mongodb', 'postgresql',
  'graphql', 'rest', 'api', 'microservices', 'devops', 'ci/cd', 'git', 'agile', 'scrum',
  'frontend', 'backend', 'fullstack', 'mobile', 'react native', 'flutter', 'swift', 'kotlin',
  'machine learning', 'ai', 'data science', 'security', 'cybersecurity', 'cloud', 'serverless',
  'testing', 'jest', 'cypress', 'terraform', 'ansible', 'prometheus', 'grafana', 'redis',
  'kafka', 'rabbitmq', 'elasticsearch', 'rust', 'c++', 'c#', 'dotnet', 'django', 'flask',
  'engineer', 'developer', 'senior', 'junior', 'lead', 'manager', 'automation', 'qa', 'architect'
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
