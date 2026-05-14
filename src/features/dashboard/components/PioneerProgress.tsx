import * as React from 'react';
import { CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProgressStep {
  id: string;
  label: string;
  description: string;
  isCompleted: boolean;
  link: string;
  linkText: string;
}

interface PioneerProgressProps {
  hasJobs: boolean;
  hasResumes: boolean;
  hasApplications: boolean;
}

export const PioneerProgress: React.FC<PioneerProgressProps> = ({ 
  hasJobs, 
  hasResumes,
  hasApplications 
}) => {
  const steps: ProgressStep[] = [
    {
      id: 'import',
      label: 'Import First Job',
      description: 'Use the LinkedIn importer to find your first opportunity.',
      isCompleted: hasJobs,
      link: '/pipeline',
      linkText: 'Open Pipeline'
    },
    {
      id: 'resume',
      label: 'Materialize Resume',
      description: 'Upload your PDF to unlock the ATS Match Engine.',
      isCompleted: hasResumes,
      link: '/resumes',
      linkText: 'Upload PDF'
    },
    {
      id: 'apply',
      label: 'Track Application',
      description: 'Move a job to the "Applied" stage to start tracking.',
      isCompleted: hasApplications,
      link: '/pipeline',
      linkText: 'Update Status'
    },
    {
      id: 'pwa',
      label: 'Install App',
      description: 'Add Udyog Marg to your dock for psychological trust.',
      isCompleted: false, // Future PWA logic
      link: '#',
      linkText: 'Coming Soon'
    }
  ];

  const completedCount = steps.filter(s => s.isCompleted).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8 md:p-10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FC6100]/5 blur-[100px] -mr-32 -mt-32"></div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-[#FC6100]" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Pioneer's Progress</h3>
          </div>
          <p className="text-xs text-gray-500 font-medium">Complete these steps to become a <span className="text-[#FC6100] font-bold">100% Career Engineer</span>.</p>
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="flex-1 md:w-48 h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-[#FC6100] transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(252,97,0,0.5)]"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-xl font-bold text-white tracking-tighter">{completedCount}/{steps.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 relative z-10">
        {steps.map((step, idx) => (
          <div 
            key={step.id}
            className={`p-6 rounded-2xl border transition-all ${
              step.isCompleted 
                ? 'bg-[#FC6100]/5 border-[#FC6100]/20' 
                : 'bg-white/[0.01] border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                step.isCompleted ? 'bg-[#FC6100] text-white' : 'bg-white/5 text-gray-600'
              }`}>
                {step.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-[10px] font-black">{idx + 1}</span>}
              </div>
            </div>
            <h4 className={`text-xs font-black uppercase tracking-widest mb-2 ${step.isCompleted ? 'text-white' : 'text-gray-500'}`}>
              {step.label}
            </h4>
            <p className="text-[10px] text-gray-600 leading-relaxed mb-6 font-medium">
              {step.description}
            </p>
            {!step.isCompleted && (
              <Link 
                to={step.link}
                className="text-[10px] font-black uppercase tracking-widest text-[#FC6100] hover:gap-3 flex items-center gap-2 transition-all"
              >
                {step.linkText} <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
