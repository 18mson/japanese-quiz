-- ============================================================
-- Migration 013: Sentence Grammar Tags & Focus Indicator
-- ============================================================

-- Add grammar_tags and is_focus to sentence_questions
ALTER TABLE public.sentence_questions
  ADD COLUMN IF NOT EXISTS grammar_tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_focus BOOLEAN NOT NULL DEFAULT false;

-- Create composite index for querying approved focus vs review questions per chapter
CREATE INDEX IF NOT EXISTS idx_sentence_questions_chapter_status_focus
  ON public.sentence_questions (chapter_id, status, is_focus);
