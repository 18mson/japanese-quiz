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
 * Melipat vokal panjang (chouonpu dan vokal kembar) untuk menyamakan ejaan romaji & katakana
 * Contoh: ちょこれえと / ちょこれーと -> ちょこれと, こおひい / こーひー -> こひ
 */
export function foldLongVowels(str: string): string {
  if (!str) return '';
  return str
    .replace(/ー/g, '')
    // e + え -> e
    .replace(/([えけせてねへめれげぜでべぺぇ])え/g, '$1')
    // o + お / う -> o
    .replace(/([おこそとのほもよろごぞどぼぽぉょ])(お|う)/g, '$1')
    // a + あ -> a
    .replace(/([あかさたなはまやらわがざだばぱぁゃゎ])あ/g, '$1')
    // i + い -> i
    .replace(/([いきしちにひみりぎじぢびぴぃ])い/g, '$1')
    // u + う -> u
    .replace(/([うくすつぬふむゆるぐずづぶぷぅゅ])う/g, '$1');
}

/**
 * Memeriksa apakah jawaban user cocok dengan salah satu accepted answer (jp_answers)
 * Menguji kecocokan secara ketat (strict) maupun longgar (loose Katakana->Hiragana)
 */
export const JP_MARKERS = [
  'ではありませんでした', 'じゃありませんでした',
  'ではありません', 'じゃありません',
  'でしたか', 'ましたか', 'でした', 'ました', 'ません', 'ましょう',
  'てください', 'ないでください', 'たいです', 'たくないです',
  'です', 'ます', 'から', 'まで', 'より', 'さん',
  'は', 'が', 'を', 'に', 'で', 'へ', 'と', 'も', 'か', 'ね', 'よ'
];

/**
 * Memecah kalimat Jepang menjadi potongan kata/token morfem
 * menggunakan partikel, penutup predikat, serta transisi aksara (Kanji/Katakana/Hiragana).
 */
export function tokenizeJapaneseMarkers(str: string): string[] {
  if (!str) return [];
  const sortedMarkers = [...JP_MARKERS].sort((a, b) => b.length - a.length);
  const markerPattern = sortedMarkers.join('|');
  const tokenRegex = new RegExp(
    `(${markerPattern}|[\\u4e00-\\u9faf]+|[\\u30a0-\\u30ffー]+|[a-zA-Z0-9]+|.)`,
    'g'
  );

  const rawMatches = str.match(tokenRegex) || [];
  const tokens: string[] = [];
  let buffer = '';

  for (const part of rawMatches) {
    if (sortedMarkers.includes(part)) {
      if (buffer) {
        tokens.push(buffer);
        buffer = '';
      }
      tokens.push(part);
    } else if (/^[\u4e00-\u9faf]+$/.test(part) || /^[\u30a0-\u30ffー]+$/.test(part)) {
      if (buffer) {
        tokens.push(buffer);
        buffer = '';
      }
      tokens.push(part);
    } else {
      buffer += part;
    }
  }
  if (buffer) {
    tokens.push(buffer);
  }

  return tokens.filter(t => t.trim().length > 0);
}

/**
 * Menghitung selisih token (Levenshtein distance pada array token)
 * untuk mendeteksi apakah hanya ada 1 kata/token yang salah.
 */
export function countTokenErrors(tokensA: string[], tokensB: string[]): number {
  const m = tokensA.length;
  const n = tokensB.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const a = foldKatakanaToHiragana(tokensA[i - 1]);
      const b = foldKatakanaToHiragana(tokensB[j - 1]);
      const cost = (a === b) ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,       // deletion
        dp[i][j - 1] + 1,       // insertion
        dp[i - 1][j - 1] + cost  // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Menghitung Levenshtein distance (jumlah edit/salah karakter) antara dua string.
 */
export function countCharErrors(strA: string, strB: string): number {
  const a = foldKatakanaToHiragana(strA);
  const b = foldKatakanaToHiragana(strB);
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = (a[i - 1] === b[j - 1]) ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,       // deletion
        dp[i][j - 1] + 1,       // insertion
        dp[i - 1][j - 1] + cost  // substitution
      );
    }
  }
  return dp[m][n];
}

export interface AnswerCheckResult {
  isMatch: boolean;
  isTolerance: boolean;
  matchedTarget?: string;
}

