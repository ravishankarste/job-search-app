import React from 'react';
import type { ResumeVersion } from '../services/resumeService';
import { FileDown, Clock } from 'lucide-react';
import { resumeService } from '../services/resumeService';

interface ResumeVersionCardProps {
  version: ResumeVersion;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const ResumeVersionCard: React.FC<ResumeVersionCardProps> = ({ 
  version,
  isSelectionMode = false,
  isSelected = false,
  onSelect
}) => {
  const formattedDate = version.created_at
    ? new Date(version.created_at).toLocaleString()
    : 'Unknown Date';

  // Extract label from content json if it exists
  const content = typeof version.content === 'object' && version.content !== null 
    ? (version.content as Record<string, any>) 
    : {};
  const label = content.label || `Version ${version.version_number}`;
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger select mode
    if (!version.file_url) return;

    try {
      setIsDownloading(true);
      const url = await resumeService.createSignedUrl(version.file_url);
      if (url) {
        window.open(url, '_blank');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div 
      onClick={isSelectionMode ? onSelect : undefined}
      className={`bg-[#121212] border rounded-2xl p-5 transition-all group ${
        isSelectionMode ? 'cursor-pointer' : ''
      } ${
        isSelected 
          ? 'border-[#FC6100] shadow-[0_0_15px_rgba(252,97,0,0.1)]' 
          : 'border-white/10 hover:border-[#FC6100]/30'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-4">
          {isSelectionMode && (
            <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-all ${
              isSelected ? 'bg-[#FC6100] border-[#FC6100]' : 'bg-white/5 border-white/20'
            }`}>
              {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
          )}
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
        </div>
        
        {version.file_url && (
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="p-2.5 text-gray-500 bg-white/5 border border-white/10 rounded-xl hover:bg-[#FC6100] hover:text-white hover:border-[#FC6100] transition-all disabled:opacity-50"
            title="Download/View PDF"
          >
            <FileDown className={`w-4 h-4 ${isDownloading ? 'animate-pulse' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
};
