-- Enable UUID extension (gen_random_uuid() is built-in for modern PG, but we ensure pgcrypto is available if needed)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
CREATE TYPE application_status AS ENUM ('saved', 'applied', 'interviewing', 'offered', 'rejected');
CREATE TYPE job_type AS ENUM ('full-time', 'part-time', 'contract', 'freelance', 'internship');
CREATE TYPE user_role AS ENUM ('user', 'coach', 'admin');

-- Timestamp Update Function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-------------------------------------------------------------------------------
-- 1. PROFILES (The core identity table, referencing auth.users)
-------------------------------------------------------------------------------
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role user_role DEFAULT 'user',
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at 
BEFORE UPDATE ON public.profiles 
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-------------------------------------------------------------------------------
-- 2. RESUMES (User-owned)
-------------------------------------------------------------------------------
CREATE TABLE public.resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_role TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_resumes_updated_at 
BEFORE UPDATE ON public.resumes 
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE INDEX idx_resumes_profile_id ON public.resumes(profile_id);

-------------------------------------------------------------------------------
-- 3. RESUME VERSIONS (IMMUTABLE audit log)
-------------------------------------------------------------------------------
CREATE TABLE public.resume_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    version_number INT NOT NULL,
    content JSONB NOT NULL,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- NO updated_at trigger for immutable table

-------------------------------------------------------------------------------
-- 4. JOBS (User-owned job tracking)
-------------------------------------------------------------------------------
CREATE TABLE public.jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT,
    description TEXT,
    location TEXT,
    employment_type job_type,
    salary_range JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_jobs_updated_at 
BEFORE UPDATE ON public.jobs 
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE INDEX idx_jobs_profile_id ON public.jobs(profile_id);

-------------------------------------------------------------------------------
-- 5. APPLICATIONS (User-owned + unique job application)
-------------------------------------------------------------------------------
CREATE TABLE public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    status application_status DEFAULT 'saved',
    applied_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, job_id)
);

CREATE TRIGGER update_applications_updated_at 
BEFORE UPDATE ON public.applications 
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE INDEX idx_applications_profile_id ON public.applications(profile_id);
CREATE INDEX idx_applications_job_id ON public.applications(job_id);

-------------------------------------------------------------------------------
-- 6. COVER LETTERS (Linked to applications)
-------------------------------------------------------------------------------
CREATE TABLE public.cover_letters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_cover_letters_updated_at 
BEFORE UPDATE ON public.cover_letters 
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE INDEX idx_cover_letters_profile_id ON public.cover_letters(profile_id);
CREATE INDEX idx_cover_letters_application_id ON public.cover_letters(application_id);

-------------------------------------------------------------------------------
-- 7. FOLLOWUPS (Linked to applications only)
-------------------------------------------------------------------------------
CREATE TABLE public.followups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_followups_updated_at 
BEFORE UPDATE ON public.followups 
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE INDEX idx_followups_application_id ON public.followups(application_id);

-------------------------------------------------------------------------------
-- 8. ANALYTICS EVENTS (IMMUTABLE event log)
-------------------------------------------------------------------------------
CREATE TABLE public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- NO updated_at trigger for immutable table
CREATE INDEX idx_analytics_events_profile_id ON public.analytics_events(profile_id);

-------------------------------------------------------------------------------
-- 9. NOTIFICATIONS (User-owned)
-------------------------------------------------------------------------------
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_profile_id ON public.notifications(profile_id);

-------------------------------------------------------------------------------
-- 10. INTEGRATIONS (User-owned)
-------------------------------------------------------------------------------
CREATE TABLE public.integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, provider)
);

CREATE TRIGGER update_integrations_updated_at 
BEFORE UPDATE ON public.integrations 
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE INDEX idx_integrations_profile_id ON public.integrations(profile_id);

-------------------------------------------------------------------------------
-- 11. COLLABORATORS (Profile-id based system)
-------------------------------------------------------------------------------
CREATE TABLE public.collaborators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    collaborator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'coach',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_id, collaborator_id)
);
CREATE INDEX idx_collaborators_owner_id ON public.collaborators(owner_id);
CREATE INDEX idx_collaborators_collaborator_id ON public.collaborators(collaborator_id);

