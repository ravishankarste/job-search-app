import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useJobDetail } from '../hooks/useJobDetail';
import { useJobActions } from '../hooks/useJobActions';
import { ResumeSelector } from '../components/ResumeSelector';
import { TaskEngine } from '../components/TaskEngine';
import { CoverLetterEditor } from '../components/CoverLetterEditor';
import { MatchScoreWidget } from '../components/MatchScoreWidget';
import { InterviewPrepWidget } from '../components/InterviewPrepWidget';
import { 
  ArrowLeft, 
  ExternalLink, 
  Building2, 
  MapPin, 
  Briefcase, 
  Calendar,
  Trash2,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useMatchScore } from '../hooks/useMatchScore';
import { useResumes } from '../../resumes/hooks/useResumes';
import type { ApplicationStatus } from '../services/jobService';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading, error } = useJobDetail(id || '');
  const { updateStatus, linkResume, deleteJob, isUpdatingStatus, isLinkingResume, isDeleting } = useJobActions();
  
  const { data: resumes } = useResumes();
  const matchResult = useMatchScore(job?.title || "", job?.description || "");

  if (isLoading) return <div className="p-10 animate-pulse bg-white/5 border border-white/10 rounded-3xl h-96"></div>;
  if (error || !job) return (
    <div className="text-center py-24 bg-[#121212] border border-white/10 rounded-3xl">
      <h2 className="text-2xl font-bold text-white mb-2">Job Not Found</h2>
      <Link to="/jobs" className="text-[#FC6100] font-bold hover:underline mt-4 inline-block">
        <ArrowLeft className="w-4 h-4 mr-2 inline" /> Back to Pipeline
      </Link>
    </div>
  );

  const application = job.application;

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
    if (window.confirm('Are you sure you want to delete this job entry?')) {
      await deleteJob(job.id);
      navigate('/jobs');
    }
  };

  const statuses: ApplicationStatus[] = ['saved', 'applied', 'interviewing', 'offered', 'rejected'];

  return (
    <div className="max-w-5xl mx-auto space-y-12 fade-in-up pb-12">
      <div className="flex items-center justify-between">
        <Link to="/jobs" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Pipeline
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-[#121212] p-10 rounded-[32px] border border-white/5 space-y-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FC6100]/5 blur-[100px] -mr-32 -mt-32"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-6 h-[2px] bg-[#FC6100]"></div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC6100]">Application Detail</span>
                </div>
                <h1 className="text-4xl font-bold text-white leading-tight tracking-tighter">{job.title}</h1>
                <div className="flex items-center text-gray-400 font-black text-sm uppercase tracking-widest">
                  <Building2 className="w-4 h-4 mr-2 text-[#FC6100]" />
                  {job.company_name}
                </div>
              </div>
              <div className="flex gap-3">
                {job.url && (
                  <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white/5 text-gray-500 hover:text-[#FC6100] hover:bg-[#FC6100]/10 rounded-2xl flex items-center justify-center transition-all border border-white/10 group/btn shadow-lg"
                    title="Open Original Job Post"
                  >
                    <ExternalLink className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  </a>
                )}
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-12 h-12 bg-white/5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl flex items-center justify-center transition-all border border-white/10 group/btn shadow-lg"
                  title="Delete Job"
                >
                  <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10 py-10 border-y border-white/5 relative z-10">
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
                <p className="text-sm text-white font-bold">{job.created_at ? new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-600 flex items-center">
                  Last Activity
                </span>
                <p className="text-sm text-white font-bold">{application?.updated_at ? new Date(application.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}</p>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Pipeline Stage</h3>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => {
                  const isCurrent = application?.status === status;
                  const isRejected = status === 'rejected';
                  
                  return (
                    <button
                      key={status}
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange(status)}
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
