import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface JobDescriptionViewerProps {
  description?: string;
}

export const JobDescriptionViewer: React.FC<JobDescriptionViewerProps> = ({ description }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description || description.trim() === '') {
    return null;
  }

  return (
    <div className="bg-[#121212] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl transition-all">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-white/[0.02] transition-colors group focus:outline-none"
        data-testid="toggle-description-btn"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FC6100]/10 rounded-2xl flex items-center justify-center border border-[#FC6100]/20">
            <FileText className="w-6 h-6 text-[#FC6100]" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-white">Imported Job Description</h3>
            <p className="text-xs text-gray-500 font-medium">
              {isExpanded ? 'Click to collapse raw text' : 'Click to view the raw text scraped from the URL'}
            </p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-all border border-white/5">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-6 md:p-8 pt-0 border-t border-white/5">
          <div className="bg-black/40 rounded-2xl p-6 border border-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
            <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-mono">
              {description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
