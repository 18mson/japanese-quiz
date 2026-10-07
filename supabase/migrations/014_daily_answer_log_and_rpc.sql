-- ============================================================
-- Migration 014: Daily Practice Answer Log and Audit Table
-- ============================================================

-- 1. Table: answer_log
-- Audit log of user attempts for rate limiting (max 60/hour) and performance tracking.
CREATE TABLE IF NOT EXISTS public.answer_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_question_id UUID NOT NULL REFERENCES public.daily_questions(id) ON DELETE CASCADE,
  input_method      TEXT NOT NULL CHECK (input_method IN ('text', 'voice')),
  is_correct        BOOLEAN NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for checking rate limits per user within sliding time windows
CREATE INDEX IF NOT EXISTS idx_answer_log_user_created
  ON public.answer_log (user_id, created_at);

-- 2. Row Level Security (RLS)
-- Sealed from direct client reads and writes. Accessible exclusively via service_role.
ALTER TABLE public.answer_log ENABLE ROW LEVEL SECURITY;
-- No SELECT/INSERT/UPDATE/DELETE policies for authenticated or anon = denied by default.
