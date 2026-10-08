import { wordsData } from '../data/words';

export interface WordHint {
  japanese: string;
  kana: string;
  romaji?: string;
  meaning?: string;
}

export interface SentenceSegment {
  text: string;
  hint?: WordHint;
}

// Stopwords kata umum bahasa Indonesia yang tidak boleh dianggap sebagai vocab kotoba
const INDONESIAN_STOPWORDS = new Set([
  'ada', 'adalah', 'dan', 'atau', 'ke', 'dari', 'yang', 'pada', 'pun',
  'itu', 'ini', 'nya', 'kah', 'lah', 'tah', 'pun', 'juga', 'bukan', 'tidak'
]);

interface KeywordEntry {
  keyword: string;
  hint: WordHint;
}

// Cache kamus kata kunci terurut dari yang terpanjang
let cachedKeywords: KeywordEntry[] | null = null;

function buildKeywordDictionary(): KeywordEntry[] {
  if (cachedKeywords) return cachedKeywords;

  const map = new Map<string, WordHint>();

  // 1. Tambahan khusus demonstratives dan frasa lokasi yang sangat sering muncul di soal latihan
  const customPhrases: Array<{ phrase: string; hint: WordHint }> = [
    { phrase: 'di sana', hint: { japanese: 'あそこ', kana: 'あそこ', romaji: 'asoko', meaning: 'di sana' } },
    { phrase: 'di sini', hint: { japanese: 'ここ', kana: 'ここ', romaji: 'koko', meaning: 'di sini' } },
    { phrase: 'di situ', hint: { japanese: 'そこ', kana: 'そこ', romaji: 'soko', meaning: 'di situ' } },
    { phrase: 'di mana', hint: { japanese: 'どこ', kana: 'どこ', romaji: 'doko', meaning: 'di mana' } },
    { phrase: 'mana', hint: { japanese: 'どこ', kana: 'どこ', romaji: 'doko', meaning: 'mana' } },
    { phrase: 'sebelah sana', hint: { japanese: 'あちら', kana: 'あちら', romaji: 'achira', meaning: 'sebelah sana' } },
    { phrase: 'sebelah sini', hint: { japanese: 'こちら', kana: 'こちら', romaji: 'kochira', meaning: 'sebelah sini' } },
    { phrase: 'sebelah situ', hint: { japanese: 'そちら', kana: 'そちら', romaji: 'sochira', meaning: 'sebelah situ' } },
    { phrase: 'sebelah mana', hint: { japanese: 'どちら', kana: 'どちら', romaji: 'dochira', meaning: 'sebelah mana' } },
    { phrase: 'tempat ini', hint: { japanese: 'ここ', kana: 'ここ', romaji: 'koko', meaning: 'tempat ini' } },
    { phrase: 'tempat itu', hint: { japanese: 'そこ', kana: 'そこ', romaji: 'soko', meaning: 'tempat itu' } },
    { phrase: 'orang itu', hint: { japanese: 'あの人', kana: 'あのひと', romaji: 'ano hito', meaning: 'orang itu' } },
    { phrase: 'terima kasih', hint: { japanese: 'ありがとう', kana: 'ありがとう', romaji: 'arigatou', meaning: 'terima kasih' } },
    { phrase: 'selamat siang', hint: { japanese: 'こんにちは', kana: 'こんにちは', romaji: 'konnichiwa', meaning: 'selamat siang' } },
    { phrase: 'selamat pagi', hint: { japanese: 'おはようございます', kana: 'おはようございます', romaji: 'ohayou gozaimasu', meaning: 'selamat pagi' } },
    { phrase: 'selamat malam', hint: { japanese: 'こんばんは', kana: 'こんばんは', romaji: 'konbanwa', meaning: 'selamat malam' } },
    { phrase: 'sama-sama', hint: { japanese: 'どういたしまして', kana: 'どういたしまして', romaji: 'douitashimashite', meaning: 'sama-sama' } },
  ];

  for (const item of customPhrases) {
    map.set(item.phrase.toLowerCase(), item.hint);
  }

  // 2. Ekstrak dari wordsData (Minna no Nihongo Pelajaran 1-25)
  for (const word of wordsData) {
    if (!word.meaning) continue;

    const romajiStr = Array.isArray(word.romaji) ? word.romaji[0] : (word.romaji || '');
    const hint: WordHint = {
      japanese: word.character || word.kana,
      kana: word.kana,
      romaji: romajiStr,
      meaning: word.meaning,
    };

    // Bersihkan makna: split tanda koma, garis miring, titik koma
    const rawParts = word.meaning.split(/[,/;]/);
    for (let part of rawParts) {
      // Hapus kurung penjelas, tanda ~, strip, dll
      part = part.replace(/\([^)]*\)/g, '').replace(/[~～\-]/g, '').trim().toLowerCase();
      if (!part) continue;

      // Skip stopwords bahasa Indonesia umum yang bukan vocab spesifik
      if (INDONESIAN_STOPWORDS.has(part)) continue;

      // Filter panjang minimal jika bukan kata penting
      if (part.length < 2) continue;

      // Jika belum ada di map, tambahkan
      if (!map.has(part)) {
        map.set(part, hint);
      }
    }
  }

  // Ubah ke array dan urutkan berdasarkan panjang keyword (terpanjang dulu untuk greedy longest match)
  const list: KeywordEntry[] = [];
  for (const [keyword, hint] of map.entries()) {
    list.push({ keyword, hint });
  }

  list.sort((a, b) => b.keyword.length - a.keyword.length);
  cachedKeywords = list;
  return list;
}

