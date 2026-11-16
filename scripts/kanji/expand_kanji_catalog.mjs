// scripts/kanji/expand_kanji_catalog.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { 
  parseKanjidic, 
  parseKradfile, 
  parseKanjivgSvg, 
  extractFlatParts, 
  extractPhoneticPart, 
  loadOldForms 
} from './facts.mjs';
import { getDirectComponents } from './validate.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KANJIVG_DIR = path.resolve(__dirname, 'raw/kanjivg/kanji');
const KANJI_INFO_PATH = path.resolve(__dirname, 'out/kanjiInfo.json');
const INTERMEDIATE_FILE = path.resolve(__dirname, 'out/kanji-info.json');
const MANUAL_ENTRIES_FILE = path.resolve(__dirname, 'data/manual_entries.json');
const AI_CACHE_FILE = path.resolve(__dirname, 'out/ai_generated.json');
const RADICAL_VARIANTS_FILE = path.resolve(__dirname, 'data/radical_variants.json');

const TARGET_OUTPUT_TS = path.resolve(__dirname, '../../src/data/kanjiCatalogData.ts');

export const GEMINI_APPROVED_KANJI = new Set([
  '梅', '紙', '荷', '警', '跳', '象', '迎', '通', '鉛', '答', '冷', '究', '花', '起', '靴'
]);

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.vue') || file.endsWith('.json')) {
      results.push(file);
    }
  });
  return results;
}

// 1. Load wordsData from words.ts
const wordsContent = fs.readFileSync(path.resolve(__dirname, '../../src/data/words.ts'), 'utf-8');
const jsCodeWords = wordsContent
  .replace('export interface JapaneseWord', '/*')
  .replace('export const wordsData: JapaneseWord[] =', '*/ const wordsData =') + '; return wordsData;';
const wordsData = new Function(jsCodeWords)();

// 2. Load N5 and N4 datasets
const n5Content = fs.readFileSync(path.resolve(__dirname, '../../src/data/kanji.ts'), 'utf-8');
const jsCodeN5 = n5Content
  .replace('export interface JapaneseKanji', '/*')
  .replace('export const kanjiGroups =', '*/ const kanjiGroups =')
  .replace('export const kanjiN5Data: JapaneseKanji[] =', 'const kanjiN5Data =') + '; return kanjiN5Data;';
const kanjiN5Data = new Function(jsCodeN5)();

const n4Content = fs.readFileSync(path.resolve(__dirname, '../../src/data/kanjiN4.ts'), 'utf-8');
const jsCodeN4 = n4Content
  .replace('import type { JapaneseKanji } from "./kanji";', '')
  .replace('export interface JapaneseKanjiN4 extends JapaneseKanji', '/*')
  .replace('export const kanjiN4Groups =', '*/ const kanjiN4Groups =')
  .replace('export const kanjiN4Data: JapaneseKanjiN4[] =', 'const kanjiN4Data =') + '; return kanjiN4Data;';
const kanjiN4Data = new Function(jsCodeN4)();

