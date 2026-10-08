// ============================================================
// Utilitas Character Diff untuk Menghasilkan Highlight Jawaban
// ============================================================

export interface CharDiffSegment {
  text: string;
  isCorrect: boolean;
}

/**
 * Menghitung diff karakter antara jawaban yang dimasukkan pengguna
 * dan kalimat target/jawaban yang benar menggunakan Longest Common Subsequence (LCS).
 * Karakter yang cocok diberi flag `isCorrect = true` (akan diwarnai biru/primary),
 * sedangkan karakter yang meleset/salah diberi `isCorrect = false` (tetap warna hitam tanpa outline).
 */
export function computeAnswerDiff(userAnswer: string, targetAnswer: string): CharDiffSegment[] {
  const u = String(userAnswer || '').trim();
  const t = String(targetAnswer || '').trim();
  if (!u) return [];
  if (!t) return [{ text: u, isCorrect: false }];

  const m = u.length;
  const n = t.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (u[i - 1] === t[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Lacak indeks yang cocok di string user
  const matchedInUser = new Array<boolean>(m).fill(false);
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (u[i - 1] === t[j - 1]) {
      matchedInUser[i - 1] = true;
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  // Kelompokkan karakter yang bersebelahan
  const segments: CharDiffSegment[] = [];
  let currText = '';
  let currCorrect = matchedInUser[0];

  for (let k = 0; k < m; k++) {
    if (matchedInUser[k] === currCorrect) {
      currText += u[k];
    } else {
      if (currText) {
        segments.push({ text: currText, isCorrect: currCorrect });
      }
      currText = u[k];
      currCorrect = matchedInUser[k];
    }
  }
  if (currText) {
    segments.push({ text: currText, isCorrect: currCorrect });
  }

  return segments;
}
