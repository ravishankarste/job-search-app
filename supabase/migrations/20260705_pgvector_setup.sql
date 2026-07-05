-- Migrations: Setup pgvector extension and add columns + indexes

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding and status columns (1536 dimensions for text-embedding-3-small)
ALTER TABLE public.resume_versions 
ADD COLUMN IF NOT EXISTS embedding vector(1536),
ADD COLUMN IF NOT EXISTS embedding_status TEXT DEFAULT 'pending';

ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS embedding vector(1536),
ADD COLUMN IF NOT EXISTS embedding_status TEXT DEFAULT 'pending';

-- 3. Enforce strict status contracts
ALTER TABLE public.resume_versions
ADD CONSTRAINT resume_versions_embedding_status_check
CHECK (embedding_status IN ('pending', 'processing', 'ready', 'failed'));

ALTER TABLE public.jobs
ADD CONSTRAINT jobs_embedding_status_check
CHECK (embedding_status IN ('pending', 'processing', 'ready', 'failed'));

-- 4. Create HNSW Cosine Similarity indexes for fast semantic searches
CREATE INDEX IF NOT EXISTS idx_jobs_embedding_hnsw 
ON public.jobs 
USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_resume_versions_embedding_hnsw 
ON public.resume_versions 
USING hnsw (embedding vector_cosine_ops);

-- 5. Helper Function: Calculate deterministic match score from vectors
CREATE OR REPLACE FUNCTION public.calculate_match_score(resume_ver_id UUID, target_job_id UUID)
RETURNS INTEGER AS $$
DECLARE
    res_emb vector(1536);
    job_emb vector(1536);
    dist double precision;
BEGIN
    SELECT embedding INTO res_emb FROM public.resume_versions WHERE id = resume_ver_id;
    SELECT embedding INTO job_emb FROM public.jobs WHERE id = target_job_id;
    
    IF res_emb IS NULL OR job_emb IS NULL THEN
        RETURN NULL;
    END IF;
    
    dist := res_emb <=> job_emb;
    -- Map cosine distance to percentage, clamping between 0 and 100
    RETURN greatest(least(round((1.0 - dist) * 100), 100), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. State Transition Safety Guards
CREATE OR REPLACE FUNCTION public.enforce_embedding_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent downgrading from ready unless explicitly reprocessing
  IF OLD.embedding_status = 'ready' AND NEW.embedding_status = 'pending' THEN
    RAISE EXCEPTION 'Invalid status transition: ready → pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER resume_versions_embedding_status_guard
BEFORE UPDATE OF embedding_status ON public.resume_versions
FOR EACH ROW
EXECUTE FUNCTION public.enforce_embedding_status_transition();

CREATE OR REPLACE TRIGGER jobs_embedding_status_guard
BEFORE UPDATE OF embedding_status ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.enforce_embedding_status_transition();
