import React from 'react';
import type { ResumeVersion } from '../services/resumeService';
import { ResumeVersionCard } from './ResumeVersionCard';

interface ResumeVersionTimelineProps {
  versions: ResumeVersion[];
  isLoading: boolean;
  isSelectionMode?: boolean;
  selectedIds?: string[];
  onToggleSelection?: (id: string) => void;
  onViewVersion?: (version: ResumeVersion) => void;
}

export const ResumeVersionTimeline: React.FC<ResumeVersionTimelineProps> = ({
  versions,
  isLoading,
  isSelectionMode = false,
  selectedIds = [],
  onToggleSelection,
  onViewVersion,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white/5 border border-white/10 rounded-2xl w-full"></div>
        ))}
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-12 bg-white/2 border border-dashed border-white/10 rounded-2xl">
        <p className="text-sm text-gray-400 font-bold">No versions uploaded yet.</p>
        <p className="text-xs text-gray-600 mt-2">Upload your first PDF to get started.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-white/10 ml-3 space-y-6 pb-4">
      {versions.map((version) => (
        <div key={version.id} className="relative pl-6">
          <span className={`absolute -left-[5px] top-5 w-2.5 h-2.5 rounded-full ring-4 ring-[#121212] transition-colors ${selectedIds.includes(version.id) ? 'bg-[#FC6100]' : 'bg-white/20'}`}></span>
          <ResumeVersionCard 
            version={version} 
            isSelectionMode={isSelectionMode}
            isSelected={selectedIds.includes(version.id)}
            onSelect={() => onToggleSelection?.(version.id)}
            onView={() => onViewVersion?.(version)}
          />
        </div>
      ))}
    </div>
  );
};
