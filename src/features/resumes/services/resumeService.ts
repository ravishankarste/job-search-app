import { supabase } from '../../../lib/supabaseClient';
import type { Database, Json } from '../../../types/supabase';
import { handleApiError } from '../../../services/apiClient';

export type Resume = Database['public']['Tables']['resumes']['Row'];
export type ResumeVersion = Database['public']['Tables']['resume_versions']['Row'];

export const resumeService = {
  /**
   * 1. createResume
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
      return data || [];
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 3. deleteResume
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
   */
  async createResumeVersion(
    resumeId: string,
    versionNumber: number,
    file: File,
    label?: string,
    content: Json = {}
  ): Promise<ResumeVersion> {
    try {
      console.log("[resumeService] Starting createResumeVersion...");
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const versionId = crypto.randomUUID();
      const filePath = `${user.id}/resumes/${resumeId}/${versionId}.pdf`;

      console.log("[resumeService] Uploading file to:", filePath);
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf'
        });

      if (uploadError) {
        console.error("[resumeService] Upload failed:", uploadError);
        throw uploadError;
      }

      console.log("[resumeService] Upload successful. Getting public URL...");
      const { data: publicUrlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error("Failed to generate public URL for uploaded file.");
      }

      const enrichedContent: Json =
        typeof content === 'object' && content !== null && !Array.isArray(content)
          ? { ...content, label: label || `Version ${versionNumber}` }
          : content;

      console.log("[resumeService] Inserting version record into DB...");
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
        console.error("[resumeService] DB Insert failed:", error);
        // Rollback upload on DB failure (best-effort)
        await supabase.storage.from('resumes').remove([filePath]);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from resume version insert');
      }

      console.log("[resumeService] Success:", data);
      return data;
    } catch (error) {
      console.error("[resumeService] Global Catch:", error);
      return handleApiError(error);
    }
  },

  /**
   * 5. getResumeVersions
   */
  async getResumeVersions(resumeId: string): Promise<ResumeVersion[]> {
    try {
      const { data, error } = await supabase
        .from('resume_versions')
        .select('*')
        .eq('resume_id', resumeId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 6. linkResumeToApplication
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