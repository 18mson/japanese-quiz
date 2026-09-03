// Gojūon (五十音) Ordering & Visually Distanced Batching Engine

export interface GojuonBatch {
  id: string;
  name: string;
  items: any[];
}

// Gojūon row definitions by character
export const GOJUON_ROW_MAP: Record<string, string> = {
  // Hiragana (Basic)
  'あ': 'a', 'い': 'a', 'う': 'a', 'え': 'a', 'お': 'a',
  'か': 'ka', 'き': 'ka', 'く': 'ka', 'け': 'ka', 'こ': 'ka',
  'さ': 'sa', 'し': 'sa', 'す': 'sa', 'せ': 'sa', 'そ': 'sa',
  'た': 'ta', 'ち': 'ta', 'つ': 'ta', 'て': 'ta', 'と': 'ta',
  'な': 'na', 'に': 'na', 'ぬ': 'na', 'ね': 'na', 'の': 'na',
  'は': 'ha', 'ひ': 'ha', 'ふ': 'ha', 'へ': 'ha', 'ほ': 'ha',
  'ま': 'ma', 'み': 'ma', 'む': 'ma', 'め': 'ma', 'も': 'ma',
  'や': 'ya', 'ゆ': 'ya', 'よ': 'ya',
  'ら': 'ra', 'り': 'ra', 'る': 'ra', 'れ': 'ra', 'ろ': 'ra',
  'わ': 'wa', 'を': 'wa', 'ん': 'wa',

  // Hiragana (Dakuten & Handakuten)
  'が': 'ga', 'ぎ': 'ga', 'ぐ': 'ga', 'げ': 'ga', 'ご': 'ga',
  'ざ': 'za', 'じ': 'za', 'ず': 'za', 'ぜ': 'za', 'ぞ': 'za',
  'だ': 'da', 'ぢ': 'da', 'づ': 'da', 'で': 'da', 'ど': 'da',
  'ば': 'ba', 'び': 'ba', 'ぶ': 'ba', 'べ': 'ba', 'ぼ': 'ba',
  'ぱ': 'pa', 'ぴ': 'pa', 'ぷ': 'pa', 'ぺ': 'pa', 'ぽ': 'pa',

  // Katakana (Basic)
  'ア': 'a', 'イ': 'a', 'ウ': 'a', 'エ': 'a', 'オ': 'a',
  'カ': 'ka', 'キ': 'ka', 'ク': 'ka', 'ケ': 'ka', 'コ': 'ka',
  'サ': 'sa', 'シ': 'sa', 'ス': 'sa', 'セ': 'sa', 'ソ': 'sa',
  'タ': 'ta', 'チ': 'ta', 'ツ': 'ta', 'テ': 'ta', 'ト': 'ta',
  'ナ': 'na', 'ニ': 'na', 'ヌ': 'na', 'ネ': 'na', 'ノ': 'na',
  'ハ': 'ha', 'ヒ': 'ha', 'フ': 'ha', 'ヘ': 'ha', 'ホ': 'ha',
  'マ': 'ma', 'ミ': 'ma', 'ム': 'ma', 'メ': 'ma', 'モ': 'ma',
  'ヤ': 'ya', 'ユ': 'ya', 'ヨ': 'ya',
  'ラ': 'ra', 'リ': 'ra', 'ル': 'ra', 'レ': 'ra', 'ロ': 'ra',
  'ワ': 'wa', 'ヲ': 'wa', 'ン': 'wa',

  // Katakana (Dakuten & Handakuten)
  'ガ': 'ga', 'ギ': 'ga', 'グ': 'ga', 'ゲ': 'ga', 'ゴ': 'ga',
  'ザ': 'za', 'ジ': 'za', 'ズ': 'za', 'ゼ': 'za', 'ゾ': 'za',
  'ダ': 'da', 'ヂ': 'da', 'ヅ': 'da', 'デ': 'da', 'ド': 'da',
  'バ': 'ba', 'ビ': 'ba', 'ブ': 'ba', 'ベ': 'ba', 'ボ': 'ba',
  'パ': 'pa', 'ピ': 'pa', 'プ': 'pa', 'ペ': 'pa', 'ポ': 'pa',
};

