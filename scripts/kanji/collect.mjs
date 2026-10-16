// scripts/kanji/collect.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORDS_PATH = path.resolve(__dirname, '../../src/data/words.ts');
const OUT_DIR = path.resolve(__dirname, 'out');
const OUT_FILE = path.resolve(OUT_DIR, 'collected.json');

export function collectKanjiFromWords() {
  const content = fs.readFileSync(WORDS_PATH, 'utf-8');
  const jsCode = content
    .replace('export interface JapaneseWord', '/*')
    .replace('export const wordsData: JapaneseWord[] =', '*/ const wordsData =') + '; return wordsData;';
  const wordsData = new Function(jsCode)();

  // Map: kanji -> { kanji, words: Array<{ jp, kana, meaning, lesson }> }
  const kanjiMap = new Map();

  for (const item of wordsData) {
    const charStr = item.character || '';
    // Rentang \u4e00-\u9fff, lewati 々 (\u3005)
    const matches = charStr.match(/[\u4e00-\u9fff]/g) || [];
    const uniqueInWord = new Set(matches);

    for (const kanji of uniqueInWord) {
      if (!kanjiMap.has(kanji)) {
        kanjiMap.set(kanji, {
          kanji,
          words: []
        });
      }
      const entry = kanjiMap.get(kanji);
      // Avoid duplicate words for the same kanji
      if (!entry.words.some(w => w.jp === item.character)) {
        entry.words.push({
          jp: item.character,
          kana: item.kana,
          meaning: item.meaning,
          lesson: item.lesson || ''
        });
      }
    }
  }

  // Sort by kanji character code for deterministic output
  const sortedEntries = Array.from(kanjiMap.values()).sort((a, b) => a.kanji.localeCompare(b.kanji, 'ja'));

  return {
    count: kanjiMap.size,
    kanjiList: sortedEntries
  };
}

// If run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const { count, kanjiList } = collectKanjiFromWords();
  fs.writeFileSync(OUT_FILE, JSON.stringify(kanjiList, null, 2), 'utf-8');

  console.log(`✅ Berhasil mengumpulkan kanji dari words.ts`);
  console.log(`📊 Jumlah kanji unik: ${count}`);
  console.log(`💾 Disimpan ke: ${OUT_FILE}`);
}
