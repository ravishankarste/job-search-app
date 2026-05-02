import { supabase } from '../../../lib/supabaseClient';
import type { Database, Json } from '../../../types/supabase';
import { handleApiError } from '../../../services/apiClient';
import { pdfExtractionService } from './pdfExtractionService';

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
      
      // 1. Extract text from PDF before uploading
      console.log("[resumeService] Scanning PDF for text...");
      const extractedText = await pdfExtractionService.extractText(file);
      
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

      // 2. Merge extracted text into metadata
      const enrichedContent: Json =
        typeof content === 'object' && content !== null && !Array.isArray(content)
          ? { 
              ...content, 
              label: label || `Version ${versionNumber}`,
              extractedText: extractedText 
            }
          : { extractedText };

      // 3. Store the path, NOT a public URL
      console.log("[resumeService] Inserting version record into DB...");
      const { data, error } = await supabase
        .from('resume_versions')
        .insert({
          resume_id: resumeId,
          version_number: versionNumber,
          file_url: filePath, // STORE THE PATH, NOT PUBLIC URL
          content: enrichedContent,
        })
        .select()
        .single();

      if (error) {
        console.error("[resumeService] DB Insert failed:", error);
        await supabase.storage.from('resumes').remove([filePath]);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("[resumeService] Global Catch:", error);
      return handleApiError(error);
    }
  },

  /**
   * 5. getResumeVersions (Hardened with ownership check)
   */
  async getResumeVersions(resumeId: string): Promise<ResumeVersion[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthenticated');

      // First verify the resume belongs to the user
      const { data: resume } = await supabase
        .from('resumes')
        .select('id')
        .eq('id', resumeId)
        .eq('profile_id', user.id)
        .single();

      if (!resume) throw new Error('Unauthorized');

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
   * 8. createSignedUrl (NEW: For secure, temporary access)
   */
  async createSignedUrl(filePath: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(filePath, 3600); // URL valid for 1 hour

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error("[resumeService] createSignedUrl failed:", error);
      return "";
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

  /**
   * 7. getLatestVersion
   */
  async getLatestVersion(resumeId: string): Promise<ResumeVersion | null> {
    try {
      const { data, error } = await supabase
        .from('resume_versions')
        .select('*')
        .eq('resume_id', resumeId)
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("[resumeService] getLatestVersion failed:", error);
      return null;
    }
  },
};