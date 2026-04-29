import { supabase } from '../../../lib/supabaseClient';
import type { Database } from '../../../types/supabase';
import { handleApiError } from '../../../services/apiClient';

export type Job = Database['public']['Tables']['jobs']['Row'];
export type Application = Database['public']['Tables']['applications']['Row'];
export type JobWithApplication = Job & {
  application: Application | null;
};

export type ApplicationStatus = Database['public']['Enums']['application_status'];
export type JobType = Database['public']['Enums']['job_type'];

export const jobService = {
  /**
   * Fetch all jobs for the current user with their application status
   */
  async getJobs(): Promise<JobWithApplication[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          application:applications(*)
        `)
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Supabase returns an array for the join, but it's 1:1 here conceptually
      return (data || []).map(job => ({
        ...job,
        application: Array.isArray(job.application) ? job.application[0] : job.application
      }));
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Fetch a single job by ID with application details
   */
  async getJobById(id: string): Promise<JobWithApplication> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          application:applications(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...data,
        application: Array.isArray(data.application) ? data.application[0] : data.application
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create a new job and its initial application entry
   */
  async createJob(jobData: Omit<Database['public']['Tables']['jobs']['Insert'], 'profile_id'>): Promise<JobWithApplication> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // 1. Create Job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          ...jobData,
          profile_id: user.id
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // 2. Create associated Application record
      const { data: application, error: appError } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          profile_id: user.id,
          status: 'saved'
        })
        .select()
        .single();

      if (appError) throw appError;

      return { ...job, application };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update application status
   */
  async updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<Application> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Link a resume to an application
   */
  async linkResumeToApplication(applicationId: string, resumeId: string | null): Promise<Application> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({ resume_id: resumeId, updated_at: new Date().toISOString() })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete a job
   */
  async deleteJob(jobId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Update job description
   */
  async updateJobDescription(jobId: string, description: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ description, updated_at: new Date().toISOString() })
        .eq('id', jobId);

      if (error) throw error;
    } catch (error) {
      handleApiError(error);
    }
  }
};
