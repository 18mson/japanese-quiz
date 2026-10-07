// ============================================================
// Utilitas Normalisasi Jawaban Kalimat Bahasa Jepang
// ============================================================

export const KANJI_DIGITS: Record<string, number> = {
  '〇': 0, '一': 1, '二': 2, '三': 3, '四': 4,
  '五': 5, '六': 6, '七': 7, '八': 8, '九': 9
};

/**
 * Mengonversi angka kanji (satuan dan belasan/puluhan) ke digit angka arab
 * Contoh: 六 -> 6, 十二 -> 12, 二十五 -> 25
 */
export function kanjiToDigits(str: string): string {
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
 * Melipat karakter Katakana ke Hiragana (pembanding longgar)
 */
export function foldKatakanaToHiragana(str: string): string {
  if (!str) return '';
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // Katakana ァ (0x30A1) sampai ヶ (0x30F6) berjarak 0x60 dari Hiragana ぁ (0x3041) sampai ゖ (0x3096)
    if (code >= 0x30a1 && code <= 0x30f6) {
      out += String.fromCharCode(code - 0x60);
    } else {
      out += str[i];
    }
  }
  return out;
}

/**
 * Menghapus spasi dan tanda baca umum Jepang & Latin
 */
export function cleanPunctuationAndSpaces(str: string): string {
  if (!str) return '';
  return str.replace(/[\s\u3000。、！？.,!?~～\-—_–/\\()（）「」『』"':;`]/g, '');
}

export interface NormalizedResult {
  strict: string;
  loose: string;
}

/**
 * Menormalisasi teks jawaban:
 * - NFKC
 * - Hapus spasi dan tanda baca
 * - Konversi angka kanji ke digit
 * - Lowercase untuk alfabet latin
 * - Pembanding longgar (Katakana -> Hiragana)
 */
export function normalizeAnswer(text: string): NormalizedResult {
  if (!text) return { strict: '', loose: '' };
  let str = String(text).normalize('NFKC').trim().toLowerCase();
  str = cleanPunctuationAndSpaces(str);
  str = kanjiToDigits(str);

  const strict = str;
  const loose = foldKatakanaToHiragana(strict);

  return { strict, loose };
}

/**
 * Memeriksa apakah jawaban user cocok dengan salah satu accepted answer (jp_answers)
 * Menguji kecocokan secara ketat (strict) maupun longgar (loose Katakana->Hiragana)
 * Termasuk toleransi varian '私' vs 'わたし'.
 */
export function checkAnswerMatch(userAnswer: string, acceptedAnswers: string[]): boolean {
  if (!userAnswer || !acceptedAnswers || acceptedAnswers.length === 0) return false;

  const userNorm = normalizeAnswer(userAnswer);
  if (!userNorm.strict && !userNorm.loose) return false;

  // Siapkan varian toleransi 私 <-> わたし untuk user answer
  const userVariants = [userNorm];
  if (userNorm.strict.includes('私')) {
    userVariants.push(normalizeAnswer(userAnswer.replace(/私/g, 'わたし')));
  }
  if (userNorm.strict.includes('わたし')) {
    userVariants.push(normalizeAnswer(userAnswer.replace(/わたし/g, '私')));
  }

  // Toleransi partikel topik: pembelajar sering mengetik romaji 'wa' -> 'わ', padahal partikel ditulis 'は'
  if (userNorm.strict.includes('わ')) {
    const waReplaced = userAnswer
      .replace(/わたし/g, '__WATASHI__')
      .replace(/わ/g, 'は')
      .replace(/__WATASHI__/g, 'わたし');
    userVariants.push(normalizeAnswer(waReplaced));
    userVariants.push(normalizeAnswer(waReplaced.replace(/わたし/g, '私')));
  }

  for (const acc of acceptedAnswers) {
    const accNorm = normalizeAnswer(acc);
    const accLooseNoChouon = accNorm.loose.replace(/ー/g, '');
    for (const uv of userVariants) {
      const uvLooseNoChouon = uv.loose.replace(/ー/g, '');
      if (
        uv.strict === accNorm.strict || 
        uv.loose === accNorm.loose ||
        (uvLooseNoChouon && uvLooseNoChouon === accLooseNoChouon)
      ) {
        return true;
      }
    }
  }

  return false;
}
