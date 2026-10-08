import kuromoji from 'kuromoji';

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
// Kanji Numeral to Digit Normalization & Answer Normalizer
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

/**
 * Membersihkan tanda baca dan spasi untuk variasi jawaban
 * @param {string} s
 * @returns {string}
 */
export function clean(s) {
  return s ? s.replace(/[。、！？\s]/g, '') : '';
}

/**
 * Build all valid accepted Japanese answers
 * @param {object} params
 * @param {string} params.jpText
 * @param {string} [params.kanaText='']
 * @param {string[]} [params.altJpTexts=[]]
 * @param {boolean} [params.isDroppable=false]
 * @param {string} [params.droppableSubject='']
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
