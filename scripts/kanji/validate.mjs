// scripts/kanji/validate.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateAll } from './generate.mjs';
import { parseKanjidic } from './facts.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.resolve(__dirname, 'out');
const RAW_DIR = path.resolve(OUT_DIR, 'raw');
const FACTS_FILE = path.resolve(OUT_DIR, 'facts.json');
const KANJI_INFO_FILE = path.resolve(OUT_DIR, 'kanji-info.json');
const REVIEW_SAMPLE_FILE = path.resolve(OUT_DIR, 'review-sample.md');

const DATA_DIR = path.resolve(__dirname, 'data');
const PICTOGRAPHS_FILE = path.resolve(DATA_DIR, 'pictographs.json');
const ESTABLISHED_FILE = path.resolve(DATA_DIR, 'established.json');
const MANUAL_ENTRIES_FILE = path.resolve(DATA_DIR, 'manual_entries.json');
const OLD_FORMS_FILE = path.resolve(DATA_DIR, 'old_forms.json');

export function countWords(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

export function loadPictographs() {
  if (fs.existsSync(PICTOGRAPHS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(PICTOGRAPHS_FILE, 'utf-8'));
      if (Array.isArray(data)) return new Set(data);
      if (data?.kanji) {
        const set = new Set();
        for (const list of Object.values(data.kanji)) {
          if (Array.isArray(list)) {
            for (const k of list) set.add(k);
          }
        }
        return set;
      }
    } catch (e) {
      console.warn(`Gagal membaca ${PICTOGRAPHS_FILE}:`, e.message);
    }
  }
  return new Set(['象', '日', '月', '木', '山', '川', '人', '口', '目', '手']);
}

export function loadEstablished() {
  if (fs.existsSync(ESTABLISHED_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(ESTABLISHED_FILE, 'utf-8'));
      if (Array.isArray(data)) return new Set(data);
      if (Array.isArray(data?.kanji)) return new Set(data.kanji);
    } catch (e) {
      console.warn(`Gagal membaca ${ESTABLISHED_FILE}:`, e.message);
    }
  }
  return new Set();
}

export function loadManualEntries() {
  if (fs.existsSync(MANUAL_ENTRIES_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(MANUAL_ENTRIES_FILE, 'utf-8'));
      const entries = data.entries || (Array.isArray(data) ? data : []);
      const map = new Map();
      for (const e of entries) {
        if (e.kanji) map.set(e.kanji, e);
      }
      return map;
    } catch (e) {
      console.warn(`Gagal membaca ${MANUAL_ENTRIES_FILE}:`, e.message);
    }
  }
  return new Map();
}

export function loadOldForms() {
  if (fs.existsSync(OLD_FORMS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(OLD_FORMS_FILE, 'utf-8'));
      const pairs = data.pairs || {};
      const ambiguous = new Set(Object.keys(data.meta?.ambiguous || {}));
      const map = new Map();
      for (const [k, v] of Object.entries(pairs)) {
        if (!ambiguous.has(k)) {
          map.set(k, v);
        }
      }
      return map;
    } catch (e) {
      console.warn(`Gagal membaca ${OLD_FORMS_FILE}:`, e.message);
    }
  }
  return new Map();
}

let kanjidicCache = null;
export function getKanjidic() {
  if (!kanjidicCache) {
    kanjidicCache = parseKanjidic();
  }
  return kanjidicCache;
}

// -------------------------------------------------------------
// On-yomi Phonetic Rhyme Matching
// -------------------------------------------------------------
const KANA_ROMAJI = {
  'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
  'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
  'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
  'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
  'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
  'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
  'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
  'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
  'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
  'ワ': 'wa', 'ヲ': 'o', 'ン': 'n',
  'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
  'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
  'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
  'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
  'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
  'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
  'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
  'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
  'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
  'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
  'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
  'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
  'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
  'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo',
  'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
  'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo'
};

export function kanaToRomaji(kana) {
  if (!kana) return '';
  let res = '';
  let i = 0;
  // Convert hiragana to katakana first
  const k = kana.replace(/[\u3041-\u3096]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60)).replace(/[\.\-].*$/, '');
  while (i < k.length) {
    if (i + 1 < k.length) {
      const two = k.slice(i, i + 2);
      if (KANA_ROMAJI[two]) {
        res += KANA_ROMAJI[two];
        i += 2;
        continue;
      }
    }
    const one = k[i];
    if (one === 'ー') {
      const last = res[res.length - 1];
      if (last) res += last;
    } else if (KANA_ROMAJI[one]) {
      res += KANA_ROMAJI[one];
    }
    i++;
  }
  return res;
}

