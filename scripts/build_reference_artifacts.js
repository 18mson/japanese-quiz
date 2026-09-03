// scripts/build_reference_artifacts.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'reference_source_data.json'), 'utf8'));

const { reference_lampiran, reference_konjugasi_kata_kerja } = rawData;
const { kata_bilangan, ungkapan_waktu_kalender, ungkapan_waktu_durasi, kata_bantu_bilangan } = reference_lampiran;

// 1. Generate src/data/referenceData.ts
const tsContent = `// src/data/referenceData.ts
// Bundled local reference data (Furoku / 付録) for fast loading & offline PWA support

export interface NumberUnit {
  value: number;
  japanese: string;
}

export interface ExampleValue {
  value: string;
  japanese: string;
}

export interface KataBilanganData {
  title: string;
  units: NumberUnit[];
  decimal_examples: ExampleValue[];
  fraction_examples: ExampleValue[];
  note_irregular: string;
}

export interface CalendarEntry {
  japanese: string;
  meaning: string;
}

export interface DurationEntry {
  value: number | string;
  japanese: string;
}

export interface UngkapanWaktuData {
  kalender: {
    title: string;
    hari: CalendarEntry[];
    pagi: CalendarEntry[];
    malam: CalendarEntry[];
    minggu: CalendarEntry[];
    bulan: CalendarEntry[];
    tahun: CalendarEntry[];
  };
  durasi: {
    title: string;
    jam_menit: {
      jam: DurationEntry[];
      menit: DurationEntry[];
    };
    jangka_waktu: {
      hari: DurationEntry[];
      minggu: DurationEntry[];
      bulan: DurationEntry[];
      tahun: DurationEntry[];
    };
    note_irregular: string;
  };
}

export interface CounterValueItem {
  value: number | string;
  japanese: string;
}

export interface CounterCategoryItem {
  category: string;
  counter: string;
  counter_reading: string;
  usage_example: string;
  values: CounterValueItem[];
}

export interface KataBantuBilanganData {
  title: string;
  categories: CounterCategoryItem[];
  note: string;
}

export interface VerbItem {
  masu: string;
  masu_reading: string;
  te: string;
  kamus: string;
  nai: string;
  ta: string;
  meaning: string;
  pelajaran: number;
}

export interface VerbGroupData {
  title: string;
  description: string;
  verbs: VerbItem[];
}

export interface KonjugasiKataKerjaData {
  title: string;
  note_umum: string;
  kelompok_1: VerbGroupData;
  kelompok_2: VerbGroupData;
  kelompok_3: VerbGroupData;
}

export const kataBilanganData: KataBilanganData = ${JSON.stringify(kata_bilangan, null, 2)};

export const ungkapanWaktuData: UngkapanWaktuData = {
  kalender: ${JSON.stringify(ungkapan_waktu_kalender, null, 2)},
  durasi: ${JSON.stringify(ungkapan_waktu_durasi, null, 2)}
};

export const kataBantuBilanganData: KataBantuBilanganData = ${JSON.stringify(kata_bantu_bilangan, null, 2)};

export const konjugasiKataKerjaData: KonjugasiKataKerjaData = {
  title: ${JSON.stringify(reference_konjugasi_kata_kerja.title)},
  note_umum: ${JSON.stringify(reference_konjugasi_kata_kerja.note_umum)},
  kelompok_1: ${JSON.stringify(reference_konjugasi_kata_kerja.kelompok_1, null, 2)},
  kelompok_2: ${JSON.stringify(reference_konjugasi_kata_kerja.kelompok_2, null, 2)},
  kelompok_3: ${JSON.stringify(reference_konjugasi_kata_kerja.kelompok_3, null, 2)}
};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/referenceData.ts'), tsContent, 'utf8');
console.log('✅ Generated src/data/referenceData.ts');

// 2. Generate supabase/migrations/009_seed_reference_data.sql
const escapeSql = (str) => {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
};

const escapeJson = (obj) => {
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
};

let sql = `-- 009_seed_reference_data.sql
-- Seeding data Furoku (Lampiran & Referensi)

DO $$
DECLARE
  cat_bilangan_id UUID;
  cat_waktu_id UUID;
  cat_counter_id UUID;
  cat_verba_id UUID;
BEGIN

-- 1. Categories
INSERT INTO public.reference_categories (slug, title, description, order_index)
VALUES 
  ('kata_bilangan', 'Kata Bilangan', 'Angka dasar 0-100jt, desimal, pecahan, dan pola pengucapan', 1),
  ('ungkapan_waktu', 'Ungkapan Waktu', 'Kalender (hari/minggu/bulan/tahun) dan durasi (jam/menit/jangka waktu)', 2),
  ('kata_bantu_bilangan', 'Kata Bantu Bilangan', 'Penghitung (counter words) untuk benda, waktu, orang, binatang, dll.', 3),
  ('konjugasi_kata_kerja', 'Konjugasi Kata Kerja', 'Daftar 154 kata kerja lengkap dengan 5 bentuk konjugasi dan pelajaran asal', 4)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index;

SELECT id INTO cat_bilangan_id FROM public.reference_categories WHERE slug = 'kata_bilangan';
SELECT id INTO cat_waktu_id FROM public.reference_categories WHERE slug = 'ungkapan_waktu';
SELECT id INTO cat_counter_id FROM public.reference_categories WHERE slug = 'kata_bantu_bilangan';
SELECT id INTO cat_verba_id FROM public.reference_categories WHERE slug = 'konjugasi_kata_kerja';

