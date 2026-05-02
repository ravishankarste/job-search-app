export interface FollowUpTemplate {
  subject: string;
  body: string;
}

export const followUpService = {
  /**
   * Checks if an application is "Stale" (No activity for X days)
   */
  isStale(updatedAt: string | null | undefined, days: number = 14): boolean {
    if (!updatedAt) return false;
    const lastUpdate = new Date(updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastUpdate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= days;
  },

  /**
   * Drafts a professional follow-up email
   */
  generateFollowUp(jobTitle: string, companyName: string): FollowUpTemplate {
    return {
      subject: `Following up: ${jobTitle} application - [Your Name]`,
      body: `Hi Hiring Team at ${companyName},

I hope you're having a great week!

I'm writing to briefly check in on the status of my application for the ${jobTitle} position. I'm still very excited about the opportunity to join ${companyName} and contribute to your team's success.

Please let me know if there are any additional materials or information I can provide to help with your decision-making process.

Looking forward to hearing from you!

Best regards,
[Your Name]
[Phone Number]`
    };
  }
};
