-- 007_grammar_notes_and_vocabulary.sql

-- 1. Alter grammar_points to support rich hierarchical explanations, sub_points, examples, and notes
ALTER TABLE public.grammar_points
  ADD COLUMN IF NOT EXISTS point_number INT,
  ADD COLUMN IF NOT EXISTS pattern TEXT,
  ADD COLUMN IF NOT EXISTS explanation TEXT,
  ADD COLUMN IF NOT EXISTS sub_points JSONB,
  ADD COLUMN IF NOT EXISTS examples JSONB,
  ADD COLUMN IF NOT EXISTS note TEXT;

-- 2. Create lesson_vocabulary table
CREATE TABLE IF NOT EXISTS public.lesson_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  japanese TEXT NOT NULL,
  meaning TEXT NOT NULL,
  note TEXT,
  category TEXT NOT NULL CHECK (category IN ('kosakata', 'renshuu_c_phrase')),
  order_index INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lesson_vocabulary ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow public read on lesson_vocabulary" ON public.lesson_vocabulary FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated manage on lesson_vocabulary" ON public.lesson_vocabulary FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Create lesson_reference_tables table
CREATE TABLE IF NOT EXISTS public.lesson_reference_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  table_type TEXT NOT NULL,
  row_data JSONB NOT NULL,
  order_index INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lesson_reference_tables ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow public read on lesson_reference_tables" ON public.lesson_reference_tables FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated manage on lesson_reference_tables" ON public.lesson_reference_tables FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
