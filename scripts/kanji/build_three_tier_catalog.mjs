// scripts/kanji/build_three_tier_catalog.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { parseKanjidic } from './facts.mjs';
import { getDirectComponents } from './validate.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const OUT_DIR = path.resolve(__dirname, 'out');
const FACTS_FILE = path.resolve(OUT_DIR, 'facts.json');
const AI_CACHE_FILE = path.resolve(OUT_DIR, 'ai_generated.json');
const MANUAL_ENTRIES_FILE = path.resolve(DATA_DIR, 'manual_entries.json');
const OLD_FORMS_FILE = path.resolve(DATA_DIR, 'old_forms.json');
const RADICAL_VARIANTS_FILE = path.resolve(DATA_DIR, 'radical_variants.json');
const KANJI_INFO_INTERMEDIATE = path.resolve(OUT_DIR, 'kanji-info.json');
const TARGET_FINAL_FILE = path.resolve(__dirname, '../../src/data/kanjiInfo.json');

export const GEMINI_APPROVED_KANJI = new Set([
  '梅', '紙', '荷', '警', '跳', '象', '迎', '通', '鉛', '答', '冷', '究', '花', '起', '靴'
]);

export function loadRadicalVariants() {
  if (fs.existsSync(RADICAL_VARIANTS_FILE)) {
    return JSON.parse(fs.readFileSync(RADICAL_VARIANTS_FILE, 'utf-8'));
  }
  return {};
}