export function parseSyllable(romaji) {
  const match = romaji.match(/^([bcdfghjklmnprstwyz]*)(.*)$/i);
  let cons = match ? match[1].toLowerCase() : '';
  let rime = match ? match[2].toLowerCase() : romaji.toLowerCase();

  // Voicing and articulation classes:
  // k/g -> k
  // s/z/j/sh -> s
  // t/d/ch/ts -> t
  // h/b/p/f/m -> p (bilabials / labials)
  let consClass = cons;
  if (/^[kg]/i.test(cons)) consClass = 'k';
  else if (/^(s|z|j|sh)/i.test(cons)) consClass = 's';
  else if (/^(t|d|ch|ts)/i.test(cons)) consClass = 't';
  else if (/^[hbpfmtw]/i.test(cons)) consClass = 'p';

  // Normalize long vowels: ou ≈ o, uu ≈ u, ei ≈ e, aa ≈ a, ii ≈ i
  let normRime = rime
    .replace(/ou$/, 'o')
    .replace(/uu$/, 'u')
    .replace(/ei$/, 'e')
    .replace(/aa$/, 'a')
    .replace(/ii$/, 'i');

  return { cons, consClass, rime, normRime };
}

export function isReadingMatch(partOnList, kanjiOnList) {
  if (!partOnList?.length || !kanjiOnList?.length) {
    return { match: false, reason: 'Daftar on-yomi kosong' };
  }
  for (const pKana of partOnList) {
    const pRomaji = kanaToRomaji(pKana);
    const pSyl = parseSyllable(pRomaji);
    for (const kKana of kanjiOnList) {
      const kRomaji = kanaToRomaji(kKana);
      const kSyl = parseSyllable(kRomaji);

      const rimeMatch = (pSyl.normRime === kSyl.normRime) || (pSyl.rime === kSyl.rime);
      const consMatch = (pSyl.consClass === kSyl.consClass);

      if (rimeMatch && consMatch) {
        return {
          match: true,
          pair: `${pKana} → ${kKana}`,
          detail: `${pKana} (${pRomaji}) ≈ ${kKana} (${kRomaji})`
        };
      }
    }
  }
  return { match: false, reason: 'Rima atau konsonan tidak berkerabat' };
}

export function computeReadingHint(part, kanji, kanjidicMap, matchResult = null) {
  if (!part || !kanjidicMap.has(part)) return null;
  const partEntry = kanjidicMap.get(part);
  const kanjiEntry = kanjidicMap.get(kanji);
  if (!partEntry?.on?.length || !kanjiEntry?.on?.length) return null;

  if (matchResult?.match && matchResult.pair) {
    const [pMatch, kMatch] = matchResult.pair.split(' → ');
    return `${part} (${pMatch}) → ${kanji} (${kMatch})`;
  }

  const pOn = partEntry.on[0];
  const kOn = kanjiEntry.on[0];
  return `${part} (${pOn}) → ${kanji} (${kOn})`;
}

// -------------------------------------------------------------
// Confidence Determination
// -------------------------------------------------------------
export function determineConfidence(entry, fact, { pictographsSet = new Set(), establishedSet = new Set(), manualEntriesMap = new Map() } = {}) {
  const kanji = entry.kanji;
  const isManual = manualEntriesMap.has(kanji);
  const isPictograph = pictographsSet.has(kanji);
  const isEstablished = establishedSet.has(kanji);

  if (isManual) {
    return manualEntriesMap.get(kanji).etymology_confidence || 'established';
  }

  // 'established' HANYA bila kanji ada di established.json, pictographs.json, atau manual_entries.json
  if (isPictograph || isEstablished) {
    return 'established';
  }

  if (entry.claim_kind === 'unknown' || entry.formation_type === 'unknown') {
    return 'uncertain';
  }

  return 'traditional';
}

