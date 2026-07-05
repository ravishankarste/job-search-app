import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useResumes } from '../hooks/useResumes';
import { useResumeVersions } from '../hooks/useResumeVersions';
import { useResumeActions } from '../hooks/useResumeActions';
import { ResumeVersionTimeline } from '../components/ResumeVersionTimeline';
import { UploadVersionModal } from '../components/UploadVersionModal';
import { CompareVersionsModal } from '../components/CompareVersionsModal';
import { ArrowLeft, Upload, Trash2, Briefcase, ArrowLeftRight, X, FileDown, Copy, Check } from 'lucide-react';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import type { VersionMetadata } from '../components/VersionMetadataForm';
import type { ResumeVersion } from '../services/resumeService';
import { resumeService } from '../services/resumeService';

export const ResumeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [isShowingComparison, setIsShowingComparison] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVersionForPreview, setSelectedVersionForPreview] = useState<ResumeVersion | null>(null);

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
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (resume) {
      await deleteResume(resume.id);
      setIsDeleteModalOpen(false);
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

  const handleToggleSelection = (id: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(id)) {
        return prev.filter(vId => vId !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const versionA = versions.find(v => v.id === selectedForComparison[0]) || null;
  const versionB = versions.find(v => v.id === selectedForComparison[1]) || null;

  const nextVersionNumber = versions.length > 0 ? Math.max(...versions.map(v => v.version_number)) + 1 : 1;

  return (
    <div className="space-y-8 max-w-4xl mx-auto fade-in-up">
      {/* Header */}
      <div>
        <Link 
          to="/resumes" 
          data-testid="resume-back-btn"
          className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-[#FC6100] mb-6 transition-colors"
        >
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
            {!isComparisonMode ? (
              <>
                <button
                  onClick={() => setIsComparisonMode(true)}
                  data-testid="resume-compare-toggle-btn"
                  className="inline-flex items-center justify-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-[#FC6100] hover:border-[#FC6100]/30 transition-all font-bold text-sm"
                >
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  Compare
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  data-testid="resume-delete-btn"
                  className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
                  title="Delete Resume"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  data-testid="resume-upload-version-btn"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#FC6100] text-white text-sm font-bold rounded-xl shadow-lg hover:bg-[#E35205] transition-all"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Version
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsComparisonMode(false);
                    setSelectedForComparison([]);
                  }}
                  data-testid="resume-cancel-compare-btn"
                  className="inline-flex items-center justify-center px-4 py-2 text-gray-400 hover:text-white transition-all text-sm font-bold"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={() => setIsShowingComparison(true)}
                  disabled={selectedForComparison.length < 2}
                  data-testid="resume-start-compare-btn"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#FC6100] text-white text-sm font-bold rounded-xl shadow-lg hover:bg-[#E35205] transition-all disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-500"
                >
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  Compare ({selectedForComparison.length}/2)
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Version History Section */}
      <div className="bg-[#121212] p-8 rounded-3xl border border-white/10">
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
          <h2 className="text-xl font-bold text-white">Version History</h2>
          {isComparisonMode && (
            <p className="text-xs text-[#FC6100] font-bold animate-pulse uppercase tracking-widest">
              Select 2 versions to compare
            </p>
          )}
        </div>
        <ResumeVersionTimeline 
          versions={versions} 
          isLoading={isLoadingVersions} 
          isSelectionMode={isComparisonMode}
          selectedIds={selectedForComparison}
          onToggleSelection={handleToggleSelection}
          onViewVersion={(version) => setSelectedVersionForPreview(version)}
        />
      </div>

      <UploadVersionModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUpload}
        isUploading={isUploading}
        suggestedVersionNumber={nextVersionNumber}
      />

      <CompareVersionsModal
        isOpen={isShowingComparison}
        onClose={() => setIsShowingComparison(false)}
        versionA={versionA}
        versionB={versionB}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={resume.name}
        isDeleting={isDeleting}
      />

      <ResumePreviewModal
        isOpen={!!selectedVersionForPreview}
        onClose={() => setSelectedVersionForPreview(null)}
        version={selectedVersionForPreview}
      />
    </div>
  );
};

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: ResumeVersion | null;
}

const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({ isOpen, onClose, version }) => {
  const [signedUrl, setSignedUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copyStatus, setCopyStatus] = useState<string>('Copy Text');

  useEffect(() => {
    if (!isOpen || !version) {
      setSignedUrl('');
      return;
    }

    const loadSignedUrl = async () => {
      if (!version.file_url) return;
      setIsLoading(true);
      try {
        let path = version.file_url;
        if (path.includes('http')) {
          try {
            const urlObj = new URL(path);
            const pathParts = urlObj.pathname.split('/storage/v1/object/public/resumes/');
            if (pathParts.length > 1) path = pathParts[1];
          } catch (e) {
            console.error("Failed to parse URL:", e);
          }
        }
        const url = await resumeService.createSignedUrl(path);
        setSignedUrl(url);
      } catch (err) {
        console.error("Failed to load signed URL:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSignedUrl();
  }, [isOpen, version]);

  const handleCopy = async () => {
    if (!version) return;
    const text = (version.content as any)?.extractedText || '';
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy Text'), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = async () => {
    if (!version || !version.file_url) return;
    try {
      const url = signedUrl || await resumeService.createSignedUrl(version.file_url);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        const content = typeof version.content === 'object' && version.content !== null ? (version.content as any) : {};
        const label = content.label || `Version ${version.version_number}`;
        link.download = `${label.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen || !version) return null;

  const content = typeof version.content === 'object' && version.content !== null ? (version.content as any) : {};
  const label = content.label || `Version ${version.version_number}`;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-[#121212] w-full max-w-4xl h-[85vh] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Preview Resume</h2>
            <p className="text-xs text-[#FC6100] font-black uppercase tracking-widest mt-1">
              v{version.version_number} — {label}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {version.file_url ? (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white hover:border-white/20 transition-all text-xs font-bold"
              >
                <FileDown className="w-4 h-4 text-[#FC6100]" />
                Download PDF
              </button>
            ) : (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-[#FC6100]/10 border border-[#FC6100]/30 rounded-xl text-[#FC6100] hover:bg-[#FC6100]/20 transition-all text-xs font-bold"
              >
                {copyStatus === 'Copied!' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[#FC6100]" />}
                {copyStatus}
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 bg-black overflow-hidden relative p-4 flex flex-col">
          {version.file_url ? (
            isLoading ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 animate-pulse">Loading preview...</div>
            ) : signedUrl ? (
              <iframe src={signedUrl} className="w-full h-full border-none grayscale-[0.5] hover:grayscale-0 transition-all" title={label} />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-600 italic">Failed to load PDF preview</div>
            )
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-auto p-4 text-xs font-mono text-gray-300 whitespace-pre-wrap select-text bg-[#080808] border border-white/5 rounded-xl">
                {content.extractedText || "No text content available."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
