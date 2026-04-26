import { supabase } from '../lib/supabaseClient';
import { handleApiError } from './apiClient';
import type { User, Session } from '@supabase/supabase-js';

// Auth Response Types
export interface AuthResponse {
  user: User | null;
  session: Session | null;
}

export const authService = {
  async getSession(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { user: data.session?.user || null, session: data.session };
    } catch (error) {
      return handleApiError(error);
    }
  },

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Note: Actual login/signup logic will typically be handled in the feature slice
  // (e.g. features/auth/api/...) but global auth service methods can stay here
  // or act as a wrapper if needed.
};