// -------------------------------------------------------------
// Mnemonic Quality Verification
// -------------------------------------------------------------
export function checkMnemonicQuality(mnemonic, fact, entry) {
  const reasons = [];
  if (!mnemonic || !mnemonic.trim().startsWith('Cara mengingat:')) {
    reasons.push("mnemonic_id harus diawali dengan 'Cara mengingat:'");
    return reasons;
  }

  const wordCount = countWords(mnemonic);
  if (wordCount > 40) {
    reasons.push(`Panjang mnemonic_id melebihi 40 kata (${wordCount} kata)`);
  }

  // Tolak bila mnemonik menyatakan sesuatu "berasal dari..." atau "artinya awalnya..."
  if (/(berasal dari|artinya awalnya|makna asalnya)/i.test(mnemonic)) {
    reasons.push("Mnemonik dilarang memuat spekulasi asal-usul ('berasal dari...' atau 'artinya awalnya...')");
  }

  const body = mnemonic.replace(/^Cara mengingat:\s*/i, '').trim();

  // 1. Cek keberadaan petunjuk bunyi
  const soundClueRegex = /(bunyi|suara|bacaan|lafal|diucapkan|mirip|pengucapan)/i;
  const arrowRegex = /[→\->]/;
  const romajiInParens = /\([a-zōūāīē\s]+\)/i;

  let hasSoundClue = soundClueRegex.test(body) || arrowRegex.test(body) || romajiInParens.test(body);

  const allReadings = [...(fact?.on || []), ...(fact?.kun || [])].map(r => r.replace(/[.\-].*$/, '').trim()).filter(Boolean);
  if (!hasSoundClue) {
    for (const r of allReadings) {
      if (r.length >= 2 && body.includes(r)) {
        hasSoundClue = true;
        break;
      }
    }
  }

  // 2. Cek keberadaan citra konkret atau penyebutan komponen
  const commonImagery = [
    'orang', 'anak', 'wanita', 'perempuan', 'ibu', 'bapak', 'pria',
    'pohon', 'kayu', 'hutan', 'daun', 'bunga', 'buah', 'akar', 'tanaman', 'rumput',
    'air', 'sungai', 'hujan', 'laut', 'danau', 'es', 'tetes', 'salju',
    'api', 'panas', 'cahaya', 'matahari', 'bulan', 'bintang',
    'tanah', 'bumi', 'ladang', 'sawah', 'gunung', 'batu', 'pasir',
    'mata', 'tangan', 'kaki', 'mulut', 'telinga', 'hidung', 'kepala', 'hati', 'badan', 'tubuh',
    'atap', 'rumah', 'pintu', 'gerbang', 'jendela', 'pagar', 'dinding', 'gedung', 'bangunan',
    'pedang', 'pisau', 'senjata', 'panah', 'tombak', 'tongkat',
    'mobil', 'kereta', 'kendaraan', 'roda', 'perahu', 'kapal',
    'benang', 'kain', 'tali', 'baju', 'pakaian', 'topi',
    'emas', 'besi', 'logam', 'uang', 'koin',
    'hewan', 'gajah', 'kuda', 'burung', 'ikan', 'sapi', 'anjing', 'kucing', 'serangga',
    'cangkang', 'tulang', 'sayap', 'bulu',
    'buku', 'kertas', 'pena', 'tulisan', 'kotak', 'lingkaran', 'garis', 'gambar', 'mangkuk', 'meja'
  ];

  let hasImagery = false;
  for (const comp of entry.components || []) {
    if (comp.part && body.includes(comp.part)) {
      hasImagery = true;
      break;
    }
    if (comp.meaning_id) {
      const words = comp.meaning_id.toLowerCase().split(/[\s,()/]+/).filter(w => w.length > 2);
      for (const w of words) {
        if (body.toLowerCase().includes(w)) {
          hasImagery = true;
          break;
        }
      }
    }
    if (hasImagery) break;
  }

  if (!hasImagery) {
    const lowerBody = body.toLowerCase();
    for (const img of commonImagery) {
      if (lowerBody.includes(img)) {
        hasImagery = true;
        break;
      }
    }
  }

  // 3. Deteksi pengulangan arti (Tolak jika >= 70% kata mnemoniknya adalah kata dari arti kanji)
  const meaningWords = new Set();
  for (const m of fact?.meaning || []) {
    for (const word of m.toLowerCase().split(/[\s,();/]+/)) {
      if (word.length >= 3) meaningWords.add(word);
    }
  }
  for (const w of fact?.words || []) {
    if (w.meaning) {
      for (const word of w.meaning.toLowerCase().split(/[\s,();/]+/)) {
        if (word.length >= 3) meaningWords.add(word);
      }
    }
  }

  const mnemonicWords = body.toLowerCase().split(/[\s,().;:"'!?/-]+/).filter(w => w.length >= 3);
  if (mnemonicWords.length > 0 && meaningWords.size > 0) {
    let repeatedCount = 0;
    for (const w of mnemonicWords) {
      if (meaningWords.has(w)) repeatedCount++;
    }
    const ratio = repeatedCount / mnemonicWords.length;
    if (ratio >= 0.70) {
      reasons.push(`Mnemonik ditolak karena ${Math.round(ratio * 100)}% (>= 70%) katanya mengulang arti kanji`);
    }
  }

  if (!hasSoundClue && !hasImagery) {
    reasons.push('Mnemonik harus memuat citra konkret atau petunjuk bunyi');
  }

  return reasons;
}

// -------------------------------------------------------------
// Entry Validator
// -------------------------------------------------------------
export function validateEntry(entry, factsMap, options = {}) {
  // Dukung pemanggilan dengan options object maupun legacy 3rd param (pictographsSet)
  let pictographsSet, establishedSet, manualEntriesMap, kanjidicMap, oldFormsMap;
  if (options instanceof Set) {
    pictographsSet = options;
    establishedSet = loadEstablished();
    manualEntriesMap = loadManualEntries();
    kanjidicMap = getKanjidic();
    oldFormsMap = loadOldForms();
  } else {
    pictographsSet = options.pictographsSet || loadPictographs();
    establishedSet = options.establishedSet || loadEstablished();
    manualEntriesMap = options.manualEntriesMap || loadManualEntries();
    kanjidicMap = options.kanjidicMap || getKanjidic();
    oldFormsMap = options.oldFormsMap || loadOldForms();
  }

  const kanji = entry.kanji;
  const isManual = manualEntriesMap.has(kanji) || entry.source === 'manual';

  // -----------------------------------------------------------
  // A. Entri Manual: Menang langsung & lewati filter Gemini
  // -----------------------------------------------------------
  if (isManual) {
    const manualData = manualEntriesMap.get(kanji) || entry;
    const mReasons = [];
    if (!entry.mnemonic_id || !entry.mnemonic_id.trim().startsWith('Cara mengingat:')) {
      mReasons.push("mnemonic_id harus diawali dengan 'Cara mengingat:'");
    }
    const mWordCount = countWords(entry.mnemonic_id);
    if (mWordCount > 40) {
      mReasons.push(`Panjang mnemonic_id melebihi 40 kata (${mWordCount} kata)`);
    }
    const eWordCount = countWords(entry.etymology_id);
    if (eWordCount > 50) {
      mReasons.push(`Panjang etymology_id melebihi 50 kata (${eWordCount} kata)`);
    }
    if (!Array.isArray(entry.components)) {
      mReasons.push("'components' harus berupa array");
    }

    const conf = entry.etymology_confidence || manualData.etymology_confidence || 'established';
    const readingHint = entry.reading_hint || manualData.reading_hint || null;

    if (mReasons.length > 0) {
      return {
        valid: false,
        status: 'rejected',
        reasons: mReasons,
        confidence: conf,
        source: 'manual',
        reading_hint: readingHint,
        reading_match: true
      };
    }

    return {
      valid: true,
      status: 'approved',
      reasons: [],
      confidence: conf,
      source: 'manual',
      reading_hint: readingHint,
      reading_match: true
    };
  }

  // -----------------------------------------------------------
  // B. Validasi Keluaran Gemini
  // -----------------------------------------------------------
  const reasons = [];
  let needsReview = false;

  // Default claim_kind jika belum ada (untuk kompatibilitas test)
  if (!entry.claim_kind) {
    entry.claim_kind = 'structure';
  }

  // 1. JSON valid & semua field wajib terisi
  const requiredFields = ['kanji', 'formation_type', 'claim_kind', 'components', 'etymology_id', 'mnemonic_id', 'note_id'];
  for (const field of requiredFields) {
    if (entry[field] === undefined || entry[field] === null) {
      reasons.push(`Field '${field}' wajib ada`);
    }
  }

  if (reasons.length > 0) {
    return {
      valid: false,
      status: 'rejected',
      reasons,
      confidence: 'uncertain',
      source: 'gemini',
      reading_hint: null,
      reading_match: null
    };
  }

  const fact = factsMap.get(kanji);

  // 2. Cek kesesuaian komponen terhadap pohon KanjiVG, KRADFILE, atau old_form
  const flatParts = new Set(fact?.flat_parts || []);
  const kradParts = new Set(fact?.components || []);
  const allowedParts = new Set([...flatParts, ...kradParts]);

  if (fact?.old_form) {
    allowedParts.add(fact.old_form);
  }
  if (fact?.phon_hints) {
    for (const h of fact.phon_hints) allowedParts.add(h);
  }

  let phoneticComponent = null;

  if (!Array.isArray(entry.components) || entry.components.length === 0) {
    reasons.push(`'components' harus berupa array dan tidak boleh kosong`);
  } else {
    for (const comp of entry.components) {
      if (!comp.part) {
        reasons.push(`Komponen tanpa 'part'`);
        continue;
      }
      if (!allowedParts.has(comp.part)) {
        reasons.push(`Komponen '${comp.part}' tidak ada dalam KRADFILE maupun flat_parts KanjiVG untuk kanji ${entry.kanji}`);
      }
      if (!comp.role || !['meaning', 'phonetic', 'shape'].includes(comp.role)) {
        reasons.push(`Role komponen '${comp.part}' tidak valid: ${comp.role}`);
      }

      // Elemen tanpa arti: Komponen yang TIDAK ada sebagai kanji di KANJIDIC2 hanya boleh 'shape' tanpa meaning_id
      const inKanjidic = kanjidicMap.has(comp.part);
      if (!inKanjidic) {
        if (comp.role !== 'shape') {
          reasons.push(`Komponen '${comp.part}' bukan kanji di KANJIDIC2, hanya boleh berperan 'shape'`);
        }
        if (comp.meaning_id && comp.meaning_id.trim() !== '') {
          reasons.push(`Komponen '${comp.part}' bukan kanji di KANJIDIC2, tidak boleh memiliki meaning_id`);
        }
      } else {
        if (comp.role !== 'shape' && (!comp.meaning_id || typeof comp.meaning_id !== 'string')) {
          reasons.push(`meaning_id komponen '${comp.part}' tidak valid`);
        }
      }

      if (comp.role === 'phonetic') {
        phoneticComponent = comp;
      }
    }
  }

  // 3. Pagar Karakter CJK (Whitelist ketat untuk teks penjelasan Gemini)
  const allowedCjkChars = new Set();
  allowedCjkChars.add(kanji);
  for (const p of fact?.flat_parts || []) {
    for (const ch of p) allowedCjkChars.add(ch);
  }
  for (const c of fact?.components || []) {
    for (const ch of c) allowedCjkChars.add(ch);
  }
  if (fact?.old_form) {
    for (const ch of fact.old_form) allowedCjkChars.add(ch);
  }
  for (const w of fact?.words || []) {
    if (w.jp) {
      for (const ch of w.jp) {
        if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(ch)) allowedCjkChars.add(ch);
      }
    }
  }

  const allGeminiTexts = [
    { field: 'etymology_id', text: entry.etymology_id || '' },
    { field: 'mnemonic_id', text: entry.mnemonic_id || '' },
    { field: 'note_id', text: entry.note_id || '' }
  ];

  for (const { field, text } of allGeminiTexts) {
    const cjkMatches = text.match(/[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}]/gu) || [];
    for (const ch of cjkMatches) {
      if (!allowedCjkChars.has(ch)) {
        reasons.push(`Karakter CJK '${ch}' pada field '${field}' tidak diizinkan (bukan kanji target, komponen pohon, KRADFILE, old_form, maupun kata konteks)`);
      }
    }
  }

  // 4. Larangan teks sejarah & pola terlarang
  const forbiddenPatterns = [
    { regex: /\b\d{3,4}\b/, name: 'angka tahun' },
    { regex: /\bdinasti\b/i, name: 'kata "dinasti"' },
    { regex: /tulang ramalan/i, name: 'kata "tulang ramalan"' },
    { regex: /pada zaman/i, name: 'frasa "pada zaman"' }
  ];

  for (const { field, text } of allGeminiTexts) {
    for (const { regex, name: patternName } of forbiddenPatterns) {
      if (regex.test(text)) {
        reasons.push(`Field '${field}' mengandung teks terlarang: ${patternName}`);
      }
    }
  }

  // 5. Batasan panjang teks etymology_id
  const etymologyWordCount = countWords(entry.etymology_id);
  if (etymologyWordCount > 50) {
    reasons.push(`Panjang etymology_id melebihi 50 kata (${etymologyWordCount} kata)`);
  }

  // 6. Larang klaim visual/gambar bila bukan di pictographs.json
  const hasPictographClaim = /(digambarkan sebagai|melambangkan|berasal dari gambar)/i.test(entry.etymology_id || '');
  if (hasPictographClaim && !pictographsSet.has(kanji)) {
    reasons.push(`Klaim visual ('digambarkan sebagai' / 'melambangkan' / 'berasal dari gambar') dilarang karena kanji ${kanji} bukan anggota pictographs.json`);
  }

  // 7. Validasi kualitas mnemonik
  const mnemonicReasons = checkMnemonicQuality(entry.mnemonic_id, fact, entry);
  for (const r of mnemonicReasons) reasons.push(r);

  // 8. Evaluasi phonetic role & perhitungan reading_hint & reading_match dari skrip
  let readingMatchResult = null;
  let scriptReadingHint = null;

  if (phoneticComponent) {
    const partChar = phoneticComponent.part;
    const partInKanjidic = kanjidicMap.has(partChar);

    if (!partInKanjidic) {
      needsReview = true;
      readingMatchResult = { match: false, reason: `Komponen phonetic '${partChar}' tidak ada di KANJIDIC2` };
      reasons.push(`Komponen '${partChar}' ditandai phonetic tetapi tidak terdaftar di KANJIDIC2`);
    } else {
      const partOn = kanjidicMap.get(partChar)?.on || [];
      const kanjiOn = fact?.on || kanjidicMap.get(kanji)?.on || [];
      readingMatchResult = isReadingMatch(partOn, kanjiOn);
      scriptReadingHint = computeReadingHint(partChar, kanji, kanjidicMap, readingMatchResult);

      if (!readingMatchResult.match) {
        needsReview = true;
        reasons.push(`Klaim phonetic pada '${partChar}' tidak cocok rima bacaan on-yomi (${partOn.join(', ') || '-'} vs ${kanjiOn.join(', ') || '-'})`);
      }
    }
  }

  // 9. Kanji ber-old_form: tanpa entri manual status 'needs_review'
  const hasOldForm = !!fact?.old_form || oldFormsMap.has(kanji);
  if (hasOldForm) {
    needsReview = true;
    reasons.push(`Kanji memiliki old_form ('${fact?.old_form || oldFormsMap.get(kanji)}') tetapi tidak ada di manual_entries.json, wajib peninjauan manual`);
  }

  // 10. Hitung label keyakinan
  const calculatedConfidence = determineConfidence(entry, fact, { pictographsSet, establishedSet, manualEntriesMap });

  if (calculatedConfidence === 'uncertain') {
    if (/berasal dari/i.test(entry.etymology_id || '')) {
      reasons.push("Entri berkeyakinan 'uncertain' dilarang memuat klaim 'berasal dari ...'");
    }
    if (/asal[- ]usul/i.test(entry.etymology_id || '')) {
      reasons.push("Entri berkeyakinan 'uncertain' dilarang memuat klaim 'asal-usul'");
    }
  }

  // Tolak bila ada pelanggaran fatal
  // Pisahkan pelanggaran keras (rejection) vs penanda review lunak (needs_review)
  const fatalReasons = reasons.filter(r => !r.includes('tidak cocok rima bacaan on-yomi') && !r.includes('wajib peninjauan manual'));

  if (fatalReasons.length > 0) {
    return {
      valid: false,
      status: 'rejected',
      reasons: fatalReasons,
      confidence: calculatedConfidence,
      source: 'gemini',
      reading_hint: scriptReadingHint,
      reading_match: readingMatchResult ? readingMatchResult.match : null
    };
  }

  let status = 'draft';
  if (needsReview || calculatedConfidence === 'uncertain' || entry.formation_type === 'unknown' || entry.claim_kind === 'unknown') {
    status = 'needs_review';
  }

  return {
    valid: true,
    status,
    reasons: reasons,
    confidence: calculatedConfidence,
    source: 'gemini',
    reading_hint: scriptReadingHint,
    reading_match: readingMatchResult ? readingMatchResult.match : null
  };
}

