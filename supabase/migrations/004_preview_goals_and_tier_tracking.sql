-- Migration 004: Preview mode flags, user goals, and daily progress tracking

-- 1. Add tracking columns to user_streaks table
ALTER TABLE IF EXISTS public.user_streaks 
ADD COLUMN IF NOT EXISTS previewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_tier TEXT,
ADD COLUMN IF NOT EXISTS tier_changed_at TIMESTAMPTZ;

-- 2. Create user_goals table
CREATE TABLE IF NOT EXISTS public.user_goals (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  daily_target_minutes INT DEFAULT 10,
  daily_target_questions INT DEFAULT 10,
  goal_type TEXT DEFAULT 'questions' CHECK (goal_type IN ('minutes', 'questions')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_goals
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own goals" ON public.user_goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Create daily_progress table
CREATE TABLE IF NOT EXISTS public.daily_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  progress_date DATE DEFAULT CURRENT_DATE NOT NULL,
  questions_answered INT DEFAULT 0,
  minutes_spent INT DEFAULT 0,
  goal_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, progress_date)
);

-- Enable RLS on daily_progress
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their daily progress" ON public.daily_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date ON public.daily_progress(user_id, progress_date);
