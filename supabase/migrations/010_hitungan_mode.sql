-- 010_hitungan_mode.sql
-- Schema for Mode Hitungan (Number & Counter Typing with Wave System)

-- 1. Create hitungan_waves table
CREATE TABLE IF NOT EXISTS public.hitungan_waves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wave_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  min_value INT,
  max_value INT,
  counter_category TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hitungan_waves_order ON public.hitungan_waves(order_index);

ALTER TABLE public.hitungan_waves ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow public read on hitungan_waves" ON public.hitungan_waves FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated manage on hitungan_waves" ON public.hitungan_waves FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create hitungan_progress table
CREATE TABLE IF NOT EXISTS public.hitungan_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wave_id UUID NOT NULL REFERENCES public.hitungan_waves(id) ON DELETE CASCADE,
  tutorial_seen BOOLEAN DEFAULT false,
  attempts INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  last_practiced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, wave_id)
);

CREATE INDEX IF NOT EXISTS idx_hitungan_progress_user ON public.hitungan_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_hitungan_progress_wave ON public.hitungan_progress(wave_id);

ALTER TABLE public.hitungan_progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own hitungan progress" ON public.hitungan_progress 
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own hitungan progress" ON public.hitungan_progress 
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own hitungan progress" ON public.hitungan_progress 
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Seed hitungan_waves data
INSERT INTO public.hitungan_waves (wave_key, title, description, min_value, max_value, counter_category, order_index)
VALUES
  ('basic_1_10', 'Angka Dasar (1–10)', 'Pengenalan digit dasar angka 1 sampai 10', 1, 10, NULL, 1),
  ('basic_10_99', 'Puluhan (10–99)', 'Kombinasi puluhan dan satuan', 10, 99, NULL, 2),
  ('hundreds', 'Ratusan (100–999)', 'Pola ratusan dengan pengecualian bunyi 300, 600, dan 800', 100, 999, NULL, 3),
  ('thousands', 'Ribuan (1.000–9.999)', 'Pola ribuan dengan pengecualian bunyi 3000 dan 8000', 1000, 9999, NULL, 4),
  ('ten_thousands', 'Puluhan Ribu (10.000+)', 'Pola kelipatan 万 (まん) dan gabungan angka besar', 10000, 1000000, NULL, 5),
  ('counter_hon', 'Counter: 本 (ほん)', 'Kata bantu untuk benda panjang dan silinder (pensil, botol, dll.)', NULL, NULL, 'benda yang kurus dan panjang', 6),
  ('counter_hai', 'Counter: 杯 (はい)', 'Kata bantu untuk minuman dalam gelas atau cangkir', NULL, NULL, 'minuman dalam cangkir/gelas', 7),
  ('counter_hiki', 'Counter: 匹 (ひき)', 'Kata bantu untuk binatang kecil, ikan, dan serangga', NULL, NULL, 'binatang kecil, ikan, dan serangga', 8),
  ('counter_ko', 'Counter: 個 (こ)', 'Kata bantu untuk benda kecil dan bulat', NULL, NULL, 'benda kecil', 9),
  ('counter_kai', 'Counter: 回 (かい)', 'Kata bantu untuk frekuensi (berapa kali)', NULL, NULL, 'frekuensi', 10),
  ('counter_soku', 'Counter: 足 (そく)', 'Kata bantu untuk pasang sepatu dan kaos kaki', NULL, NULL, 'sepatu dan kaos kaki', 11),
  ('counter_ken', 'Counter: 軒 (けん)', 'Kata bantu untuk rumah dan bangunan', NULL, NULL, 'rumah', 12),
  ('counter_kai_floor', 'Counter: 階 (かい)', 'Kata bantu untuk tingkat lantai gedung', NULL, NULL, 'lantai dari sebuah bangunan', 13),
  ('mixed_review', 'Campuran (Mixed Review)', 'Review acak dari semua wave yang telah dipelajari', NULL, NULL, NULL, 99)
ON CONFLICT (wave_key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  min_value = EXCLUDED.min_value,
  max_value = EXCLUDED.max_value,
  counter_category = EXCLUDED.counter_category,
  order_index = EXCLUDED.order_index;
