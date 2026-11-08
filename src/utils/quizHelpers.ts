// Quiz Helper Utilities & Romaji Normalization Engine
import { hiraganaData } from '../data/hiragana';
import { katakanaData } from '../data/katakana';
import { wordsData } from '../data/words';
import { kanjiN5Data } from '../data/kanji';
import { kanjiWritingEntriesMap } from '../data/kanjiWritingPrompts';
import * as wanakana from 'wanakana';

export const normalizeRomajiForComparison = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/\(.*?\)|（.*?）/g, '') // ignore optional parenthetical readings e.g. (どなた)
    .replace(/[^a-z0-9]/g, '') // ignore all spaces, punctuation, symbols, and hyphens
    .replace(/ha/g, 'wa')  // particle 'ha' and 'wa' normalized equally (watashi ha / watashi wa)
    .replace(/nn/g, 'n')  // normalize double n to single n
    .replace(/tsu/g, 'tu') // normalize tsu/tu
    .replace(/shi/g, 'si') // normalize shi/si
    .replace(/chi/g, 'ti') // normalize chi/ti
    .replace(/ji/g, 'zi')  // normalize ji/zi
    .replace(/ou/g, 'o')   // normalize long vowels ou -> o
    .replace(/oo/g, 'o')   // normalize long vowels oo -> o
    .replace(/sh/g, 'sy')  // normalize sha/sho/shu
    .replace(/ch/g, 'ty')  // normalize cha/cho/chu
    .replace(/j/g, 'zy');   // normalize ja/jo/ju
};

export const getLevenshteinDistance = (a: string, b: string): number => {
  const tmp: number[][] = [];
  let i: number, j: number;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
};

export const checkIsCorrect = (userInputClean: string, targetRomaji: string | string[]): boolean => {
  const targets = Array.isArray(targetRomaji) ? targetRomaji : [targetRomaji];
  return targets.some(t => {
    return normalizeRomajiForComparison(userInputClean) === normalizeRomajiForComparison(t);
  });
};

export const checkIsTypo = (userInputClean: string, targetRomaji: string | string[]): boolean => {
  if (!userInputClean || userInputClean.trim() === '') return false;
  // If the user's input already matches any valid romaji target, it is 100% correct, never a typo
  if (checkIsCorrect(userInputClean, targetRomaji)) return false;

  const targets = Array.isArray(targetRomaji) ? targetRomaji : [targetRomaji];
  const normUser = normalizeRomajiForComparison(userInputClean);
  if (!normUser) return false;

  return targets.some(t => {
    const normTarget = normalizeRomajiForComparison(t);
    if (!normTarget || normUser === normTarget) return false;
    const dist = getLevenshteinDistance(normUser, normTarget);
    return dist === 1;
  });
};

export const getQuestionCountFromDuration = (targetDurationMinutes: number, type: string = 'hiragana'): number => {
  if (type === 'kaiwa') {
    return 1; // 1 whole dialog
  }
  if (type === 'renshuu') {
    if (targetDurationMinutes <= 1) return 6;
    if (targetDurationMinutes <= 3) return 14;
    return 25;
  }
  if (['words', 'words_meaning', 'meaning_to_words', 'words_mixed', 'kanji'].includes(type)) {
    if (targetDurationMinutes <= 1) return 8;
    if (targetDurationMinutes <= 3) return 24;
    return 40;
  }
  if (targetDurationMinutes <= 1) return 16;
  if (targetDurationMinutes <= 3) return 48;
  return 78;
};

/**
 * Extracts multiple normalized candidate phrases from an Indonesian meaning string.
 * Handles synonyms separated by /, ;, or commas, as well as parenthesized notes.
 */
