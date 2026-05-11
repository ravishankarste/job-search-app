import React from 'react';
import { X, MessageSquare, Heart, Zap } from 'lucide-react';
import { trackEvent } from '../../lib/analytics';
import { useAuth } from '../../contexts/AuthContext';
import { feedbackService } from '../../services/feedbackService';

interface ExitNudgeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExitNudge: React.FC<ExitNudgeProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = React.useState<'initial' | 'feedback' | 'thanks'>('initial');
  const [sentiment, setSentiment] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSentiment = (s: string) => {
    setSentiment(s);
    
    // 1. Track in PostHog (Passive Analytics)
    trackEvent('exit_nudge_sentiment_click', { 
      sentiment: s,
      path: window.location.pathname
    });

    if (s === 'love') {
      // Direct submit for 'love' as it's a quick win
      submitFeedback(s, '');
    } else {
      // Show content step for others to capture intelligence
      setStep('feedback');
    }
  };

  const submitFeedback = async (s: string, content: string) => {
    // Scribe to Supabase (Sovereign Intelligence)
    await feedbackService.submitFeedback({
      sentiment: s,
      content: content || undefined,
      path: window.location.pathname,
      user_id: user?.id
    });

    setStep('thanks');
    
    setTimeout(() => {
      onClose();
      // Reset for next time
      setTimeout(() => {
        setStep('initial');
        setSentiment(null);
      }, 500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md fade-in"
        onClick={onClose}
      />
      
      {/* Nudge Card */}
      <div className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl shadow-orange-500/10 fade-in-up">
        <button 
          onClick={onClose}
          data-testid="exit-nudge-close"
          className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10 pt-12 text-center">
          {step === 'initial' && (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-[#FC6100] to-[#FF9E00] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-orange-500/20 rotate-3">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight font-display mb-4 uppercase">How are we doing?</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-10 font-medium">
                We'd love to hear your thoughts so we can make <span className="text-[#FC6100]">Udyog Marg</span> even better for you.
              </p>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => handleSentiment('love')}
                  data-testid="sentiment-love-btn"
                  className="flex items-center justify-between w-full p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-[#FC6100]/10 hover:border-[#FC6100]/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <Heart className="w-6 h-6 text-[#FC6100] group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-white uppercase tracking-wider text-xs">It's Game-Changing</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>

                <button 
                  onClick={() => handleSentiment('confused')}
                  data-testid="sentiment-confused-btn"
                  className="flex items-center justify-between w-full p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-purple-500/10 hover:border-purple-500/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <Zap className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-white uppercase tracking-wider text-xs">A bit confused</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>

                <button 
                  onClick={() => handleSentiment('missing')}
                  data-testid="sentiment-missing-btn"
                  className="flex items-center justify-between w-full p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <MessageSquare className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-white uppercase tracking-wider text-xs">Missing Features</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </>
          )}

          {step === 'feedback' && (
            <div className="fade-in">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                {sentiment === 'confused' ? <Zap className="w-8 h-8 text-purple-500" /> : <MessageSquare className="w-8 h-8 text-blue-500" />}
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight font-display mb-2 uppercase">
                {sentiment === 'confused' ? "What's confusing?" : "What's missing?"}
              </h3>
              <p className="text-gray-400 text-xs mb-6">Your feedback helps us build the perfect Job Search tool.</p>
              
              <textarea 
                autoFocus
                data-testid="feedback-textarea"
                placeholder="Type your thoughts..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-[#FC6100] focus:ring-1 focus:ring-[#FC6100] outline-none transition-all mb-6 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    submitFeedback(sentiment!, (e.target as HTMLTextAreaElement).value);
                  }
                }}
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => setStep('initial')}
                  className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-xs font-bold text-gray-500 hover:text-white transition-all uppercase"
                >
                  Back
                </button>
                <button 
                  onClick={() => {
                    const el = document.querySelector('textarea') as HTMLTextAreaElement;
                    submitFeedback(sentiment!, el.value);
                  }}
                  data-testid="feedback-submit-btn"
                  className="flex-[2] px-6 py-3 bg-[#FC6100] rounded-xl text-xs font-bold text-white hover:bg-[#E35205] transition-all uppercase shadow-lg shadow-orange-500/20"
                >
                  Send Feedback
                </button>
              </div>
            </div>
          )}

          {step === 'thanks' && (
            <div className="fade-in py-10">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Heart className="w-10 h-10 text-green-500 fill-green-500" />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight font-display mb-4 uppercase">Received!</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-medium">
                Your feedback helps us build a better platform. Thanks for being with us!
              </p>
            </div>
          )}
        </div>

        <div className="bg-white/[0.02] p-6 border-t border-white/5">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Udyog Marg Collective • Feedback Pulse</p>
        </div>
      </div>
    </div>
  );
};

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
