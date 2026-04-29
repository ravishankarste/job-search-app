import React from 'react';
import type { ResumeVersion } from '../services/resumeService';
import { FileDown, Clock } from 'lucide-react';

interface ResumeVersionCardProps {
  version: ResumeVersion;
}

export const ResumeVersionCard: React.FC<ResumeVersionCardProps> = ({ version }) => {
  const formattedDate = version.created_at
    ? new Date(version.created_at).toLocaleString()
    : 'Unknown Date';

  // Extract label from content json if it exists
  const content = typeof version.content === 'object' && version.content !== null 
    ? (version.content as Record<string, any>) 
    : {};
  const label = content.label || `Version ${version.version_number}`;

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 transition-all hover:border-[#FC6100]/30 group">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-black leading-none text-[#FC6100] bg-[#FC6100]/10 border border-[#FC6100]/20 rounded-full">
              v{version.version_number}
            </span>
            <h4 className="text-base font-bold text-white">{label}</h4>
          </div>
          <div className="flex items-center text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-3">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-[#FC6100]/30" />
            {formattedDate}
          </div>
        </div>
        
        {version.file_url && (
          <a
            href={version.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 text-gray-500 bg-white/5 border border-white/10 rounded-xl hover:bg-[#FC6100] hover:text-white hover:border-[#FC6100] transition-all"
            title="Download/View PDF"
          >
            <FileDown className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};
