import React from 'react';
import type { ResumeVersion } from '../services/resumeService';
import { ResumeVersionCard } from './ResumeVersionCard';

interface ResumeVersionTimelineProps {
  versions: ResumeVersion[];
  isLoading: boolean;
}

export const ResumeVersionTimeline: React.FC<ResumeVersionTimelineProps> = ({
  versions,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg w-full"></div>
        ))}
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
        <p className="text-sm text-gray-500">No versions uploaded yet.</p>
        <p className="text-xs text-gray-400 mt-1">Upload your first PDF to get started.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l border-gray-200 ml-3 space-y-6 pb-4">
      {versions.map((version) => (
        <div key={version.id} className="relative pl-6">
          <span className="absolute -left-1.5 top-5 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-white"></span>
          <ResumeVersionCard version={version} />
        </div>
      ))}
    </div>
  );
};
