-- Migration 006: Renshuu Atomic Items, Bunkei Reference & Progress Tracking

-- 1. Add bunkei_ref column to existing tables if not present
ALTER TABLE public.renshuu_a 
  ADD COLUMN IF NOT EXISTS bunkei_ref UUID REFERENCES public.grammar_points(id) ON DELETE SET NULL;

ALTER TABLE public.renshuu_b_questions 
  ADD COLUMN IF NOT EXISTS bunkei_ref UUID REFERENCES public.grammar_points(id) ON DELETE SET NULL;

ALTER TABLE public.renshuu_c 
  ADD COLUMN IF NOT EXISTS bunkei_ref UUID REFERENCES public.grammar_points(id) ON DELETE SET NULL;

-- 2. Atomized Tables for Granular Progress Tracking

-- Renshuu A Atomized Items (8 items per lesson)
CREATE TABLE IF NOT EXISTS public.renshuu_a_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  bunkei_id UUID REFERENCES public.grammar_points(id) ON DELETE SET NULL,
  question_order INT NOT NULL,
  sub_order INT NOT NULL DEFAULT 1,
  base_example TEXT NOT NULL,
  substitution_word TEXT NOT NULL,
  target_japanese TEXT NOT NULL,
  target_romaji TEXT NOT NULL,
  meaning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Renshuu B Atomized Items (28 items per lesson)
CREATE TABLE IF NOT EXISTS public.renshuu_b_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  bunkei_id UUID REFERENCES public.grammar_points(id) ON DELETE SET NULL,
  character_id UUID REFERENCES public.renshuu_b_characters(id) ON DELETE CASCADE,
  question_order INT NOT NULL,
  sub_order INT NOT NULL DEFAULT 1,
  pattern TEXT NOT NULL,
  character_key TEXT NOT NULL,
  prompt_question TEXT,
  prompt_romaji TEXT,
  target_japanese TEXT NOT NULL,
  target_romaji TEXT NOT NULL,
  meaning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Renshuu C Atomized Items (9 items per lesson)
CREATE TABLE IF NOT EXISTS public.renshuu_c_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  bunkei_id UUID REFERENCES public.grammar_points(id) ON DELETE SET NULL,
  renshuu_c_id UUID REFERENCES public.renshuu_c(id) ON DELETE CASCADE,
  question_order INT NOT NULL,
  option_key TEXT NOT NULL,
  slot_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  dialogue_template JSONB NOT NULL DEFAULT '[]'::jsonb,
  resolved_lines JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Renshuu Progress Table
CREATE TABLE IF NOT EXISTS public.renshuu_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  renshuu_item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('a', 'b', 'c')),
  status TEXT NOT NULL DEFAULT 'belum' CHECK (status IN ('belum', 'benar', 'salah_perlu_ulang')),
  last_attempted_at TIMESTAMPTZ DEFAULT NOW(),
  attempt_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, renshuu_item_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_renshuu_a_items_lesson ON public.renshuu_a_items (lesson_id);
CREATE INDEX IF NOT EXISTS idx_renshuu_b_items_lesson ON public.renshuu_b_items (lesson_id);
CREATE INDEX IF NOT EXISTS idx_renshuu_c_items_lesson ON public.renshuu_c_items (lesson_id);
CREATE INDEX IF NOT EXISTS idx_renshuu_progress_user_type_status ON public.renshuu_progress (user_id, item_type, status);

-- Enable RLS
ALTER TABLE public.renshuu_a_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renshuu_b_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renshuu_c_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renshuu_progress ENABLE ROW LEVEL SECURITY;

-- Read policies for atomized tables
DROP POLICY IF EXISTS "Public read renshuu_a_items" ON public.renshuu_a_items;
CREATE POLICY "Public read renshuu_a_items" ON public.renshuu_a_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read renshuu_b_items" ON public.renshuu_b_items;
CREATE POLICY "Public read renshuu_b_items" ON public.renshuu_b_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read renshuu_c_items" ON public.renshuu_c_items;
CREATE POLICY "Public read renshuu_c_items" ON public.renshuu_c_items FOR SELECT USING (true);

-- User progress policies
DROP POLICY IF EXISTS "Users can view own renshuu progress" ON public.renshuu_progress;
CREATE POLICY "Users can view own renshuu progress" ON public.renshuu_progress 
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can insert own renshuu progress" ON public.renshuu_progress;
CREATE POLICY "Users can insert own renshuu progress" ON public.renshuu_progress 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can update own renshuu progress" ON public.renshuu_progress;
CREATE POLICY "Users can update own renshuu progress" ON public.renshuu_progress 
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL);
