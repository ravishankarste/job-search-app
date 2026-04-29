import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, ChevronRight, ExternalLink } from 'lucide-react';
import type { JobWithApplication } from '../services/jobService';

interface JobCardProps {
  job: JobWithApplication;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <div className="clean-card p-5 group relative bg-[#121212] border-white/10 hover:border-[#FC6100]/50">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-[#FC6100]/10 border border-[#FC6100]/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#FC6100] transition-colors">
          <Building2 className="w-6 h-6 text-[#FC6100] group-hover:text-white transition-colors" />
        </div>
        
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-500 hover:text-[#FC6100] hover:bg-[#FC6100]/10 rounded-lg transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      <div className="space-y-1 mb-6">
        <h4 className="text-base font-bold text-white group-hover:text-[#FC6100] transition-colors line-clamp-1">
          {job.title}
        </h4>
        <p className="text-sm font-semibold text-gray-400">{job.company_name}</p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center text-[11px] text-gray-500 font-bold uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#FC6100]/50" />
          {job.location || 'Remote'}
        </div>
        
        <Link
          to={`/jobs/${job.id}`}
          className="p-1.5 bg-white/5 text-gray-500 group-hover:bg-[#FC6100] group-hover:text-white rounded-lg transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
