import { supabase } from '../../../lib/supabaseClient';
import type { DiscoveredJob } from './apifyService';

export const jobRelevanceService = {
  /**
   * Fast, intent-based job search via Adzuna Edge Function
   */
  async searchJobs(query: string, country: string): Promise<DiscoveredJob[]> {
    try {
      const { data, error } = await supabase.functions.invoke('search-jobs', {
        body: { query, country }
      });

      if (error) throw error;
      return data as DiscoveredJob[];
    } catch (err: any) {
      console.error("[jobRelevanceService] Error fetching from Adzuna proxy:", err.message);
      throw new Error("Unable to retrieve live jobs right now.");
    }
  }
};