// Visually ambiguous pairs that should not be in the exact same batch if possible
const VISUAL_CONFUSION_PAIRS: Array<[string, string]> = [
  ['シ', 'ツ'],
  ['ソ', 'ン'],
  ['さ', 'き'],
  ['ぬ', 'め'],
  ['ね', 'れ'],
  ['は', 'ほ'],
];

export const GOJUON_ROW_ORDER = [
  'a', 'ka', 'sa', 'ta', 'na',
  'ha', 'ma', 'ya', 'ra', 'wa',
  'ga', 'za', 'da', 'ba', 'pa',
  'other'
];

// Canonical kana list in standard curriculum order (Basic, Dakuten, Combination)
const CANONICAL_KANA_ORDER: Record<string, number> = {};

[
  // Hiragana Basic
  'あ', 'い', 'う', 'え', 'お',
  'か', 'き', 'く', 'け', 'こ',
  'さ', 'し', 'す', 'せ', 'そ',
  'た', 'ち', 'つ', 'て', 'と',
  'な', 'に', 'ぬ', 'ね', 'の',
  'は', 'ひ', 'ふ', 'へ', 'ほ',
  'ま', 'み', 'む', 'め', 'も',
  'や', 'ゆ', 'よ',
  'ら', 'り', 'る', 'れ', 'ろ',
  'わ', 'を', 'ん',

  // Hiragana Dakuten
  'が', 'ぎ', 'ぐ', 'げ', 'ご',
  'ざ', 'じ', 'ず', 'ぜ', 'ぞ',
  'だ', 'ぢ', 'づ', 'で', 'ど',
  'ば', 'び', 'ぶ', 'べ', 'ぼ',
  'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ',

  // Hiragana Combination
  'きゃ', 'きゅ', 'きょ',
  'しゃ', 'しゅ', 'しょ',
  'ちゃ', 'ちゅ', 'ちょ',
  'にゃ', 'にゅ', 'にょ',
  'ひゃ', 'ひゅ', 'ひょ',
  'みゃ', 'みゅ', 'みょ',
  'りゃ', 'りゅ', 'りょ',
  'ぎゃ', 'ぎゅ', 'ぎょ',
  'じゃ', 'じゅ', 'じょ',
  'びゃ', 'びゅ', 'びょ',
  'ぴゃ', 'ぴゅ', 'ぴょ',

  // Katakana Basic
  'ア', 'イ', 'ウ', 'エ', 'オ',
  'カ', 'キ', 'ク', 'ケ', 'コ',
  'サ', 'シ', 'ス', 'セ', 'ソ',
  'タ', 'チ', 'ツ', 'テ', 'ト',
  'ナ', 'ニ', 'ヌ', 'ネ', 'ノ',
  'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
  'マ', 'ミ', 'ム', 'メ', 'モ',
  'ヤ', 'ユ', 'ヨ',
  'ラ', 'リ', 'ル', 'レ', 'ロ',
  'ワ', 'ヲ', 'ン',

  // Katakana Dakuten
  'ガ', 'ギ', 'グ', 'ゲ', 'ゴ',
  'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ',
  'ダ', 'ヂ', 'ヅ', 'デ', 'ド',
  'バ', 'ビ', 'ブ', 'ベ', 'ボ',
  'パ', 'ピ', 'プ', 'ペ', 'ポ',

  // Katakana Combination
  'キャ', 'キュ', 'キョ',
  'シャ', 'シュ', 'ショ',
  'チャ', 'チュ', 'チョ',
  'ニャ', 'ニュ', 'ニョ',
  'ヒャ', 'ヒュ', 'ヒョ',
  'ミャ', 'ミュ', 'ミョ',
  'リャ', 'リュ', 'リョ',
  'ギャ', 'ギュ', 'ギョ',
  'ジャ', 'ジュ', 'ジョ',
  'ビャ', 'ビュ', 'ビョ',
  'ピャ', 'ピュ', 'ピョ',
].forEach((char, idx) => {
  CANONICAL_KANA_ORDER[char] = idx;
});

