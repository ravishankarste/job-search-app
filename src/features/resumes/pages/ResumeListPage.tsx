import React, { useState } from 'react';
import { useResumes } from '../hooks/useResumes';
import { useResumeActions } from '../hooks/useResumeActions';
import { ResumeCard } from '../components/ResumeCard';
import { CreateResumeModal } from '../components/CreateResumeModal';
import { Plus, FileText } from 'lucide-react';

export const ResumeListPage: React.FC = () => {
  const { data: resumes, isLoading, error } = useResumes();
  const { createResume, isCreating } = useResumeActions();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = async (data: { name: string; targetRole?: string }) => {
    await createResume(data);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Resumes</h1>
          <p className="text-gray-400 font-medium">Manage your resume versions and professional templates.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-6 py-2 bg-[#FC6100] text-white text-sm font-bold rounded-lg shadow-md hover:bg-[#E35205] transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Resume
        </button>
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
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">
            Get started by creating your first resume container. You can organize different versions for each job application.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-6 py-3 bg-[#FC6100] text-white text-sm font-bold rounded-xl shadow-lg hover:bg-[#E35205] transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Resume
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
