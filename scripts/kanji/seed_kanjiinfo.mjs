// scripts/kanji/seed_kanjiinfo.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Polyfill WebSocket for Node.js < 22 to prevent Supabase RealtimeClient error
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class DummyWebSocket {};
}

import { createClient } from '@supabase/supabase-js';
import { parseKanjidic, parseKanjivgSvg } from './facts.mjs';
import { getDirectComponents } from './validate.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_FILE = path.resolve(__dirname, '../../.env');
const DATA_DIR = path.resolve(__dirname, 'data');
const OUT_DIR = path.resolve(__dirname, 'out');
const RAW_DIR = path.resolve(__dirname, 'raw');

const MANUAL_ENTRIES_FILE = path.resolve(DATA_DIR, 'manual_entries.json');
const AI_CACHE_FILE = path.resolve(OUT_DIR, 'ai_generated.json');
const OLD_FORMS_FILE = path.resolve(DATA_DIR, 'old_forms.json');
const RADICAL_VARIANTS_FILE = path.resolve(DATA_DIR, 'radical_variants.json');
const INTERMEDIATE_FILE = path.resolve(OUT_DIR, 'kanji-info.json');
const KANJIVG_DIR = path.resolve(RAW_DIR, 'kanjivg/kanji');

const KANJI_TS_FILE = path.resolve(__dirname, '../../src/data/kanji.ts');

function loadN5KanjiSet() {
  if (fs.existsSync(KANJI_TS_FILE)) {
    const content = fs.readFileSync(KANJI_TS_FILE, 'utf-8');
    const matches = content.matchAll(/character:\s*['"]([^'"]+)['"]/g);
    const set = new Set();
    for (const m of matches) {
      set.add(m[1]);
    }
    return set;
  }
  return new Set();
}

function normalizeJlpt(rawJlpt, kanji, n5Set) {
  if (kanji && n5Set && n5Set.has(kanji)) return 5;
  if (!rawJlpt) return null;
  if (rawJlpt === 4) return 5;
  if (rawJlpt === 3) return 4;
  if (rawJlpt === 2) return 3;
  if (rawJlpt === 1) return 1;
  return rawJlpt;
}

export const GEMINI_APPROVED_KANJI = new Set([
  '梅', '紙', '荷', '警', '跳', '象', '迎', '通', '鉛', '答', '冷', '究', '花', '起', '靴'
]);

