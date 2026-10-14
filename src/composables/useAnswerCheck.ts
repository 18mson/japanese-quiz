import readingsData from '../data/readings.json';

export interface AnswerCheckEvaluation {
  isMatch: boolean;
  isTolerance: boolean;
  distance: number;
  maxAllowedDistance: number;
  matchedTarget?: string;
  userKana: string;
  targetKana?: string;
}

// Urutkan kunci berdasarkan panjang karakter secara menurun agar frasa panjang dicocokkan lebih dulu
const sortedKanjiKeys = Object.keys(readingsData).sort((a, b) => b.length - a.length);

/**
 * Mengubah huruf Katakana menjadi Hiragana.
 */
export function katakanaToHiragana(text: string): string {
  return text.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

/**
 * Melakukan kanonisasi teks ke bentuk Kana murni:
 * 1. NFKC normalization
 * 2. Mengganti Kanji dengan bacaan Kana dari readings.json
 * 3. Mengubah Katakana ke Hiragana
 * 4. Menghapus tanda baca dan spasi
 */
export function canonicalizeToKana(text: string): string {
  if (!text) return '';
  let str = text.normalize('NFKC').trim();

  // Bersihkan tanda kutip dan tanda kurung
  str = str.replace(/[「」『』()（）\[\]]/g, '');

  // Ganti kanji berdasarkan readings.json
  for (const kanji of sortedKanjiKeys) {
    if (str.includes(kanji)) {
      const kana = (readingsData as Record<string, string>)[kanji];
      str = str.split(kanji).join(kana);
    }
  }

  // Lipat katakana ke hiragana
  str = katakanaToHiragana(str);

  // Bersihkan spasi dan tanda baca Jepang maupun Latin
  str = str.replace(/[。、！？\s\.,!?・~〜]/g, '');

  return str;
}

/**
 * Biaya substitusi berbobot antara dua karakter Jepang:
 * - Sama persis: 0
 * - Partikel umum (wa/ha, o/wo, e/he): 0.2
 * - Vokal panjang / tanda perpanjangan bunyi (ー vs vokal): 0.25
 * - Beda karakter umum: 1.0
 */
function getSubstitutionCost(c1: string, c2: string): number {
  if (c1 === c2) return 0;

  // Substitusi partikel umum
  const isWaHa = (c1 === 'は' && c2 === 'わ') || (c1 === 'わ' && c2 === 'は');
  const isOWo = (c1 === 'を' && c2 === 'お') || (c1 === 'お' && c2 === 'を');
  const isEHe = (c1 === 'へ' && c2 === 'え') || (c1 === 'え' && c2 === 'へ');
  if (isWaHa || isOWo || isEHe) {
    return 0.2;
  }

  // Chouonpu (ー) vs vokal panjang (あ、い、う、え、お)
  const isChouon =
    (c1 === 'ー' && 'あいうえお'.includes(c2)) ||
    (c2 === 'ー' && 'あいうえお'.includes(c1));
  const isOuVowel = (c1 === 'お' && c2 === 'う') || (c1 === 'う' && c2 === 'お');
  const isEiVowel = (c1 === 'え' && c2 === 'い') || (c1 === 'い' && c2 === 'え');
  if (isChouon || isOuVowel || isEiVowel) {
    return 0.25;
  }

  return 1.0;
}

/**
 * Menghitung Weighted Levenshtein Distance antara dua string Kana.
 */
export function calculateWeightedEditDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;

  if (m === 0) return n;
  if (n === 0) return m;

  // Inisialisasi matriks DP
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    const c1 = s1[i - 1];
    for (let j = 1; j <= n; j++) {
      const c2 = s2[j - 1];
      const cost = getSubstitutionCost(c1, c2);

      dp[i][j] = Math.min(
        dp[i - 1][j] + 1.0,        // Deletion
        dp[i][j - 1] + 1.0,        // Insertion
        dp[i - 1][j - 1] + cost    // Substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Batas toleransi jarak lolos: clamp(panjang * 0.12, 0.6, 3)
 */
export function calculateMaxAllowedDistance(length: number): number {
  return Math.min(3.0, Math.max(0.6, length * 0.12));
}

/**
 * useAnswerCheck Composable
 */
export function useAnswerCheck() {
  /**
   * Menilai jawaban pengguna terhadap daftar kunci jawaban yang diterima.
   * Batas lolos dihitung dengan rumus clamp(panjang * 0.12, 0.6, 3).
   */
  function check(userAnswer: string, acceptedAnswers: string[]): AnswerCheckEvaluation {
    if (!userAnswer || !acceptedAnswers || acceptedAnswers.length === 0) {
      return {
        isMatch: false,
        isTolerance: false,
        distance: Infinity,
        maxAllowedDistance: 0.6,
        userKana: ''
      };
    }

    const userKana = canonicalizeToKana(userAnswer);
    if (!userKana) {
      return {
        isMatch: false,
        isTolerance: false,
        distance: Infinity,
        maxAllowedDistance: 0.6,
        userKana: ''
      };
    }

    let minDistance = Infinity;
    let bestTarget = acceptedAnswers[0];
    let bestTargetKana = '';
    let bestMaxAllowed = 0.6;

    for (const target of acceptedAnswers) {
      const targetKana = canonicalizeToKana(target);
      if (!targetKana) continue;

      const maxAllowed = calculateMaxAllowedDistance(targetKana.length);
      const distance = calculateWeightedEditDistance(userKana, targetKana);

      if (distance < minDistance) {
        minDistance = distance;
        bestTarget = target;
        bestTargetKana = targetKana;
        bestMaxAllowed = maxAllowed;
      }

      // Jika cocok sempurna (0 distance), langsung kembalikan sukses
      if (distance === 0) {
        return {
          isMatch: true,
          isTolerance: false,
          distance: 0,
          maxAllowedDistance: maxAllowed,
          matchedTarget: target,
          userKana,
          targetKana
        };
      }
    }

    const isMatch = minDistance <= bestMaxAllowed;

    return {
      isMatch,
      isTolerance: isMatch && minDistance > 0,
      distance: minDistance,
      maxAllowedDistance: bestMaxAllowed,
      matchedTarget: isMatch ? bestTarget : undefined,
      userKana,
      targetKana: bestTargetKana
    };
  }

  return {
    check,
    canonicalizeToKana,
    calculateWeightedEditDistance,
    calculateMaxAllowedDistance
  };
}
