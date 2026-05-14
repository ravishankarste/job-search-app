import React from 'react';
import { Target, CheckCircle2, AlertCircle, Loader2, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { useMatchScore } from '../hooks/useMatchScore';
import { trackEvent } from '../../../lib/analytics';
import { feedbackService } from '../../../services/feedbackService';
import { useAuth } from '../../../contexts/AuthContext';

interface MatchScoreWidgetProps {
  jobId: string;
  jobTitle: string;
  jobDescription?: string | null;
  linkedResumeId?: string | null;
}

export const MatchScoreWidget: React.FC<MatchScoreWidgetProps> = ({ 
  jobId,
  jobTitle, 
  jobDescription, 
  linkedResumeId 
}) => {
  // 3. Run the match analysis
  const { score, matchingSkills, missingSkills, warnings, isLoading, hasResumeText } = useMatchScore(
    jobTitle,
    jobDescription || "",
    linkedResumeId
  );
  
  const { user } = useAuth();
  const [hasVoted, setHasVoted] = React.useState(false);
  const [isScribeReady, setIsScribeReady] = React.useState(false);

  // Set the "Loaded" Switch once analysis and auth are stable
  React.useEffect(() => {
    if (!isLoading && user !== undefined) {
      setIsScribeReady(true);
    }
  }, [isLoading, user]);

  const handleVote = async (isAccurate: boolean) => {
    // BLOCK the save if the scribe isn't ready
    if (!isScribeReady) return;

    setHasVoted(true);
    
    // 1. Track in PostHog
    trackEvent('match_score_validation', {
      job_id: jobId,
      score,
      is_accurate: isAccurate
    });

    // 2. Scribe to Supabase
    await feedbackService.submitFeedback({
      sentiment: isAccurate ? 'love' : 'confused',
      content: `User voted ${isAccurate ? 'ACCURATE' : 'INACCURATE'} for score: ${score}% on job: ${jobTitle}`,
      path: window.location.pathname,
      user_id: user?.id
    });
  };

  // Track the 'Aha' moment when the score is viewed
  React.useEffect(() => {
    if (!isLoading && score !== undefined) {
      trackEvent('match_score_viewed', {
        job_id: jobId,
        score: score,
        company: jobTitle // Use title as proxy for context
      });
    }
  }, [isLoading, score, jobId, jobTitle]);


  return (
    <div className="bg-[#121212] border border-white/5 rounded-[32px] p-8 md:p-10 pb-12 shadow-2xl space-y-8 relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FC6100]/5 blur-[60px] -mr-16 -mt-16"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-2">
          <h3 className="font-black text-xl text-white uppercase tracking-tight flex items-center">
            <Target className="w-5 h-5 mr-2 text-[#FC6100]" /> ATS Match Score
          </h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Analysis based on {linkedResumeId ? "linked resume" : "primary resume"}
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex items-center gap-3">
             <Loader2 className="w-6 h-6 animate-spin text-[#FC6100]" />
             <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Analyzing...</span>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            {!hasVoted ? (
              <div className="flex flex-col items-center gap-2 pr-6 border-r border-white/5">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Accurate?</span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleVote(false)}
                    disabled={!isScribeReady}
                    data-testid="match-vote-down"
                    className={`p-1.5 rounded-lg transition-colors ${
                      !isScribeReady 
                        ? 'text-gray-800 cursor-not-allowed opacity-50' 
                        : 'text-gray-600 hover:bg-red-500/10 hover:text-red-500'
                    }`}
                    title="Inaccurate"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleVote(true)}
                    disabled={!isScribeReady}
                    data-testid="match-vote-up"
                    className={`p-1.5 rounded-lg transition-colors ${
                      !isScribeReady 
                        ? 'text-gray-800 cursor-not-allowed opacity-50' 
                        : 'text-gray-600 hover:bg-emerald-500/10 hover:text-emerald-500'
                    }`}
                    title="Accurate"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 pr-6 border-r border-white/5 animate-in fade-in slide-in-from-right-2">
                <div className="w-7 h-7 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter">Verified</span>
              </div>
            )}
            
            <div className="text-right">
              <div className={`text-4xl font-black ${score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-yellow-500' : 'text-[#FC6100]'}`}>
                {score}%
              </div>
              <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Overall Compatibility</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {/* Matching Skills */}
        <div className="space-y-4 px-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Matched Keywords</h4>
          </div>
          <div className="flex flex-wrap gap-2 pb-2">
            {matchingSkills.length > 0 ? (
              matchingSkills.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold rounded-lg uppercase tracking-wider">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-600 font-bold italic">No technical matches found yet.</span>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="space-y-4 px-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#FC6100]" />
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Missing Requirements</h4>
          </div>
          <div className="flex flex-wrap gap-2 pb-2">
            {missingSkills.length > 0 ? (
              missingSkills.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-[#FC6100]/10 border border-[#FC6100]/20 text-[#FC6100] text-[11px] font-bold rounded-lg uppercase tracking-wider">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-600 font-bold italic">You have all the required keywords!</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Reality Check / Seniority Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Reality Check</h4>
          </div>
          <div className="flex flex-col gap-3">
            {(warnings || []).map((warning: string, idx: number) => (
              <div key={idx} className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-3">
                 <AlertCircle className="w-4 h-4 text-orange-400 shrink-0" />
                 <p className="text-[11px] text-orange-200 font-bold leading-relaxed">
                   {warning}
                 </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!jobDescription || !hasResumeText) && (
        <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest leading-relaxed">
            {!jobDescription 
              ? "Note: Job description is missing. Score is based on title only."
              : "Analysis cannot proceed: Linked resume has no text content."}
          </p>
        </div>
      )}
    </div>
  );
};
