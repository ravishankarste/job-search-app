import { supabase } from '../lib/supabaseClient';

export interface UserFeedback {
  sentiment: string;
  content?: string;
  path: string;
  user_id?: string;
}

export const feedbackService = {
  /**
   * Scribe user sentiment into the Sovereign Vault
   */
  async submitFeedback(feedback: UserFeedback): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_feedback')
        .insert([{
          sentiment: feedback.sentiment,
          content: feedback.content,
          path: feedback.path,
          user_id: feedback.user_id
        }]);

      if (error) throw error;
    } catch (error) {
      // Silent Resilience: For background intelligence capture, we log the error 
      // but do not throw, ensuring the user experience remains uninterrupted.
      console.error('[Intelligence] Failed to scribe feedback:', error);
    }
  }
};
