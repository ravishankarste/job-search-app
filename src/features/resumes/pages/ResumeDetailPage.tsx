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
    return <div className="p-6 animate-pulse bg-white/5 border border-white/10 rounded-2xl h-64"></div>;
  }

  if (!resume) {
    return (
      <div className="text-center py-24 bg-white/5 border border-white/10 rounded-3xl">
        <h2 className="text-2xl font-bold text-white mb-2">Resume Not Found</h2>
        <p className="text-gray-400 mb-8">The resume you're looking for doesn't exist or you don't have access.</p>
        <Link to="/resumes" className="inline-flex items-center text-[#FC6100] font-bold hover:underline transition-all">
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
    <div className="space-y-8 max-w-4xl mx-auto fade-in-up">
      {/* Header */}
      <div>
        <Link to="/resumes" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-[#FC6100] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Resumes
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 bg-[#121212] p-8 rounded-3xl border border-white/10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{resume.name}</h1>
            {resume.target_role && (
              <div className="flex items-center text-sm font-bold text-gray-500 uppercase tracking-widest mt-3">
                <Briefcase className="w-4 h-4 mr-2 text-[#FC6100]/50" />
                Target Role: <span className="ml-2 text-white">{resume.target_role}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
              title="Delete Resume"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center justify-center px-6 py-3 bg-[#FC6100] text-white text-sm font-bold rounded-xl shadow-lg hover:bg-[#E35205] transition-all"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Version
            </button>
          </div>
        </div>
      </div>

      {/* Version History Section */}
      <div className="bg-[#121212] p-8 rounded-3xl border border-white/10">
        <h2 className="text-xl font-bold text-white mb-8 border-b border-white/5 pb-6">Version History</h2>
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
