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
  generateGuide(jobTitle: string, matchResult: MatchScoreResult, resumeText?: string): InterviewQuestion[] {
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

    // 4. Tenure Reframe (The "Un-learner" logic)
    const longTenureDetected = resumeText && (
      resumeText.includes('10 years') || 
      resumeText.includes('14 years') || 
      (resumeText.match(/20\d{2}/g)?.length || 0) < 5 // Few date changes suggest long stays
    );

    if (longTenureDetected) {
      questions.push({
        question: `You spent a significant amount of time at your last role. How have you ensured your skills stayed modern and didn't become 'institutionalized'?`,
        type: 'behavioral',
        suggestedAngle: `This is the 'Un-learner' challenge. Reframe your 14 years as '7 different 2-year roles' where you constantly evolved. Talk about the new technologies you introduced, not just the ones you used.`
      });
    }

    // 5. Seniority Clash (The "Reality Check" follow-up)
    if (matchResult.warnings?.some(w => w.includes('overqualified'))) {
      questions.push({
        question: `This role might seem like a step back in seniority for someone with your background. Why are you interested in it?`,
        type: 'behavioral',
        suggestedAngle: `Focus on your desire to get back to 'hands-on' work or your specific passion for this project. Defuse the fear that you'll leave for a higher role.`
      });
    }

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