// -------------------------------------------------------------
// Validation Runner
// -------------------------------------------------------------
export async function runValidation({ specificKanji = null, autoRetry = true } = {}) {
  if (!fs.existsSync(FACTS_FILE)) {
    throw new Error('facts.json tidak ditemukan!');
  }
  const factsList = JSON.parse(fs.readFileSync(FACTS_FILE, 'utf-8'));
  const factsMap = new Map(factsList.map(f => [f.kanji, f]));
  const pictographsSet = loadPictographs();
  const establishedSet = loadEstablished();
  const manualEntriesMap = loadManualEntries();
  const kanjidicMap = getKanjidic();
  const oldFormsMap = loadOldForms();

  const validatorOpts = {
    pictographsSet,
    establishedSet,
    manualEntriesMap,
    kanjidicMap,
    oldFormsMap
  };

  if (!fs.existsSync(RAW_DIR)) {
    throw new Error('Folder out/raw tidak ditemukan!');
  }

  let rawFiles = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.json'));
  if (specificKanji && specificKanji.length > 0) {
    const filterSet = new Set(specificKanji);
    rawFiles = rawFiles.filter(f => filterSet.has(f.replace('.json', '')));
  }

  console.log(`🔍 Memvalidasi ${rawFiles.length} berkas mentah kanji...`);

  const validatedEntries = new Map();
  const rejectedKanji = [];

  for (const file of rawFiles) {
    try {
      const rawContent = fs.readFileSync(path.resolve(RAW_DIR, file), 'utf-8');
      const entry = JSON.parse(rawContent);
      const validation = validateEntry(entry, factsMap, validatorOpts);

      const fact = factsMap.get(entry.kanji);
      const fullEntry = {
        ...entry,
        source: validation.source || entry.source || 'gemini',
        etymology_confidence: validation.confidence,
        status: validation.status,
        reading_hint: validation.reading_hint || null,
        reading_match: validation.reading_match ?? null,
        reasons: validation.reasons,
        facts: {
          meaning: fact?.meaning || [],
          on: fact?.on || [],
          kun: fact?.kun || [],
          stroke_count: fact?.stroke_count ?? null,
          jlpt: fact?.jlpt ?? null,
          grade: fact?.grade ?? null,
          components: fact?.components || [],
          phon_hints: fact?.phon_hints || [],
          phonetic_part: fact?.phonetic_part || null,
          flat_parts: fact?.flat_parts || [],
          old_form: fact?.old_form || null,
          words: fact?.words || []
        }
      };

      validatedEntries.set(entry.kanji, fullEntry);
      if (validation.status === 'rejected') {
        rejectedKanji.push({ kanji: entry.kanji, reasons: validation.reasons });
      }
    } catch (err) {
      console.error(`Gagal memproses file ${file}:`, err.message);
    }
  }

  // Regenerasi kanji yang rejected (maksimal 2 kali per aturan FASE C)
  if (autoRetry && rejectedKanji.length > 0) {
    console.log(`\n⚠️ Terdeteksi ${rejectedKanji.length} kanji dengan status 'rejected'. Mencoba regenerasi maksimal 2 kali...`);
    const kanjiToRetry = rejectedKanji.map(r => r.kanji);

    for (let attempt = 1; attempt <= 2; attempt++) {
      console.log(`\n🔄 [Attempt ${attempt}/2] Regenerasi ${kanjiToRetry.length} kanji rejected...`);
      await generateAll({ specificKanji: kanjiToRetry, overwrite: true });

      const stillRejected = [];
      for (const k of kanjiToRetry) {
        const rawFile = path.resolve(RAW_DIR, `${k}.json`);
        if (fs.existsSync(rawFile)) {
          const entry = JSON.parse(fs.readFileSync(rawFile, 'utf-8'));
          const validation = validateEntry(entry, factsMap, validatorOpts);
          const fact = factsMap.get(entry.kanji);
          const fullEntry = {
            ...entry,
            source: validation.source || entry.source || 'gemini',
            etymology_confidence: validation.confidence,
            status: validation.status,
            reading_hint: validation.reading_hint || null,
            reading_match: validation.reading_match ?? null,
            reasons: validation.reasons,
            facts: {
              meaning: fact?.meaning || [],
              on: fact?.on || [],
              kun: fact?.kun || [],
              stroke_count: fact?.stroke_count ?? null,
              jlpt: fact?.jlpt ?? null,
              grade: fact?.grade ?? null,
              components: fact?.components || [],
              phon_hints: fact?.phon_hints || [],
              phonetic_part: fact?.phonetic_part || null,
              flat_parts: fact?.flat_parts || [],
              old_form: fact?.old_form || null,
              words: fact?.words || []
            }
          };
          validatedEntries.set(k, fullEntry);
          if (validation.status === 'rejected') {
            stillRejected.push({ kanji: k, reasons: validation.reasons });
          }
        }
      }

      if (stillRejected.length === 0) {
        console.log(`✅ Semua kanji rejected berhasil lolos validasi setelah percobaan ke-${attempt}!`);
        break;
      }
      kanjiToRetry.length = 0;
      for (const item of stillRejected) kanjiToRetry.push(item.kanji);
    }
  }

  // Hitung statistik final
  const allEntries = Array.from(validatedEntries.values());
  const approvedList = allEntries.filter(e => e.status === 'approved');
  const needsReviewList = allEntries.filter(e => e.status === 'needs_review');
  const draftList = allEntries.filter(e => e.status === 'draft');
  const finalRejectedList = allEntries.filter(e => e.status === 'rejected');

  // Baca kanji-info.json yang ada jika specificKanji digunakan agar tidak menimpa kanji lain
  let mergedKanjiInfo = allEntries;
  if (specificKanji && fs.existsSync(KANJI_INFO_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(KANJI_INFO_FILE, 'utf-8'));
      const map = new Map(existing.map(e => [e.kanji, e]));
      for (const e of allEntries) {
        map.set(e.kanji, e);
      }
      mergedKanjiInfo = Array.from(map.values());
    } catch (e) {
      mergedKanjiInfo = allEntries;
    }
  }

  // Simpan kanji-info.json
  fs.writeFileSync(KANJI_INFO_FILE, JSON.stringify(mergedKanjiInfo, null, 2), 'utf-8');

  // Hasilkan review-sample.md
  generateReviewSample(allEntries, specificKanji);

  return {
    total: allEntries.length,
    approved: approvedList.length,
    needs_review: needsReviewList.length,
    draft: draftList.length,
    rejected: finalRejectedList.length,
    rejectedDetails: finalRejectedList
  };
}

