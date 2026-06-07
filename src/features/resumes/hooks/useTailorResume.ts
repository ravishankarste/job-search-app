import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export function useTailorResume() {
  const [isTailoring, setIsTailoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tailorResume = async (resumeId: string, applicationId: string) => {
    setIsTailoring(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('tailor-resume', {
        body: { resumeId, applicationId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data.tailoredResumeId;
    } catch (err: any) {
      console.error('Tailor Resume Error:', err);
      setError(err.message || 'Failed to tailor resume.');
      throw err;
    } finally {
      setIsTailoring(false);
    }
  };

  return { tailorResume, isTailoring, error };
}
