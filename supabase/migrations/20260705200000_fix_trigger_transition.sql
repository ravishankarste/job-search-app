-- Migration: Fix enforce_embedding_status_transition trigger deadlock
-- Allows transitioning ready -> pending on jobs if the description or title changed

CREATE OR REPLACE FUNCTION public.enforce_embedding_status_transition()
RETURNS trigger AS $$
BEGIN
  -- Prevent downgrading from ready unless explicitly reprocessing
  IF OLD.embedding_status = 'ready' AND NEW.embedding_status = 'pending' THEN
    IF TG_TABLE_NAME = 'jobs' AND (NEW.description IS DISTINCT FROM OLD.description OR NEW.title IS DISTINCT FROM OLD.title) THEN
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'Invalid status transition: ready → pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
