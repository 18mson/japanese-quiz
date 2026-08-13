// Gojūon (五十音) Ordering & Visually Distanced Batching Engine

export interface GojuonBatch {
  id: string;
  name: string;
  items: any[];
}

// Gojūon row definitions by character
const GOJUON_ROW_MAP: Record<string, string> = {
  // Hiragana
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

  // Katakana
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
    other: []
  };

  unlearnedPool.forEach(item => {
    const row = GOJUON_ROW_MAP[item.character] || 'other';
    rowGroups[row].push(item);
  });

  // Flatten in Gojūon sequence order
  const orderedList: any[] = [
    ...rowGroups.a, ...rowGroups.ka, ...rowGroups.sa, ...rowGroups.ta, ...rowGroups.na,
    ...rowGroups.ha, ...rowGroups.ma, ...rowGroups.ya, ...rowGroups.ra, ...rowGroups.wa,
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
