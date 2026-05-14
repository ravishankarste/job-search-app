import React, { useState } from 'react';
import { useResumes } from '../hooks/useResumes';
import { useResumeActions } from '../hooks/useResumeActions';
import { ResumeCard } from '../components/ResumeCard';
import { CreateResumeModal } from '../components/CreateResumeModal';
import { Plus, FileText } from 'lucide-react';

export const ResumeListPage: React.FC = () => {
  const { data: resumes, isLoading, error } = useResumes();
  const { createResumeWithFile, isCreating } = useResumeActions();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = async (data: { name: string; file: File; targetRole?: string }) => {
    await createResumeWithFile(data);
    setIsModalOpen(false);
  };

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
        Failed to load resumes. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in-up">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">Resumes</h1>
          <p className="text-gray-400 mt-1">Manage your resume versions.</p>
        </div>
        
        {resumes && resumes.length > 0 && (
          <button
            onClick={() => setIsModalOpen(true)}
            data-testid="resume-create-btn"
            className="flex items-center px-6 py-2 bg-[#FC6100] text-white text-sm font-bold rounded-lg hover:bg-[#E35205] transition-all shadow-lg shadow-[#FC6100]/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Resume
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white/5 border border-white/10 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : resumes?.length === 0 ? (
        <div className="text-center py-24 px-4 bg-white/5 border border-white/10 rounded-3xl shadow-sm">
          <div className="mx-auto w-20 h-20 bg-[#FC6100]/10 text-[#FC6100] rounded-2xl flex items-center justify-center mb-6">
            <FileText className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No resumes yet</h3>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto font-medium">
            Upload your first resume to see how you match against any job description.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            data-testid="resume-empty-create-btn"
            className="inline-flex items-center px-8 py-3 bg-[#FC6100] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg hover:bg-[#E35205] transition-all border border-white/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resumes?.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}

      <CreateResumeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
      />
    </div>
  );
};
