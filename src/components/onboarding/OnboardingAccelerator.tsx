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
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC6100]">Instant Start</span>
        </div>
        <h2 className="text-4xl font-bold text-white tracking-tighter leading-tight">
          Build your pipeline in <span className="text-[#FC6100]">30 seconds.</span>
        </h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto font-medium">
          Your pipeline is empty. Import your first role to unlock your <strong>Match Score</strong> and track your progress.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Dominant Path: LinkedIn Import */}
        <button
          onClick={onImportClick}
          data-testid="onboarding-import-btn"
          className="clean-card group bg-[#FC6100]/10 hover:bg-[#FC6100]/20 border-[#FC6100]/30 hover:border-[#FC6100]/50 transition-all duration-500 text-left flex items-center justify-between p-8 md:p-10 tactile-press relative overflow-hidden shadow-2xl shadow-[#FC6100]/10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FC6100]/10 blur-[100px] -mr-32 -mt-32"></div>
          
          <div className="flex items-center gap-8 relative z-10">
            <div className="w-20 h-20 bg-[#FC6100] rounded-[24px] flex items-center justify-center shadow-2xl shadow-[#FC6100]/30 group-hover:scale-105 transition-transform">
              <LinkIcon className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-2xl font-bold text-white tracking-tight">Universal Job Importer</h3>
                <div className="flex gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8px] font-black uppercase tracking-wider">LinkedIn</span>
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[8px] font-black uppercase tracking-wider">Indeed</span>
                  <span className="px-2 py-0.5 rounded bg-[#FC6100]/10 text-[#FC6100] border border-[#FC6100]/20 text-[8px] font-black uppercase tracking-wider">Sovereign Fallback</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-medium max-w-sm">
                Paste any LinkedIn or Indeed job URL. We'll automatically extract the job requirements, company details, and salary.
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full group-hover:gap-5 transition-all">
            Open Importer <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Secondary Path: Sample */}
          <button
            onClick={handleSampleInjection}
            disabled={isCreating}
            data-testid="onboarding-sample-btn"
            className="clean-card group bg-white/[0.02] hover:bg-white/[0.05] border-white/5 hover:border-white/10 transition-all duration-500 text-left flex items-center gap-6 p-6 tactile-press"
          >
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white tracking-tight">Try with Sample Job</h3>
              <p className="text-[10px] text-gray-500 font-medium">Inject a mock Netflix role into your pipeline.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
          </button>

          {/* Secondary Path: Manual */}
          <button
            onClick={onManualClick}
            data-testid="onboarding-manual-btn"
            className="clean-card group bg-white/[0.02] hover:bg-white/[0.05] border-white/5 hover:border-white/10 transition-all duration-500 text-left flex items-center gap-6 p-6 tactile-press"
          >
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white tracking-tight">Add Job Manually</h3>
              <p className="text-[10px] text-gray-500 font-medium">Copy and paste details from any other source.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};
