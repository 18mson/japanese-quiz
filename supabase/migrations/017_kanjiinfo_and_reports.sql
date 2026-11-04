-- 017_kanjiinfo_and_reports.sql
-- Table public.kanjiinfo and public.kanji_reports with RLS and tier guard

-- 1. Table public.kanjiinfo
CREATE TABLE IF NOT EXISTS public.kanjiinfo (
  kanji TEXT PRIMARY KEY,
  tier TEXT NOT NULL CHECK (tier IN ('manual', 'ai', 'basic')),
  tier_rank INT NOT NULL,
  meaning_en TEXT,
  on_yomi TEXT[] NOT NULL DEFAULT '{}',
  kun_yomi TEXT[] NOT NULL DEFAULT '{}',
  strokes INT,
  jlpt INT,
  old_form TEXT,
  components JSONB NOT NULL DEFAULT '[]',
  mnemonic_id TEXT,
  etymology_id TEXT,
  etymology_confidence TEXT,
  source TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kanjiinfo_tier ON public.kanjiinfo(tier);

-- Prioritas tingkat: hanya timpa baris bila tier_rank baru >= tier_rank lama (manual=3, ai=2, basic=1)
CREATE OR REPLACE FUNCTION kanjiinfo_tier_rank_guard()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.tier_rank > NEW.tier_rank THEN
    RETURN OLD;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kanjiinfo_tier_rank_guard ON public.kanjiinfo;
CREATE TRIGGER trg_kanjiinfo_tier_rank_guard
BEFORE UPDATE ON public.kanjiinfo
FOR EACH ROW
EXECUTE FUNCTION kanjiinfo_tier_rank_guard();

ALTER TABLE public.kanjiinfo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read on kanjiinfo" ON public.kanjiinfo;
CREATE POLICY "Allow authenticated read on kanjiinfo" 
ON public.kanjiinfo FOR SELECT 
TO authenticated 
USING (true);

-- 2. Table public.kanji_reports
CREATE TABLE IF NOT EXISTS public.kanji_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kanji TEXT NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.kanji_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated insert kanji_reports" ON public.kanji_reports;
CREATE POLICY "Allow authenticated insert kanji_reports" 
ON public.kanji_reports FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users select own kanji_reports" ON public.kanji_reports;
CREATE POLICY "Allow users select own kanji_reports" 
ON public.kanji_reports FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);
