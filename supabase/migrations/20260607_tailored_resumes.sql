-- Add columns for tailored resumes feature
ALTER TABLE public.resumes
ADD COLUMN is_tailored BOOLEAN DEFAULT false,
ADD COLUMN application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL;

-- Update RLS to allow these columns, but the existing policy ("Users can manage own resumes") 
-- applies to ALL operations based on profile_id, so no new RLS policy is strictly needed.
-- However, we might want to add an index for quick lookups by application_id
CREATE INDEX idx_resumes_application_id ON public.resumes(application_id);
