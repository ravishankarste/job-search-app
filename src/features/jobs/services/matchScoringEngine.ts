// A lightweight, rules-based engine for text matching and keyword extraction
// This avoids expensive LLM calls for initial diffing

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it',
  'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these',
  'they', 'this', 'to', 'was', 'will', 'with', 'we', 'you', 'your', 'i', 'my', 'me'
]);

export interface MatchScoreResult {
  score: number; // 0-100 percentage
  matchedKeywords: string[];
  missingKeywords: string[];
}

export const matchScoringEngine = {
  /**
   * Extracts meaningful keywords from a block of text
   */
  extractKeywords(text: string): string[] {
    if (!text) return [];
    
    // Normalize text: lowercase, replace punctuation with spaces
    const normalized = text.toLowerCase().replace(/[^\w\s-]/g, ' ');
    
    // Split into words, filter out stop words, numbers, and short words
    const words = normalized.split(/\s+/).filter(word => 
      word.length > 2 && 
      !STOP_WORDS.has(word) && 
      isNaN(Number(word))
    );
    
    // Count frequencies
    const freq: Record<string, number> = {};
    for (const w of words) {
      freq[w] = (freq[w] || 0) + 1;
    }
    
    // Sort by frequency, take top 30 unique meaningful words
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 30);
  },

  /**
   * Compares resume text against a job description
   */
  computeMatchScore(jobDescription: string, resumeText: string): MatchScoreResult {
    const jobKeywords = this.extractKeywords(jobDescription);
    const resumeKeywords = this.extractKeywords(resumeText);
    
    if (jobKeywords.length === 0) {
      return { score: 0, matchedKeywords: [], missingKeywords: [] };
    }

    const resumeSet = new Set(resumeKeywords);
    
    const matched: string[] = [];
    const missing: string[] = [];
    
    for (const kw of jobKeywords) {
      if (resumeSet.has(kw)) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    }
    
    const score = Math.round((matched.length / jobKeywords.length) * 100);
    
    return {
      score,
      matchedKeywords: matched,
      missingKeywords: missing
    };
  }
};
