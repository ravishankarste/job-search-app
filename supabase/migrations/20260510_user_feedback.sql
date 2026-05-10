-- Create user_feedback table for Sovereign Intelligence
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sentiment TEXT NOT NULL,
    content TEXT,
    path TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own feedback
CREATE POLICY "Users can insert their own feedback" 
ON public.user_feedback 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow anonymous feedback (optional, but good for exit nudges before login)
CREATE POLICY "Allow anonymous feedback" 
ON public.user_feedback 
FOR INSERT 
TO anon 
WITH CHECK (user_id IS NULL);

-- Only admins can read all feedback (add your admin policy here if needed)
CREATE POLICY "Admins can view all feedback" 
ON public.user_feedback 
FOR SELECT 
TO authenticated 
USING (true); -- Simplified for now, refine with admin roles later
