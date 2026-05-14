import React from 'react';
import { jobService } from '../../features/jobs/services/jobService';
import { resumeService } from '../../features/resumes/services/resumeService';
import { trackEvent } from '../../lib/analytics';
import { useQueryClient } from '@tanstack/react-query';
import { JOBS_QUERY_KEY } from '../../features/jobs/hooks/useJobs';
import { Zap, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export const OnboardingHydrator: React.FC = () => {
  const [isHydrating, setIsHydrating] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const queryClient = useQueryClient();
  const hydrationLock = React.useRef(false);

  React.useEffect(() => {
    const hydrateSandboxData = async () => {
      // 1. SOVEREIGN LOCK: Prevent double-execution
      if (hydrationLock.current) return;
      
      const savedState = localStorage.getItem('udyog_marg_sandbox_state');
      
      if (!savedState) return;

      // 2. INSTANT CLEAR: Remove from storage BEFORE async calls
      localStorage.removeItem('udyog_marg_sandbox_state');
      hydrationLock.current = true;

      try {
        const { jobText, resumeText } = JSON.parse(savedState);
        
        console.log("[OnboardingHydrator] Sandbox state detected:", { 
          hasJob: !!jobText, 
          hasResume: !!resumeText,
          jobLength: jobText?.length,
          resumeLength: resumeText?.length 
        });

        if (!jobText || !resumeText) {
          console.warn("[OnboardingHydrator] Incomplete sandbox data. Aborting hydration.");
          setIsHydrating(false);
          return;
        }

        setIsHydrating(true);

        // SAFETY GATE: Only hydrate if user has 0 jobs
        const currentJobs = queryClient.getQueryData<any[]>(JOBS_QUERY_KEY) || [];
        if (currentJobs.length > 0) {
          setIsHydrating(false);
          return;
        }

        // 1. Create the Resume Record from Sandbox Text
        const newResume = await resumeService.createResume('Imported Sandbox Resume', 'Target Role (From Scan)');
        
        // 2. Create the "Ghost Version" (Text-only version for immediate Match Logic)
        const { error: versionError } = await supabase
          .from('resume_versions')
          .insert({
            resume_id: newResume.id,
            version_number: 1,
            file_url: null, // No physical PDF yet
            content: { 
              label: 'Sandbox Import',
              extractedText: resumeText // This is what the Match Engine needs
            }
          });

        if (versionError) throw versionError;
        
        // 3. Create the Job Application with CORRECT SCHEMA MAPPING
        const jobWithApp = await jobService.createJob({
          company_name: 'Target Company (From Scan)',
          title: 'Target Role (From Scan)',
          description: jobText,
          url: '',
          location: 'Remote',
          salary_range: {},
          employment_type: 'full-time'
        });

        // 4. Link the Resume to the Application for INSTANT MATCH SCORE
        if (jobWithApp.application) {
          await jobService.linkResumeToApplication(jobWithApp.application.id, newResume.id);
        }

        // Track the success
        trackEvent('sandbox_data_hydrated', { hasResume: !!resumeText, fullHydration: true });
        
        // Refresh the jobs and resumes list to ensure Match Engine sees the new data
        queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: ['resumes'] });
        queryClient.invalidateQueries({ queryKey: ['resume-version'] });
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      } catch (err) {
        console.error("Hydration failed", err);
      } finally {
        setIsHydrating(false);
      }
    };

    hydrateSandboxData();
  }, [queryClient]);

  if (isHydrating) {
    return (
      <div className="bg-[#FC6100]/10 border border-[#FC6100]/20 rounded-2xl p-4 mb-8 flex items-center gap-4 animate-pulse">
        <Zap className="w-5 h-5 text-[#FC6100]" />
        <span className="text-sm font-bold text-white tracking-tight">Importing your sandbox analysis...</span>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-8 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
        <div className="flex items-center gap-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-tight">Zero-Friction Import Complete!</span>
            <span className="text-xs text-gray-400 font-medium">Your sandbox match is now tracked in your pipeline.</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
