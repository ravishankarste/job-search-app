import React from 'react';
import { Target, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useMatchScore } from '../hooks/useMatchScore';
import { useResumes } from '../../resumes/hooks/useResumes';
import { useQuery } from '@tanstack/react-query';
import { resumeService } from '../../resumes/services/resumeService';

interface MatchScoreWidgetProps {
  jobId: string;
  jobTitle: string;
  jobDescription?: string | null;
  linkedResumeId?: string | null;
}

export const MatchScoreWidget: React.FC<MatchScoreWidgetProps> = ({ 
  jobTitle, 
  jobDescription, 
  linkedResumeId 
}) => {
  // 3. Run the match analysis
  const { score, matchingSkills, missingSkills, isLoading } = useMatchScore(
    jobTitle,
    jobDescription || ""
  );


  return (
    <div className="bg-[#121212] border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FC6100]/5 blur-[60px] -mr-16 -mt-16"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <h3 className="font-black text-xl text-white uppercase tracking-tighter flex items-center">
            <Target className="w-5 h-5 mr-2 text-[#FC6100]" /> ATS Match Score
          </h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
            Analysis based on {linkedResumeId ? "linked resume" : "primary resume"}
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex items-center gap-3">
             <Loader2 className="w-6 h-6 animate-spin text-[#FC6100]" />
             <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Analyzing...</span>
          </div>
        ) : (
          <div className="text-right">
            <div className={`text-4xl font-black ${score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-yellow-500' : 'text-[#FC6100]'}`}>
              {score}%
            </div>
            <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Overall Compatibility</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {/* Matching Skills */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Matched Keywords</h4>
          </div>
          <div className="flex flex-wrap gap-2">
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
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#FC6100]" />
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Missing Requirements</h4>
          </div>
          <div className="flex flex-wrap gap-2">
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

      {!jobDescription && (
        <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest leading-relaxed">
            Note: Job description is missing. Score is based on title only.
          </p>
        </div>
      )}
    </div>
  );
};
