import { supabase } from '../../../lib/supabaseClient';
import type { Database } from '../../../types/supabase';
import { handleApiError } from '../../../services/apiClient';

export type Followup = Database['public']['Tables']['followups']['Row'];
export type FollowupInsert = Database['public']['Tables']['followups']['Insert'];

export interface FollowUpTemplate {
  subject: string;
  body: string;
}

export const followupService = {
  /**
   * Fetch all followups for a specific application
   */
  async getFollowupsByApplication(applicationId: string): Promise<Followup[]> {
    try {
      const { data, error } = await supabase
        .from('followups')
        .select('*')
        .eq('application_id', applicationId)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Fetch all upcoming/pending followups across all applications for the user
   */
  async getUpcomingTasks(): Promise<any[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('followups')
        .select(`
          *,
          application:applications!inner(
            id,
            profile_id,
            job:jobs(id, title, company_name)
          )
        `)
        .is('completed_at', null)
        .order('scheduled_at', { ascending: true })
        .limit(5);

      if (error) throw error;
      
      // Clean up the nested structure for the UI
      return (data || []).map(task => ({
        ...task,
        job: Array.isArray(task.application?.job) ? task.application?.job[0] : task.application?.job
      }));
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create a new followup task
   */
  async createFollowup(followupData: FollowupInsert): Promise<Followup> {
    try {
      const { data, error } = await supabase
        .from('followups')
        .insert(followupData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Mark a followup as completed
   */
  async toggleFollowupCompletion(followupId: string, isCompleted: boolean): Promise<Followup> {
    try {
      const { data, error } = await supabase
        .from('followups')
        .update({ 
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', followupId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete a followup task
   */
  async deleteFollowup(followupId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('followups')
        .delete()
        .eq('id', followupId);

      if (error) throw error;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * NEW: Checks if an application is "Stale" (No activity for X days)
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
   * NEW: Drafts a professional follow-up email
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
