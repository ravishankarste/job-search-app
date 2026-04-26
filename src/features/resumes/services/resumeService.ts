import { supabase } from '../../../lib/supabaseClient';
import type { Database, Json } from '../../../types/supabase';
import { handleApiError } from '../../../services/apiClient';

export type Resume = Database['public']['Tables']['resumes']['Row'];
export type ResumeVersion = Database['public']['Tables']['resume_versions']['Row'];

export const resumeService = {
  /**
   * 1. createResume
   * Inserts a new resume for the logged-in user.
   */
  async createResume(name: string, target_role?: string): Promise<Resume> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('resumes')
        .insert({
          profile_id: user.id,
          name,
          target_role,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 2. getUserResumes
   * Fetches all resumes for the logged-in user.
   */
  async getUserResumes(): Promise<Resume[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('profile_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 3. deleteResume
   * Deletes a resume by id (RLS ensures user owns it).
   */
  async deleteResume(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * 4. createResumeVersion
   * Uploads file to Supabase Storage and inserts a record into resume_versions.
   * Note: `label` is merged into the JSON `content` field as the schema does not have a dedicated `label` column.
   */
  async createResumeVersion(
    resumeId: string,
    versionNumber: number,
    file: File,
    label?: string,
    content: Json = {}
  ): Promise<ResumeVersion> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const versionId = crypto.randomUUID();
      const filePath = `${user.id}/resumes/${resumeId}/${versionId}.pdf`;

      // Upload file to the "resumes" bucket
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      // Merge label into content if provided, since label column doesn't exist natively
      const enrichedContent: Json = typeof content === 'object' && content !== null && !Array.isArray(content)
        ? { ...content, label: label || `Version ${versionNumber}` }
        : content;

      // Insert into resume_versions table
      const { data, error } = await supabase
        .from('resume_versions')
        .insert({
          resume_id: resumeId,
          version_number: versionNumber,
          file_url: publicUrlData.publicUrl,
          content: enrichedContent,
        })
        .select()
        .single();

      if (error) {
        // Rollback upload on DB failure (best-effort)
        await supabase.storage.from('resumes').remove([filePath]);
        throw error;
      }

      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 5. getResumeVersions
   * Fetches all versions for a given resume.
   */
  async getResumeVersions(resumeId: string): Promise<ResumeVersion[]> {
    try {
      const { data, error } = await supabase
        .from('resume_versions')
        .select('*')
        .eq('resume_id', resumeId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 6. linkResumeToApplication
   * Updates an application to reference a specific resume.
   */
  async linkResumeToApplication(applicationId: string, resumeId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ resume_id: resumeId })
        .eq('id', applicationId);

      if (error) throw error;
    } catch (error) {
      handleApiError(error);
    }
  },
};