-- Clear existing entries for idempotent re-seed
DELETE FROM public.reference_entries WHERE category_id IN (cat_bilangan_id, cat_waktu_id, cat_counter_id, cat_verba_id);

-- 2. Seed Kata Bilangan
`;

let orderIdx = 1;
// Units
for (const u of kata_bilangan.units) {
  sql += `INSERT INTO public.reference_entries (category_id, group_label, entry_data, order_index) VALUES (cat_bilangan_id, 'units', ${escapeJson(u)}, ${orderIdx++});\n`;
}
// Decimal
for (const d of kata_bilangan.decimal_examples) {
  sql += `INSERT INTO public.reference_entries (category_id, group_label, entry_data, order_index) VALUES (cat_bilangan_id, 'decimal_examples', ${escapeJson(d)}, ${orderIdx++});\n`;
}
// Fraction
for (const f of kata_bilangan.fraction_examples) {
  sql += `INSERT INTO public.reference_entries (category_id, group_label, entry_data, order_index) VALUES (cat_bilangan_id, 'fraction_examples', ${escapeJson(f)}, ${orderIdx++});\n`;
}
// Note irregular
sql += `INSERT INTO public.reference_entries (category_id, group_label, entry_data, note, order_index) VALUES (cat_bilangan_id, 'note_irregular', ${escapeJson({ note: kata_bilangan.note_irregular })}, ${escapeSql(kata_bilangan.note_irregular)}, ${orderIdx++});\n\n`;

// 3. Seed Ungkapan Waktu (Kalender & Durasi)
sql += `-- Ungkapan Waktu: Kalender\n`;
orderIdx = 1;
const calKeys = ['hari', 'pagi', 'malam', 'minggu', 'bulan', 'tahun'];
for (const key of calKeys) {
  for (const item of ungkapan_waktu_kalender[key]) {
    sql += `INSERT INTO public.reference_entries (category_id, group_label, entry_data, order_index) VALUES (cat_waktu_id, ${escapeSql(key)}, ${escapeJson(item)}, ${orderIdx++});\n`;
  }
}

sql += `-- Ungkapan Waktu: Durasi\n`;
for (const item of ungkapan_waktu_durasi.jam_menit.jam) {
  sql += `INSERT INTO public.reference_entries (category_id, group_label, entry_data, order_index) VALUES (cat_waktu_id, 'jam', ${escapeJson(item)}, ${orderIdx++});\n`;
}
for (const item of ungkapan_waktu_durasi.jam_menit.menit) {
  sql += `INSERT INTO public.reference_entries (category_id, group_label, entry_data, order_index) VALUES (cat_waktu_id, 'menit', ${escapeJson(item)}, ${orderIdx++});\n`;
}
const durJangkaKeys = ['hari', 'minggu', 'bulan', 'tahun'];
for (const key of durJangkaKeys) {
  for (const item of ungkapan_waktu_durasi.jangka_waktu[key]) {
    sql += `INSERT INTO public.reference_entries (category_id, group_label, entry_data, order_index) VALUES (cat_waktu_id, ${escapeSql('durasi_' + key)}, ${escapeJson(item)}, ${orderIdx++});\n`;
  }
}
sql += `INSERT INTO public.reference_entries (category_id, group_label, entry_data, note, order_index) VALUES (cat_waktu_id, 'note_irregular', ${escapeJson({ note: ungkapan_waktu_durasi.note_irregular })}, ${escapeSql(ungkapan_waktu_durasi.note_irregular)}, ${orderIdx++});\n\n`;

// 4. Seed Kata Bantu Bilangan
sql += `-- Kata Bantu Bilangan\n`;
orderIdx = 1;
for (const cat of kata_bantu_bilangan.categories) {
  sql += `INSERT INTO public.reference_entries (category_id, group_label, entry_data, note, order_index) VALUES (cat_counter_id, 'counter', ${escapeJson(cat)}, ${escapeSql(kata_bantu_bilangan.note)}, ${orderIdx++});\n`;
}

// 5. Seed Konjugasi Kata Kerja
sql += `\n-- Konjugasi Kata Kerja\n`;
orderIdx = 1;
for (const v of reference_konjugasi_kata_kerja.kelompok_1.verbs) {
  sql += `INSERT INTO public.reference_entries (category_id, group_label, entry_data, order_index) VALUES (cat_verba_id, 'kelompok_1', ${escapeJson(v)}, ${orderIdx++});\n`;
}
for (const v of reference_konjugasi_kata_kerja.kelompok_2.verbs) {
  sql += `INSERT INTO public.reference_entries (category_id, group_label, entry_data, order_index) VALUES (cat_verba_id, 'kelompok_2', ${escapeJson(v)}, ${orderIdx++});\n`;
}
for (const v of reference_konjugasi_kata_kerja.kelompok_3.verbs) {
  sql += `INSERT INTO public.reference_entries (category_id, group_label, entry_data, order_index) VALUES (cat_verba_id, 'kelompok_3', ${escapeJson(v)}, ${orderIdx++});\n`;
}

sql += `\nEND $$;\n`;

fs.writeFileSync(path.join(__dirname, '../supabase/migrations/009_seed_reference_data.sql'), sql, 'utf8');
console.log('✅ Generated supabase/migrations/009_seed_reference_data.sql');
