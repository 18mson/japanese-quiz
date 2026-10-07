import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import kuromoji from 'kuromoji';
import { getAllowedTagsForLesson } from './grammar/tags.mjs';
import { detectTags } from './grammar/detect.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesPath = path.resolve(__dirname, 'templates.json');
const templatesData = JSON.parse(fs.readFileSync(templatesPath, 'utf-8'));
export const TEMPLATES = templatesData.templates;

const poolsPath = path.resolve(__dirname, 'data/pools.json');
const poolsData = JSON.parse(fs.readFileSync(poolsPath, 'utf-8'));
export const POOLS = poolsData.pools;

const vocabExtraPath = path.resolve(__dirname, 'data/vocab-extra.json');
const vocabReportPath = path.resolve(__dirname, 'data/vocab-extra.report.md');

/**
 * Inisialisasi Kuromoji tokenizer
 * @returns {Promise<any>}
 */
export function initTokenizer() {
  return new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath: 'node_modules/kuromoji/dict' }).build((err, tokenizer) => {
      if (err) reject(err);
      else resolve(tokenizer);
    });
  });
}

/**
 * Konversi katakana reading ke hiragana
 * @param {string} katakana
 * @returns {string}
 */
export function toHiragana(katakana) {
  if (!katakana) return '';
  return katakana.replace(/[\u30a1-\u30f6]/g, (match) => {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

/**
 * Strips honorific prefix お or ご
 * @param {string} s
 * @returns {string}
 */
export function stripHonorific(s) {
  if (!s) return '';
  if (s.length > 1 && (s.startsWith('お') || s.startsWith('ご') || s.startsWith('オ') || s.startsWith('ゴ'))) {
    return s.slice(1);
  }
  return s;
}

/**
 * Cek apakah string mengandung kanji
 * @param {string} s
 * @returns {boolean}
 */
export function hasKanji(s) {
  return /[一-龯]/.test(s);
}

// -------------------------------------------------------------
// 1. Vocabulary Gating Index & Vocab Extra Supplement
// -------------------------------------------------------------

/**
 * Membaca data words.ts langsung
 * @returns {any[]}
 */
export function loadRawWordsData() {
  const wordsPath = path.resolve(__dirname, '../src/data/words.ts');
  const wordsContent = fs.readFileSync(wordsPath, 'utf-8');
  const jsCode = wordsContent
    .replace('export interface JapaneseWord', '/*')
    .replace('export const wordsData: JapaneseWord[] =', '*/ const wordsData =') + '; return wordsData;';
  return new Function(jsCode)();
}

const vocabBookPath = path.resolve(__dirname, 'data/vocab-book.json');

/**
 * Membaca data vocab-book.json (sumber resmi Pelajaran 1-8 Minna no Nihongo)
 * @returns {any[]}
 */
export function loadVocabBookData() {
  if (fs.existsSync(vocabBookPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(vocabBookPath, 'utf-8'));
      return data.words || [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Membangun array entries kosakata dari vocab-book.json (Bab 1-8 primer) + words.ts (Bab 9-25) + suplemen
 * @param {any[]} rawWords
 * @param {any[]} [extraWords=[]]
 * @returns {any[]}
 */
export function buildVocabEntries(rawWords, extraWords = []) {
  const entries = [];
  const vocabBook = loadVocabBookData();
  const naAdjBab8 = new Set(['ハンサム', 'きれい', '静か', 'にぎやか', '有名', '親切', '元気', '暇', '便利', 'すてき']);

  // 1. Bab 1-8: vocab-book.json sebagai sumber UTAMA resmi
  for (const w of vocabBook) {
    if (!w.lesson) continue;
    const l = w.lesson;
    const cleanChar = w.jp.replace(/^[～~]/, '');
    const cleanKana = (w.kana || '').replace(/^[～~]/, '');

    entries.push({ char: cleanChar, kana: cleanKana, lesson: l, raw: w, fromBook: true });
    for (const a of (w.alt || [])) {
      const cleanAlt = a.replace(/^[～~]/, '');
      entries.push({ char: cleanAlt, kana: cleanKana, lesson: l, raw: w, fromBook: true, isAlt: true });
    }

    // Verb stems (e.g. 起きます -> 起き, kana: おき)
    if (cleanChar.endsWith('ます')) {
      const stem = cleanChar.slice(0, -2);
      const kanaStem = cleanKana.endsWith('ます') ? cleanKana.slice(0, -2) : cleanKana;
      entries.push({ char: stem, kana: kanaStem, lesson: l, raw: w, fromBook: true });
      for (const a of (w.alt || [])) {
        if (a.endsWith('ます')) {
          entries.push({ char: a.slice(0, -2), kana: kanaStem, lesson: l, raw: w, fromBook: true, isAlt: true });
        }
      }
    }

    // Na-adjectives modifier form (e.g. 静かな, きれいな)
    if (l === 8 && naAdjBab8.has(cleanChar)) {
      entries.push({ char: cleanChar + 'な', kana: cleanKana + 'な', lesson: l, raw: w, fromBook: true });
      for (const a of (w.alt || [])) {
        entries.push({ char: a + 'な', kana: cleanKana + 'な', lesson: l, raw: w, fromBook: true, isAlt: true });
      }
    }

    // I-adjectives past stem (e.g. おいしい -> おいしかっ)
    if (l === 8 && cleanChar.endsWith('い') && !naAdjBab8.has(cleanChar)) {
      entries.push({ char: cleanChar.slice(0, -1) + 'かっ', kana: cleanKana.slice(0, -1) + 'かっ', lesson: l, raw: w, fromBook: true });
      for (const a of (w.alt || [])) {
        if (a.endsWith('い')) {
          entries.push({ char: a.slice(0, -1) + 'かっ', kana: cleanKana.slice(0, -1) + 'かっ', lesson: l, raw: w, fromBook: true, isAlt: true });
        }
      }
    }
  }

  // 2. Bab 9-25: kata dari words.ts (hanya jika lesson > 8)
  for (const w of rawWords) {
    if (!w.lesson) continue;
    const l = parseInt(w.lesson.replace('Pelajaran ', ''), 10);
    if (l <= 8) continue; // vocab-book.json menang mutlak untuk Bab 1-8

    const cleanChar = w.character.replace(/^[～~]/, '');
    const cleanKana = (w.kana || '').replace(/^[～~]/, '');

    entries.push({ char: cleanChar, kana: cleanKana, lesson: l, raw: w });

    if (cleanChar.endsWith('ます')) {
      entries.push({
        char: cleanChar.slice(0, -2),
        kana: cleanKana.endsWith('ます') ? cleanKana.slice(0, -2) : cleanKana,
        lesson: l,
        raw: w
      });
    }

    if (cleanChar.endsWith('な') && w.category_word?.includes('Sifat-na')) {
      entries.push({
        char: cleanChar.slice(0, -1),
        kana: cleanKana.endsWith('な') ? cleanKana.slice(0, -1) : cleanKana,
        lesson: l,
        raw: w
      });
    }

    if (cleanChar.endsWith('い') && w.category_word?.includes('Sifat-i')) {
      entries.push({
        char: cleanChar.slice(0, -1) + 'かっ',
        kana: cleanKana.endsWith('い') ? cleanKana.slice(0, -1) + 'かっ' : cleanKana,
        lesson: l,
        raw: w
      });
    }
  }

  // 3. Proper names standard in Minna no Nihongo
  const textbookProper = [
    { char: 'ミラーさん', kana: 'ミラーさん', lesson: 1 },
    { char: 'サントスさん', kana: 'サントスさん', lesson: 1 },
    { char: 'ワットさん', kana: 'ワットさん', lesson: 1 },
    { char: 'カリナさん', kana: 'カリナさん', lesson: 1 },
    { char: '山田さん', kana: 'やまださん', lesson: 1 },
    { char: '佐藤さん', kana: 'さとうさん', lesson: 1 },
    { char: '木村さん', kana: 'きむらさん', lesson: 1 },
    { char: 'ミラー', kana: 'ミラー', lesson: 1 },
    { char: 'サントス', kana: 'サントス', lesson: 1 },
    { char: 'ワット', kana: 'ワット', lesson: 1 },
    { char: 'カリナ', kana: 'カリナ', lesson: 1 },
    { char: '山田', kana: 'やまだ', lesson: 1 },
    { char: '佐藤', kana: 'さとう', lesson: 1 },
    { char: '木村', kana: 'きむら', lesson: 1 },
    { char: '京都', kana: 'きょうと', lesson: 3 },
    { char: '富士山', kana: 'ふじさん', lesson: 8 }
  ];
  for (const tp of textbookProper) {
    entries.push(tp);
  }

  // 4. Nationalities: country + 人 / じん (Pelajaran 1)
  const countries = [
    { char: '日本', kana: 'にほん' },
    { char: '中国', kana: 'ちゅうごく' },
    { char: '韓国', kana: 'かんこく' },
    { char: 'アメリカ', kana: 'アメリカ' },
    { char: 'イギリス', kana: 'イギリス' },
    { char: 'インド', kana: 'インド' },
    { char: 'インドネシア', kana: 'インドネシア' },
    { char: 'タイ', kana: 'タイ' },
    { char: 'ドイツ', kana: 'ドイツ' },
    { char: 'ブラジル', kana: 'ブラジル' }
  ];
  for (const c of countries) {
    entries.push({ char: c.char + '人', kana: c.kana + 'じん', lesson: 1 });
  }

  // 5. Suplemen vocab-extra.json (hanya untuk Bab > 8)
  for (const ew of extraWords) {
    if (!ew.jp || ew.lesson <= 8) continue;
    const cleanChar = ew.jp.replace(/^[～~]/, '');
    const cleanKana = (ew.kana || '').replace(/^[～~]/, '');
    entries.push({ char: cleanChar, kana: cleanKana, lesson: ew.lesson, raw: ew });

    if (cleanChar.endsWith('ます')) {
      entries.push({
        char: cleanChar.slice(0, -2),
        kana: cleanKana.endsWith('ます') ? cleanKana.slice(0, -2) : cleanKana,
        lesson: ew.lesson,
        raw: ew
      });
    }
  }

  return entries;
}

/**
 * Mencocokkan kandidat kata dengan tabel kosakata secara aman homofon
 * @param {string} candText
 * @param {string} candKana
 * @param {number} maxLesson
 * @param {any[]} vocabEntries
 * @returns {{ ok: boolean, lesson?: number, reason?: string, missing?: string }}
 */
export function checkVocabMatch(candText, candKana, maxLesson, vocabEntries) {
  if (!candText) return { ok: true };

  const candHasK = hasKanji(candText);
  const candCharStr = stripHonorific(candText);
  const candKanaStr = candKana ? stripHonorific(candKana) : '';

  const matched = [];
  let kanjiMatchedDiffKana = false;

  for (const e of vocabEntries) {
    const eCharStr = stripHonorific(e.char);
    const eKanaStr = stripHonorific(e.kana);

    if (candHasK) {
      if (eCharStr === candCharStr) {
        if (!candKanaStr || eKanaStr === candKanaStr) {
          matched.push(e);
        } else {
          kanjiMatchedDiffKana = true;
        }
      }
    } else {
      // Pure kana candidate: cocok jika entry kana ATAU entry char sama
      if (eKanaStr === candCharStr || eCharStr === candCharStr) {
        matched.push(e);
      }
    }
  }

  if (matched.length > 0) {
    const minLesson = Math.min(...matched.map(m => m.lesson));
    if (minLesson <= maxLesson) {
      return { ok: true, lesson: minLesson };
    }
    return {
      ok: false,
      lesson: minLesson,
      reason: `kata '${candText}' bab ${minLesson} > bab template ${maxLesson}`
    };
  }

  if (kanjiMatchedDiffKana) {
    return {
      ok: false,
      reason: `konflik bacaan kanji '${candText}'`
    };
  }

  return {
    ok: false,
    missing: candText,
    reason: `kata '${candText}' tidak ada di tabel kosakata`
  };
}

/**
 * Mengklasifikasikan kata pool terhadap words.ts murni
 * @param {any} item
 * @param {number} poolLesson
 * @param {any[]} baseEntries
 * @returns {{ pass: boolean, reason?: string, lesson?: number }}
 */
export function classifyPoolWord(item, poolLesson, baseEntries) {
  const itemJp = item.jp;
  const itemKana = item.kana || item.jp;
  const itemHasK = hasKanji(itemJp);
  const candCharStr = stripHonorific(itemJp);
  const candKanaStr = stripHonorific(itemKana);

  if (itemHasK) {
    const kanjiMatches = baseEntries.filter(e => stripHonorific(e.char) === candCharStr);
    if (kanjiMatches.length > 0) {
      const kanaMatches = kanjiMatches.filter(e => stripHonorific(e.kana) === candKanaStr);
      if (kanaMatches.length === 0) {
        return { pass: false, reason: 'reading_conflict' };
      }
    }
  }

  const matched = [];
  for (const e of baseEntries) {
    const eCharStr = stripHonorific(e.char);
    const eKanaStr = stripHonorific(e.kana);

    if (itemHasK) {
      if (eCharStr === candCharStr && eKanaStr === candKanaStr) {
        matched.push(e);
      }
    } else {
      if (eKanaStr === candCharStr || eCharStr === candCharStr) {
        matched.push(e);
      }
    }
  }

  if (matched.length > 0) {
    const minLesson = Math.min(...matched.map(m => m.lesson));
    if (minLesson <= poolLesson) {
      return { pass: true, lesson: minLesson };
    }
    return { pass: false, reason: `later_lesson:${minLesson}`, lesson: minLesson };
  }

  return { pass: false, reason: 'missing' };
}

export const CURRICULUM_FIRST_TAUGHT = {
  'エンジニア': { lesson: 1, confidence: 'curriculum', id: 'insinyur', kana: 'エンジニア' },
  'チョコレート': { lesson: 2, confidence: 'book', id: 'cokelat', kana: 'チョコレート' },
  'たばこ': { lesson: 3, confidence: 'curriculum', id: 'rokok', kana: 'たばこ' },
  'おととい': { lesson: 4, confidence: 'curriculum', id: 'kemarin lusa', kana: 'おととい' },
  'きのう': { lesson: 4, confidence: 'book', id: 'kemarin', kana: 'きのう' },
  'けさ': { lesson: 4, confidence: 'curriculum', id: 'tadi pagi', kana: 'けさ' },
  'あした': { lesson: 4, confidence: 'curriculum', id: 'besok', kana: 'あした' },
  'あさって': { lesson: 4, confidence: 'curriculum', id: 'lusa', kana: 'あさって' },
  'シャツ': { lesson: 7, confidence: 'curriculum', id: 'kemeja', kana: 'シャツ' },
  'ワープロ': { lesson: 7, confidence: 'book', id: 'pengolah kata', kana: 'ワープロ' },
  '紙': { lesson: 7, confidence: 'curriculum', id: 'kertas', kana: 'かみ' },
  'ファクス': { lesson: 7, confidence: 'curriculum', id: 'faks', kana: 'ファクス' },
  '面白い': { lesson: 8, confidence: 'curriculum', id: 'menarik', kana: 'おもしろい' }
};

/**
 * Melakukan auto-add kata pool ke scripts/data/vocab-extra.json
 * @param {boolean} [isStrict=false]
 * @param {any} [tokenizer=null]
 * @returns {{ extraWords: any[], reportSummary: any }}
 */
export function autoAddPoolWords(isStrict = false, tokenizer = null) {
  let existingExtra = [];
  if (fs.existsSync(vocabExtraPath)) {
    try {
      existingExtra = JSON.parse(fs.readFileSync(vocabExtraPath, 'utf-8'));
    } catch {
      existingExtra = [];
    }
  }

  if (isStrict) {
    return {
      extraWords: existingExtra,
      reportSummary: { totalAdded: 0, byReason: {}, nonMissing: [] }
    };
  }

  const rawWords = loadRawWordsData();
  const baseEntries = buildVocabEntries(rawWords, []);
  const extraMap = new Map();
  for (const ew of existingExtra) {
    if (ew.lesson <= 8) continue; // Matikan dan hapus entri bab 1-8
    const meta = CURRICULUM_FIRST_TAUGHT[ew.jp];
    if (meta) {
      if (meta.lesson <= 8) continue;
      ew.lesson = meta.lesson;
      ew.lesson_confidence = meta.confidence;
      ew.id = meta.id;
      ew.kana = meta.kana;
    }
    extraMap.set(`${ew.jp}__${ew.kana}`, ew);
  }

  const newlyAdded = [];

  const skipPools = new Set([
    'clock', 'hour_morning', 'hour_night', 'range', 'date'
  ]);
  const phrasePools = new Set([
    'means_action', 'place_action', 'obj_verb', 'ni_verb', 'noun_of_noun'
  ]);

  for (const [pn, p] of Object.entries(POOLS)) {
    // Matikan auto-add untuk bab 1-8: vocab-book.json adalah sumber resmi Bab 1-8
    if (skipPools.has(pn) || !p.items || !p.lesson || p.lesson <= 8) continue;
    for (const it of p.items) {
      if (phrasePools.has(pn)) {
        if (tokenizer) {
          const tokens = tokenizer.tokenize(it.jp);
          for (const t of tokens) {
            if (t.pos === '助詞' || t.pos === '記号' || t.pos === '助動詞') continue;
            const jp = t.surface_form;
            const kana = t.reading ? toHiragana(t.reading) : t.surface_form;
            const key = `${jp}__${kana}`;
            if (extraMap.has(key)) continue;

            const classification = classifyPoolWord({ jp, kana }, p.lesson, baseEntries);
            if (!classification.pass) {
              const meta = CURRICULUM_FIRST_TAUGHT[jp] || {};
              const newEntry = {
                jp,
                kana: meta.kana || kana,
                id: meta.id || it.id || '',
                lesson: meta.lesson || p.lesson,
                lesson_confidence: meta.confidence || 'curriculum',
                source: 'pool',
                auto: true,
                reason: classification.reason || 'missing'
              };
              extraMap.set(key, newEntry);
              newlyAdded.push(newEntry);
            }
          }
        }
      } else {
        if (it.jp.startsWith('この') || it.jp.startsWith('その') || it.jp.startsWith('あの')) continue;

        const key = `${it.jp}__${it.kana || it.jp}`;
        if (extraMap.has(key)) continue;

        const classification = classifyPoolWord(it, p.lesson, baseEntries);
        if (!classification.pass) {
          const meta = CURRICULUM_FIRST_TAUGHT[it.jp] || {};
          const newEntry = {
            jp: it.jp,
            kana: meta.kana || it.kana || it.jp,
            id: meta.id || it.id || '',
            lesson: meta.lesson || p.lesson,
            lesson_confidence: meta.confidence || 'curriculum',
            source: 'pool',
            auto: true,
            reason: classification.reason || 'missing'
          };
          extraMap.set(key, newEntry);
          newlyAdded.push(newEntry);
        }
      }
    }
  }

  // Ensure all known missing words in CURRICULUM_FIRST_TAUGHT are accounted for (hanya untuk bab >= 9)
  for (const [kw, km] of Object.entries(CURRICULUM_FIRST_TAUGHT)) {
    if (km.lesson <= 8) continue;
    const key = `${kw}__${km.kana}`;
    if (!extraMap.has(key)) {
      const classification = classifyPoolWord({ jp: kw, kana: km.kana }, km.lesson, baseEntries);
      if (!classification.pass) {
        const newEntry = {
          jp: kw,
          kana: km.kana,
          id: km.id,
          lesson: km.lesson,
          lesson_confidence: km.confidence,
          source: 'pool',
          auto: true,
          reason: classification.reason || 'missing'
        };
        extraMap.set(key, newEntry);
        newlyAdded.push(newEntry);
      }
    }
  }

  const allExtra = Array.from(extraMap.values());
  allExtra.sort((a, b) => (a.lesson - b.lesson) || a.jp.localeCompare(b.jp));

  fs.writeFileSync(vocabExtraPath, JSON.stringify(allExtra, null, 2) + '\n', 'utf-8');

  // Tulis laporan markdown scripts/data/vocab-extra.report.md
  let reportMd = '# Laporan Suplemen Kosakata (vocab-extra.json)\n\n';
  reportMd += `Total kata suplemen: ${allExtra.length} kata (baru ditambahkan: ${newlyAdded.length} kata)\n\n`;

  const byLesson = {};
  const byReason = { missing: 0, later_lesson: 0, reading_conflict: 0 };
  const nonMissing = [];

  for (const w of allExtra) {
    if (!byLesson[w.lesson]) byLesson[w.lesson] = [];
    byLesson[w.lesson].push(w);

    const baseReason = w.reason.startsWith('later_lesson') ? 'later_lesson' : w.reason;
    byReason[baseReason] = (byReason[baseReason] || 0) + 1;
    if (w.reason !== 'missing') {
      nonMissing.push(w);
    }
  }

  for (const [l, words] of Object.entries(byLesson)) {
    reportMd += `## Bab ${l}\n`;
    for (const w of words) {
      reportMd += `- ${w.jp} / ${w.kana} / ${w.id} / ${w.reason} [${w.lesson_confidence}]\n`;
    }
    reportMd += '\n';
  }

  fs.writeFileSync(vocabReportPath, reportMd, 'utf-8');

  return {
    extraWords: allExtra,
    reportSummary: {
      totalAdded: newlyAdded.length,
      totalCount: allExtra.length,
      byReason,
      nonMissing
    }
  };
}

/**
 * Memuat seluruh indeks kosakata aktif (words.ts ∪ vocab-extra.json)
 * @param {object} [opts]
 * @param {boolean} [opts.isStrict=false]
 * @returns {any[]}
 */
export function loadVocabularyIndex(opts = {}) {
  const isStrict = opts.isStrict ?? process.argv.includes('--strict');
  const { extraWords } = autoAddPoolWords(isStrict);
  const rawWords = loadRawWordsData();
  return buildVocabEntries(rawWords, extraWords);
}

export const VOCAB_INDEX = loadVocabularyIndex();

// -------------------------------------------------------------
// 2. Pool Resolver (include, exclude, union)
// -------------------------------------------------------------
/**
 * Resolves a pool by name, recursively merging include and applying exclude.
 * @param {string} poolName
 * @returns {any[]}
 */
export function resolvePool(poolName) {
  const pool = POOLS[poolName];
  if (!pool) {
    throw new Error(`Pool not found: ${poolName}`);
  }

  let items = [...(pool.items || [])];

  if (pool.include && Array.isArray(pool.include)) {
    for (const inc of pool.include) {
      items = items.concat(resolvePool(inc));
    }
  }

  if (pool.exclude && Array.isArray(pool.exclude)) {
    const excludeSet = new Set(pool.exclude);
    items = items.filter(it => !excludeSet.has(it.jp));
  }

  // Deduplicate items based on jp and jp2
  const seen = new Set();
  return items.filter(it => {
    const key = `${it.jp}__${it.jp2 || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// -------------------------------------------------------------
// 3. Vocabulary Gating Helper
// -------------------------------------------------------------
/**
 * Checks if a word token is valid for a given lesson
 * @param {string} surface
 * @param {string} basic
 * @param {string} pos
 * @param {string} pos1
 * @param {string} reading
 * @param {any[]} vocabEntries
 * @param {number} maxLesson
 * @returns {{ ok: boolean, lesson?: number, missing?: string, reason?: string }}
 */
export function checkToken(surface, basic, pos, pos1, reading, vocabEntries, maxLesson) {
  if (pos === '助詞' || pos === '記号' || pos === '接続詞') return { ok: true };
  if (pos === '名詞' && pos1 === '数') return { ok: true };
  if (['さん', '人', '語', '階', '時', '分', '日', '月', '年', '半', '目', 'ごろ'].includes(surface)) return { ok: true };
  if (['な', 'だ', 'です', 'ます', 'でした', 'ません', 'ませんでした'].includes(surface)) return { ok: true };

  const candKana = reading ? toHiragana(reading) : '';
  const resSurface = checkVocabMatch(surface, candKana, maxLesson, vocabEntries);
  if (resSurface.ok) return resSurface;

  if (basic && basic !== surface && basic !== '*') {
    const resBasic = checkVocabMatch(basic, candKana, maxLesson, vocabEntries);
    if (resBasic.ok) return resBasic;
  }

  return resSurface;
}

/**
 * Checks if a pool item passes vocabulary gating for a template lesson
 * @param {any} item
 * @param {number} maxLesson
 * @param {any} tokenizer
 * @param {any[]} [vocabEntries=VOCAB_INDEX]
 * @returns {{ pass: boolean, word?: string, reason?: string }}
 */
export function checkItemGating(item, maxLesson, tokenizer, vocabEntries = VOCAB_INDEX) {
  // 1. Direct match check first
  const directMatch = checkVocabMatch(item.jp, item.kana, maxLesson, vocabEntries);
  if (directMatch.ok) return { pass: true };
  if (directMatch.lesson !== undefined && directMatch.lesson > maxLesson) {
    return {
      pass: false,
      word: item.jp,
      reason: `kata '${item.jp}' bab ${directMatch.lesson} > bab template ${maxLesson}`
    };
  }

  // 2. Token decomposition for compound nouns / phrases
  const texts = [item.jp];
  if (item.jp2) texts.push(item.jp2);

  for (const txt of texts) {
    const tokens = tokenizer.tokenize(txt);
    for (const t of tokens) {
      const reading = t.reading ? toHiragana(t.reading) : '';
      const res = checkToken(t.surface_form, t.basic_form, t.pos, t.pos_detail_1, reading, vocabEntries, maxLesson);
      if (!res.ok) {
        if (res.lesson !== undefined && res.lesson > maxLesson) {
          return {
            pass: false,
            word: t.surface_form,
            reason: `kata '${t.surface_form}' bab ${res.lesson} > bab template ${maxLesson}`
          };
        }
        return {
          pass: false,
          word: res.missing || t.surface_form,
          reason: res.reason || `kata '${t.surface_form}' tidak ada di tabel kosakata`
        };
      }
    }
  }

  return { pass: true };
}

// -------------------------------------------------------------
// 4. Kanji Numeral to Digit Normalization
// -------------------------------------------------------------
const KANJI_DIGITS = {
  '〇': 0, '一': 1, '二': 2, '三': 3, '四': 4,
  '五': 5, '六': 6, '七': 7, '八': 8, '九': 9
};

/**
 * Converts kanji numerals to regular digits
 * @param {string} str
 * @returns {string}
 */
export function kanjiToDigits(str) {
  if (!str) return '';
  let res = str.replace(/([一二三四五六七八九]?)(十)([一二三四五六七八九]?)/g, (_, tens, __, ones) => {
    const t = tens ? KANJI_DIGITS[tens] : 1;
    const o = ones ? KANJI_DIGITS[ones] : 0;
    return String(t * 10 + o);
  });
  res = res.replace(/[〇一二三四五六七八九]/g, m => String(KANJI_DIGITS[m]));
  return res;
}

/**
 * Normalizes answer string
 * @param {string} text
 * @returns {string}
 */
export function normalizeAnswer(text) {
  if (!text) return '';
  let str = String(text).normalize('NFKC').trim().toLowerCase();
  str = str.replace(/[\s\u3000。、！？.,!?~～\-—_–/\\()（）「」『』"':;`]/g, '');
  str = kanjiToDigits(str);
  return str;
}

// -------------------------------------------------------------
// 5. Answer Variations Builder
// -------------------------------------------------------------
function clean(s) {
  return s.replace(/[。、！？\s]/g, '');
}

/**
 * Build all valid accepted Japanese answers
 * @param {object} params
 * @returns {string[]}
 */
export function buildJpAnswers({ jpText, kanaText = '', altJpTexts = [], isDroppable = false, droppableSubject = '' }) {
  const set = new Set();

  set.add(clean(jpText));
  if (kanaText) set.add(clean(kanaText));

  for (const alt of altJpTexts) {
    if (alt) set.add(clean(alt));
  }

  // Kanji vs Hiragana variant for watashi
  if (jpText.includes('わたし')) {
    set.add(clean(jpText.replace(/わたし/g, '私')));
  }
  if (jpText.includes('私')) {
    set.add(clean(jpText.replace(/私/g, 'わたし')));
  }

  // Digits to Kanji numerals and vice versa
  const normDigits = normalizeAnswer(jpText);
  if (normDigits) set.add(normDigits);

  // Droppable subject variant
  if (isDroppable && droppableSubject) {
    const subjWa = droppableSubject + 'は';
    if (jpText.startsWith(subjWa)) {
      set.add(clean(jpText.slice(subjWa.length)));
    }
    if (kanaText && kanaText.startsWith(subjWa)) {
      set.add(clean(kanaText.slice(subjWa.length)));
    }
    for (const alt of altJpTexts) {
      if (alt.startsWith(subjWa)) {
        set.add(clean(alt.slice(subjWa.length)));
      }
    }
  }

  return Array.from(set).filter(Boolean);
}

// -------------------------------------------------------------
// 6. Template Combinations Generator
// -------------------------------------------------------------
/**
 * Generates all valid questions for a given template definition
 * @param {any} tpl
 * @param {any} tokenizer
 * @param {number} lessonNumber
 * @param {Set<string>} [discardedSet]
 * @param {any[]} [vocabEntries=VOCAB_INDEX]
 * @returns {{ questions: any[], skipReason?: string }}
 */
export function generateAllCombinationsForTemplate(tpl, tokenizer, lessonNumber, discardedSet = new Set(), vocabEntries = VOCAB_INDEX) {
  const slotNames = Object.keys(tpl.slots);
  const slotItems = {};

  // 1. Resolve and gate each slot's items
  for (const sName of slotNames) {
    const poolSpec = tpl.slots[sName];
    const poolNames = Array.isArray(poolSpec) ? poolSpec : [poolSpec];
    let items = [];
    for (const pn of poolNames) {
      items = items.concat(resolvePool(pn));
    }

    const validItems = [];
    for (const it of items) {
      const chk = checkItemGating(it, tpl.lesson, tokenizer, vocabEntries);
      if (chk.pass) {
        validItems.push(it);
      } else {
        discardedSet.add(`${it.jp} (${chk.reason})`);
      }
    }
    slotItems[sName] = validItems;
  }

  // Check if any slot has 0 items after gating
  const emptySlot = slotNames.find(sn => slotItems[sn].length === 0);
  if (emptySlot) {
    return {
      questions: [],
      skipReason: `slot '${emptySlot}' (${JSON.stringify(tpl.slots[emptySlot])}) kosong setelah gating kosakata`
    };
  }

  // 2. Cartesian product across slots
  let combinations = [{}];
  for (const sName of slotNames) {
    const nextCombos = [];
    for (const curr of combinations) {
      for (const it of slotItems[sName]) {
        nextCombos.push({ ...curr, [sName]: it });
      }
    }
    combinations = nextCombos;
  }

  // 3. Apply distinct filter
  if (tpl.distinct && Array.isArray(tpl.distinct)) {
    combinations = combinations.filter(combo => {
      for (const [a, b] of tpl.distinct) {
        if (combo[a] && combo[b] && combo[a].jp === combo[b].jp) return false;
      }
      return true;
    });
  }

  // 4. Apply compat filter
  if (tpl.compat && Array.isArray(tpl.compat)) {
    combinations = combinations.filter(combo => {
      for (const [s1, s2] of tpl.compat) {
        const it1 = combo[s1];
        const it2 = combo[s2];
        if (!it1 || !it2) continue;
        const cats = it1.cats || it2.cats || [];
        const ok = it1.ok || it2.ok || [];
        if (cats.length > 0 && ok.length > 0) {
          const matched = cats.filter(c => ok.includes(c));
          if (matched.length === 0) return false;
        }
      }
      return true;
    });
  }

  const allowedTags = getAllowedTagsForLesson(lessonNumber);
  const validQuestions = [];
  let lastAssertionError = '';

  // 5. Expand placeholders and test assertions
  for (let idx = 0; idx < combinations.length; idx++) {
    const combo = combinations[idx];

    // Determine category override if compat has id_cat
    const idOverrides = {};
    if (tpl.compat && Array.isArray(tpl.compat)) {
      for (const [s1, s2] of tpl.compat) {
        const it1 = combo[s1];
        const it2 = combo[s2];
        if (!it1 || !it2) continue;
        const cats = it1.cats || it2.cats || [];
        const ok = it1.ok || it2.ok || [];
        const matched = cats.filter(c => ok.includes(c));
        if (matched.length > 0) {
          const matchedCat = matched[0];
          if (it1.id_cat && it1.id_cat[matchedCat]) idOverrides[s1] = it1.id_cat[matchedCat];
          if (it2.id_cat && it2.id_cat[matchedCat]) idOverrides[s2] = it2.id_cat[matchedCat];
        }
      }
    }

    // Build jp_text
    let jpText = tpl.jp;
    for (const s of slotNames) {
      const it = combo[s];
      jpText = jpText.replace(new RegExp(`\\{${s}\\.stem\\}`, 'g'), it.stem || it.jp);
      jpText = jpText.replace(new RegExp(`\\{${s}\\.2\\}`, 'g'), it.jp2 || '');
      jpText = jpText.replace(new RegExp(`\\{${s}\\}`, 'g'), it.jp);
    }

    // Build kana_text
    let kanaText = tpl.jp_kana || tpl.jp;
    for (const s of slotNames) {
      const it = combo[s];
      kanaText = kanaText.replace(new RegExp(`\\{${s}\\.stem\\}`, 'g'), it.stem_kana || it.kana || it.stem || it.jp);
      kanaText = kanaText.replace(new RegExp(`\\{${s}\\.2\\}`, 'g'), it.kana2 || it.jp2 || '');
      kanaText = kanaText.replace(new RegExp(`\\{${s}\\}`, 'g'), it.kana || it.jp);
    }

    // Build alt_jp_texts (Fase 2.5c: dukungan alt dan alt_stem dari item pool)
    const slotChoices = {};
    let hasAnyAlt = false;

    for (const s of slotNames) {
      const it = combo[s];
      const choices = [
        { jp: it.jp, stem: it.stem || it.jp, jp2: it.jp2 || '' }
      ];
      if (it.alt && Array.isArray(it.alt)) {
        for (let k = 0; k < it.alt.length; k++) {
          const altJp = it.alt[k];
          const altStem = (it.alt_stem && it.alt_stem[k]) ? it.alt_stem[k] : (it.stem || altJp);
          choices.push({
            jp: altJp,
            stem: altStem,
            jp2: it.jp2 || ''
          });
          hasAnyAlt = true;
        }
      }
      slotChoices[s] = choices;
    }

    // Cartesian product of slotChoices
    let altVariants = [{}];
    for (const s of slotNames) {
      const next = [];
      for (const r of altVariants) {
        for (const choice of slotChoices[s]) {
          next.push({ ...r, [s]: choice });
        }
      }
      altVariants = next;
    }

    const altJpTexts = [];

    // Jika template memiliki jp_alt, buat variasi untuk semua combo variant
    if (tpl.jp_alt && Array.isArray(tpl.jp_alt)) {
      for (const altPat of tpl.jp_alt) {
        for (const variant of altVariants) {
          let altJp = altPat;
          for (const s of slotNames) {
            const it = variant[s];
            altJp = altJp.replace(new RegExp(`\\{${s}\\.stem\\}`, 'g'), it.stem);
            altJp = altJp.replace(new RegExp(`\\{${s}\\.2\\}`, 'g'), it.jp2);
            altJp = altJp.replace(new RegExp(`\\{${s}\\}`, 'g'), it.jp);
          }
          altJpTexts.push(altJp);
        }
      }
    }

    // Variasi dari tpl.jp jika ada slot yang menggunakan pilihan alt (vIdx >= 1)
    if (hasAnyAlt) {
      for (let vIdx = 1; vIdx < altVariants.length; vIdx++) {
        const variant = altVariants[vIdx];
        let altJp = tpl.jp;
        for (const s of slotNames) {
          const it = variant[s];
          altJp = altJp.replace(new RegExp(`\\{${s}\\.stem\\}`, 'g'), it.stem);
          altJp = altJp.replace(new RegExp(`\\{${s}\\.2\\}`, 'g'), it.jp2);
          altJp = altJp.replace(new RegExp(`\\{${s}\\}`, 'g'), it.jp);
        }
        altJpTexts.push(altJp);
      }
    }

    // Build id_text
    let idText = tpl.id_text;
    for (const s of slotNames) {
      const it = combo[s];
      const baseId = idOverrides[s] || it.id;
      idText = idText.replace(new RegExp(`\\{${s}\\.loc\\}`, 'g'), it.loc || baseId);
      idText = idText.replace(new RegExp(`\\{${s}\\.2\\}`, 'g'), it.id2 || baseId);
      idText = idText.replace(new RegExp(`\\{${s}\\.stem\\}`, 'g'), baseId);
      idText = idText.replace(new RegExp(`\\{${s}\\}`, 'g'), baseId);
    }
    idText = idText.charAt(0).toUpperCase() + idText.slice(1);

    // Check droppable subject
    let isDroppable = false;
    let droppableSubject = '';
    for (const s of slotNames) {
      if (combo[s]?.droppable) {
        const prefix = `{${s}}は`;
        if (tpl.jp.startsWith(prefix)) {
          isDroppable = true;
          droppableSubject = combo[s].jp;
          break;
        }
      }
    }

    // 6. KUROMOJI GRAMMAR ASSERTION
    const tokens = tokenizer.tokenize(jpText);
    const { tags, unknown } = detectTags(tokens);

    // Assertion A: must_tags ⊆ tags
    const missingMust = (tpl.must_tags || []).filter(mt => !tags.has(mt));
    if (missingMust.length > 0) {
      lastAssertionError = `must_tags tidak terdeteksi: ${missingMust.join(', ')} pada "${jpText}" (detected: ${[...tags].join(', ')})`;
      continue;
    }

    // Assertion B: tags ⊆ allowedTags(bab)
    const disallowed = [...tags].filter(t => !allowedTags.has(t));
    if (disallowed.length > 0) {
      lastAssertionError = `disallowed tags untuk Bab ${lessonNumber}: ${disallowed.join(', ')} pada "${jpText}"`;
      continue;
    }

    // Assertion C: unknown kosong
    if (unknown.length > 0) {
      lastAssertionError = `unknown grammar: ${unknown.join(', ')} pada "${jpText}"`;
      continue;
    }

    // Build accepted answers
    const answers = buildJpAnswers({
      jpText,
      kanaText,
      altJpTexts,
      isDroppable,
      droppableSubject
    });

    // Stable source_ref format: L5-T3:タクシー|うち (menangani jp2 untuk compound slot seperti na_np/i_np)
    const slotValues = slotNames.map(s => {
      const item = combo[s];
      if (!item) return '';
      if (item.jp2) return `${item.jp}+${item.jp2}`;
      return item.jp;
    }).join('|');
    const sourceRef = slotValues ? `${tpl.tid}:${slotValues}` : `${tpl.tid}`;

    validQuestions.push({
      id_text: idText,
      jp_text: jpText,
      jp_answers: answers,
      chapter_id: lessonNumber,
      grammar_tags: Array.from(tags),
      is_focus: true,
      source: 'template',
      source_ref: sourceRef,
      attribution: 'Nihongo Master Template Engine',
      status: 'approved',
      template_id: tpl.tid
    });
  }

  if (validQuestions.length === 0) {
    return {
      questions: [],
      skipReason: lastAssertionError || 'tidak ada kombinasi yang memenuhi assertion'
    };
  }

  return { questions: validQuestions };
}

// -------------------------------------------------------------
// 7. Round-Robin Lesson Generator (Target: 150 soal per bab, min 10 per template)
// -------------------------------------------------------------
/**
 * Generates questions for a lesson with round-robin sampling across templates
 * @param {number} lessonNumber
 * @param {any} tokenizer
 * @param {number} [targetCount=150]
 * @param {number} [minPerTemplate=10]
 * @param {Set<string>} [discardedWordsSet=new Set()]
 * @param {any[]} [vocabEntries=VOCAB_INDEX]
 * @returns {{
 *   questions: any[],
 *   templateStats: Record<string, number>,
 *   skippedTemplates: Array<{ tid: string, reason: string }>,
 *   discardedWords: string[]
 * }}
 */
export function generateQuestionsForLesson(
  lessonNumber,
  tokenizer,
  targetCount = 150,
  minPerTemplate = 10,
  discardedWordsSet = new Set(),
  vocabEntries = VOCAB_INDEX
) {
  const lessonTemplates = TEMPLATES.filter(t => t.lesson === lessonNumber);
  if (lessonTemplates.length === 0) {
    return {
      questions: [],
      templateStats: {},
      skippedTemplates: [],
      discardedWords: []
    };
  }

  const poolsByTemplate = new Map();
  const skippedTemplates = [];

  for (const tpl of lessonTemplates) {
    const res = generateAllCombinationsForTemplate(tpl, tokenizer, lessonNumber, discardedWordsSet, vocabEntries);
    if (res.questions.length > 0) {
      poolsByTemplate.set(tpl.tid, res.questions);
    } else {
      skippedTemplates.push({ tid: tpl.tid, reason: res.skipReason || 'Tidak ada soal valid' });
    }
  }

  const selectedQuestions = [];
  const seenJpTexts = new Set();
  /** @type {Record<string, number>} */
  const templateStats = {};
  for (const tpl of lessonTemplates) {
    templateStats[tpl.tid] = 0;
  }

  // Phase 1: Jamin minimal minPerTemplate (10) soal per template aktif
  for (let r = 0; r < minPerTemplate; r++) {
    for (const [tid, pool] of poolsByTemplate.entries()) {
      if (r < pool.length) {
        const candidate = pool[r];
        if (!seenJpTexts.has(candidate.jp_text)) {
          seenJpTexts.add(candidate.jp_text);
          selectedQuestions.push(candidate);
          templateStats[tid]++;
        }
      }
    }
  }

  // Phase 2: Lanjutkan round-robin hingga targetCount (150) atau semua kombinasi habis
  let round = minPerTemplate;
  let addedInRound = true;

  while (selectedQuestions.length < targetCount && addedInRound) {
    addedInRound = false;
    for (const [tid, pool] of poolsByTemplate.entries()) {
      if (round < pool.length) {
        const candidate = pool[round];
        if (!seenJpTexts.has(candidate.jp_text)) {
          seenJpTexts.add(candidate.jp_text);
          selectedQuestions.push(candidate);
          templateStats[tid]++;
          addedInRound = true;
          if (selectedQuestions.length >= targetCount) break;
        }
      }
    }
    round++;
  }

  return {
    questions: selectedQuestions,
    templateStats,
    skippedTemplates,
    discardedWords: Array.from(discardedWordsSet)
  };
}

// -------------------------------------------------------------
// 8. CLI Runner
// -------------------------------------------------------------
async function runCli() {
  const isStrict = process.argv.includes('--strict');
  console.log('=== NIHONGO MASTER TEMPLATE GENERATOR (FASE 2.5) ===');
  console.log(`Mode: ${isStrict ? 'STRICT (Auto-Add Dinonaktifkan)' : 'AUTO-ADD AKTIF (Suplemen Kosakata)'}`);
  console.log('Menginisialisasi Kuromoji tokenizer & indeks kosakata...');
  const tokenizer = await initTokenizer();

  const { reportSummary } = autoAddPoolWords(isStrict);

  console.log('\n======================================================');
  console.log('       RINGKASAN SUPLEMEN KOSAKATA (vocab-extra)      ');
  console.log('======================================================');
  console.log(`Total kata dalam vocab-extra.json: ${reportSummary.totalCount} kata`);
  console.log('Rincian kata berdasarkan alasan penambahan:');
  console.log(`  - missing          : ${reportSummary.byReason.missing || 0} kata`);
  console.log(`  - later_lesson     : ${reportSummary.byReason.later_lesson || 0} kata`);
  console.log(`  - reading_conflict : ${reportSummary.byReason.reading_conflict || 0} kata`);

  console.log('\nDaftar kata dengan alasan BUKAN "missing":');
  if (reportSummary.nonMissing && reportSummary.nonMissing.length > 0) {
    for (const nm of reportSummary.nonMissing) {
      console.log(`  - ${nm.jp} (kana: ${nm.kana}, arti: ${nm.id}, bab: ${nm.lesson}, alasan: ${nm.reason})`);
    }
  } else {
    console.log('  (Tidak ada kata non-missing)');
  }

  const vocabIndex = loadVocabularyIndex({ isStrict });
  const allSummary = [];
  const globalDiscarded = new Set();
  const globalSkipped = [];
  const targetPerLesson = 150;

  for (let lesson = 1; lesson <= 8; lesson++) {
    const discardedSet = new Set();
    const result = generateQuestionsForLesson(lesson, tokenizer, targetPerLesson, 10, discardedSet, vocabIndex);
    allSummary.push({ lesson, result });

    for (const w of result.discardedWords) globalDiscarded.add(w);
    for (const s of result.skippedTemplates) globalSkipped.push({ lesson, ...s });
  }

  console.log('\n======================================================');
  console.log('              LAPORAN GENERASI SOAL BAB 1 - 8          ');
  console.log('======================================================');
  console.log('Bab  | Target | Jumlah Soal Terpilih | Status Template Aktif');
  console.log('-----+--------+----------------------+----------------------');
  for (const item of allSummary) {
    const activeCount = Object.values(item.result.templateStats).filter(c => c > 0).length;
    const totalTpl = Object.keys(item.result.templateStats).length;
    console.log(
      `${String(item.lesson).padStart(3)}  |  ${targetPerLesson}   | ${String(item.result.questions.length).padStart(20)} | ${activeCount}/${totalTpl} template aktif`
    );
  }

  console.log('\n------------------------------------------------------');
  console.log('Rincian Soal per Template (Target min 10):');
  console.log('------------------------------------------------------');
  for (const item of allSummary) {
    console.log(`\nBab ${item.lesson}:`);
    for (const [tid, count] of Object.entries(item.result.templateStats)) {
      console.log(`  - ${tid}: ${count} soal`);
    }
  }

  console.log('\n------------------------------------------------------');
  console.log('Daftar Template yang Di-Skip:');
  console.log('------------------------------------------------------');
  if (globalSkipped.length === 0) {
    console.log('  ✓ SEMUA TEMPLATE AKTIF (0 template di-skip)');
  } else {
    for (const s of globalSkipped) {
      console.log(`  - [Bab ${s.lesson}] ${s.tid}: ${s.reason}`);
    }
  }

  console.log('\n------------------------------------------------------');
  console.log(`Daftar Kata yang Masih Terbuang oleh Gating (${globalDiscarded.size} kata):`);
  console.log('------------------------------------------------------');
  for (const w of globalDiscarded) {
    console.log(`  - ${w}`);
  }

  console.log('\n======================================================');
  console.log('    KONFIRMASI TEMPLATE L4-T6, L4-T7, L6-T11 (3 SAMPEL)   ');
  console.log('======================================================');
  const targetTids = ['L4-T6', 'L4-T7', 'L6-T11'];
  for (const tid of targetTids) {
    const lesson = parseInt(tid.slice(1, 2), 10);
    const item = allSummary.find(s => s.lesson === lesson);
    const tplQuestions = (item?.result.questions || []).filter(q => q.template_id === tid);
    console.log(`\n>>> Template ${tid} (Status: ${tplQuestions.length > 0 ? `AKTIF (${tplQuestions.length} soal)` : '❌ SKIP'}) <<<`);
    tplQuestions.slice(0, 3).forEach((q, idx) => {
      console.log(`  [Sampel ${idx + 1}] source_ref: "${q.source_ref}"`);
      console.log(`    id_text     : "${q.id_text}"`);
      console.log(`    jp_text     : "${q.jp_text}"`);
      console.log(`    jp_answers  : ${JSON.stringify(q.jp_answers)}`);
      console.log(`    grammar_tags: ${JSON.stringify(q.grammar_tags)}`);
    });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCli().catch(err => {
    console.error('Fatal generator error:', err);
    process.exit(1);
  });
}