-------------------------------------------------------------------------------
-- AUTO-PROFILE CREATION TRIGGER
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'avatar_url',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;

-- Profiles: SELECT / UPDATE / INSERT: auth.uid() = id
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Resumes: ALL operations: auth.uid() = profile_id
CREATE POLICY "Users can manage own resumes" ON public.resumes FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Resume Versions (Immutable): SELECT/INSERT where auth.uid() = profile_id (via join to resumes table)
-- We enforce NO UPDATE/DELETE by only creating SELECT and INSERT policies.
CREATE POLICY "Users can view own resume versions" ON public.resume_versions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.resumes WHERE id = public.resume_versions.resume_id AND profile_id = auth.uid())
);
CREATE POLICY "Users can insert own resume versions" ON public.resume_versions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND profile_id = auth.uid())
);

-- Jobs: ALL operations: auth.uid() = profile_id
CREATE POLICY "Users can manage own jobs" ON public.jobs FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Applications: ALL operations: auth.uid() = profile_id
CREATE POLICY "Users can manage own applications" ON public.applications FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Cover Letters: SELECT/INSERT/UPDATE: must belong to application owned by auth.uid()
-- (Note: Cover letters also have a profile_id per the schema, so we can check that directly for performance or check the application owner).
CREATE POLICY "Users can view own cover letters" ON public.cover_letters FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can insert own cover letters" ON public.cover_letters FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can update own cover letters" ON public.cover_letters FOR UPDATE USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Followups: only accessible via application ownership
CREATE POLICY "Users can manage followups via application" ON public.followups FOR ALL USING (
    EXISTS (SELECT 1 FROM public.applications WHERE id = public.followups.application_id AND profile_id = auth.uid())
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.applications WHERE id = application_id AND profile_id = auth.uid())
);

-- Notifications: auth.uid() = profile_id
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Integrations: auth.uid() = profile_id
CREATE POLICY "Users can manage own integrations" ON public.integrations FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Analytics Events (Immutable): SELECT only where auth.uid() = profile_id, INSERT allowed only for same profile_id. NO UPDATE / DELETE.
CREATE POLICY "Users can view own events" ON public.analytics_events FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can insert own events" ON public.analytics_events FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Collaborators: owner_id = auth.uid() OR collaborator_id = auth.uid()
CREATE POLICY "Users can access their collaborations" ON public.collaborators FOR ALL USING (
    owner_id = auth.uid() OR collaborator_id = auth.uid()
) WITH CHECK (
    owner_id = auth.uid() OR collaborator_id = auth.uid()
);

-------------------------------------------------------------------------------
-- STORAGE ARCHITECTURE & SECURITY POLICIES
-------------------------------------------------------------------------------
-- 3 separate private buckets: resumes, cover_letters, user_uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
('resumes', 'resumes', false),
('cover_letters', 'cover_letters', false),
('user_uploads', 'user_uploads', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage Buckets
-- UPLOAD, READ, DELETE, UPDATE: auth.uid() must match folder prefix. Folder structure: /{user_id}/filename

-- Resumes Bucket
CREATE POLICY "Users can manage their own resumes storage" ON storage.objects FOR ALL TO authenticated USING (
    bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text
) WITH CHECK (
    bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Cover Letters Bucket
CREATE POLICY "Users can manage their own cover letters storage" ON storage.objects FOR ALL TO authenticated USING (
    bucket_id = 'cover_letters' AND (storage.foldername(name))[1] = auth.uid()::text
) WITH CHECK (
    bucket_id = 'cover_letters' AND (storage.foldername(name))[1] = auth.uid()::text
);

-- User Uploads Bucket
CREATE POLICY "Users can manage their own user uploads storage" ON storage.objects FOR ALL TO authenticated USING (
    bucket_id = 'user_uploads' AND (storage.foldername(name))[1] = auth.uid()::text
) WITH CHECK (
    bucket_id = 'user_uploads' AND (storage.foldername(name))[1] = auth.uid()::text
);