// Known Indonesian meaning mapping for common kanji
const KANJI_ID_MEANINGS = {
  '私': ['saya', 'pribadi'],
  '誰': ['siapa'],
  '鳥': ['burung'],
  '力': ['tenaga', 'kekuatan'],
  '飯': ['makanan', 'nasi'],
  '村': ['desa'],
  '良': ['baik', 'bagus'],
  '鍵': ['kunci'],
  '鞄': ['tas'],
  '席': ['tempat duduk', 'kursi'],
  '指': ['jari', 'menunjuk'],
  '移': ['pindah', 'bergeser'],
  '数': ['angka', 'jumlah', 'menghitung'],
  '量': ['kuantitas', 'takaran'],
  '匹': ['ekor (satuan hewan kecil)'],
  '個': ['buah (satuan benda kecil)'],
  '軒': ['buah (satuan rumah/bangunan)'],
  '冊': ['jilid', 'eksemplar (satuan buku)'],
  '過': ['lewat', 'berlebih'],
  '比': ['banding', 'membandingkan'],
  '較': ['membandingkan'],
  '州': ['negara bagian', 'provinsi'],
  '望': ['berharap', 'memandang jauh'],
  '依': ['bergantung', 'berdasarkan'],
  '頼': ['memohon', 'meminta tolong', 'percaya'],
  '許': ['mengizinkan', 'memaafkan'],
  '可': ['boleh', 'dapat'],
  '阪': ['lereng', 'tanjakan (Osaka)'],
  '順': ['urutan', 'patuh'],
  '序': ['awalan', 'urutan'],
  '接': ['menyentuh', 'menghubungkan'],
  '続': ['berlanjut', 'menyambung'],
  '券': ['tiket', 'karcis', 'kupon'],
  '義': ['kebenaran', 'arti', 'keadilan'],
  '沖': ['lepas pantai', 'laut lepas (Okinawa)'],
  '縄': ['tali (Okinawa)'],
  '首': ['leher', 'kepala'],
  '条': ['pasal', 'butir', 'garis'],
  '件': ['perkara', 'masalah', 'kasus'],
  '譲': ['mengalah', 'menyerahkan'],
  '昨': ['kemarin', 'lampau'],
  '造': ['membuat', 'menciptakan'],
  '貴': ['berharga', 'mulia', 'terhormat'],
  '素': ['unsur', 'polos', 'dasar'],
  '敵': ['musuh', 'tandingan'],
  '以': ['dengan', 'mulai dari', 'karena'],
  '区': ['distrik', 'wilayah', 'daerah'],
  '光': ['cahaya', 'sinar'],
  '工': ['kerajinan', 'teknik', 'konstruksi'],
  '死': ['mati', 'kematian'],
  '質': ['kualitas', 'sifat', 'pertanyaan'],
  '色': ['warna'],
  '森': ['hutan lebat'],
  '林': ['hutan kecil', 'semak'],
  '進': ['maju', 'berkembang'],
  '声': ['suara'],
  '代': ['generasi', 'menggantikan', 'biaya'],
  '同': ['sama', 'serupa'],
  '発': ['berangkat', 'menerbitkan', 'terjadi'],
  '民': ['rakyat', 'masyarakat'],
  '洋': ['samudra', 'gaya barat'],
  '録': ['merekam', 'mencatat'],
  '佐': ['membantu', 'menolong'],
  '藤': ['bunga wisteria (Sato)'],
  '解': ['mengurai', 'memahami', 'solusi'],
  '訓': ['petunjuk', 'ajaran', 'kunyomi'],
  '型': ['tipe', 'model', 'pola'],
  '助': ['membantu', 'menolong'],
  '詞': ['kata', 'lirik', 'puisi'],
  '第': ['ke- (urutan nomor)'],
  '仮': ['sementara', 'palsu', 'kana'],
  '対': ['menghadap', 'lawan', 'pasang'],
  '戦': ['perang', 'pertandingan'],
  '他': ['lain', 'yang lain'],
  '形': ['bentuk', 'rupa'],
  '太': ['gemuk', 'tebal', 'besar'],
  '夕': ['sore', 'senja'],
  '刀': ['pedang', 'pisau'],
  '玉': ['permata', 'bola'],
  '戸': ['pintu'],
  '由': ['alasan', 'sebab'],
  '的': ['sasaran', 'target', '-istis'],
  '勧': ['menganjurkan', 'menyarankan'],
  '誘': ['mengajak', 'mengundang'],
  '授': ['memberi', 'mengajar'],
  '存': ['ada', 'mengetahui'],
  '在': ['berada', 'tinggal'],
  '位': ['kedudukan', 'posisi', 'peringkat'],
  '期': ['periode', 'jangka waktu'],
  '椅': ['kursi']
};

