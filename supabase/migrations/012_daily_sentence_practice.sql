-- ============================================================
-- Migration 012: Daily Sentence Practice (Latihan Kalimat Harian)
-- ============================================================

-- 1. Table: sentence_questions
-- Stores the bank of sentences (Tatoeba, template, manual).
-- Sealed from direct client reads to prevent jp_answers leakage.
CREATE TABLE IF NOT EXISTS public.sentence_questions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id   INT NOT NULL,
  id_text      TEXT NOT NULL,
  jp_text      TEXT NOT NULL,
  jp_answers   TEXT[] NOT NULL,
  source       TEXT NOT NULL CHECK (source IN ('tatoeba', 'template', 'manual')),
  source_ref   TEXT,
  attribution  TEXT,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('approved', 'draft')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_sentence_questions_source_ref UNIQUE (source, source_ref)
);

-- Index on (chapter_id, status) for fast randomized selection of approved questions
CREATE INDEX IF NOT EXISTS idx_sentence_questions_chapter_status
  ON public.sentence_questions (chapter_id, status);

-- 2. Table: daily_sessions
-- Tracks a user's daily practice session per calendar date (Asia/Jakarta).
-- Enforces one session per user per day.
CREATE TABLE IF NOT EXISTS public.daily_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date  DATE NOT NULL,
  chapter_ids   INT[] NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_daily_sessions_user_date UNIQUE (user_id, session_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_sessions_user_date
  ON public.daily_sessions (user_id, session_date);

-- 3. Table: daily_questions
-- Stores the specific questions assigned to a user's daily session,
-- along with attempt count, reveal state, and correctness.
CREATE TABLE IF NOT EXISTS public.daily_questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES public.daily_sessions(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.sentence_questions(id) ON DELETE CASCADE,
  chapter_id  INT NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT false,
  attempts    INT NOT NULL DEFAULT 0,
  revealed    BOOLEAN NOT NULL DEFAULT false,
  answered_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_daily_questions_session_question UNIQUE (session_id, question_id)
);

-- Index for checking previously seen questions by a user
CREATE INDEX IF NOT EXISTS idx_daily_questions_user_question
  ON public.daily_questions (user_id, question_id);

-- Index for fetching questions of a given session
CREATE INDEX IF NOT EXISTS idx_daily_questions_session
  ON public.daily_questions (session_id);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- A. sentence_questions:
-- MUST NOT be accessible directly by anon or authenticated clients.
-- Only accessible via Edge Functions using service_role key.
ALTER TABLE public.sentence_questions ENABLE ROW LEVEL SECURITY;
-- No SELECT/INSERT/UPDATE/DELETE policies for anon/authenticated = access denied by default.

-- B. daily_sessions:
-- Authenticated users can only SELECT their own sessions.
-- INSERT, UPDATE, DELETE are forbidden from client; only service_role can modify.
ALTER TABLE public.daily_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own daily_sessions" ON public.daily_sessions;
CREATE POLICY "Users can view own daily_sessions"
  ON public.daily_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- C. daily_questions:
-- Authenticated users can only SELECT their own assigned daily questions.
-- INSERT, UPDATE, DELETE are forbidden from client; only service_role can modify.
ALTER TABLE public.daily_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own daily_questions" ON public.daily_questions;
CREATE POLICY "Users can view own daily_questions"
  ON public.daily_questions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
