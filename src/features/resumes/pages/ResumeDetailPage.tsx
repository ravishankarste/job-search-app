import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useResumes } from '../hooks/useResumes';
import { useResumeVersions } from '../hooks/useResumeVersions';
import { useResumeActions } from '../hooks/useResumeActions';
import { ResumeVersionTimeline } from '../components/ResumeVersionTimeline';
import { UploadVersionModal } from '../components/UploadVersionModal';
import { ArrowLeft, Upload, Trash2, Briefcase } from 'lucide-react';
import type { VersionMetadata } from '../components/VersionMetadataForm';

export const ResumeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: resumes, isLoading: isLoadingResumes } = useResumes();
  const { versions, isLoadingVersions, uploadVersion, isUploading } = useResumeVersions(id || '');
  const { deleteResume, isDeleting } = useResumeActions();

  // Find the current resume from the cached resumes list
  const resume = resumes?.find((r) => r.id === id);

  if (isLoadingResumes) {
    return <div className="p-6 animate-pulse bg-gray-100 rounded-xl h-64"></div>;
  }

  if (!resume) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Resume Not Found</h2>
        <p className="text-gray-500 mb-6">The resume you're looking for doesn't exist or you don't have access.</p>
        <Link to="/resumes" className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Resumes
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this resume? This cannot be undone.')) {
      await deleteResume(resume.id);
      navigate('/resumes');
    }
  };

  const handleUpload = async (file: File, metadata: VersionMetadata) => {
    await uploadVersion({
      versionNumber: metadata.versionNumber,
      file,
      label: metadata.label,
    });
    setIsUploadModalOpen(false);
  };

  const nextVersionNumber = versions.length > 0 ? Math.max(...versions.map(v => v.version_number)) + 1 : 1;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Link to="/resumes" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Resumes
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{resume.name}</h1>
            {resume.target_role && (
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <Briefcase className="w-4 h-4 mr-1.5" />
                Target Role: <span className="ml-1 font-medium text-gray-700">{resume.target_role}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center justify-center p-2 border border-gray-300 rounded-lg text-gray-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 focus:outline-none transition-colors disabled:opacity-50"
              title="Delete Resume"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Version
            </button>
          </div>
        </div>
      </div>

      {/* Version History Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">Version History</h2>
        <ResumeVersionTimeline versions={versions} isLoading={isLoadingVersions} />
      </div>

      <UploadVersionModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUpload}
        isUploading={isUploading}
        suggestedVersionNumber={nextVersionNumber}
      />
    </div>
  );
};
