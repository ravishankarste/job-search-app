-- Add metadata column to usage_logs for IP address rate-limiting tracking
ALTER TABLE public.usage_logs
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add index to speed up metadata IP lookups
CREATE INDEX IF NOT EXISTS idx_usage_logs_ip ON public.usage_logs ((metadata->>'ip'));