export const sortInGojuonOrder = <T extends { character: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const idxA = CANONICAL_KANA_ORDER[a.character] ?? 9999;
    const idxB = CANONICAL_KANA_ORDER[b.character] ?? 9999;
    if (idxA !== idxB) return idxA - idxB;
    return a.character.localeCompare(b.character);
  });
};

/**
 * Organizes an unlearned items pool into Gojūon ordered batches.
 * Enforces visual separation for easily confused pairs.
 */
export const buildGojuonBatches = (
  unlearnedPool: any[],
  targetBatchCount: number = 2
): GojuonBatch[] => {
  if (!unlearnedPool || unlearnedPool.length === 0) return [];

  // Group items by Gojūon row
  const rowGroups: Record<string, any[]> = {
    a: [], ka: [], sa: [], ta: [], na: [],
    ha: [], ma: [], ya: [], ra: [], wa: [],
    ga: [], za: [], da: [], ba: [], pa: [],
    other: []
  };

  unlearnedPool.forEach(item => {
    const row = GOJUON_ROW_MAP[item.character] || 'other';
    if (rowGroups[row]) {
      rowGroups[row].push(item);
    } else {
      rowGroups.other.push(item);
    }
  });

  // Flatten in Gojūon sequence order (Basic then Dakuten / Handakuten then Combination)
  const orderedList: any[] = [
    ...rowGroups.a, ...rowGroups.ka, ...rowGroups.sa, ...rowGroups.ta, ...rowGroups.na,
    ...rowGroups.ha, ...rowGroups.ma, ...rowGroups.ya, ...rowGroups.ra, ...rowGroups.wa,
    ...rowGroups.ga, ...rowGroups.za, ...rowGroups.da, ...rowGroups.ba, ...rowGroups.pa,
    ...rowGroups.other
  ];

  if (orderedList.length === 0) return [];

  // Ideal 5 items per batch for Gojūon rows
  const itemsPerBatch = 5;
  const actualBatchCount = Math.max(1, targetBatchCount);
  const rawBatches: any[][] = [];

  for (let i = 0; i < orderedList.length && rawBatches.length < actualBatchCount; i += itemsPerBatch) {
    const chunk = orderedList.slice(i, i + itemsPerBatch);
    if (chunk.length > 0) {
      rawBatches.push(chunk);
    }
  }

  // Adjust for visual interference: if both items of a confusion pair are in the same batch,
  // shift one item to the next batch if available.
  for (let b = 0; b < rawBatches.length - 1; b++) {
    const currentBatch = rawBatches[b];
    const nextBatch = rawBatches[b + 1];

    if (!nextBatch) continue;

    VISUAL_CONFUSION_PAIRS.forEach(([charA, charB]) => {
      const idxA = currentBatch.findIndex(item => item.character === charA);
      const idxB = currentBatch.findIndex(item => item.character === charB);

      if (idxA !== -1 && idxB !== -1) {
        // Shift charB to next batch
        const [movedItem] = currentBatch.splice(idxB, 1);
        nextBatch.unshift(movedItem);
      }
    });
  }

  // Consolidate any small trailing batch (< 3 items) into preceding batch
  for (let i = rawBatches.length - 1; i >= 1; i--) {
    if (rawBatches[i].length < 3) {
      rawBatches[i - 1].push(...rawBatches[i]);
      rawBatches.splice(i, 1);
    }
  }

  return rawBatches.map((batchItems, index) => ({
    id: `batch-${index + 1}`,
    name: `Gelombang ${index + 1} (${batchItems.length} Huruf)`,
    items: batchItems
  }));
};
