import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, ChevronRight, ExternalLink, Ghost } from 'lucide-react';
import type { JobWithApplication } from '../services/jobService';

import { useMatchScore } from '../hooks/useMatchScore';
import { MatchScoreBadge } from './MatchScoreBadge';

interface JobCardProps {
  job: JobWithApplication;
  onFollowUpClick?: (companyName: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onFollowUpClick }) => {
  const navigate = useNavigate();
  const { score, isLoading } = useMatchScore(job.title, job.description);

  // Ghost Detection Logic: > 14 days without update on active applications
  const isGhosted = () => {
    if (!job.application) return false;
    const status = job.application.status;
    if (status !== 'applied' && status !== 'interviewing') return false;
    
    const dateString = job.application.updated_at || job.application.created_at;
    if (!dateString) return false;
    const updatedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - updatedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    return diffDays > 14;
  };

  const ghosted = isGhosted();

  return (
    <div 
      onClick={() => navigate(`/jobs/${job.id}`)}
      className={`clean-card p-5 group relative bg-white/[0.02] border-white/5 hover:border-[#FC6100]/30 cursor-pointer transition-all ${
        ghosted ? 'border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]' : 'shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
      }`}
    >

      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-[#FC6100]/10 border border-[#FC6100]/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#FC6100] transition-colors">
          <Building2 className="w-6 h-6 text-[#FC6100] group-hover:text-white transition-colors" />
        </div>
        
        <div className="flex items-center gap-2">
          <MatchScoreBadge score={score} isLoading={isLoading} size="sm" showLabel={false} />
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
    </div>
  );
};