const EXTRA_KNOWN_KOTOBA = {
  '私': [
    { jp: '私', kana: 'わたし', meaning: 'saya', lesson: 'Bab 1' },
    { jp: '私たち', kana: 'わたしたち', meaning: 'kami, kita', lesson: 'Bab 22' }
  ],
  '誰': [
    { jp: '誰', kana: 'だれ', meaning: 'siapa', lesson: 'Bab 1' },
    { jp: '誰か', kana: 'だれか', meaning: 'seseorang', lesson: 'Bab 13' }
  ],
  '鳥': [
    { jp: '小鳥', kana: 'ことり', meaning: 'burung kecil', lesson: 'Bab 20' },
    { jp: '白鳥', kana: 'はくちょう', meaning: 'angsa', lesson: 'N5' },
    { jp: '鳥肉', kana: 'とりにく', meaning: 'daging ayam', lesson: 'Bab 12' }
  ],
  '力': [
    { jp: '能力', kana: 'のうりょく', meaning: 'kemampuan, kapabilitas', lesson: 'Bab 9' },
    { jp: '力', kana: 'ちから', meaning: 'tenaga, kekuatan', lesson: 'N4' }
  ],
  '飯': [
    { jp: 'ご飯', kana: 'ごはん', meaning: 'nasi, makanan', lesson: 'Bab 6' },
    { jp: '朝ご飯', kana: 'あさごはん', meaning: 'sarapan, makan pagi', lesson: 'Bab 6' },
    { jp: '昼ご飯', kana: 'ひるごはん', meaning: 'makan siang', lesson: 'Bab 6' },
    { jp: '晩ご飯', kana: 'ばんごはん', meaning: 'makan malam', lesson: 'Bab 6' }
  ],
  '色': [
    { jp: '色', kana: 'いろ', meaning: 'warna', lesson: 'Bab 16' },
    { jp: '色々', kana: 'いろいろ', meaning: 'bermacam-macam', lesson: 'Bab 11' }
  ],
  '声': [
    { jp: '声', kana: 'こえ', meaning: 'suara', lesson: 'Bab 20' }
  ],
  '森': [
    { jp: '森', kana: 'もり', meaning: 'hutan lebat', lesson: 'N5' }
  ],
  '林': [
    { jp: '林', kana: 'はやし', meaning: 'hutan kecil', lesson: 'N5' }
  ],
  '工': [
    { jp: '工場', kana: 'こうじょう', meaning: 'pabrik', lesson: 'Bab 10' }
  ],
  '光': [
    { jp: '観光', kana: 'かんこう', meaning: 'pariwisata', lesson: 'Bab 24' },
    { jp: '光', kana: 'ひかり', meaning: 'cahaya, sinar', lesson: 'N4' }
  ],
  '昨': [
    { jp: '昨日', kana: 'きのう', meaning: 'kemarin', lesson: 'Bab 4' }
  ],
  '鍵': [
    { jp: '鍵', kana: 'かぎ', meaning: 'kunci', lesson: 'Bab 2' }
  ],
  '鞄': [
    { jp: '鞄', kana: 'かばん', meaning: 'tas', lesson: 'Bab 2' }
  ],
  '席': [
    { jp: '出席', kana: 'しゅっせき', meaning: 'kehadiran', lesson: 'Bab 20' }
  ],
  '匹': [
    { jp: '一匹', kana: 'いっぴき', meaning: '1 ekor', lesson: 'Bab 11' }
  ],
  '個': [
    { jp: '一個', kana: 'いっこ', meaning: '1 buah', lesson: 'Bab 11' }
  ],
  '軒': [
    { jp: '一軒', kana: 'いっけん', meaning: '1 rumah/bangunan', lesson: 'Bab 11' }
  ],
  '冊': [
    { jp: '一冊', kana: 'いっさつ', meaning: '1 jilid buku', lesson: 'Bab 11' }
  ]
};

