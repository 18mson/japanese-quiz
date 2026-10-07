import { FURIGANA_DICT } from './furiganaDict';

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
