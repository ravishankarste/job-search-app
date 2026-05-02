import React, { useState } from 'react';
import { Mic, HelpCircle, Lightbulb, Sparkles } from 'lucide-react';
import { interviewPrepService } from '../services/interviewPrepService';
import type { InterviewQuestion } from '../services/interviewPrepService';
import type { MatchScoreResult } from '../services/matchAnalysisService';

interface InterviewPrepWidgetProps {
  jobTitle: string;
  companyName: string;
  matchResult: MatchScoreResult;
}

export const InterviewPrepWidget: React.FC<InterviewPrepWidgetProps> = ({ 
  jobTitle, 
  companyName, 
  matchResult 
}) => {
  const [guide, setGuide] = useState<InterviewQuestion[] | null>(null);
  const [pitch, setPitch] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate a brief analysis time for a premium feel
    setTimeout(() => {
      const newGuide = interviewPrepService.generateGuide(jobTitle, matchResult);
      const newPitch = interviewPrepService.generateElevatorPitch(jobTitle, companyName, matchResult.matchingSkills);
      setGuide(newGuide);
      setPitch(newPitch);
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="bg-[#121212] border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[60px] -mr-16 -mt-16"></div>
      
      <div className="flex justify-between items-center relative z-10">
        <div>
          <h3 className="font-black text-xl text-white uppercase tracking-tighter flex items-center">
            <Mic className="w-5 h-5 mr-2 text-purple-500" /> Interview Prep Mode
          </h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Virtual Coaching & Strategy</p>
        </div>
        {!guide && (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
          >
            {isGenerating ? 'Analyzing Role...' : <><Sparkles className="w-4 h-4" /> Generate Prep Guide</>}
          </button>
        )}
      </div>

      {guide && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Elevator Pitch Section */}
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-purple-400">
              <Mic className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Your 30-Second Intro</span>
            </div>
            <p className="text-sm text-gray-300 italic leading-relaxed font-medium">"{pitch}"</p>
          </div>

          {/* Questions Grid */}
          <div className="grid grid-cols-1 gap-4">
            {guide.map((q, idx) => (
              <div key={idx} className="group p-5 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-2xl transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
                    q.type === 'strength' ? 'bg-emerald-500/10 text-emerald-500' :
                    q.type === 'gap' ? 'bg-[#FC6100]/10 text-[#FC6100]' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white leading-snug">{q.question}</h4>
                    <div className="flex items-start gap-2 p-3 bg-white/[0.03] rounded-xl border border-white/5">
                      <Lightbulb className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic">
                        <span className="text-white not-italic font-black uppercase tracking-widest mr-1">Pro Tip:</span>
                        {q.suggestedAngle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setGuide(null)}
            className="w-full py-3 text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors"
          >
            Refresh Guide
          </button>
        </div>
      )}

      {!guide && !isGenerating && (
        <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Click above to generate your customized interview strategy.</p>
        </div>
      )}
    </div>
  );
};
