import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../services/jobService';
import type { Application, ApplicationStatus } from '../services/jobService';
import { JOBS_QUERY_KEY } from './useJobs';
import type { Database } from '../../../types/supabase';
import { notificationService } from '../../notifications/services/notificationService';
import { NOTIFICATIONS_KEY } from '../../notifications/hooks/useNotifications';

export const JOB_DETAIL_QUERY_KEY = (id: string) => ['jobs', id];

export function useJobActions() {
  const queryClient = useQueryClient();

  // Create Job Mutation
  const createJobMutation = useMutation({
    mutationFn: (jobData: Omit<Database['public']['Tables']['jobs']['Insert'], 'profile_id'>) =>
      jobService.createJob(jobData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      notificationService.sendNotification(`New Opportunity: Added ${data.title} to your pipeline.`);
    },
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation<
    Application,
    Error,
    { applicationId: string; status: ApplicationStatus; jobId: string }
  >({
    mutationFn: ({ applicationId, status }) =>
      jobService.updateApplicationStatus(applicationId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: JOB_DETAIL_QUERY_KEY(variables.jobId) });
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      notificationService.sendNotification(`Status Update: A job moved to ${variables.status}.`);
    },
  });

  // Link Resume Mutation
  const linkResumeMutation = useMutation<
    Application,
    Error,
    { applicationId: string; resumeId: string | null; jobId: string }
  >({
    mutationFn: ({ applicationId, resumeId }) =>
      jobService.linkResumeToApplication(applicationId, resumeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: JOB_DETAIL_QUERY_KEY(variables.jobId) });
    },
  });

  // Delete Job Mutation
  const deleteJobMutation = useMutation({
    mutationFn: ({ jobId }: { jobId: string; message?: string }) => jobService.deleteJob(jobId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      notificationService.sendNotification(variables.message || `Pipeline Cleaned: A job entry has been removed.`);
    },
  });

  // Update Job Description Mutation
  const updateJobDescriptionMutation = useMutation<
    void,
    Error,
    { jobId: string; description: string }
  >({
    mutationFn: ({ jobId, description }) => jobService.updateJobDescription(jobId, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: JOB_DETAIL_QUERY_KEY(variables.jobId) });
    },
  });

  // Update Job Details Mutation
  const updateJobDetailsMutation = useMutation<
    void,
    Error,
    { jobId: string; details: Partial<Database['public']['Tables']['jobs']['Row']> }
  >({
    mutationFn: ({ jobId, details }) => jobService.updateJobDetails(jobId, details),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: JOB_DETAIL_QUERY_KEY(variables.jobId) });
    },
  });

  return {
    createJob: createJobMutation.mutateAsync,
    isCreating: createJobMutation.isPending,

    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,

    linkResume: linkResumeMutation.mutateAsync,
    isLinkingResume: linkResumeMutation.isPending,

    deleteJob: deleteJobMutation.mutateAsync,
    isDeleting: deleteJobMutation.isPending,

    updateJobDescription: updateJobDescriptionMutation.mutateAsync,
    isUpdatingJobDescription: updateJobDescriptionMutation.isPending,

    updateJobDetails: updateJobDetailsMutation.mutateAsync,
    isUpdatingJobDetails: updateJobDetailsMutation.isPending,
  };
}
