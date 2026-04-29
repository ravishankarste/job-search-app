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
        <Loader2 className="w-6 h-6 animate-spin text-[#FC6100]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-white uppercase tracking-widest opacity-60">Link a Resume</h3>
      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => onSelect(null)}
          className={`flex items-center justify-between p-4 rounded-xl border text-sm font-bold transition-all ${
            currentResumeId === null
              ? 'border-[#FC6100] bg-[#FC6100]/10 text-[#FC6100]'
              : 'border-white/5 hover:border-white/10 bg-white/2 text-gray-500 hover:text-gray-400'
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
            className={`flex items-center justify-between p-4 rounded-xl border text-sm font-bold transition-all ${
              currentResumeId === resume.id
                ? 'border-[#FC6100] bg-[#FC6100]/10 text-[#FC6100]'
                : 'border-white/5 hover:border-white/10 bg-white/2 text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3 text-left">
              <div className={`p-2 rounded-lg transition-colors ${currentResumeId === resume.id ? 'bg-[#FC6100] text-white' : 'bg-white/5 text-gray-500'}`}>
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold">{resume.name}</div>
                {resume.target_role && <div className="text-[10px] opacity-50 uppercase tracking-widest">{resume.target_role}</div>}
              </div>
            </div>
            {currentResumeId === resume.id && (
              isLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />
            )}
          </button>
        ))}

        {resumes?.length === 0 && (
          <div className="text-center py-6 text-[10px] font-bold text-gray-600 uppercase tracking-widest border border-dashed border-white/5 rounded-xl">
            No resumes found. Create one in the Resumes section first.
          </div>
        )}
      </div>
    </div>
  );
};