// -------------------------------------------------------------
// Review Sample Table Generator
// -------------------------------------------------------------
export function generateReviewSample(entries, specificKanji = null) {
  let sampleEntries = entries;
  if (!specificKanji || specificKanji.length === 0) {
    const eligible = entries.filter(e => e.status !== 'rejected');
    const shuffled = [...eligible].sort((a, b) => {
      return ((a.kanji.charCodeAt(0) * 9301 + 49297) % 233280) - ((b.kanji.charCodeAt(0) * 9301 + 49297) % 233280);
    });
    sampleEntries = shuffled.slice(0, 30);
  }

  // Header sesuai Poin 6 & Poin E:
  // status, sumber (manual/gemini), label keyakinan, reading_hint (dari skrip), reading_match, alasan penolakan
  let md = `# Sampel Peninjauan Kanji (${sampleEntries.length} Kanji)\n\n`;
  md += `Dokumen ini disusun untuk ditinjau secara manual sebelum persetujuan akhir (\`approve.mjs\`).\n\n`;

  // Ringkasan Status
  const statusCounts = { approved: 0, needs_review: 0, draft: 0, rejected: 0 };
  const sourceCounts = { manual: 0, gemini: 0 };
  for (const e of sampleEntries) {
    statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
    const src = e.source || 'gemini';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  }

  md += `### Ringkasan Jumlah Sampel:\n`;
  md += `- **Total Sampel**: ${sampleEntries.length}\n`;
  md += `- **Sumber**: Manual: ${sourceCounts.manual} | Gemini: ${sourceCounts.gemini}\n`;
  md += `- **Status**: Approved: ${statusCounts.approved} | Needs Review: ${statusCounts.needs_review} | Draft: ${statusCounts.draft} | Rejected: ${statusCounts.rejected}\n\n`;

  md += `| No | Kanji | Sumber | Status | Keyakinan | Reading Hint (Skrip) | Match | Komponen | Alasan Penolakan / Review | Asal-usul (Etymology) | Cara Mengingat (Mnemonic) |\n`;
  md += `|:---:|:---:|:---:|:---:|:---:|:---|:---:|:---|:---|:---|:---|\n`;

  for (let i = 0; i < sampleEntries.length; i++) {
    const e = sampleEntries[i];
    const source = e.source === 'manual' ? '**manual**' : 'gemini';
    const status = `\`${e.status}\``;
    const confidence = `\`${e.etymology_confidence || '-'}\``;
    const readingHint = e.reading_hint ? `\`${e.reading_hint}\`` : '-';
    const readingMatch = e.reading_match === true ? '✅' : (e.reading_match === false ? '❌' : '-');
    const comps = (e.components || []).map(c => `${c.part}(${c.role === 'phonetic' ? 'fonetik' : (c.role === 'meaning' ? 'makna' : 'bentuk')})`).join(' ');
    const reasons = (e.reasons && e.reasons.length > 0) ? e.reasons.join('; ') : '-';
    const cleanEtym = (e.etymology_id || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const cleanMnem = (e.mnemonic_id || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

    md += `| ${i + 1} | **${e.kanji}** | ${source} | ${status} | ${confidence} | ${readingHint} | ${readingMatch} | \`${comps}\` | ${reasons} | ${cleanEtym} | ${cleanMnem} |\n`;
  }

  md += `\n\n---\n### Laporan Khusus Komponen Fonetik (reading_match):\n`;
  md += `| Kanji | Sumber | Komponen Fonetik | On-yomi Komponen | On-yomi Kanji | Match | Catatan |\n`;
  md += `|:---:|:---:|:---:|:---|:---|:---:|:---|\n`;

  const kanjidicMap = getKanjidic();
  for (const e of sampleEntries) {
    const phonComps = (e.components || []).filter(c => c.role === 'phonetic');
    for (const pc of phonComps) {
      const partOn = kanjidicMap.get(pc.part)?.on?.join(', ') || '-';
      const kanjiOn = e.facts?.on?.join(', ') || kanjidicMap.get(e.kanji)?.on?.join(', ') || '-';
      const matchSym = e.reading_match === true ? '✅ true' : (e.reading_match === false ? '❌ false' : '-');
      let note = '';
      if (e.kanji === '顔') note = 'Bentuk historis 彦 memberi bunyi gen → gan (頁 adalah semantik kepala)';
      if (e.kanji === '強') note = 'Bentuk historis 弘/彊 (bukan 弓 kyū)';
      md += `| **${e.kanji}** | ${e.source} | **${pc.part}** | \`${partOn}\` | \`${kanjiOn}\` | ${matchSym} | ${note} |\n`;
    }
  }

  md += `\n---\n*Jangan menyetujui apa pun sebelum peninjauan selesai. Gunakan \`approve.mjs --only <daftar>\` hanya setelah ditinjau.*\n`;

  fs.writeFileSync(REVIEW_SAMPLE_FILE, md, 'utf-8');
  console.log(`📝 Sampel tinjauan ${sampleEntries.length} kanji disimpan ke: ${REVIEW_SAMPLE_FILE}`);
}

// -------------------------------------------------------------
// CLI Arguments & Entrypoint
// -------------------------------------------------------------
export function parseCliArgs() {
  const args = process.argv.slice(2);
  let specificKanji = null;
  let autoRetry = true;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--only' && args[i + 1]) {
      const raw = args[i + 1];
      const items = raw.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
      specificKanji = [];
      for (const item of items) {
        for (const char of item) {
          if (/[\u4e00-\u9fff]/.test(char)) {
            specificKanji.push(char);
          }
        }
      }
      i++;
    } else if (arg === '--no-retry') {
      autoRetry = false;
    }
  }

  return { specificKanji, autoRetry };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { specificKanji, autoRetry } = parseCliArgs();
  runValidation({ specificKanji, autoRetry }).then(stats => {
    console.log('\n📊 Ringkasan Hasil Validasi:');
    console.log(`Total entri: ${stats.total}`);
    console.log(`- Approved: ${stats.approved}`);
    console.log(`- Needs Review: ${stats.needs_review}`);
    console.log(`- Draft: ${stats.draft}`);
    console.log(`- Rejected: ${stats.rejected}`);
    if (stats.rejected > 0) {
      console.log('\nDaftar kanji rejected:');
      for (const r of stats.rejectedDetails.slice(0, 10)) {
        console.log(`- ${r.kanji}: ${r.reasons.join('; ')}`);
      }
    }
  }).catch(err => {
    console.error('❌ Gagal menjalankan validate.mjs:', err);
    process.exit(1);
  });
}
