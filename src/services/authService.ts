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

  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return { user: data.user, session: data.session };
    } catch (error) {
      return handleApiError(error);
    }
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { user: data.user, session: data.session };
    } catch (error) {
      return handleApiError(error);
    }
  },

  async signInWithGoogle(): Promise<void> {
    try {
      // In the new root-level deployment, we no longer need the /jobs suffix
      const baseUrl = window.location.origin;
      const redirectTo = `${baseUrl}/dashboard`;
      console.log('Initiating Google Sign-in with redirect:', redirectTo);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      });
      if (error) throw error;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  async signInWithIdToken(token: string, nonce?: string): Promise<AuthResponse> {
    try {
      // If no nonce was passed, attempt to extract it from the token as a fallback
      if (!nonce) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const pad = base64.length % 4;
          const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;
          const jsonPayload = decodeURIComponent(window.atob(paddedBase64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const payload = JSON.parse(jsonPayload);
          nonce = payload.nonce;
        } catch (e) {
          console.warn('Could not parse ID token for fallback nonce:', e);
        }
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token,
        nonce,
      });
      if (error) throw error;
      return { user: data.user, session: data.session };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
