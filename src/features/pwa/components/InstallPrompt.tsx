import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    
    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
      // Delay showing the prompt slightly so it doesn't overwhelm immediately on load
      setTimeout(() => setIsVisible(true), 3000);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:top-1/2 md:-translate-y-1/2 md:right-6 md:bottom-auto md:left-auto md:w-96 bg-white dark:bg-gray-900 border border-purple-500/30 rounded-xl p-4 shadow-2xl z-50 animate-in slide-in-from-right-5 slide-in-from-bottom-5">
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-4">
        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
          {isIOS ? <Share className="text-purple-600 dark:text-purple-400" size={24} /> : <Download className="text-purple-600 dark:text-purple-400" size={24} />}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Install Udyog Marg</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {isIOS 
              ? "Install the app for faster access. Tap the share icon below and select 'Add to Home Screen'."
              : "Install our Progressive Web App to your home screen for instant access to your ATS scores."}
          </p>
          
          {!isIOS && deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Install App
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
