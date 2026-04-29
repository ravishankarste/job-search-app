import { supabase } from '../../../lib/supabaseClient';
import type { Database } from '../../../types/supabase';
import { handleApiError } from '../../../services/apiClient';

export type Followup = Database['public']['Tables']['followups']['Row'];
export type FollowupInsert = Database['public']['Tables']['followups']['Insert'];

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
  }
};