export function loadOldForms() {
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

export function buildCatalog() {
  if (!fs.existsSync(FACTS_FILE)) {
    throw new Error(`Facts file not found at ${FACTS_FILE}`);
  }
  const facts = JSON.parse(fs.readFileSync(FACTS_FILE, 'utf-8'));
  const factsMap = new Map(facts.map(f => [f.kanji, f]));

  const radicalVariants = loadRadicalVariants();
  const oldForms = loadOldForms();

  // 1. Manual entries
  let manualEntries = [];
  if (fs.existsSync(MANUAL_ENTRIES_FILE)) {
    const raw = JSON.parse(fs.readFileSync(MANUAL_ENTRIES_FILE, 'utf-8'));
    manualEntries = raw.entries || (Array.isArray(raw) ? raw : []);
  }
  const manualMap = new Map(manualEntries.map(e => [e.kanji, e]));

  // Build Indonesian component meaning dictionary from manual entries
  const compMeaningDict = new Map();
  for (const m of manualEntries) {
    for (const c of m.components || []) {
      if (c.part && c.meaning_id && !compMeaningDict.has(c.part)) {
        compMeaningDict.set(c.part, c.meaning_id);
      }
    }
  }

  // 2. 15 Gemini approved entries from intermediate kanji-info.json
  const intermediateMap = new Map();
  if (fs.existsSync(KANJI_INFO_INTERMEDIATE)) {
    const inter = JSON.parse(fs.readFileSync(KANJI_INFO_INTERMEDIATE, 'utf-8'));
    for (const item of inter) {
      intermediateMap.set(item.kanji, item);
    }
  }

  // 3. AI Generated cache
  let aiCache = {};
  if (fs.existsSync(AI_CACHE_FILE)) {
    aiCache = JSON.parse(fs.readFileSync(AI_CACHE_FILE, 'utf-8'));
  }

  // Helper KANJIDIC2
  let kdict = null;
  const getDict = () => {
    if (!kdict) kdict = parseKanjidic();
    return kdict;
  };

  const finalMap = {};
  const stats = {
    manual: 0,
    ai: 0,
    basic: 0,
    total: 0
  };

  const basicKanjiChars = [];
  const aiKanjiList = [];

  for (const fact of facts) {
    const k = fact.kanji;
    const oldForm = fact.old_form || oldForms[k] || null;

    // A. Tingkat MANUAL: ada di manual_entries.json atau 15 Gemini approved
    if (manualMap.has(k)) {
      const m = manualMap.get(k);
      finalMap[k] = {
        kanji: k,
        tier: 'manual',
        meaning: fact.meaning || [],
        on: fact.on || [],
        kun: fact.kun || [],
        stroke_count: fact.stroke_count ?? null,
        jlpt: fact.jlpt ?? null,
        grade: fact.grade ?? null,
        formation_type: m.formation_type || 'unknown',
        components: m.components || [],
        etymology_id: m.etymology_id || '',
        etymology_confidence: m.etymology_confidence || 'established',
        mnemonic_id: m.mnemonic_id || '',
        note_id: m.note_id || '',
        phonetic_part: m.phonetic_part || null,
        reading_hint: m.reading_hint || null,
        claim_kind: m.claim_kind || 'structure',
        old_form: m.old_form || oldForm,
        words: fact.words || []
      };
      stats.manual++;
      continue;
    }

    if (GEMINI_APPROVED_KANJI.has(k) && intermediateMap.has(k)) {
      const im = intermediateMap.get(k);
      finalMap[k] = {
        kanji: k,
        tier: 'manual',
        meaning: fact.meaning || [],
        on: fact.on || [],
        kun: fact.kun || [],
        stroke_count: fact.stroke_count ?? null,
        jlpt: fact.jlpt ?? null,
        grade: fact.grade ?? null,
        formation_type: im.formation_type || 'unknown',
        components: im.components || [],
        etymology_id: im.etymology_id || '',
        etymology_confidence: im.etymology_confidence || 'established',
        mnemonic_id: im.mnemonic_id || '',
        note_id: im.note_id || '',
        phonetic_part: im.phonetic_part || im.facts?.phonetic_part || null,
        reading_hint: im.reading_hint || null,
        claim_kind: im.claim_kind || 'structure',
        old_form: im.old_form || oldForm,
        words: fact.words || []
      };
      stats.manual++;
      continue;
    }

    // B. Tingkat AI: kanji lain yang berhasil dibuat Gemini
    const aiEntry = aiCache[k];
    if (aiEntry && aiEntry.mnemonic_id && aiEntry.tier !== 'basic') {
      finalMap[k] = {
        kanji: k,
        tier: 'ai',
        meaning: fact.meaning || [],
        on: fact.on || [],
        kun: fact.kun || [],
        stroke_count: fact.stroke_count ?? null,
        jlpt: fact.jlpt ?? null,
        grade: fact.grade ?? null,
        components: (aiEntry.components || []).map(c => ({
          part: c.part,
          meaning_id: c.meaning_id || ''
        })),
        mnemonic_id: aiEntry.mnemonic_id,
        old_form: oldForm,
        words: fact.words || []
      };
      stats.ai++;
      aiKanjiList.push(finalMap[k]);
      continue;
    }

    // C. Tingkat BASIC (cadangan faktual tanpa AI)
    const directParts = getDirectComponents(fact.tree);
    const basicComponents = [];
    const dict = getDict();

    for (const part of directParts) {
      let mId = compMeaningDict.get(part);
      if (!mId) {
        // Cek varian radikal
        const base = radicalVariants[part] || part;
        mId = compMeaningDict.get(base);
        if (!mId) {
          const dictEntry = dict.get(base) || dict.get(part);
          if (dictEntry && dictEntry.meaning && dictEntry.meaning.length > 0) {
            mId = dictEntry.meaning[0];
          } else {
            mId = 'bentuk';
          }
        }
      }
      basicComponents.push({
        part,
        meaning_id: mId
      });
    }

    finalMap[k] = {
      kanji: k,
      tier: 'basic',
      meaning: fact.meaning || [],
      on: fact.on || [],
      kun: fact.kun || [],
      stroke_count: fact.stroke_count ?? null,
      jlpt: fact.jlpt ?? null,
      grade: fact.grade ?? null,
      components: basicComponents,
      old_form: oldForm,
      words: fact.words || []
    };
    stats.basic++;
    basicKanjiChars.push(k);
  }

  stats.total = Object.keys(finalMap).length;

  // Tulis ke src/data/kanjiInfo.json
  const finalJson = JSON.stringify(finalMap, null, 2);
  fs.writeFileSync(TARGET_FINAL_FILE, finalJson, 'utf-8');

  // Hitung ukuran raw & gzip
  const rawBytes = Buffer.byteLength(finalJson, 'utf-8');
  const gzipBytes = zlib.gzipSync(Buffer.from(finalJson)).length;

  console.log('\n=== KATALOG KANJI TIGA TINGKAT BERHASIL DISUSUN ===');
  console.log(`Berkas target: ${TARGET_FINAL_FILE}`);
  console.log(`Jumlah total kanji: ${stats.total}`);
  console.log(`  - Tier Manual: ${stats.manual}`);
  console.log(`  - Tier AI:     ${stats.ai}`);
  console.log(`  - Tier Basic:  ${stats.basic}`);
  console.log(`Ukuran berkas raw:  ${(rawBytes / 1024).toFixed(2)} KB (${rawBytes} bytes)`);
  console.log(`Ukuran berkas gzip: ${(gzipBytes / 1024).toFixed(2)} KB (${gzipBytes} bytes)`);

  return {
    stats,
    basicKanjiChars,
    aiKanjiList,
    rawBytes,
    gzipBytes
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildCatalog();
}

