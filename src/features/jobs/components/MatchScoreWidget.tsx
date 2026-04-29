import React, { useState, useMemo } from 'react';
import { Target, AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { matchScoringEngine } from '../services/matchScoringEngine';
import { useJobActions } from '../hooks/useJobActions';

interface MatchScoreWidgetProps {
  jobId: string;
  jobDescription?: string | null;
}

export const MatchScoreWidget: React.FC<MatchScoreWidgetProps> = ({ jobId, jobDescription }) => {
  const [resumeText, setResumeText] = useState('');
  const [newJobDescription, setNewJobDescription] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { updateJobDescription, isUpdatingJobDescription } = useJobActions();

  const result = useMemo(() => {
    if (!jobDescription || !resumeText) return null;
    return matchScoringEngine.computeMatchScore(jobDescription, resumeText);
  }, [jobDescription, resumeText]);

  const handleSaveDescription = async () => {
    if (!newJobDescription.trim()) return;
    await updateJobDescription({ jobId, description: newJobDescription });
  };

  if (!jobDescription) {
    return (
      <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-sm space-y-6">
        <div>
          <h3 className="font-black text-xl text-white uppercase tracking-tighter flex items-center">
            <Target className="w-5 h-5 mr-2 text-[#FC6100]" /> ATS Match Score
          </h3>
          <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">Hybrid Rules-Based Engine</p>
        </div>

        <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-6 space-y-4">
          <div className="flex items-center text-gray-400">
            <AlertCircle className="w-5 h-5 mr-3 text-[#FC6100]" />
            <p className="text-sm font-bold">Add the job description to unlock Match Scoring.</p>
          </div>
          <textarea
            value={newJobDescription}
            onChange={(e) => setNewJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="w-full h-32 px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FC6100] focus:ring-1 focus:ring-[#FC6100] resize-y"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSaveDescription}
              disabled={isUpdatingJobDescription || !newJobDescription.trim()}
              className="px-6 py-3 bg-[#FC6100] text-white text-sm font-bold rounded-xl hover:bg-[#E35205] transition-all disabled:opacity-50 flex items-center"
            >
              {isUpdatingJobDescription ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Description</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-sm space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-black text-xl text-white uppercase tracking-tighter flex items-center">
            <Target className="w-5 h-5 mr-2 text-[#FC6100]" /> ATS Match Score
          </h3>
          <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">Hybrid Rules-Based Engine</p>
        </div>
        {result && (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-3xl font-black text-[#FC6100]">{result.score}%</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Match Rate</div>
            </div>
          </div>
        )}
      </div>

      {!result && !isExpanded ? (
        <button 
          onClick={() => setIsExpanded(true)}
          className="w-full py-4 border border-dashed border-white/20 rounded-2xl text-gray-400 font-bold text-sm hover:border-[#FC6100] hover:text-[#FC6100] transition-colors flex justify-center items-center"
        >
          Paste your Resume text to scan keywords
        </button>
      ) : null}

      {(isExpanded || result) && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="relative">
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste the raw text of your resume here..."
              className="w-full h-32 px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FC6100] focus:ring-1 focus:ring-[#FC6100] resize-y"
            />
          </div>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
          <div>
            <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Matched Keywords ({result.matchedKeywords.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.matchedKeywords.length === 0 ? (
                <span className="text-xs text-gray-600">None found</span>
              ) : (
                result.matchedKeywords.map(kw => (
                  <span key={kw} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg">
                    {kw}
                  </span>
                ))
              )}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5" /> Missing Keywords ({result.missingKeywords.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.missingKeywords.length === 0 ? (
                <span className="text-xs text-gray-600">Perfect match!</span>
              ) : (
                result.missingKeywords.map(kw => (
                  <span key={kw} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg">
                    {kw}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
