import React from 'react';
import { useResumes } from '../../resumes/hooks/useResumes';
import { FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      <div className="flex items-center justify-center py-12" data-testid="resume-loading">
        <Loader2 className="w-8 h-8 animate-spin text-[#FC6100]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
          Applying With
        </h3>
        {currentResumeId && (
          <button 
            onClick={() => onSelect(null)}
            disabled={isLinking}
            data-testid="resume-unlink-btn"
            className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 flex items-center transition-colors"
          >
            Clear Selection
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {resumes?.map((resume) => {
          const isSelected = resume.id === currentResumeId;
          return (
            <button
              key={resume.id}
              onClick={() => onSelect(isSelected ? null : resume.id)}
              disabled={isLinking}
              data-testid={`resume-item-${resume.id}`}
              className={`group flex items-center justify-between p-5 rounded-2xl text-sm transition-all border ${
                isSelected 
                  ? 'bg-[#FC6100]/10 border-[#FC6100]/50 shadow-lg shadow-[#FC6100]/5' 
                  : 'bg-white/[0.02] border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center space-x-4 text-left">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-[#FC6100] text-white' : 'bg-white/5 text-gray-500 group-hover:text-white'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className={`font-bold transition-colors ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                    {resume.name}
                  </div>
                  <div className={`text-[9px] font-black uppercase tracking-widest mt-0.5 transition-colors ${
                    isSelected ? 'text-[#FC6100]' : 'text-gray-600'
                  }`}>
                    {isSelected ? 'Active for this job' : (resume.target_role || 'General Resume')}
                  </div>
                </div>
              </div>
              
              {isLinking && isSelected && <Loader2 className="w-4 h-4 animate-spin text-[#FC6100]" />}
              {isSelected && !isLinking && <CheckCircle2 className="w-5 h-5 text-[#FC6100] animate-in zoom-in duration-300" />}
            </button>
          );
        })}
        
        {resumes?.length === 0 && (
          <div className="text-center py-10 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">No resumes in library</p>
            <Link to="/resumes" className="text-[10px] font-black uppercase tracking-widest text-[#FC6100] hover:underline">
              Upload Resume
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
