-- 🛡️ Sovereign Shield: Rate Limiting & Intelligence Caching

-- 1. Create Discovery Cache to prevent redundant Apify costs
CREATE TABLE IF NOT EXISTS discovery_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    location TEXT NOT NULL,
    days_ago INTEGER NOT NULL,
    results JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for high-speed cache lookups
CREATE INDEX IF NOT EXISTS idx_discovery_cache_lookup ON discovery_cache(query, location, days_ago);

-- 2. Create Usage Logs to prevent credit exhaustion attacks
CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for usage monitoring
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_action ON usage_logs(user_id, action_type, created_at);

-- 3. Cleanup Policy: Delete cache entries older than 24 hours
CREATE OR REPLACE FUNCTION cleanup_discovery_cache() RETURNS void AS $$
BEGIN
    DELETE FROM discovery_cache WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- 🛡️ Security: Enable RLS (Default Deny)
ALTER TABLE discovery_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Service-level only access (Edge Functions will use service_role)
CREATE POLICY "Service-role only access" ON discovery_cache FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service-role only access" ON usage_logs FOR ALL USING (auth.role() = 'service_role');
