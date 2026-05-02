// No imports needed for now as we use CoverLetterParams interface below

export interface CoverLetterParams {
  jobTitle: string;
  companyName: string;
  matchingSkills: string[];
  targetRole: string;
}

export const coverLetterGeneratorService = {
  /**
   * Generates a tailored cover letter draft based on matching skills
   */
  generateDraft(params: CoverLetterParams): string {
    const { jobTitle, companyName, matchingSkills, targetRole } = params;

    // Determine the skills highlight section
    const skillsList = matchingSkills.length > 0 
      ? `Specifically, my experience with ${matchingSkills.slice(0, 3).join(', ')} aligns perfectly with the technical requirements of this position.`
      : `My background as a ${targetRole || 'Software Professional'} has prepared me to contribute effectively to your engineering team from day one.`;

    const draft = `Dear Hiring Team at ${companyName},

I am writing to express my strong interest in the ${jobTitle} position. Having followed ${companyName}'s recent growth and impact in the industry, I am eager to bring my background in ${targetRole || 'software development'} to your team.

${skillsList} Throughout my career, I have focused on building scalable, high-performance solutions and collaborating with cross-functional teams to deliver exceptional user experiences.

I am particularly drawn to this role at ${companyName} because of your commitment to technical excellence. I am confident that my problem-solving skills and passion for building quality software would make me a valuable asset to your organization.

Thank you for your time and consideration. I look forward to the possibility of discussing how my experience can help ${companyName} achieve its goals.

Sincerely,
[Your Name]`;

    return draft;
  }
};
