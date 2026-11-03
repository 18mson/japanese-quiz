-- 016_kanji_catalog.sql
-- Table for 3-tier kanji catalog (591 kanji from words.ts)

CREATE TABLE IF NOT EXISTS public.kanji_catalog (
  kanji TEXT PRIMARY KEY,
  tier TEXT NOT NULL CHECK (tier IN ('manual', 'ai', 'basic')),
  meaning TEXT[] NOT NULL DEFAULT '{}',
  on_readings TEXT[] NOT NULL DEFAULT '{}',
  kun_readings TEXT[] NOT NULL DEFAULT '{}',
  stroke_count INT,
  jlpt INT,
  grade INT,
  formation_type TEXT,
  components JSONB NOT NULL DEFAULT '[]',
  etymology_id TEXT,
  etymology_confidence TEXT,
  mnemonic_id TEXT,
  note_id TEXT,
  phonetic_part TEXT,
  reading_hint TEXT,
  claim_kind TEXT,
  old_form TEXT,
  words JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kanji_catalog_tier ON public.kanji_catalog(tier);

ALTER TABLE public.kanji_catalog ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow public read on kanji_catalog" ON public.kanji_catalog FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow service_role manage on kanji_catalog" ON public.kanji_catalog FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

