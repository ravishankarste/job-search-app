import { supabase } from '../../../lib/supabaseClient';
import type { Database } from '../../../types/supabase';
import { handleApiError } from '../../../services/apiClient';

export type CoverLetter = Database['public']['Tables']['cover_letters']['Row'];

export const coverLetterService = {
  /**
   * Fetch the cover letter for a specific application
   */
  async getCoverLetterForApplication(applicationId: string): Promise<CoverLetter | null> {
    try {
      const { data, error } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Upsert a cover letter for an application
   */
  async saveCoverLetter(applicationId: string, content: string): Promise<CoverLetter> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Check if it exists first
      const { data: existing } = await supabase
        .from('cover_letters')
        .select('id')
        .eq('application_id', applicationId)
        .maybeSingle();

      if (existing) {
        // Update
        const { data, error } = await supabase
          .from('cover_letters')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from('cover_letters')
          .insert({
            profile_id: user.id,
            application_id: applicationId,
            content
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    } catch (error) {
      return handleApiError(error);
    }
  }
};