export function getRelatedKotoba(kanji, existingWords = []) {
  const results = [];
  const seenJp = new Set();

  // 1. wordsData
  for (const w of wordsData) {
    if (w.character && w.character.includes(kanji)) {
      if (!seenJp.has(w.character)) {
        seenJp.add(w.character);
        results.push({
          jp: w.character,
          kana: w.kana || '',
          meaning: w.meaning || '',
          lesson: w.lesson ? (w.lesson.startsWith('Pelajaran') ? w.lesson.replace('Pelajaran', 'Bab') : w.lesson) : undefined
        });
      }
    }
  }

  // 2. Extra known kotoba
  if (EXTRA_KNOWN_KOTOBA[kanji]) {
    for (const item of EXTRA_KNOWN_KOTOBA[kanji]) {
      if (!seenJp.has(item.jp)) {
        seenJp.add(item.jp);
        results.push(item);
      }
    }
  }

  // 3. Existing words
  if (Array.isArray(existingWords)) {
    for (const ew of existingWords) {
      if (ew && ew.jp && !seenJp.has(ew.jp)) {
        seenJp.add(ew.jp);
        results.push(ew);
      }
    }
  }

  // 4. kanjiN5Data examples
  const n5 = kanjiN5Data.find(k => k.character === kanji);
  if (n5?.examples) {
    for (const ex of n5.examples) {
      const match = ex.match(/^([^\s(]+)(?:\s*\(([^)]+)\))?/);
      if (match) {
        const jp = match[1];
        const meaning = match[2] || '';
        if (!seenJp.has(jp)) {
          seenJp.add(jp);
          results.push({ jp, kana: '', meaning, lesson: n5.lesson || 'N5' });
        }
      }
    }
  }

  // 5. kanjiN4Data examples
  const n4 = kanjiN4Data.find(k => k.character === kanji);
  if (n4?.examples) {
    for (const ex of n4.examples) {
      const match = ex.match(/^([^\s(]+)(?:\s*\(([^)]+)\))?/);
      if (match) {
        const jp = match[1];
        const meaning = match[2] || '';
        if (!seenJp.has(jp)) {
          seenJp.add(jp);
          results.push({ jp, kana: '', meaning, lesson: 'N4' });
        }
      }
    }
  }

  return results.sort((a, b) => {
    const babA = parseInt((a.lesson || '').replace(/\D/g, ''), 10) || 999;
    const babB = parseInt((b.lesson || '').replace(/\D/g, ''), 10) || 999;
    if (babA !== babB) return babA - babB;
    return a.jp.length - b.jp.length;
  });
}

