// src/composables/battleground/useSentenceUnits.ts
import { computed, type Ref } from 'vue';
import { toRomaji } from 'wanakana';

export interface Unit {
  kana: string;
  acceptedRomaji: string[];
}

export interface ActiveSentenceDef {
  id?: string;
  japanese: string;
  romaji_variants: string[][];
  word_spans?: number[] | null;
  meaning?: string;
}

const yoonSmallKana = ['ゃ','ゅ','ょ','ぁ','ぃ','ぅ','ぇ','ぉ','ャ','ュ','ョ','ァ','ィ','ゥ','ェ','ォ'];
const isSokuon = (c: string) => c === 'っ' || c === 'ッ';

export function parseSentenceToUnits(sentence: ActiveSentenceDef | null): Unit[] {
  if (!sentence) return [];

  const japanese = sentence.japanese;
  const variants: string[][] = sentence.romaji_variants || [];
  const wordSpans: number[] | null = sentence.word_spans ?? null;
  const result: Unit[] = [];

  if (wordSpans && wordSpans.length > 0) {
    let charIdx = 0;
    let vIdx = 0;

    for (const span of wordSpans) {
      if (vIdx >= variants.length) break;
      const wordVariants = variants.slice(vIdx, vIdx + span);
      let wordCharCount = 0;
      for (let i = 0; i < wordVariants.length; i++) {
        const remaining = japanese.slice(charIdx + wordCharCount);
        const nextV = wordVariants[i + 1];
        const isNextU = nextV && nextV.some((r: string) => r === 'u');
        let matchedLen = 1;
        if (isSokuon(remaining[0])) {
          matchedLen = (remaining.length >= 3 && yoonSmallKana.includes(remaining[2])) ? 3 : 2;
        } else if (remaining.length >= 2 && yoonSmallKana.includes(remaining[1])) {
          if (remaining.length >= 3 && (remaining[2] === 'う' || remaining[2] === 'ウ') && !isNextU) matchedLen = 3;
          else matchedLen = 2;
        }
        wordCharCount += matchedLen;
      }
      const kana = japanese.slice(charIdx, charIdx + wordCharCount);
      charIdx += wordCharCount;
      vIdx += span;
      let combos: string[] = [''];
      for (const varOpts of wordVariants) {
        const next: string[] = [];
        const opts = varOpts.length > 0 ? varOpts : [toRomaji(kana)];
        for (const c of combos) for (const o of opts) next.push(c + o);
        combos = next;
      }
      result.push({ kana, acceptedRomaji: Array.from(new Set(combos)) });
    }
  } else {
    // Fallback: simple unit-per-variant
    let charIdx2 = 0;
    for (let vIdx = 0; vIdx < variants.length; vIdx++) {
      const v = variants[vIdx];
      if (charIdx2 >= japanese.length) break;
      const remaining = japanese.slice(charIdx2);
      let matchedLen = 1;
      const nextVar = variants[vIdx + 1];
      const isNextU = nextVar && nextVar.some((r: string) => r === 'u');
      if (isSokuon(remaining[0])) {
        matchedLen = (remaining.length >= 3 && yoonSmallKana.includes(remaining[2])) ? 3 : 2;
      } else if (remaining.length >= 2 && yoonSmallKana.includes(remaining[1])) {
        if ((remaining[2] === 'う' || remaining[2] === 'ウ') && !isNextU) matchedLen = 3;
        else matchedLen = 2;
      }
      const kana = remaining.slice(0, matchedLen);
      charIdx2 += matchedLen;
      const rawAccepted = v && v.length > 0 ? [...v] : [toRomaji(kana)];
      result.push({ kana, acceptedRomaji: rawAccepted });
    }
  }

  // Sanitize acceptedRomaji: remove stray '-' or 'ー' so dash never shows up in romaji display
  result.forEach(u => {
    u.acceptedRomaji = u.acceptedRomaji
      .map(r => r.replace(/[-ー]/g, ''))
      .filter(r => r.length > 0);
    if (u.acceptedRomaji.length === 0) u.acceptedRomaji = [''];
  });

  return result;
}

export function useSentenceUnits(sentenceRef: Ref<ActiveSentenceDef | null>) {
  const units = computed<Unit[]>(() => parseSentenceToUnits(sentenceRef.value));
  return { units };
}
