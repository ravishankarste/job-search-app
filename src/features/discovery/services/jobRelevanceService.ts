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
      
      const results = data as DiscoveredJob[];
      if (results && results.length > 0) {
        return results;
      }
      return [];
    } catch (err: any) {
      console.error("[jobRelevanceService] Error fetching from Aggregator proxy:", err.message);
      throw new Error("All discovery engines failed. Please try again later.");
    }
  }
};
