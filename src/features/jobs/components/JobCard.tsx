import React from 'react';
import { Link } from 'react-router-dom';
import type { JobWithApplication } from '../services/jobService';
import { StatusBadge } from './StatusBadge';
import { Building2, MapPin, Calendar, ExternalLink } from 'lucide-react';

interface JobCardProps {
  job: JobWithApplication;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const formattedDate = job.created_at
    ? new Date(job.created_at).toLocaleDateString()
    : 'Recently';

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Building2 className="w-4 h-4 mr-1.5 text-gray-400" />
            {job.company_name}
          </div>
        </div>
        {job.application && <StatusBadge status={job.application.status || 'saved'} />}
      </div>

      <div className="mt-4 flex flex-wrap gap-y-2 gap-x-4">
        {job.location && (
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
            {job.location}
          </div>
        )}
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
          Saved {formattedDate}
        </div>
      </div>

      {job.url && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-blue-600 font-medium group-hover:underline flex items-center">
            View details <ExternalLink className="w-3 h-3 ml-1" />
          </span>
          {job.employment_type && (
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
              {job.employment_type}
            </span>
          )}
        </div>
      )}
    </Link>
  );
};
