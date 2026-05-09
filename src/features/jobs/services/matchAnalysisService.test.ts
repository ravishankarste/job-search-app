import { describe, it, expect } from 'vitest';
import { matchAnalysisService } from './matchAnalysisService';

describe('matchAnalysisService', () => {
  const mockResume = `
    Senior Software Engineer with experience in React, TypeScript, and AWS.
    Focused on building scalable frontend applications and cloud infrastructure.
  `;

  it('should calculate a basic match score correctly', () => {
    const jobDescription = 'Looking for a Senior React Developer with TypeScript skills.';
    const result = matchAnalysisService.calculateMatchScore(jobDescription, mockResume);
    
    expect(result.score).toBeGreaterThan(0);
    expect(result.matchingSkills).toContain('react');
    expect(result.matchingSkills).toContain('typescript');
    expect(result.matchingSkills).toContain('senior');
  });

  it('should handle synonym mapping (AWS vs Amazon Web Services)', () => {
    const jobDescription = 'Experience with Amazon Web Services is required.';
    const result = matchAnalysisService.calculateMatchScore(jobDescription, mockResume);
    
    expect(result.matchingSkills).toContain('aws');
  });

  it('should detect overqualification (Senior Resume vs Junior Job)', () => {
    const juniorJob = 'Junior Frontend Developer role for entry-level candidates.';
    const result = matchAnalysisService.calculateMatchScore(juniorJob, mockResume);
    
    expect(result.warnings).toContain("Reality Check: You appear overqualified for this role. Hiring managers may fear you'll leave for a higher-paying position.");
  });

  it('should return zero score for completely unrelated texts', () => {
    const unrelatedJob = 'Professional chef needed for Italian restaurant.';
    const result = matchAnalysisService.calculateMatchScore(unrelatedJob, mockResume);
    
    expect(result.score).toBe(0);
    expect(result.matchingSkills).toHaveLength(0);
  });
});
