import * as React from 'react';
import { CheckCircle2, ArrowRight, Zap, X, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProgressStep {
  id: string;
  label: string;
  description: string;
  isCompleted: boolean;
  link: string;
  linkText: string;
  action?: (e: React.MouseEvent) => void;
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
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [showGuide, setShowGuide] = React.useState(false);

  React.useEffect(() => {
    // 1. Detect standalone (PWA) display mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    
    if (isStandalone || localStorage.getItem('pwa_installed') === 'true') {
      setIsInstalled(true);
    }

    // 2. Capture Chrome/Edge browser PWA installation trigger
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // 3. Mark as installed when process completes
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      localStorage.setItem('pwa_installed', 'true');
      
      // Trigger instant victory celebration confetti
      import('../../../lib/confetti').then(({ triggerConfetti }) => triggerConfetti());
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        localStorage.setItem('pwa_installed', 'true');
        import('../../../lib/confetti').then(({ triggerConfetti }) => triggerConfetti());
      }
      setDeferredPrompt(null);
    } else {
      setShowGuide(true);
    }
  };

  const steps: ProgressStep[] = [
    {
      id: 'import',
      label: 'Compare First Job',
      description: 'Compare your resume with a job link to calculate your compatibility score.',
      isCompleted: hasJobs,
      link: '/pipeline',
      linkText: 'Compare Job'
    },
    {
      id: 'resume',
      label: 'Upload Resume',
      description: 'Upload your PDF or Word document to unlock the ATS Match Engine.',
      isCompleted: hasResumes,
      link: '/resumes',
      linkText: 'Upload Resume'
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
      description: isInstalled 
        ? 'App successfully added to your desktop/dock!'
        : 'Add Udyog Marg to your dock for psychological trust.',
      isCompleted: isInstalled,
      link: '#',
      linkText: isInstalled ? 'Installed 🚀' : 'Install Now',
      action: !isInstalled ? handleInstallClick : undefined
    }
  ];

  const completedCount = steps.filter(s => s.isCompleted).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8 md:p-10 relative group">
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
            className={`p-6 rounded-2xl border transition-all flex flex-col justify-between h-full min-h-[160px] ${
              step.isCompleted 
                ? 'bg-[#FC6100]/5 border-[#FC6100]/20' 
                : 'bg-white/[0.01] border-white/5 hover:border-white/10'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  step.isCompleted ? 'bg-[#FC6100] text-white' : 'bg-white/5 text-gray-600'
                }`}>
                  {step.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-[10px] font-black">{idx + 1}</span>}
                </div>
              </div>
              <h4 className={`text-[10px] font-black uppercase tracking-[0.15em] mb-2 leading-snug ${step.isCompleted ? 'text-white' : 'text-gray-500'}`}>
                {step.label}
              </h4>
              <p className="text-[9px] text-gray-500 leading-relaxed mb-4 font-medium">
                {step.description}
              </p>
            </div>
            {!step.isCompleted && (
              step.action ? (
                <button 
                  onClick={step.action}
                  className="text-[9px] font-black uppercase tracking-widest text-[#FC6100] hover:gap-3 flex items-center gap-2 transition-all mt-auto cursor-pointer self-start"
                >
                  {step.linkText} <ArrowRight className="w-2.5 h-2.5" />
                </button>
              ) : (
                <Link 
                  to={step.link}
                  className="text-[9px] font-black uppercase tracking-widest text-[#FC6100] hover:gap-3 flex items-center gap-2 transition-all mt-auto self-start"
                >
                  {step.linkText} <ArrowRight className="w-2.5 h-2.5" />
                </Link>
              )
            )}
          </div>
        ))}
      </div>

      {/* Premium Install Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="w-14 h-14 bg-[#FC6100]/10 rounded-2xl flex items-center justify-center border border-[#FC6100]/20">
                <Monitor className="w-7 h-7 text-[#FC6100]" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white tracking-tight">App Installation Guide</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC6100]">Sovereign App Launcher</p>
              </div>

              <div className="space-y-4 text-xs text-gray-400 font-medium leading-relaxed">
                <p>Udyog Marg runs natively on your machine as an installable desktop or mobile app.</p>
                
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                  <div className="flex gap-3">
                    <span className="w-5 h-5 bg-[#FC6100]/20 border border-[#FC6100]/30 rounded flex items-center justify-center text-[10px] font-black text-[#FC6100] shrink-0">1</span>
                    <p><strong>For Chrome, Edge, or Brave:</strong> Look for the <strong>Install Udyog Marg</strong> computer icon in your URL address bar, or click your browser's menu button `(⋮)` and select <strong>Save and share &rarr; Install page</strong>.</p>
                  </div>
                  <div className="flex gap-3 border-t border-white/5 pt-3">
                    <span className="w-5 h-5 bg-[#FC6100]/20 border border-[#FC6100]/30 rounded flex items-center justify-center text-[10px] font-black text-[#FC6100] shrink-0">2</span>
                    <p><strong>For iOS Safari:</strong> Tap the <strong>Share</strong> icon in your mobile browser toolbar, scroll down, and tap <strong>Add to Home Screen</strong>.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-4">
                <button
                  onClick={() => setShowGuide(false)}
                  className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-white bg-[#FC6100] border border-transparent rounded-xl hover:bg-[#E35205] transition-all tactile-press flex items-center justify-center shadow-lg shadow-[#FC6100]/20"
                >
                  Got It, Thanks!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