// Demonstratives dan frasa lokasi kontekstual berdasarkan keterangan kurung penjelas (seperti jauh dari kita berdua)
const CONTEXTUAL_DEMONSTRATIVES: Array<{
  pattern: RegExp;
  hint: WordHint;
}> = [
  // 1. Tempat / Lokasi Jauh (asoko / achira)
  {
    pattern: /\b(tempat itu)\s*\((?:jauh[^)]*)\)/i,
    hint: { japanese: 'あそこ', kana: 'あそこ', romaji: 'asoko', meaning: 'tempat itu (jauh)' }
  },
  {
    pattern: /\b(di sana)\s*\((?:jauh[^)]*)\)/i,
    hint: { japanese: 'あそこ', kana: 'あそこ', romaji: 'asoko', meaning: 'di sana (jauh)' }
  },
  {
    pattern: /\b(sebelah sana)\s*\((?:jauh[^)]*)\)/i,
    hint: { japanese: 'あちら', kana: 'あちら', romaji: 'achira', meaning: 'sebelah sana (jauh)' }
  },
  {
    pattern: /\b(arah sana)\s*\((?:jauh[^)]*)\)/i,
    hint: { japanese: 'あちら', kana: 'あちら', romaji: 'achira', meaning: 'arah sana (jauh)' }
  },

  // 2. Tempat / Lokasi Dekat Lawan Bicara (soko / sochira)
  {
    pattern: /\b(tempat itu)\s*\((?:dekat lawan bicara[^)]*)\)/i,
    hint: { japanese: 'そこ', kana: 'そこ', romaji: 'soko', meaning: 'tempat itu (dekat lawan bicara)' }
  },
  {
    pattern: /\b(di situ)\s*\((?:dekat lawan bicara[^)]*)\)/i,
    hint: { japanese: 'そこ', kana: 'そこ', romaji: 'soko', meaning: 'di situ (dekat lawan bicara)' }
  },
  {
    pattern: /\b(sebelah situ)\s*\((?:dekat lawan bicara[^)]*)\)/i,
    hint: { japanese: 'そちら', kana: 'そちら', romaji: 'sochira', meaning: 'sebelah situ (dekat lawan bicara)' }
  },

  // 3. Benda / Kata Tunjuk 'itu' Jauh (are / ano hito)
  {
    pattern: /\b(benda itu|barang itu)\s*\((?:jauh[^)]*)\)/i,
    hint: { japanese: 'あれ', kana: 'あれ', romaji: 'are', meaning: 'itu (jauh)' }
  },
  {
    pattern: /\b(orang itu)\s*\((?:jauh[^)]*)\)/i,
    hint: { japanese: 'あの人', kana: 'あのひと', romaji: 'ano hito', meaning: 'orang itu (jauh)' }
  },
  {
    pattern: /\b(itu)\s*\((?:jauh[^)]*)\)/i,
    hint: { japanese: 'あれ', kana: 'あれ', romaji: 'are', meaning: 'itu (jauh)' }
  },

  // 4. Benda / Kata Tunjuk 'itu' Dekat Lawan Bicara (sore)
  {
    pattern: /\b(benda itu|barang itu)\s*\((?:dekat lawan bicara[^)]*)\)/i,
    hint: { japanese: 'それ', kana: 'それ', romaji: 'sore', meaning: 'itu (dekat lawan bicara)' }
  },
  {
    pattern: /\b(itu)\s*\((?:dekat lawan bicara[^)]*)\)/i,
    hint: { japanese: 'それ', kana: 'それ', romaji: 'sore', meaning: 'itu (dekat lawan bicara)' }
  }
];

