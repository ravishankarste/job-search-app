import React from 'react';
import { useResumes } from '../../resumes/hooks/useResumes';
import { FileText, Loader2, Link2Off } from 'lucide-react';

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

  const linkedResume = resumes?.find(r => r.id === currentResumeId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
          {currentResumeId ? 'Linked Resume' : 'Link a Resume'}
        </h3>
        {currentResumeId && (
          <button 
            onClick={() => onSelect(null)}
            disabled={isLinking}
            data-testid="resume-unlink-btn"
            className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 flex items-center transition-colors"
          >
            <Link2Off className="w-3 h-3 mr-1.5" /> Unlink
          </button>
        )}
      </div>

      {/* Linked State Show */}
      {linkedResume ? (
        <div className="p-5 bg-[#FC6100]/10 border border-[#FC6100]/30 rounded-2xl flex items-center justify-between shadow-lg shadow-[#FC6100]/5 animate-in zoom-in-95 duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-[#FC6100] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#FC6100]/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{linkedResume.name}</div>
              <div className="text-[9px] text-[#FC6100] font-black uppercase tracking-widest mt-0.5">Active Version Linked</div>
            </div>
          </div>
          {isLinking && <Loader2 className="w-4 h-4 animate-spin text-[#FC6100]" />}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {resumes?.map((resume) => (
            <button
              key={resume.id}
              onClick={() => onSelect(resume.id)}
              disabled={isLinking}
              data-testid={`resume-item-${resume.id}`}
              className="group flex items-center justify-between p-4 bg-white/2 border border-white/5 hover:border-[#FC6100]/30 hover:bg-[#FC6100]/5 rounded-2xl text-sm transition-all"
            >
              <div className="flex items-center space-x-3 text-left">
                <div className="w-8 h-8 bg-white/5 group-hover:bg-[#FC6100]/20 rounded-lg flex items-center justify-center text-gray-500 group-hover:text-[#FC6100] transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-gray-400 group-hover:text-white transition-colors">{resume.name}</div>
                  {resume.target_role && <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">{resume.target_role}</div>}
                </div>
              </div>
            </button>
          ))}
          
          {resumes?.length === 0 && (
            <div className="text-center py-10 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No resumes found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
