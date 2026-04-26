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
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-800 bg-blue-100 rounded-full">
              v{version.version_number}
            </span>
            <h4 className="text-md font-medium text-gray-900">{label}</h4>
          </div>
          <div className="flex items-center text-xs text-gray-500 mt-2">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {formattedDate}
          </div>
        </div>
        
        {version.file_url && (
          <a
            href={version.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center p-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-blue-600 focus:ring-4 focus:outline-none focus:ring-gray-200 transition-colors"
            title="Download/View PDF"
          >
            <FileDown className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};
