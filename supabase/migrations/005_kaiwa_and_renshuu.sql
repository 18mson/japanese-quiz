-- Migration 005: Kaiwa and Renshuu Schema

-- 1. Lessons Table (Induk Pelajaran)
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_number INT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Grammar Points (Bunkei / Pola Kalimat)
CREATE TABLE IF NOT EXISTS public.grammar_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  order_index INT NOT NULL,
  japanese TEXT NOT NULL,
  romaji TEXT,
  meaning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Kaiwa (Dialog Induk)
CREATE TABLE IF NOT EXISTS public.kaiwa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  title_romaji TEXT,
  title_meaning TEXT,
  context_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Kaiwa Lines (Baris Percakapan)
CREATE TABLE IF NOT EXISTS public.kaiwa_lines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kaiwa_id UUID REFERENCES public.kaiwa(id) ON DELETE CASCADE NOT NULL,
  speaker TEXT NOT NULL,
  japanese TEXT NOT NULL,
  romaji TEXT NOT NULL,
  meaning TEXT,
  order_index INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Renshuu A (Substitusi Teks)
CREATE TABLE IF NOT EXISTS public.renshuu_a (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  question_order INT NOT NULL,
  type TEXT NOT NULL,
  base_template TEXT,
  base_filled_example TEXT,
  substitutions JSONB DEFAULT '[]'::jsonb,
  results JSONB DEFAULT '[]'::jsonb,
  meaning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Renshuu B Characters (Tokoh Gambar)
CREATE TABLE IF NOT EXISTS public.renshuu_b_characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  table_id TEXT NOT NULL,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  romaji_name TEXT,
  age INT,
  country TEXT,
  company TEXT,
  profession TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Renshuu B Questions (Soal Pola Gambar)
CREATE TABLE IF NOT EXISTS public.renshuu_b_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  table_ref TEXT NOT NULL,
  question_order INT NOT NULL,
  pattern TEXT NOT NULL,
  question_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Renshuu C (Role-play Template Dialog)
CREATE TABLE IF NOT EXISTS public.renshuu_c (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  question_order INT NOT NULL,
  type TEXT NOT NULL,
  dialogue_template JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Renshuu C Options (Opsi Slot Pilihan Ganda)
CREATE TABLE IF NOT EXISTS public.renshuu_c_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  renshuu_c_id UUID REFERENCES public.renshuu_c(id) ON DELETE CASCADE NOT NULL,
  option_key TEXT NOT NULL,
  slot_values JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes on foreign keys
CREATE INDEX IF NOT EXISTS idx_grammar_points_lesson_id ON public.grammar_points(lesson_id);
CREATE INDEX IF NOT EXISTS idx_kaiwa_lesson_id ON public.kaiwa(lesson_id);
CREATE INDEX IF NOT EXISTS idx_kaiwa_lines_kaiwa_id ON public.kaiwa_lines(kaiwa_id);
CREATE INDEX IF NOT EXISTS idx_renshuu_a_lesson_id ON public.renshuu_a(lesson_id);
CREATE INDEX IF NOT EXISTS idx_renshuu_b_characters_lesson_id ON public.renshuu_b_characters(lesson_id);
CREATE INDEX IF NOT EXISTS idx_renshuu_b_questions_lesson_id ON public.renshuu_b_questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_renshuu_c_lesson_id ON public.renshuu_c(lesson_id);
CREATE INDEX IF NOT EXISTS idx_renshuu_c_options_renshuu_c_id ON public.renshuu_c_options(renshuu_c_id);

-- Enable RLS for all new tables
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grammar_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kaiwa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kaiwa_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renshuu_a ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renshuu_b_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renshuu_b_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renshuu_c ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renshuu_c_options ENABLE ROW LEVEL SECURITY;

-- Read policies for public access (following quiz_items pattern)
DROP POLICY IF EXISTS "Allow public read access for lessons" ON public.lessons;
CREATE POLICY "Allow public read access for lessons" ON public.lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access for grammar_points" ON public.grammar_points;
CREATE POLICY "Allow public read access for grammar_points" ON public.grammar_points FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access for kaiwa" ON public.kaiwa;
CREATE POLICY "Allow public read access for kaiwa" ON public.kaiwa FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access for kaiwa_lines" ON public.kaiwa_lines;
CREATE POLICY "Allow public read access for kaiwa_lines" ON public.kaiwa_lines FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access for renshuu_a" ON public.renshuu_a;
CREATE POLICY "Allow public read access for renshuu_a" ON public.renshuu_a FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access for renshuu_b_characters" ON public.renshuu_b_characters;
CREATE POLICY "Allow public read access for renshuu_b_characters" ON public.renshuu_b_characters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access for renshuu_b_questions" ON public.renshuu_b_questions;
CREATE POLICY "Allow public read access for renshuu_b_questions" ON public.renshuu_b_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access for renshuu_c" ON public.renshuu_c;
CREATE POLICY "Allow public read access for renshuu_c" ON public.renshuu_c FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access for renshuu_c_options" ON public.renshuu_c_options;
CREATE POLICY "Allow public read access for renshuu_c_options" ON public.renshuu_c_options FOR SELECT USING (true);

-- Allow permissive write for initial seeding & admin management
DROP POLICY IF EXISTS "Allow anon insert for lessons" ON public.lessons;
CREATE POLICY "Allow anon insert for lessons" ON public.lessons FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update for lessons" ON public.lessons;
CREATE POLICY "Allow anon update for lessons" ON public.lessons FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon insert for grammar_points" ON public.grammar_points;
CREATE POLICY "Allow anon insert for grammar_points" ON public.grammar_points FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert for kaiwa" ON public.kaiwa;
CREATE POLICY "Allow anon insert for kaiwa" ON public.kaiwa FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert for kaiwa_lines" ON public.kaiwa_lines;
CREATE POLICY "Allow anon insert for kaiwa_lines" ON public.kaiwa_lines FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert for renshuu_a" ON public.renshuu_a;
CREATE POLICY "Allow anon insert for renshuu_a" ON public.renshuu_a FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert for renshuu_b_characters" ON public.renshuu_b_characters;
CREATE POLICY "Allow anon insert for renshuu_b_characters" ON public.renshuu_b_characters FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert for renshuu_b_questions" ON public.renshuu_b_questions;
CREATE POLICY "Allow anon insert for renshuu_b_questions" ON public.renshuu_b_questions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert for renshuu_c" ON public.renshuu_c;
CREATE POLICY "Allow anon insert for renshuu_c" ON public.renshuu_c FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert for renshuu_c_options" ON public.renshuu_c_options;
CREATE POLICY "Allow anon insert for renshuu_c_options" ON public.renshuu_c_options FOR INSERT WITH CHECK (true);

-- Ensure public storage bucket 'renshuu-characters' exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('renshuu-characters', 'renshuu-characters', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage public read policy
DROP POLICY IF EXISTS "Public access to renshuu-characters" ON storage.objects;
CREATE POLICY "Public access to renshuu-characters" ON storage.objects
  FOR SELECT USING (bucket_id = 'renshuu-characters');

DROP POLICY IF EXISTS "Anon insert to renshuu-characters" ON storage.objects;
CREATE POLICY "Anon insert to renshuu-characters" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'renshuu-characters');

DROP POLICY IF EXISTS "Anon update to renshuu-characters" ON storage.objects;
CREATE POLICY "Anon update to renshuu-characters" ON storage.objects
  FOR UPDATE USING (bucket_id = 'renshuu-characters');
