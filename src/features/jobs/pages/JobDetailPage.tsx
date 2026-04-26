import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useJobDetail } from '../hooks/useJobDetail';
import { useJobActions } from '../hooks/useJobActions';
import { ResumeSelector } from '../components/ResumeSelector';
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

  if (isLoading) return <div className="p-10 animate-pulse bg-gray-50 rounded-2xl h-96"></div>;
  if (error || !job) return (
    <div className="text-center py-20">
      <h2 className="text-xl font-bold text-gray-900">Job Not Found</h2>
      <Link to="/jobs" className="text-blue-600 hover:underline mt-2 inline-block">Back to Pipeline</Link>
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link to="/jobs" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-2 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Pipeline
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <div className="flex items-center text-gray-600 font-medium">
                  <Building2 className="w-4 h-4 mr-1.5 text-gray-400" />
                  {job.company_name}
                </div>
              </div>
              <div className="flex space-x-2">
                {job.url && (
                  <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200"
                    title="Open Original Job Post"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
                  title="Delete Job"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" /> Location
                </span>
                <p className="text-sm text-gray-900 font-medium">{job.location || 'Not Specified'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 flex items-center">
                  <Briefcase className="w-3 h-3 mr-1" /> Type
                </span>
                <p className="text-sm text-gray-900 font-medium capitalize">{job.employment_type || 'Not Specified'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" /> Date Saved
                </span>
                <p className="text-sm text-gray-900 font-medium">{job.created_at ? new Date(job.created_at).toLocaleDateString() : '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> Last Update
                </span>
                <p className="text-sm text-gray-900 font-medium">{application?.updated_at ? new Date(application.updated_at).toLocaleDateString() : 'Never'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Application Status</h3>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                      application?.status === status
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Integration Area */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <ResumeSelector 
              currentResumeId={application?.resume_id || null} 
              onSelect={handleResumeSelect}
              isLoading={isLinkingResume}
            />
            {application?.resume_id && (
              <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <p className="text-xs text-green-700">
                  This resume is linked to your application. We'll use this version for tracking.
                </p>
              </div>
            )}
          </div>

          <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2">Next Steps</h3>
            <ul className="text-sm space-y-2 opacity-90">
              <li>• Link your best resume</li>
              <li>• Tailor your application</li>
              <li>• Mark as 'Applied' once sent</li>
              <li>• Schedule follow-up</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
