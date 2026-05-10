import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, ChevronRight, ExternalLink, Ghost } from 'lucide-react';
import type { JobWithApplication } from '../services/jobService';

import { useMatchScore } from '../hooks/useMatchScore';
import { MatchScoreBadge } from './MatchScoreBadge';

import { followupService } from '../services/followupService';
import { MatchScoreModal } from './MatchScoreModal';

interface JobCardProps {
  job: JobWithApplication;
  onFollowUpClick?: (companyName: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onFollowUpClick }) => {
  const navigate = useNavigate();
  const [showScoreDetails, setShowScoreDetails] = React.useState(false);
  const { score, matchingSkills, missingSkills, warnings, isLoading } = useMatchScore(job.title, job.description);

  const ghosted = job.application?.status === 'applied' || job.application?.status === 'interviewing'
    ? followupService.isStale(job.application.updated_at || job.application.created_at)
    : false;

  return (
    <div 
      onClick={() => navigate(`/pipeline/${job.id}`)}
      className={`clean-card p-5 group relative bg-white/[0.02] border-white/5 hover:border-[#FC6100]/30 cursor-pointer transition-all ${
        ghosted ? 'border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]' : 'shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
      }`}
    >

      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-[#FC6100]/10 border border-[#FC6100]/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#FC6100] transition-colors">
          <Building2 className="w-6 h-6 text-[#FC6100] group-hover:text-white transition-colors" />
        </div>
        
        <div className="flex items-center gap-2">
          <MatchScoreBadge 
            score={score} 
            isLoading={isLoading} 
            size="sm" 
            showLabel={false} 
            onClick={(e) => {
              e.stopPropagation();
              setShowScoreDetails(true);
            }}
          />
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Original Job Posting"
              className="p-1.5 text-gray-500 hover:text-[#FC6100] hover:bg-[#FC6100]/10 rounded-lg transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      <div className="space-y-1 mb-6">
        <h4 className="text-base font-bold text-white group-hover:text-[#FC6100] transition-colors line-clamp-1 pr-8">
          {job.title}
        </h4>
        <p className="text-sm font-semibold text-gray-400">{job.company_name}</p>
        
        {ghosted && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFollowUpClick?.(job.company_name);
            }}
            className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 text-[11px] font-bold rounded-lg border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all cursor-pointer"
          >
            <Ghost className="w-3 h-3" />
            Ghosted? Follow up
          </button>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center text-[11px] text-gray-500 font-bold uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#FC6100]/50" />
          {job.location || 'Remote'}
        </div>
        
        <div className="p-1.5 bg-white/5 text-gray-500 group-hover:bg-[#FC6100] group-hover:text-white rounded-lg transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      <MatchScoreModal
        isOpen={showScoreDetails}
        onClose={() => setShowScoreDetails(false)}
        score={score}
        matchingSkills={matchingSkills}
        missingSkills={missingSkills}
        warnings={warnings}
        jobTitle={job.title}
        companyName={job.company_name}
      />
    </div>
  );
};
