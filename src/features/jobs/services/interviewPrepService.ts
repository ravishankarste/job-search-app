import type { MatchScoreResult } from './matchAnalysisService';

export interface InterviewQuestion {
  question: string;
  type: 'strength' | 'gap' | 'behavioral';
  suggestedAngle: string;
}

export const interviewPrepService = {
  /**
   * Generates a custom interview preparation guide based on match data
   */
  generateGuide(jobTitle: string, matchResult: MatchScoreResult): InterviewQuestion[] {
    const questions: InterviewQuestion[] = [];

    // 1. Strength-Based (Matching Skills)
    if (matchResult.matchingSkills.length > 0) {
      const topSkill = matchResult.matchingSkills[0];
      questions.push({
        question: `Can you walk us through a complex project where you heavily utilized ${topSkill}?`,
        type: 'strength',
        suggestedAngle: `Since this is a core requirement and you have it on your resume, use the STAR method to highlight a specific win with ${topSkill}.`
      });
    }

    // 2. Gap-Based (Missing Skills) - The "Trap" Question
    if (matchResult.missingSkills.length > 0) {
      const gapSkill = matchResult.missingSkills[0];
      questions.push({
        question: `This role requires experience with ${gapSkill}. How would you approach learning or implementing this if you were hired?`,
        type: 'gap',
        suggestedAngle: `Be honest about your current level, but pivot quickly to a similar tool you DO know (e.g., "While I haven't used ${gapSkill} at scale, I am an expert in [Similar Tool] and have already started a proof-of-concept with ${gapSkill}...")`
      });
    }

    // 3. The "Why Us" (Tailored to the Role)
    questions.push({
      question: `Why are you the best fit for this ${jobTitle} position specifically?`,
      type: 'behavioral',
      suggestedAngle: `Combine your top matching skills (${matchResult.matchingSkills.slice(0, 2).join(' & ')}) with your excitement for their specific industry.`
    });

    // 4. Behavioral / Leadership
    questions.push({
      question: "Tell us about a time you had to deliver a project under a tight deadline. What was your strategy?",
      type: 'behavioral',
      suggestedAngle: "Focus on prioritization and communication—traits every hiring manager looks for."
    });

    return questions;
  },

  /**
   * Generates a 30-second "Elevator Pitch" intro
   */
  generateElevatorPitch(jobTitle: string, companyName: string, matchingSkills: string[]): string {
    const skillsPart = matchingSkills.length > 0 
      ? `I've spent the last few years honing my skills in ${matchingSkills.slice(0, 2).join(' and ')}`
      : `I'm a dedicated professional with a strong background in software engineering`;

    return `Hi, I'm [Your Name]. I'm a ${jobTitle} who loves building scalable solutions. ${skillsPart}, and I've been following ${companyName} for a while now because of your impact in the industry. I'm excited about the possibility of bringing my problem-solving approach to your team!`;
  }
};
