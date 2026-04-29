import React from 'react';
import type { ApplicationStatus } from '../services/jobService';

interface StatusBadgeProps {
  status: ApplicationStatus;
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  saved:       { label: 'Saved',       color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  applied:     { label: 'Applied',     color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  interviewing:{ label: 'Interviewing',color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  offered:     { label: 'Offered',     color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  rejected:    { label: 'Rejected',    color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || statusConfig.saved;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.color}`}>
      {config.label}
    </span>
  );
};