function getEnv(key) {
  if (process.env[key]) return process.env[key];
  if (fs.existsSync(ENV_FILE)) {
    const content = fs.readFileSync(ENV_FILE, 'utf-8');
    for (const line of content.split('\n')) {
      const m = line.match(new RegExp(`^[ \\t]*${key}[ \\t]*=[ \\t]*(.*)$`));
      if (m) {
        return m[1].replace(/['"]/g, '').trim();
      }
    }
  }
  return '';
}

function loadRadicalVariants() {
  if (fs.existsSync(RADICAL_VARIANTS_FILE)) {
    return JSON.parse(fs.readFileSync(RADICAL_VARIANTS_FILE, 'utf-8'));
  }
  return {};
}

function loadOldForms() {
  if (fs.existsSync(OLD_FORMS_FILE)) {
    const data = JSON.parse(fs.readFileSync(OLD_FORMS_FILE, 'utf-8'));
    const pairs = data.pairs || data;
    const clean = {};
    for (const [k, v] of Object.entries(pairs)) {
      if (k.normalize('NFC') !== v.normalize('NFC')) {
        clean[k] = v;
      }
    }
    return clean;
  }
  return {};
}

function getKanjiVGDirectComponents(char) {
  try {
    const hex = char.codePointAt(0).toString(16).padStart(5, '0');
    const svgPath = path.resolve(KANJIVG_DIR, `${hex}.svg`);
    if (fs.existsSync(svgPath)) {
      const svgText = fs.readFileSync(svgPath, 'utf-8');
      const tree = parseKanjivgSvg(svgText);
      return getDirectComponents(tree);
    }
  } catch {}
  return [];
}

export async function buildAndSeedKanjiinfo() {
  console.log('🔄 Membaca KANJIDIC2 & berkas data pendukung...');
  const dict = parseKanjidic();
  const oldForms = loadOldForms();
  const radicalVariants = loadRadicalVariants();
  const n5KanjiSet = loadN5KanjiSet();

  // 1. Manual entries
  let manualEntries = [];
  if (fs.existsSync(MANUAL_ENTRIES_FILE)) {
    const raw = JSON.parse(fs.readFileSync(MANUAL_ENTRIES_FILE, 'utf-8'));
    manualEntries = raw.entries || (Array.isArray(raw) ? raw : []);
  }
  const manualMap = new Map(manualEntries.map(e => [e.kanji, e]));

  // Build Indonesian component meaning dictionary
  const compMeaningDict = new Map();
  for (const m of manualEntries) {
    for (const c of m.components || []) {
      if (c.part && c.meaning_id && !compMeaningDict.has(c.part)) {
        compMeaningDict.set(c.part, c.meaning_id);
      }
    }
  }

  // 15 Gemini approved entries from intermediate
  const intermediateMap = new Map();
  if (fs.existsSync(INTERMEDIATE_FILE)) {
    const inter = JSON.parse(fs.readFileSync(INTERMEDIATE_FILE, 'utf-8'));
    for (const item of inter) {
      intermediateMap.set(item.kanji, item);
    }
  }

  // 2. AI Generated cache
  let aiCache = {};
  if (fs.existsSync(AI_CACHE_FILE)) {
    aiCache = JSON.parse(fs.readFileSync(AI_CACHE_FILE, 'utf-8'));
  }

  // Siapkan data per tier
  const basicRows = [];
  const aiRows = [];
  const manualRows = [];

  for (const [k, d] of dict.entries()) {
    const oldForm = oldForms[k] || null;
    const meaningEn = (d.meaning && d.meaning.length > 0) ? d.meaning.join(', ') : null;

    // A. Tingkat MANUAL (tier_rank: 3)
    if (manualMap.has(k)) {
      const m = manualMap.get(k);
      manualRows.push({
        kanji: k,
        tier: 'manual',
        tier_rank: 3,
        meaning_en: meaningEn,
        on_yomi: d.on || [],
        kun_yomi: d.kun || [],
        strokes: d.stroke_count ?? null,
        jlpt: normalizeJlpt(d.jlpt, k, n5KanjiSet),
        old_form: m.old_form || oldForm,
        components: (m.components || []).map(c => ({
          part: c.part,
          meaning_id: c.meaning_id || compMeaningDict.get(c.part) || '',
          role: c.role || undefined
        })),
        mnemonic_id: m.mnemonic_id || null,
        etymology_id: m.etymology_id || null,
        etymology_confidence: m.etymology_confidence || 'established',
        source: 'manual',
        updated_at: new Date().toISOString()
      });
      continue;
    }

    if (GEMINI_APPROVED_KANJI.has(k) && intermediateMap.has(k)) {
      const im = intermediateMap.get(k);
      manualRows.push({
        kanji: k,
        tier: 'manual',
        tier_rank: 3,
        meaning_en: meaningEn,
        on_yomi: d.on || [],
        kun_yomi: d.kun || [],
        strokes: d.stroke_count ?? null,
        jlpt: normalizeJlpt(d.jlpt, k, n5KanjiSet),
        old_form: im.old_form || oldForm,
        components: (im.components || []).map(c => ({
          part: c.part,
          meaning_id: c.meaning_id || compMeaningDict.get(c.part) || '',
          role: c.role || undefined
        })),
        mnemonic_id: im.mnemonic_id || null,
        etymology_id: im.etymology_id || null,
        etymology_confidence: im.etymology_confidence || 'established',
        source: 'manual',
        updated_at: new Date().toISOString()
      });
      continue;
    }

    // B. Tingkat AI (tier_rank: 2)
    const aiEntry = aiCache[k];
    if (aiEntry && aiEntry.mnemonic_id) {
      aiRows.push({
        kanji: k,
        tier: 'ai',
        tier_rank: 2,
        meaning_en: meaningEn,
        on_yomi: d.on || [],
        kun_yomi: d.kun || [],
        strokes: d.stroke_count ?? null,
        jlpt: normalizeJlpt(d.jlpt, k, n5KanjiSet),
        old_form: oldForm,
        components: (aiEntry.components || []).map(c => ({
          part: c.part,
          meaning_id: c.meaning_id || compMeaningDict.get(c.part) || ''
        })),
        mnemonic_id: aiEntry.mnemonic_id,
        etymology_id: null,
        etymology_confidence: null,
        source: 'gemini-3.5-flash-lite',
        updated_at: new Date().toISOString()
      });
      continue;
    }

    // C. Tingkat BASIC (tier_rank: 1) untuk SEMUA kanji KANJIDIC2 lainnya
    const directParts = getKanjiVGDirectComponents(k);
    const basicComponents = [];
    for (const part of directParts) {
      let mId = compMeaningDict.get(part);
      if (!mId) {
        const base = radicalVariants[part] || part;
        mId = compMeaningDict.get(base);
        if (!mId) {
          const dictEntry = dict.get(base) || dict.get(part);
          if (dictEntry && dictEntry.meaning && dictEntry.meaning.length > 0) {
            mId = dictEntry.meaning[0];
          } else {
            mId = 'komponen';
          }
        }
      }
      basicComponents.push({
        part,
        meaning_id: mId
      });
    }

    basicRows.push({
      kanji: k,
      tier: 'basic',
      tier_rank: 1,
      meaning_en: meaningEn,
      on_yomi: d.on || [],
      kun_yomi: d.kun || [],
      strokes: d.stroke_count ?? null,
      jlpt: normalizeJlpt(d.jlpt, k, n5KanjiSet),
      old_form: oldForm,
      components: basicComponents,
      mnemonic_id: null,
      etymology_id: null,
      etymology_confidence: null,
      source: 'kanjidic2',
      updated_at: new Date().toISOString()
    });
  }

  console.log(`\n📊 Ringkasan Baris yang Disiapkan:`);
  console.log(`  - Tier Basic  (tier_rank: 1): ${basicRows.length}`);
  console.log(`  - Tier AI     (tier_rank: 2): ${aiRows.length}`);
  console.log(`  - Tier Manual (tier_rank: 3): ${manualRows.length}`);
  console.log(`  - Total Baris: ${basicRows.length + aiRows.length + manualRows.length}`);

  // Urutkan pengiriman dari rank terendah (basic -> ai -> manual)
  // sehingga prioritas tingkat terjamin dan entri manual tidak tertimpa
  const allRows = [...basicRows, ...aiRows, ...manualRows];

  const url = getEnv('VITE_SUPABASE_URL');
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');

  if (!url || !serviceKey) {
    throw new Error('Supabase URL atau Service Role Key tidak ditemukan di .env!');
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  console.log(`\n🚀 Memulai seeding ke Supabase (tabel public.kanjiinfo)...`);
  const BATCH_SIZE = 250;
  let inserted = 0;

  for (let i = 0; i < allRows.length; i += BATCH_SIZE) {
    const chunk = allRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('kanjiinfo')
      .upsert(chunk, { onConflict: 'kanji' });

    if (error) {
      throw new Error(`Gagal upsert batch ${i + 1}-${i + chunk.length}: ${error.message}`);
    }

    inserted += chunk.length;
    if (inserted % 1000 === 0 || inserted === allRows.length) {
      console.log(`  Progress: ${inserted} / ${allRows.length} kanji tersimpan (${Math.round((inserted / allRows.length) * 100)}%)...`);
    }
  }

  console.log('\n✅ Seeding selesai! Menghitung jumlah baris aktual per tingkat di database...');
  for (const t of ['manual', 'ai', 'basic']) {
    const { count } = await supabase
      .from('kanjiinfo')
      .select('*', { count: 'exact', head: true })
      .eq('tier', t);
    console.log(`  - ${t.toUpperCase()}: ${count} baris`);
  }
  const { count: total } = await supabase
    .from('kanjiinfo')
    .select('*', { count: 'exact', head: true });
  console.log(`  - TOTAL KESELURUHAN: ${total} baris`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildAndSeedKanjiinfo().catch(err => {
    console.error('❌ Error seeding kanjiinfo:', err);
    process.exit(1);
  });
}
