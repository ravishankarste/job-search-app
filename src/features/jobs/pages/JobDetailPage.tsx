import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useJobDetail } from '../hooks/useJobDetail';
import { useJobActions } from '../hooks/useJobActions';
import { ResumeSelector } from '../components/ResumeSelector';
import { TaskEngine } from '../components/TaskEngine';
import { CoverLetterEditor } from '../components/CoverLetterEditor';
import { MatchScoreWidget } from '../components/MatchScoreWidget';
import { JobDescriptionViewer } from '../components/JobDescriptionViewer';
import { InterviewPrepWidget } from '../components/InterviewPrepWidget';
import { 
  ArrowLeft, 
  ExternalLink, 
  Building2, 
  Trash2
} from 'lucide-react';
import { useMatchScore } from '../hooks/useMatchScore';
import { useResumes } from '../../resumes/hooks/useResumes';
import type { ApplicationStatus } from '../services/jobService';

import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const { data: job, isLoading, error } = useJobDetail(id || '');
  const { updateStatus, linkResume, deleteJob, isUpdatingStatus, isLinkingResume, isDeleting } = useJobActions();
  
  const { data: resumes } = useResumes();
  const application = job?.application;
  const matchResult = useMatchScore(job?.title || "", job?.description || "", application?.resume_id);

  if (isLoading) return <div className="p-10 animate-pulse bg-white/5 border border-white/10 rounded-3xl h-96"></div>;
  if (error || !job) return (
    <div className="text-center py-24 bg-[#121212] border border-white/10 rounded-3xl">
      <h2 className="text-2xl font-bold text-white mb-2">Job Not Found</h2>
      <Link to="/pipeline" className="text-[#FC6100] font-bold hover:underline mt-4 inline-block">
        <ArrowLeft className="w-4 h-4 mr-2 inline" /> Back to Pipeline
      </Link>
    </div>
  );

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (application) {
      await updateStatus({ applicationId: application.id, status: newStatus, jobId: job.id });
    }
  };

  const handleResumeSelect = async (resumeId: string | null) => {
    if (application) {
      await linkResume({ applicationId: application.id, resumeId, jobId: job.id });
    }
  };

  const handleDelete = async () => {
    await deleteJob({ 
      jobId: job.id, 
      message: `Pipeline Cleaned: Removed ${job.title} @ ${job.company_name}.` 
    });
    navigate('/pipeline');
  };

  const statuses: ApplicationStatus[] = ['saved', 'applied', 'interviewing', 'offered', 'rejected'];

  return (
    <div className="max-w-5xl mx-auto space-y-12 fade-in-up pb-12">
      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={job.title}
        isDeleting={isDeleting}
      />

      <div className="flex items-center justify-between">
        <Link 
          to="/pipeline" 
          data-testid="job-back-btn"
          className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Pipeline
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          <div className="bg-[#121212] border border-white/5 rounded-[32px] p-8 md:p-12 pb-20 shadow-2xl relative overflow-visible group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FC6100]/5 blur-[100px] -mr-32 -mt-32"></div>
            
            <div className="flex items-start justify-between gap-4 relative">
              <div className="space-y-6">
                <div className="flex shrink-0 items-center gap-3">
                   <div className="w-6 h-[2px] bg-[#FC6100]"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#FC6100]">Application Detail</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight break-words">{job.title}</h1>
                <div className="flex items-center text-gray-400 font-black text-xs uppercase tracking-widest mt-3">
                  <Building2 className="w-4 h-4 mr-2 text-[#FC6100]" />
                  {job.company_name}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {job.url && (
                  <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    data-testid="job-external-link"
                    className="w-12 h-12 bg-white/5 text-gray-500 hover:text-[#FC6100] hover:bg-[#FC6100]/10 rounded-2xl flex items-center justify-center transition-all border border-white/10 group/btn shadow-lg"
                    title="Open Original Job Post"
                  >
                    <ExternalLink className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  </a>
                )}
                <button 
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={isDeleting}
                  data-testid="job-delete-btn"
                  className="w-12 h-12 bg-white/5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl flex items-center justify-center transition-all border border-white/10 group/btn shadow-lg"
                  title="Delete Job"
                >
                  <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 md:gap-10 py-6 md:py-10 border-y border-white/5 relative z-10">
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-600 flex items-center">
                  Location
                </span>
                <p className="text-sm text-white font-bold">{job.location || 'Not Specified'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-600 flex items-center">
                  Type
                </span>
                <p className="text-sm text-white font-bold capitalize">{job.employment_type || 'Not Specified'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-600 flex items-center">
                  Saved
                </span>
                <p className="text-xs md:text-sm text-white font-bold">{job.created_at ? new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-600 flex items-center">
                  Last Activity
                </span>
                <p className="text-xs md:text-sm text-white font-bold">{application?.updated_at ? new Date(application.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}</p>
              </div>
            </div>

            <div className="space-y-6 relative pt-4">
              <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Pipeline Stage</h3>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => {
                  const isCurrent = application?.status === status;
                  const isRejected = status === 'rejected';
                  
                  return (
                    <button
                      key={status}
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange(status)}
                      data-testid={`status-btn-${status}`}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        isCurrent
                          ? (isRejected 
                              ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' 
                              : 'bg-[#FC6100] border-[#FC6100] text-white shadow-lg shadow-[#FC6100]/20')
                          : 'bg-white/5 border-white/5 text-gray-600 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <JobDescriptionViewer description={job.description || undefined} />

          <MatchScoreWidget 
            jobId={job.id} 
            jobTitle={job.title}
            jobDescription={job.description} 
            linkedResumeId={application?.resume_id}
          />

          <InterviewPrepWidget 
            jobTitle={job.title}
            companyName={job.company_name}
            matchResult={matchResult}
          />
        </div>

        {/* Sidebar / Integration Area */}
        <div className="space-y-8">
          <div className="bg-[#121212] p-8 rounded-[32px] border border-white/5 shadow-2xl shadow-black/50">
            <ResumeSelector 
              currentResumeId={application?.resume_id || null} 
              onSelect={handleResumeSelect}
              isLoading={isLinkingResume}
            />
          </div>
          
          {application && (
            <CoverLetterEditor 
              applicationId={application.id} 
              job={{ title: job.title, company_name: job.company_name }}
              matchResult={matchResult}
              targetRole={resumes?.find(r => r.id === application.resume_id)?.target_role || resumes?.[0]?.target_role || ""}
            />
          )}

          {application && (
            <TaskEngine applicationId={application.id} />
          )}
        </div>
      </div>
    </div>
  );
};
