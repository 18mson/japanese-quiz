import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hasKanji, stripHonorific, toHiragana } from './utils.mjs';
import { POOLS } from './pools.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const vocabBookPath = path.resolve(__dirname, '../data/vocab-book.json');
const vocabExtraPath = path.resolve(__dirname, '../data/vocab-extra.json');
const vocabReportPath = path.resolve(__dirname, '../data/vocab-extra.report.md');

/**
 * Membaca data words.ts langsung
 * @returns {any[]}
 */
export function loadRawWordsData() {
  const wordsPath = path.resolve(__dirname, '../../src/data/words.ts');
  const wordsContent = fs.readFileSync(wordsPath, 'utf-8');
  const jsCode = wordsContent
    .replace('export interface JapaneseWord', '/*')
    .replace('export const wordsData: JapaneseWord[] =', '*/ const wordsData =') + '; return wordsData;';
  return new Function(jsCode)();
}

/**
 * Membaca data vocab-book.json (sumber resmi Minna no Nihongo)
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
 * Membangun array entries kosakata dari vocab-book.json (Bab 1-12 primer) + words.ts (Bab 13-25) + suplemen
 * @param {any[]} rawWords
 * @param {any[]} [extraWords=[]]
 * @returns {any[]}
 */
export function buildVocabEntries(rawWords, extraWords = []) {
  const entries = [];
  const vocabBook = loadVocabBookData();
  const naAdjSet = new Set([
    'ハンサム', 'きれい', '静か', 'にぎやか', '有名', '親切', '元気', '暇', '便利', 'すてき',
    '好き', '嫌い', '上手', '下手', '簡単', '大変'
  ]);

  // 1. Bab 1-12: vocab-book.json sebagai sumber UTAMA resmi
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

    // Suru verbs noun stem (e.g. 勉強します -> 勉強)
    if (cleanChar.endsWith('します') && cleanChar.length > 3) {
      const nounStem = cleanChar.slice(0, -3);
      const kanaNounStem = cleanKana.endsWith('します') ? cleanKana.slice(0, -3) : cleanKana;
      entries.push({ char: nounStem, kana: kanaNounStem, lesson: l, raw: w, fromBook: true });
    }

    // Suffix stems for compound nouns (e.g. 誕生日 -> 誕生, 郵便局 -> 郵便)
    if (cleanChar.endsWith('日') && cleanChar.length > 1) {
      entries.push({ char: cleanChar.slice(0, -1), kana: cleanKana.replace(/び$/, ''), lesson: l, raw: w, fromBook: true });
    }
    if (cleanChar.endsWith('局') && cleanChar.length > 1) {
      entries.push({ char: cleanChar.slice(0, -1), kana: cleanKana.replace(/きょく$/, ''), lesson: l, raw: w, fromBook: true });
    }

    // Na-adjectives modifier form (e.g. 静かな, きれいな)
    if (naAdjSet.has(cleanChar)) {
      entries.push({ char: cleanChar + 'な', kana: cleanKana + 'な', lesson: l, raw: w, fromBook: true });
      for (const a of (w.alt || [])) {
        entries.push({ char: a + 'な', kana: cleanKana + 'な', lesson: l, raw: w, fromBook: true, isAlt: true });
      }
    }

    // I-adjectives past stem (e.g. おいしい -> おいしかっ, いい -> よかっ)
    if (cleanChar.endsWith('い') && !naAdjSet.has(cleanChar)) {
      entries.push({ char: cleanChar.slice(0, -1) + 'かっ', kana: cleanKana.slice(0, -1) + 'かっ', lesson: l, raw: w, fromBook: true });
      for (const a of (w.alt || [])) {
        if (a.endsWith('い')) {
          entries.push({ char: a.slice(0, -1) + 'かっ', kana: cleanKana.slice(0, -1) + 'かっ', lesson: l, raw: w, fromBook: true, isAlt: true });
        }
      }
    }
    if (cleanChar === 'いい') {
      entries.push({ char: 'よかっ', kana: 'よかっ', lesson: l, raw: w, fromBook: true });
      entries.push({ char: 'よい', kana: 'よい', lesson: l, raw: w, fromBook: true });
    }
  }

  // 2. Bab 13-25: kata dari words.ts (hanya jika lesson > 12)
  for (const w of rawWords) {
    if (!w.lesson) continue;
    const l = parseInt(w.lesson.replace('Pelajaran ', ''), 10);
    if (l <= 12) continue; // vocab-book.json menang mutlak untuk Bab 1-12

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

  // 5. Suplemen vocab-extra.json (hanya untuk Bab > 12)
  for (const ew of extraWords) {
    if (!ew.jp || ew.lesson <= 12) continue;
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
    if (ew.lesson <= 12) continue; // Matikan dan hapus entri bab 1-12
    const meta = CURRICULUM_FIRST_TAUGHT[ew.jp];
    if (meta) {
      if (meta.lesson <= 12) continue;
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
    // Matikan auto-add untuk bab 1-12: vocab-book.json adalah sumber resmi Bab 1-12
    if (skipPools.has(pn) || !p.items || !p.lesson || p.lesson <= 12) continue;
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

  // Ensure all known missing words in CURRICULUM_FIRST_TAUGHT are accounted for (hanya untuk bab >= 13)
  for (const [kw, km] of Object.entries(CURRICULUM_FIRST_TAUGHT)) {
    if (km.lesson <= 12) continue;
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
  if (pos === '助詞' || pos === '記号' || pos === '接続詞' || pos === '助動詞') return { ok: true };
  if (pos === '名詞' && pos1 === '数') return { ok: true };
  if (['さん', '人', '語', '階', '時', '分', '日', '月', '年', '半', '目', 'ごろ', '局', '屋', '台', '枚', '回', '本', '匹', '冊', '個', '杯'].includes(surface)) return { ok: true };
  if (['な', 'だ', 'です', 'ます', 'でした', 'ません', 'ませんでした'].includes(surface)) return { ok: true };

  // Handle composite noun phrases joined by の where Kuromoji did not split on の (e.g. 木の下)
  if (surface.includes('の') && surface.length > 2) {
    const parts = surface.split('の');
    let allOk = true;
    for (const p of parts) {
      if (!p) continue;
      const resP = checkVocabMatch(p, '', maxLesson, vocabEntries);
      if (!resP.ok) { allOk = false; break; }
    }
    if (allOk) return { ok: true };
  }

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
  // Collect all parts: jp, jp2, jp3, jp4, ...
  const parts = [{ jp: item.jp, kana: item.kana }];
  for (let n = 2; n <= 10; n++) {
    if (item['jp' + n]) {
      parts.push({ jp: item['jp' + n], kana: item['kana' + n] });
    }
  }

  for (const part of parts) {
    // 1. Direct match check first
    const directMatch = checkVocabMatch(part.jp, part.kana, maxLesson, vocabEntries);
    if (directMatch.ok) continue;
    if (directMatch.lesson !== undefined && directMatch.lesson > maxLesson) {
      return {
        pass: false,
        word: part.jp,
        reason: `kata '${part.jp}' bab ${directMatch.lesson} > bab template ${maxLesson}`
      };
    }

    // 2. Token decomposition for compound nouns / phrases
    const tokens = tokenizer.tokenize(part.jp);
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
