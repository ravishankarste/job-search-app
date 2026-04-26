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
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        Failed to load resumes. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resumes</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your resumes and versions for applications.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="w-5 h-5 mr-1.5 -ml-1" />
          Create Resume
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : resumes?.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No resumes yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Get started by creating your first resume container. You can upload different PDF versions inside it.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="w-5 h-5 mr-1.5 -ml-1 text-gray-400" />
            Create Your First Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
