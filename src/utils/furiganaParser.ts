import { FURIGANA_DICT } from './furiganaDict';
import { KANJI_DECOMPOSITION_MAP, type KanjiFuriganaUnit } from './kanjiDecompositionData';

export type { KanjiFuriganaUnit };

export interface FuriganaSegment {
  text: string;
  reading?: string;
  isRuby: boolean;
}

const KANJI_REGEX = /[\u4e00-\u9faf]/;

// Pre-sorted dictionary keys by length descending for greedy matching
const DICT_KEYS = Object.keys(FURIGANA_DICT).sort((a, b) => b.length - a.length);

/**
 * Memecah pasangan kata dan bacaan menjadi segmen-segmen
 * yang memisahkan okurigana di awal/akhir dari kanji inti.
 * Contoh: '食べます' & 'たべます' -> [ { text: '食', reading: 'た', isRuby: true }, { text: 'べます', isRuby: false } ]
 */
export function decomposeWordToSegments(word: string, reading: string): FuriganaSegment[] {
  if (!word || !reading) return [{ text: word || '', isRuby: false }];

  // Jika kata tidak memiliki kanji sama sekali, kembalikan teks biasa
  if (!KANJI_REGEX.test(word)) {
    return [{ text: word, isRuby: false }];
  }

  // Cari prefix kana yang sama di awal
  let start = 0;
  while (
    start < word.length &&
    start < reading.length &&
    word[start] === reading[start] &&
    !KANJI_REGEX.test(word[start])
  ) {
    start++;
  }

  // Cari suffix kana yang sama di akhir
  let endW = word.length - 1;
  let endR = reading.length - 1;
  while (
    endW >= start &&
    endR >= start &&
    word[endW] === reading[endR] &&
    !KANJI_REGEX.test(word[endW])
  ) {
    endW--;
    endR--;
  }

  const prefix = word.slice(0, start);
  const kanjiCore = word.slice(start, endW + 1);
  const readingCore = reading.slice(start, endR + 1);
  const suffix = word.slice(endW + 1);

  const segments: FuriganaSegment[] = [];
  if (prefix) {
    segments.push({ text: prefix, isRuby: false });
  }
  if (kanjiCore) {
    segments.push({
      text: kanjiCore,
      reading: readingCore,
      isRuby: true,
    });
  }
  if (suffix) {
    segments.push({ text: suffix, isRuby: false });
  }

  return segments;
}

/**
 * Memecah pasangan kata dan bacaan menjadi unit-unit per huruf kanji & kana
 * dengan furigana individual di atas setiap huruf kanji.
 * Contoh: '市役所' & 'しやくしょ' -> [
 *   { text: '市', reading: 'し', isKanji: true },
 *   { text: '役', reading: 'やく', isKanji: true },
 *   { text: '所', reading: 'しょ', isKanji: true }
 * ]
 */
export function decomposeWordToKanjiUnits(word: string, reading: string): KanjiFuriganaUnit[] {
  if (!word) return [];

  // 1. Cek kamus dekomposisi statis
  if (KANJI_DECOMPOSITION_MAP[word]) {
    return KANJI_DECOMPOSITION_MAP[word];
  }

  // 2. Jika tidak mengandung kanji, kembalikan sebagai non-kanji tunggal
  if (!KANJI_REGEX.test(word)) {
    return [{ text: word, isKanji: false }];
  }

  // 3. Fallback dinamis jika kata tidak terdaftar di kamus
  const segments = decomposeWordToSegments(word, reading);
  const units: KanjiFuriganaUnit[] = [];
  for (const seg of segments) {
    if (seg.isRuby) {
      if (seg.text.length === 1) {
        units.push({ text: seg.text, reading: seg.reading, isKanji: true });
      } else {
        const chars = [...seg.text];
        for (let i = 0; i < chars.length; i++) {
          units.push({
            text: chars[i],
            reading: i === 0 ? seg.reading : '',
            isKanji: KANJI_REGEX.test(chars[i])
          });
        }
      }
    } else {
      units.push({ text: seg.text, isKanji: false });
    }
  }
  return units;
}

/**
 * Mem-parse seluruh kalimat bahasa Jepang menjadi array FuriganaSegment.
 */
export function parseFuriganaSegments(sentence: string): FuriganaSegment[] {
  if (!sentence) return [];

  const rawSegments: FuriganaSegment[] = [];
  let i = 0;

  while (i < sentence.length) {
    let matched = false;

    // Greedy search terhadap kamus yang diurutkan dari kata terpanjang
    for (const key of DICT_KEYS) {
      if (sentence.startsWith(key, i)) {
        const reading = FURIGANA_DICT[key];
        const wordParts = decomposeWordToSegments(key, reading);
        rawSegments.push(...wordParts);
        i += key.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      rawSegments.push({ text: sentence[i], isRuby: false });
      i++;
    }
  }

  // Coalesce (gabungkan) karakter non-ruby berurutan agar DOM lebih rapi
  const merged: FuriganaSegment[] = [];
  for (const seg of rawSegments) {
    const last = merged[merged.length - 1];
    if (!seg.isRuby && last && !last.isRuby) {
      last.text += seg.text;
    } else {
      merged.push({ ...seg });
    }
  }

  return merged;
}

/**
 * Merender kalimat Jepang langsung menjadi HTML string dengan tag <ruby> dan <rt>.
 */
export function renderFuriganaHtml(sentence: string, rtClass = 'furigana-rt'): string {
  const segments = parseFuriganaSegments(sentence);
  let html = '';

  for (const seg of segments) {
    if (seg.isRuby && seg.reading) {
      html += `<ruby class="ruby-word">${seg.text}<rt class="${rtClass}">${seg.reading}</rt></ruby>`;
    } else {
      html += seg.text;
    }
  }

  return html;
}
