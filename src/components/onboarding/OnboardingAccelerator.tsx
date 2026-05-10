import React from 'react';
import { Sparkles, Link as LinkIcon, Plus, ArrowRight, Zap } from 'lucide-react';
import { useJobActions } from '../../features/jobs/hooks/useJobActions';
import { trackEvent } from '../../lib/analytics';

interface OnboardingAcceleratorProps {
  onManualClick: () => void;
  onImportClick: () => void;
}

export const OnboardingAccelerator: React.FC<OnboardingAcceleratorProps> = ({
  onManualClick,
  onImportClick,
}) => {
  const { createJob, isCreating } = useJobActions();

  const handleSampleInjection = async () => {
    trackEvent('onboarding_sample_job_injected');
    
    await createJob({
      company_name: 'Netflix',
      title: 'Senior Software Engineer (UI)',
      location: 'Los Gatos, CA (Remote)',
      description: `About the Role:\nWe are looking for a Senior UI Engineer to join our Content Experience team. You will be responsible for building the next generation of Netflix's discovery interface.\n\nRequirements:\n- 5+ years of experience with React and TypeScript.\n- Deep understanding of browser performance and rendering.\n- Experience with high-scale distributed systems.\n- Passion for cinematic user experiences.\n\nBonus:\n- Experience with GraphQL and Node.js.\n- Strong design sensibility.`,
      employment_type: 'full-time',
      url: 'https://jobs.netflix.com/jobs/sample-demo'
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 fade-in-up">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FC6100]/10 border border-[#FC6100]/20 rounded-full mb-4 pulse-brand">
          <Zap className="w-4 h-4 text-[#FC6100]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC6100]">Accelerator Active</span>
        </div>
        <h2 className="text-4xl font-bold text-white tracking-tighter">The Accelerator</h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto font-medium">
          Your pipeline is empty. Let's get your first <strong>Match Score</strong> calculated so you can see how you stack up against the competition.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Option 1: The Hook (Sample Injection) */}
        <button
          onClick={handleSampleInjection}
          disabled={isCreating}
          className="clean-card group bg-white/[0.02] hover:bg-[#FC6100]/5 border-white/10 hover:border-[#FC6100]/40 transition-all duration-500 text-left relative overflow-hidden flex flex-col justify-between h-full p-6 tactile-press"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
             <Sparkles className="w-12 h-12 text-[#FC6100]" />
          </div>
          
          <div>
            <div className="w-12 h-12 bg-[#FC6100]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-[#FC6100]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Try with Sample</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
              Inject a pre-filled <strong>Staff Engineer @ Netflix</strong> role to see the Match Engine in action immediately.
            </p>
          </div>

          <div className="mt-8 flex items-center text-[10px] font-black uppercase tracking-widest text-[#FC6100] group-hover:translate-x-1 transition-transform">
            {isCreating ? 'Injecting...' : '1-Click Launch'} <ArrowRight className="w-3 h-3 ml-2" />
          </div>
        </button>

        {/* Option 2: The Import */}
        <button
          onClick={onImportClick}
          className="clean-card group bg-white/[0.02] hover:bg-emerald-500/5 border-white/10 hover:border-emerald-500/40 transition-all duration-500 text-left flex flex-col justify-between h-full p-6 tactile-press"
        >
          <div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <LinkIcon className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">LinkedIn Import</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
              Found a job? Paste the URL and let our <strong>Smart Scraper</strong> pull the description and salary data for you.
            </p>
          </div>

          <div className="mt-8 flex items-center text-[10px] font-black uppercase tracking-widest text-emerald-500 group-hover:translate-x-1 transition-transform">
            Open Importer <ArrowRight className="w-3 h-3 ml-2" />
          </div>
        </button>

        {/* Option 3: The Manual */}
        <button
          onClick={onManualClick}
          className="clean-card group bg-white/[0.02] hover:bg-white/5 border-white/10 hover:border-white/30 transition-all duration-500 text-left flex flex-col justify-between h-full p-6 tactile-press"
        >
          <div>
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Manual Add</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
              Already have the job details? Paste them directly into your pipeline to start <strong>Keyword Analysis</strong>.
            </p>
          </div>

          <div className="mt-8 flex items-center text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white group-hover:translate-x-1 transition-transform">
            Quick Add <ArrowRight className="w-3 h-3 ml-2" />
          </div>
        </button>
      </div>
    </div>
  );
};