export const extractMeaningCandidates = (raw: string): string[] => {
  if (!raw) return [];
  const results = new Set<string>();

  const cleanBase = (s: string) => s
    .toLowerCase()
    .replace(/[~～.。!！?？\"'“”]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const addWithVariants = (s: string) => {
    const c = cleanBase(s);
    if (!c || c.length < 2) return;
    results.add(c);

    // Varian tanpa tanda koma / tanda baca koma jadi spasi
    const noComma = c.replace(/[,，、]/g, '').replace(/\s+/g, ' ').trim();
    if (noComma && noComma !== c && noComma.length >= 2) results.add(noComma);
    const commaToSpace = c.replace(/[,，、]/g, ' ').replace(/\s+/g, ' ').trim();
    if (commaToSpace && commaToSpace !== c && commaToSpace.length >= 2) results.add(commaToSpace);

    if (c.includes('-')) {
      results.add(cleanBase(c.replace(/-/g, ' ')));
      results.add(cleanBase(c.replace(/-/g, '')));
      // Reduplication support: e.g. "sendiri-sendiri" also accepts "sendiri"
      const parts = c.split('-');
      if (parts[0] && parts[0].length >= 3) {
        results.add(cleanBase(parts[0]));
      }
    }
  };

  // 1. Direct raw clean
  addWithVariants(raw);

  // 2. Remove parenthesized text
  const noParens = cleanBase(raw.replace(/\(.*?\)|（.*?）|\[.*?\]|【.*?】/g, ''));
  if (noParens) addWithVariants(noParens);

  // 3. Extract text inside parentheses as possible synonym or colon phrase
  const parenMatches = raw.match(/\((.*?)\)|（(.*?)）|\[(.*?)\]|【.*?】/g);
  if (parenMatches) {
    for (const m of parenMatches) {
      const inner = m.slice(1, -1);
      if (inner.includes(':')) {
        const afterColon = inner.split(':')[1];
        if (afterColon) addWithVariants(afterColon);
      } else if (
        !inner.includes('dekat') && 
        !inner.includes('sebagai') && 
        !inner.includes('sopan') && 
        !inner.includes('profesi') && 
        inner.length < 30
      ) {
        addWithVariants(inner);
      }
    }
  }

  // 4. Split by primary delimiters: /, ;, \n, or ' atau '
  const primaryChunks = (str: string) => {
    return str.split(/[/;\n]| atau /i).map(s => s.trim()).filter(Boolean);
  };

  const chunks1 = primaryChunks(raw);
  const chunks2 = noParens ? primaryChunks(noParens) : [];
  const allPrimary = Array.from(new Set([...chunks1, ...chunks2]));

  for (const chunk of allPrimary) {
    addWithVariants(chunk);
    const chunkNoParen = chunk.replace(/\(.*?\)|（.*?）|\[.*?\]|【.*?】/g, '').trim();
    if (chunkNoParen) addWithVariants(chunkNoParen);

    // Bila chunk memuat koma (misal: "bujangan, belum menikah" atau "Tidak, belum seberapa"),
    // selain frasa utuh, tambahkan juga sub-bagian yang dipisahkan koma
    if (chunk.includes(',')) {
      const subParts = chunk.split(',').map(s => s.trim()).filter(Boolean);
      for (const sp of subParts) {
        addWithVariants(sp);
        const spNoParen = sp.replace(/\(.*?\)|（.*?）|\[.*?\]|【.*?】/g, '').trim();
        if (spNoParen) addWithVariants(spNoParen);
      }
    }
  }

  // 5. Prefix distribution for conversational expressions with multiple alternatives
  // Misal: "Tidak, belum seberapa/masih belum memuaskan" -> "tidak, masih belum memuaskan", "tidak masih belum memuaskan"
  // "O, begitu / Begitu ya" -> "o, begitu ya", "o begitu ya"
  for (const chunk of allPrimary) {
    const prefixMatch = chunk.match(/^(tidak|bukan|o|oh|ya)[, ]\s*(.+)$/i);
    if (prefixMatch) {
      const prefix = prefixMatch[1];
      for (const other of allPrimary) {
        if (other !== chunk && !other.toLowerCase().startsWith(prefix.toLowerCase())) {
          addWithVariants(prefix + ', ' + other);
          addWithVariants(prefix + ' ' + other);
        }
      }
    }
  }

  return Array.from(results).filter(Boolean);
};

export const checkIsMeaningCorrect = (userInput: string, targetMeaning: string): boolean => {
  if (!userInput || !targetMeaning) return false;
  const cleanUser = userInput
    .toLowerCase()
    .replace(/[~～.。!！?？\"'“”]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanUser) return false;

  const candidates = extractMeaningCandidates(targetMeaning);
  if (candidates.some(c => c === cleanUser)) return true;

  const cleanUserNoHyphen = cleanUser.replace(/-/g, ' ');
  if (candidates.some(c => c === cleanUserNoHyphen)) return true;

  const cleanUserNoComma = cleanUser.replace(/[,，、]/g, '').replace(/\s+/g, ' ').trim();
  if (cleanUserNoComma && candidates.some(c => c === cleanUserNoComma)) return true;

  const cleanUserCommaToSpace = cleanUser.replace(/[,，、]/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleanUserCommaToSpace && candidates.some(c => c === cleanUserCommaToSpace)) return true;

  return false;
};

export const checkIsMeaningTypo = (userInput: string, targetMeaning: string): boolean => {
  if (!userInput || !targetMeaning) return false;
  if (checkIsMeaningCorrect(userInput, targetMeaning)) return false;

  const cleanUser = userInput
    .toLowerCase()
    .replace(/[~～.。!！?？\"'“”]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanUser || cleanUser.length < 3) return false;

  const cleanUserNoComma = cleanUser.replace(/[,，、]/g, '').replace(/\s+/g, ' ').trim();
  const candidates = extractMeaningCandidates(targetMeaning);

  return candidates.some(c => {
    if (c.length >= 4) {
      if (getLevenshteinDistance(cleanUser, c) === 1) return true;
      const cNoComma = c.replace(/[,，、]/g, '').replace(/\s+/g, ' ').trim();
      if (cNoComma.length >= 4 && cleanUserNoComma.length >= 3) {
        if (getLevenshteinDistance(cleanUserNoComma, cNoComma) === 1) return true;
      }
    }
    return false;
  });
};

export const checkIsJapaneseCorrect = (
  userInput: string,
  word: { character: string; kana?: string; romaji: string | string[] }
): boolean => {
  if (!userInput || !word) return false;
  const rawClean = userInput.trim().replace(/[\s\u3000。、！？.,!?~～\-—_–/\\()（）「」『』\"':;\`]/g, '');
  if (!rawClean) return false;

  // Hanya perbolehkan tulisan Jepang (Kanji, Hiragana, Katakana) - BUKAN dalam Romaji (huruf Latin)
  if (/[a-zA-Z]/.test(rawClean)) {
    return false;
  }

  // 1. Direct character match (Kanji or Kana)
  const targetCharClean = word.character.replace(/[\s\u3000。、！？.,!?~～\-—_–/\\()（）「」『』\"':;\`]/g, '');
  if (rawClean === targetCharClean) return true;

  // 2. Direct Kana match (Hiragana or Katakana)
  if (word.kana) {
    const targetKanaClean = word.kana.replace(/[\s\u3000。、！？.,!?~～\-—_–/\\()（）「」『』\"':;\`]/g, '');
    if (rawClean === targetKanaClean) return true;
    if (wanakana.toHiragana(rawClean) === wanakana.toHiragana(targetKanaClean)) return true;
  }

  // 3. User input converted to Hiragana and compared with target Kana or Character
  const inputAsHiragana = wanakana.toHiragana(rawClean);
  if (word.kana && inputAsHiragana === word.kana) return true;
  if (inputAsHiragana === targetCharClean) return true;

  return false;
};

export const checkIsJapaneseTypo = (
  userInput: string,
  word: { character: string; kana?: string; romaji: string | string[] }
): boolean => {
  if (!userInput || userInput.trim() === '') return false;
  if (checkIsJapaneseCorrect(userInput, word)) return false;

  const rawClean = userInput.trim().replace(/[\s\u3000。、！？.,!?~～\-—_–/\\()（）「」『』\"':;\`]/g, '');
  if (!rawClean) return false;

  // Jika input masih berupa huruf latin / romaji, jangan anggap sebagai typo tulisan Jepang
  if (/[a-zA-Z]/.test(rawClean)) {
    return false;
  }

  // Check kana typo (jarak Levenshtein 1 pada hiragana)
  if (word.kana) {
    const inputHiragana = wanakana.toHiragana(rawClean);
    const targetHiragana = wanakana.toHiragana(word.kana);
    if (targetHiragana.length >= 3 && getLevenshteinDistance(inputHiragana, targetHiragana) === 1) {
      return true;
    }
  }

  return false;
};

export interface WrongModeInterceptResult {
  isWrongMode: boolean;
  message?: string;
}

/**
 * Smart Intercept: Mendeteksi apakah pengguna salah format jawaban (salah mode).
 * Misalnya di mode Jepang ➔ Arti Indonesia, pengguna tidak sengaja mengetik Romaji atau tulisan Jepang karena refleks.
 */
export const checkIsWrongModeInput = (
  userInput: string,
  questionType: string,
  question: {
    character: string;
    kana?: string;
    romaji: string | string[];
    meaning?: string;
  }
): WrongModeInterceptResult => {
  if (!userInput || !userInput.trim() || !question) {
    return { isWrongMode: false };
  }

  const rawInput = userInput.trim();
  const cleanUser = rawInput.toLowerCase();

  // 1. Mode words_meaning: Soal tulisan Jepang, target Arti Bahasa Indonesia
  if (questionType === 'words_meaning') {
    // Jika jawaban mendekati arti Indonesia (benar atau typo), biarkan diproses oleh evaluator skor biasa
    if (question.meaning) {
      if (checkIsMeaningCorrect(cleanUser, question.meaning)) {
        return { isWrongMode: false };
      }
      if (checkIsMeaningTypo(cleanUser, question.meaning)) {
        return { isWrongMode: false };
      }
    }

    // Cek apakah user malah mengetik Romaji yang tepat atau typo dari Romaji kata tersebut
    if (question.romaji) {
      if (checkIsCorrect(cleanUser, question.romaji) || checkIsTypo(cleanUser, question.romaji)) {
        return {
          isWrongMode: true,
          message: 'Kamu mengetik Romaji! Soal ini meminta Arti Bahasa Indonesia.'
        };
      }
    }

    // Cek apakah user mengetik pembacaan kana dalam romaji (misal kata berkanji tapi membaca kana)
    if (question.kana) {
      const kanaAsRomaji = normalizeRomajiForComparison(wanakana.toRomaji(question.kana));
      const userRomaji = normalizeRomajiForComparison(cleanUser);
      if (kanaAsRomaji && userRomaji && (userRomaji === kanaAsRomaji || getLevenshteinDistance(userRomaji, kanaAsRomaji) <= 1)) {
        return {
          isWrongMode: true,
          message: 'Kamu mengetik Romaji! Soal ini meminta Arti Bahasa Indonesia.'
        };
      }
    }

    // Cek apakah user mengetik dalam tulisan Jepang (Kanji atau Kana)
    if (checkIsJapaneseCorrect(rawInput, question) || checkIsJapaneseTypo(rawInput, question)) {
      return {
        isWrongMode: true,
        message: 'Kamu mengetik Bahasa Jepang! Soal ini meminta Arti Bahasa Indonesia.'
      };
    }
  }

  // 2. Mode words: Soal tulisan Jepang, target Romaji (cara baca Latin)
  if (questionType === 'words') {
    // Jika jawaban sudah romaji yang benar atau typo romaji, jangan dicegat
    if (question.romaji) {
      if (checkIsCorrect(cleanUser, question.romaji) || checkIsTypo(cleanUser, question.romaji)) {
        return { isWrongMode: false };
      }
    }

    // Cek apakah user malah mengetik arti bahasa Indonesianya
    if (question.meaning && checkIsMeaningCorrect(cleanUser, question.meaning)) {
      return {
        isWrongMode: true,
        message: 'Kamu mengetik Arti! Soal ini meminta Romaji (cara baca latin).'
      };
    }
  }

  // 3. Mode meaning_to_words: Soal Arti Indonesia, target tulisan Jepang
  if (questionType === 'meaning_to_words') {
    if (checkIsJapaneseCorrect(rawInput, question) || checkIsJapaneseTypo(rawInput, question)) {
      return { isWrongMode: false };
    }

    // Cek apakah user mengetik ulang arti bahasa Indonesianya
    if (question.meaning && checkIsMeaningCorrect(cleanUser, question.meaning)) {
      return {
        isWrongMode: true,
        message: 'Kamu mengetik Arti! Soal ini meminta Bahasa Jepang (Kanji/Kana).'
      };
    }
  }

  return { isWrongMode: false };
};

export const getFallbackLocalPool = (type: string, _level: string = 'basic'): any[] => {
  if (type === 'hiragana') {
    // Selalu return semua hiragana (basic + dakuten + combination)
    return hiraganaData;
  }
  if (type === 'katakana') {
    // Selalu return semua katakana (basic + dakuten + combination)
    return katakanaData;
  }
  if (type === 'mix') {
    return [...hiraganaData, ...katakanaData];
  }
  if (['words', 'words_meaning', 'meaning_to_words', 'words_mixed'].includes(type)) {
    return wordsData.filter(w => !!w.character && w.character.trim().length > 0);
  }
  if (type === 'kanji') {
    return kanjiN5Data;
  }
  return [];
};

export type MasteryTierKey = 'new' | 'learning' | 'mastered' | 'crown';

export const getTierFromStreak = (streak: number): MasteryTierKey => {
  if (streak >= 6) return 'crown';
  if (streak >= 3) return 'mastered';
  if (streak >= 1) return 'learning';
  return 'new';
};

export const buildRepeatedQuestion = (current: any): any => {
  let repeated = { ...current, questionReason: 'repeat', reasonLabel: 'Babak Perbaikan: Ulang Sampai Benar', isFirstAppearance: false };
  if (current.type === 'kanji') {
    const entry = kanjiWritingEntriesMap[current.character];
    if (entry && entry.prompts.length > 1) {
      const others = entry.prompts.filter(p => p.word !== current.fullWord);
      if (others.length > 0) {
        const newPrompt = others[Math.floor(Math.random() * others.length)];
        repeated = {
          ...repeated,
          romaji: newPrompt.targetKana,
          kana: newPrompt.fullKana,
          fullWord: newPrompt.word,
          prefixKana: newPrompt.prefixKana,
          targetKana: newPrompt.targetKana,
          suffixKana: newPrompt.suffixKana,
          meaning: newPrompt.meaning
        };
      }
    }
  }
  return repeated;
};

/**
 * Memeriksa apakah suatu teks mengandung setidaknya satu aksara Jepang (Hiragana, Katakana, atau Kanji).
 */
export const hasJapaneseCharacters = (text: string): boolean => {
  if (!text) return false;
  return /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(text);
};

/**
 * Memeriksa apakah suatu kosakata hanya tersusun dari huruf abjad Latin, angka, atau simbol non-Jepang (misal: 'JR', 'CD', 'ATM').
 */
export const isAlphabetOnlyWord = (text: string): boolean => {
  return !hasJapaneseCharacters(text);
};


