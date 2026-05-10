import React from 'react';
import { createPortal } from 'react-dom';
import { X, Target, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface MatchScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  matchingSkills: string[];
  missingSkills: string[];
  warnings?: string[];
  jobTitle: string;
  companyName: string;
}

export const MatchScoreModal: React.FC<MatchScoreModalProps> = ({
  isOpen,
  onClose,
  score,
  matchingSkills,
  missingSkills,
  warnings,
  jobTitle,
  companyName
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      {/* Modal Content - Using var(--color-brand-surface) for consistency */}
      <div className="relative bg-[#121212] border border-white/10 rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden fade-in-up">
        {/* Subtle Brand Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FC6100]/5 blur-[100px] -mr-32 -mt-32"></div>

        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Target className="w-8 h-8 text-[#FC6100]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Scoring Transparency</h2>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">
                {jobTitle} <span className="mx-2 text-gray-700">•</span> {companyName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 pt-4 space-y-8 relative z-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Summary Section */}
          <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Calculated Match</span>
              <div className="text-3xl font-black text-white">{score}%</div>
            </div>
            
            <div className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
              score >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 
              score >= 50 ? 'bg-yellow-500/10 text-yellow-400' : 
              'bg-[#FC6100]/10 text-[#FC6100]'
            }`}>
              {score >= 80 ? 'Strong Match' : score >= 50 ? 'Competitive' : 'Action Required'}
            </div>
          </div>

          {/* Asset vs Gap Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Matched Keywords</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchingSkills.length > 0 ? (
                  matchingSkills.map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 text-emerald-500/70 text-[11px] font-bold rounded-lg uppercase tracking-wider">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-600 italic">No matches found yet.</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#FC6100]" />
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Missing Requirements</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingSkills.length > 0 ? (
                  missingSkills.map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-[#FC6100]/5 border border-[#FC6100]/10 text-[#FC6100]/70 text-[11px] font-bold rounded-lg uppercase tracking-wider">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-emerald-600 font-bold italic">You meet every requirement!</p>
                )}
              </div>
            </div>
          </div>

          {/* Warnings / Reality Checks */}
          {warnings && warnings.length > 0 && (
            <div className="p-5 bg-orange-500/5 border border-orange-500/10 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-orange-400">
                <AlertCircle className="w-4 h-4" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Reality Check</h4>
              </div>
              {warnings.map((warning, idx) => (
                <p key={idx} className="text-[11px] text-orange-200/70 font-medium leading-relaxed">
                  {warning}
                </p>
              ))}
            </div>
          )}

          {/* Logic Explanation */}
          <div className="p-6 bg-[#FC6100]/5 border border-[#FC6100]/10 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-[#FC6100]">
              <Info className="w-4 h-4" />
              <h4 className="text-[10px] font-black uppercase tracking-widest">How we scored this</h4>
            </div>
            <p className="text-[12px] text-gray-400 leading-relaxed font-medium">
              Udyog Marg uses a **Weighted Keyword Engine**. Core technical skills are worth **2x points**, while methodologies and tools are worth **1x**. Improving your score involves integrating missing high-impact keywords into your resume.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0 flex justify-center opacity-40">
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
            Analysis Engine v1.2.0 • Data-Driven Transparency
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};
