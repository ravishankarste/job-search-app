import React from 'react';
import { useResumes } from '../../resumes/hooks/useResumes';
import { FileText, Check, Loader2 } from 'lucide-react';

interface ResumeSelectorProps {
  currentResumeId: string | null;
  onSelect: (resumeId: string | null) => void;
  isLoading: boolean;
}

export const ResumeSelector: React.FC<ResumeSelectorProps> = ({
  currentResumeId,
  onSelect,
  isLoading: isLinking,
}) => {
  const { data: resumes, isLoading: isLoadingResumes } = useResumes();

  if (isLoadingResumes) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Link a Resume</h3>
      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => onSelect(null)}
          className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${
            currentResumeId === null
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
          }`}
        >
          <span className="flex items-center">
            No Resume Linked
          </span>
          {currentResumeId === null && <Check className="w-4 h-4" />}
        </button>

        {resumes?.map((resume) => (
          <button
            key={resume.id}
            onClick={() => onSelect(resume.id)}
            disabled={isLinking}
            className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${
              currentResumeId === resume.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
            }`}
          >
            <div className="flex items-center space-x-3 text-left">
              <div className={`p-1.5 rounded ${currentResumeId === resume.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">{resume.name}</div>
                {resume.target_role && <div className="text-[10px] opacity-70 uppercase tracking-wider">{resume.target_role}</div>}
              </div>
            </div>
            {currentResumeId === resume.id && (
              isLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />
            )}
          </button>
        ))}

        {resumes?.length === 0 && (
          <div className="text-center py-4 text-xs text-gray-500 border border-dashed border-gray-200 rounded-lg">
            No resumes found. Create one in the Resumes section first.
          </div>
        )}
      </div>
    </div>
  );
};