/**
 * Memeriksa kecocokan jawaban dengan rincian (exact vs toleransi 1 kata salah / <= 30% salah).
 */
export function checkAnswerWithDetails(
  userAnswer: string,
  acceptedAnswers: string[]
): AnswerCheckResult {
  if (!userAnswer || !acceptedAnswers || acceptedAnswers.length === 0) {
    return { isMatch: false, isTolerance: false };
  }

  const userNorm = normalizeAnswer(userAnswer);
  if (!userNorm.strict && !userNorm.loose) {
    return { isMatch: false, isTolerance: false };
  }

  // Siapkan varian toleransi 私 <-> わたし untuk user answer
  const userVariants = [userNorm];
  if (userNorm.strict.includes('私')) {
    userVariants.push(normalizeAnswer(userAnswer.replace(/私/g, 'わたし')));
  }
  if (userNorm.strict.includes('わたし')) {
    userVariants.push(normalizeAnswer(userAnswer.replace(/わたし/g, '私')));
  }

  // Toleransi partikel topik: 'わ' -> 'は'
  if (userNorm.strict.includes('わ')) {
    const waReplaced = userAnswer
      .replace(/わたし/g, '__WATASHI__')
      .replace(/わ/g, 'は')
      .replace(/__WATASHI__/g, 'わたし');
    userVariants.push(normalizeAnswer(waReplaced));
    userVariants.push(normalizeAnswer(waReplaced.replace(/わたし/g, '私')));
  }

  // Toleransi partikel objek: 'お' -> 'を'
  if (userNorm.strict.includes('お')) {
    userVariants.push(normalizeAnswer(userAnswer.replace(/お/g, 'を')));
  }

  // 1. Cek Exact & Phonetic Match
  for (const acc of acceptedAnswers) {
    const accNorm = normalizeAnswer(acc);
    const accLooseNoChouon = accNorm.loose.replace(/ー/g, '');
    const accFolded = foldLongVowels(accNorm.loose);

    for (const uv of userVariants) {
      const uvLooseNoChouon = uv.loose.replace(/ー/g, '');
      const uvFolded = foldLongVowels(uv.loose);

      if (
        uv.strict === accNorm.strict || 
        uv.loose === accNorm.loose ||
        (uvLooseNoChouon && uvLooseNoChouon === accLooseNoChouon) ||
        (uvFolded && uvFolded === accFolded)
      ) {
        return { isMatch: true, isTolerance: false, matchedTarget: acc };
      }
    }
  }

  // 2. Cek Toleransi: Boleh 1 Kata Salah ATAU Maksimal 30% dari Kalimat Salah
  const userTokens = tokenizeJapaneseMarkers(userNorm.strict);
  for (const acc of acceptedAnswers) {
    const accNorm = normalizeAnswer(acc);
    const accTokens = tokenizeJapaneseMarkers(accNorm.strict);

    // a. Toleransi berbasis token (kata): 1 kata salah ATAU <= 30% kata salah
    if (accTokens.length >= 2) {
      const tokenErrCount = countTokenErrors(userTokens, accTokens);
      const tokenErrRatio = tokenErrCount / accTokens.length;
      if (tokenErrCount === 1 || tokenErrRatio <= 0.30) {
        return { isMatch: true, isTolerance: true, matchedTarget: acc };
      }
    }

    // b. Toleransi berbasis karakter: <= 30% karakter salah
    if (accNorm.strict.length >= 4) {
      const charErrCount = countCharErrors(userNorm.strict, accNorm.strict);
      const charErrRatio = charErrCount / accNorm.strict.length;
      if (charErrRatio <= 0.30) {
        return { isMatch: true, isTolerance: true, matchedTarget: acc };
      }
    }
  }

  return { isMatch: false, isTolerance: false };
}

/**
 * Memeriksa apakah jawaban user cocok dengan salah satu accepted answer (jp_answers)
 * Menguji kecocokan secara ketat (strict) maupun longgar (loose Katakana->Hiragana)
 * Termasuk toleransi varian '私' vs 'わたし', partikel 'わ' vs 'は', vokal panjang,
 * dan toleransi 1 kata yang salah.
 */
export function checkAnswerMatch(userAnswer: string, acceptedAnswers: string[]): boolean {
  return checkAnswerWithDetails(userAnswer, acceptedAnswers).isMatch;
}