/**
 * Memecah kalimat bahasa Indonesia menjadi segmen teks biasa dan segmen kata yang memiliki hint.
 * Menggunakan longest-match greedy tokenization.
 */
export function tokenizeSentenceWithHints(sentence: string): SentenceSegment[] {
  if (!sentence || typeof sentence !== 'string') {
    return [{ text: sentence || '' }];
  }

  const length = sentence.length;

  // Track matched ranges: [start, end, hint]
  interface MatchRange {
    start: number;
    end: number;
    hint: WordHint;
  }

  const matches: MatchRange[] = [];
  const occupied = new Array<boolean>(length).fill(false);

  // 1. Ekstrak demonstratives kontekstual dengan catatan kurung terlebih dahulu
  // Contoh: "tempat itu (jauh dari kita berdua)" -> "tempat itu" = あそこ (asoko)
  for (const rule of CONTEXTUAL_DEMONSTRATIVES) {
    const rx = new RegExp(rule.pattern.source, 'gi');
    let m: RegExpExecArray | null;
    while ((m = rx.exec(sentence)) !== null) {
      const matchedWord = m[1];
      const startIdx = m.index + m[0].indexOf(matchedWord);
      const endIdx = startIdx + matchedWord.length;

      let canPlace = true;
      for (let i = startIdx; i < endIdx; i++) {
        if (occupied[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        matches.push({ start: startIdx, end: endIdx, hint: rule.hint });
        for (let i = startIdx; i < endIdx; i++) {
          occupied[i] = true;
        }
      }
    }
  }

  // 2. Keterangan di dalam kurung seperti (jauh dari kita berdua) adalah catatan konteks,
  // tandai occupied agar teks di dalam kurung tidak di-highlight sebagai kata kalimat yang diterjemahkan
  const parenRegex = /\([^)]*\)/g;
  let parenMatch: RegExpExecArray | null;
  while ((parenMatch = parenRegex.exec(sentence)) !== null) {
    for (let i = parenMatch.index; i < parenMatch.index + parenMatch[0].length; i++) {
      occupied[i] = true;
    }
  }

  // 3. Ekstrak sisa kata kunci dari kamus umum (longest-match greedy)
  const keywords = buildKeywordDictionary();
  const lowerSentence = sentence.toLowerCase();

  for (const { keyword, hint } of keywords) {
    const kLen = keyword.length;
    let pos = 0;

    while (pos <= length - kLen) {
      const idx = lowerSentence.indexOf(keyword, pos);
      if (idx === -1) break;

      const endIdx = idx + kLen;

      // Pastikan word boundary yang wajar (tidak memotong di tengah-tengah kata alfabet)
      const prevChar = idx > 0 ? lowerSentence[idx - 1] : ' ';
      const nextChar = endIdx < length ? lowerSentence[endIdx] : ' ';

      const isPrevWordChar = /[a-z0-9]/.test(prevChar);
      const isNextWordChar = /[a-z0-9]/.test(nextChar);

      // Cek apakah rentang ini belum ditempati match yang lebih panjang
      let canPlace = !isPrevWordChar && !isNextWordChar;
      if (canPlace) {
        for (let i = idx; i < endIdx; i++) {
          if (occupied[i]) {
            canPlace = false;
            break;
          }
        }
      }

      if (canPlace) {
        matches.push({ start: idx, end: endIdx, hint });
        for (let i = idx; i < endIdx; i++) {
          occupied[i] = true;
        }
      }

      pos = idx + 1;
    }
  }

  // Urutkan matches berdasarkan posisi start
  matches.sort((a, b) => a.start - b.start);

  // Buat segmen akhir
  const segments: SentenceSegment[] = [];
  let currentIdx = 0;

  for (const m of matches) {
    if (m.start > currentIdx) {
      segments.push({
        text: sentence.slice(currentIdx, m.start),
      });
    }
    segments.push({
      text: sentence.slice(m.start, m.end),
      hint: m.hint,
    });
    currentIdx = m.end;
  }

  if (currentIdx < length) {
    segments.push({
      text: sentence.slice(currentIdx),
    });
  }

  return segments;
}
