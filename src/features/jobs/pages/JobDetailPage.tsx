import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useJobDetail } from '../hooks/useJobDetail';
import { useJobActions } from '../hooks/useJobActions';
import { ResumeSelector } from '../components/ResumeSelector';
import { TaskEngine } from '../components/TaskEngine';
import { CoverLetterEditor } from '../components/CoverLetterEditor';
import { MatchScoreWidget } from '../components/MatchScoreWidget';
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
import type { ApplicationStatus } from '../services/jobService';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading, error } = useJobDetail(id || '');
  const { updateStatus, linkResume, deleteJob, isUpdatingStatus, isLinkingResume, isDeleting } = useJobActions();

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
    <div className="space-y-8 max-w-4xl mx-auto fade-in-up pb-12">
      <Link to="/jobs" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-[#FC6100] mb-2 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Pipeline
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#121212] p-8 rounded-3xl border border-white/10 space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white leading-tight">{job.title}</h1>
                <div className="flex items-center text-gray-400 font-bold text-lg">
                  <Building2 className="w-5 h-5 mr-2 text-[#FC6100]/50" />
                  {job.company_name}
                </div>
              </div>
              <div className="flex gap-3">
                {job.url && (
                  <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 text-gray-400 hover:text-[#FC6100] hover:bg-[#FC6100]/10 rounded-xl transition-all border border-white/5"
                    title="Open Original Job Post"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-3 bg-white/5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-white/5"
                  title="Delete Job"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest font-black text-gray-600 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-2 text-[#FC6100]/40" /> Location
                </span>
                <p className="text-base text-white font-bold">{job.location || 'Not Specified'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest font-black text-gray-600 flex items-center">
                  <Briefcase className="w-3.5 h-3.5 mr-2 text-[#FC6100]/40" /> Type
                </span>
                <p className="text-base text-white font-bold capitalize">{job.employment_type || 'Not Specified'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest font-black text-gray-600 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-2 text-[#FC6100]/40" /> Date Saved
                </span>
                <p className="text-base text-white font-bold">{job.created_at ? new Date(job.created_at).toLocaleDateString() : '-'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest font-black text-gray-600 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-2 text-[#FC6100]/40" /> Last Update
                </span>
                <p className="text-base text-white font-bold">{application?.updated_at ? new Date(application.updated_at).toLocaleDateString() : 'Never'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest opacity-60">Application Status</h3>
              <div className="flex flex-wrap gap-3">
                {statuses.map((status) => (
                  <button
                    key={status}
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange(status)}
                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border ${
                      application?.status === status
                        ? 'bg-[#FC6100] border-[#FC6100] text-white shadow-lg shadow-[#FC6100]/10'
                        : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <MatchScoreWidget jobId={job.id} jobDescription={job.description} />
        </div>

        {/* Sidebar / Integration Area */}
        <div className="space-y-8">
          <div className="bg-[#121212] p-8 rounded-3xl border border-white/10 shadow-sm">
            <ResumeSelector 
              currentResumeId={application?.resume_id || null} 
              onSelect={handleResumeSelect}
              isLoading={isLinkingResume}
            />
            {application?.resume_id && (
              <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                <p className="text-xs text-emerald-400 font-bold leading-relaxed">
                  This resume is linked to your application. We'll use this version for tracking.
                </p>
              </div>
            )}
          </div>
          
          {application && (
            <CoverLetterEditor applicationId={application.id} />
          )}

          {application && (
            <TaskEngine applicationId={application.id} />
          )}
        </div>
      </div>
    </div>
  );
};