export function buildExpandedCatalog() {
  console.log('🔄 Memulai penyusunan katalog kanji lengkap...');

  const dict = parseKanjidic();
  const kradMap = parseKradfile();
  const oldForms = loadOldForms();

  const radicalVariants = fs.existsSync(RADICAL_VARIANTS_FILE)
    ? JSON.parse(fs.readFileSync(RADICAL_VARIANTS_FILE, 'utf-8'))
    : {};

  // Existing kanjiInfo.json
  const existingKanjiInfo = fs.existsSync(KANJI_INFO_PATH)
    ? JSON.parse(fs.readFileSync(KANJI_INFO_PATH, 'utf-8'))
    : {};

  // Manual entries
  let manualEntries = [];
  if (fs.existsSync(MANUAL_ENTRIES_FILE)) {
    const raw = JSON.parse(fs.readFileSync(MANUAL_ENTRIES_FILE, 'utf-8'));
    manualEntries = raw.entries || (Array.isArray(raw) ? raw : []);
  }
  const manualMap = new Map(manualEntries.map(e => [e.kanji, e]));

  // Component dictionary
  const compMeaningDict = new Map();
  for (const m of manualEntries) {
    for (const c of m.components || []) {
      if (c.part && c.meaning_id && !compMeaningDict.has(c.part)) {
        compMeaningDict.set(c.part, c.meaning_id);
      }
    }
  }

  // Intermediate approved entries
  const intermediateMap = new Map();
  if (fs.existsSync(INTERMEDIATE_FILE)) {
    const inter = JSON.parse(fs.readFileSync(INTERMEDIATE_FILE, 'utf-8'));
    for (const item of inter) {
      intermediateMap.set(item.kanji, item);
    }
  }

  // AI cache
  let aiCache = {};
  if (fs.existsSync(AI_CACHE_FILE)) {
    aiCache = JSON.parse(fs.readFileSync(AI_CACHE_FILE, 'utf-8'));
  }

  // Collect target kanji from all files in src
  const allFiles = walk(path.resolve(__dirname, '../../src'));
  let allText = '';
  for (const f of allFiles) {
    allText += fs.readFileSync(f, 'utf-8');
  }
  const targetKanjiSet = new Set(allText.match(/[\u4e00-\u9fff]/g) || []);

  for (const [k, d] of dict.entries()) {
    if (d.jlpt === 4 || d.jlpt === 3) {
      targetKanjiSet.add(k);
    }
  }

  // Also include all existing in kanjiInfo.json
  for (const k of Object.keys(existingKanjiInfo)) {
    targetKanjiSet.add(k);
  }

  console.log(`🎯 Total target kanji: ${targetKanjiSet.size}`);

  const finalCatalog = {};
  let manualCount = 0;
  let aiCount = 0;
  let basicCount = 0;

  for (const k of targetKanjiSet) {
    const d = dict.get(k);
    const existing = existingKanjiInfo[k];
    const oldForm = (existing && existing.old_form) || oldForms[k] || null;

    // Normalisasi JLPT (1-4 di KANJIDIC2: 4=N5, 3=N4, 2=N3/N2, 1=N1)
    let jlpt = (existing && existing.jlpt) || (d ? (d.jlpt === 4 ? 5 : (d.jlpt === 3 ? 4 : d.jlpt)) : null);
    if (kanjiN5Data.some(n => n.character === k)) jlpt = 5;
    else if (kanjiN4Data.some(n => n.character === k)) jlpt = 4;

    const onReadings = (existing && existing.on?.length) ? existing.on : (d?.on || []);
    const kunReadings = (existing && existing.kun?.length) ? existing.kun : (d?.kun || []);
    const strokes = (existing && existing.stroke_count) || (d ? d.stroke_count : null);
    const grade = (existing && existing.grade) || (d ? d.grade : null);

    // Arti: prioritaskan Indonesian meaning
    let meanings = KANJI_ID_MEANINGS[k] || (existing?.meaning?.length ? existing.meaning : (d?.meaning || []));
    const n5Match = kanjiN5Data.find(n => n.character === k);
    if (n5Match && n5Match.meaning) {
      meanings = [n5Match.meaning, ...(meanings || []).filter(m => m !== n5Match.meaning)];
    }
    const n4Match = kanjiN4Data.find(n => n.character === k);
    if (n4Match && n4Match.meaning) {
      meanings = [n4Match.meaning, ...(meanings || []).filter(m => m !== n4Match.meaning)];
    }

    // Related words
    const relatedWords = getRelatedKotoba(k, existing?.words || []);

    // 1. MANUAL TIER
    if (manualMap.has(k)) {
      const m = manualMap.get(k);
      finalCatalog[k] = {
        kanji: k,
        tier: 'manual',
        meaning: meanings,
        on: onReadings,
        kun: kunReadings,
        stroke_count: strokes,
        jlpt,
        grade,
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
        words: relatedWords
      };
      manualCount++;
      continue;
    }

    if (GEMINI_APPROVED_KANJI.has(k) && intermediateMap.has(k)) {
      const im = intermediateMap.get(k);
      finalCatalog[k] = {
        kanji: k,
        tier: 'manual',
        meaning: meanings,
        on: onReadings,
        kun: kunReadings,
        stroke_count: strokes,
        jlpt,
        grade,
        formation_type: im.formation_type || 'unknown',
        components: im.components || [],
        etymology_id: im.etymology_id || '',
        etymology_confidence: im.etymology_confidence || 'established',
        mnemonic_id: im.mnemonic_id || '',
        note_id: im.note_id || '',
        phonetic_part: im.phonetic_part || null,
        reading_hint: im.reading_hint || null,
        claim_kind: im.claim_kind || 'structure',
        old_form: im.old_form || oldForm,
        words: relatedWords
      };
      manualCount++;
      continue;
    }

    // 2. AI TIER
    const aiEntry = aiCache[k] || (existing?.tier === 'ai' ? existing : null);
    if (aiEntry && aiEntry.mnemonic_id) {
      finalCatalog[k] = {
        kanji: k,
        tier: 'ai',
        meaning: meanings,
        on: onReadings,
        kun: kunReadings,
        stroke_count: strokes,
        jlpt,
        grade,
        components: (aiEntry.components || []).map(c => ({
          part: c.part,
          meaning_id: c.meaning_id || compMeaningDict.get(c.part) || ''
        })),
        mnemonic_id: aiEntry.mnemonic_id,
        old_form: oldForm,
        words: relatedWords
      };
      aiCount++;
      continue;
    }

    // 3. BASIC TIER (dengan komponen dan mnemonik terstruktur)
    let parts = [];
    try {
      const hex = k.codePointAt(0).toString(16).padStart(5, '0');
      const svgPath = path.resolve(KANJIVG_DIR, `${hex}.svg`);
      if (fs.existsSync(svgPath)) {
        const svgContent = fs.readFileSync(svgPath, 'utf-8');
        const tree = parseKanjivgSvg(svgContent);
        parts = getDirectComponents(tree);
      }
    } catch {}

    if (parts.length === 0) {
      parts = kradMap.get(k) || [k];
    }

    const components = parts.map(part => {
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
      return { part, meaning_id: mId };
    });

    // Mnemonic generik jika belum ada
    let mnemonic = existing?.mnemonic_id || '';
    if (!mnemonic) {
      const compStr = components.map(c => `${c.part} (${c.meaning_id})`).join(' + ');
      const mStr = meanings[0] || 'karakter';
      mnemonic = `Ingat kombinasi ${compStr} yang membentuk arti "${mStr}".`;
    }

    finalCatalog[k] = {
      kanji: k,
      tier: 'basic',
      meaning: meanings,
      on: onReadings,
      kun: kunReadings,
      stroke_count: strokes,
      jlpt,
      grade,
      components,
      mnemonic_id: mnemonic,
      old_form: oldForm,
      words: relatedWords
    };
    basicCount++;
  }

  console.log(`\n📊 Ringkasan Katalog Diperluas:`);
  console.log(`  - Total Kanji:  ${Object.keys(finalCatalog).length}`);
  console.log(`  - Tier Manual:  ${manualCount}`);
  console.log(`  - Tier AI:      ${aiCount}`);
  console.log(`  - Tier Basic:   ${basicCount}`);

  // Tulis ke scripts/kanji/out/kanjiInfo.json
  fs.writeFileSync(KANJI_INFO_PATH, JSON.stringify(finalCatalog, null, 2), 'utf-8');
  console.log(`💾 Disimpan ke: ${KANJI_INFO_PATH}`);

  // Tulis ke src/data/kanjiCatalogData.ts untuk pre-bundled offline cache
  const tsContent = `// src/data/kanjiCatalogData.ts
// Katalog Kanji Lengkap (700+ Kanji N5, N4, Minna no Nihongo & Kotoba)
// Auto-generated for instant offline lookup in Bedah Kanji

import type { KanjiDetail } from '../services/kanjiInfoService';

export const KANJI_CATALOG_DATA: Record<string, KanjiDetail> = ${JSON.stringify(finalCatalog, null, 2)};
`;

  fs.writeFileSync(TARGET_OUTPUT_TS, tsContent, 'utf-8');
  console.log(`💾 Disimpan ke: ${TARGET_OUTPUT_TS}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildExpandedCatalog();
}
