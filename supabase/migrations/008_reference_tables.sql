-- 008_reference_tables.sql
-- Schema for Furoku (Lampiran & Referensi Lintas-Pelajaran)

-- 1. Create reference_categories table
CREATE TABLE IF NOT EXISTS public.reference_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reference_categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow public read on reference_categories" ON public.reference_categories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated manage on reference_categories" ON public.reference_categories FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create reference_entries table
CREATE TABLE IF NOT EXISTS public.reference_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.reference_categories(id) ON DELETE CASCADE,
  group_label TEXT NOT NULL,
  entry_data JSONB NOT NULL,
  note TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reference_entries_category ON public.reference_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_reference_entries_group ON public.reference_entries(group_label);

ALTER TABLE public.reference_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow public read on reference_entries" ON public.reference_entries FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated manage on reference_entries" ON public.reference_entries FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
