import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import wordsData from src/data/words.ts
const WORDS_TS = path.resolve(__dirname, '../../src/data/words.ts');
const content = fs.readFileSync(WORDS_TS, 'utf-8');

// Parse wordsData items
const wordRegex = /character:\s*'([^']+)'[^\n]+lesson:\s*'(Pelajaran\s+\d+)'/g;
let match;
const lessonWords = new Map();

while ((match = wordRegex.exec(content)) !== null) {
  const char = match[1];
  const lesson = match[2];
  const lNum = parseInt(lesson.replace('Pelajaran', '').trim(), 10);
  if (lNum >= 1 && lNum <= 8) {
    if (!lessonWords.has(lNum)) lessonWords.set(lNum, []);
    lessonWords.get(lNum).push(char);
  }
}

// Data loaders
const DATA_DIR = path.resolve(__dirname, 'data');
const manualData = JSON.parse(fs.readFileSync(path.resolve(DATA_DIR, 'manual_entries.json'), 'utf-8'));
const manualSet = new Set((manualData.entries || []).map(e => e.kanji));

const estData = JSON.parse(fs.readFileSync(path.resolve(DATA_DIR, 'established.json'), 'utf-8'));
const establishedSet = new Set(estData.kanji || []);

const picData = JSON.parse(fs.readFileSync(path.resolve(DATA_DIR, 'pictographs.json'), 'utf-8'));
const pictographsSet = new Set();
for (const list of Object.values(picData.kanji || {})) {
  for (const k of list) pictographsSet.add(k);
}

const oldData = JSON.parse(fs.readFileSync(path.resolve(DATA_DIR, 'old_forms.json'), 'utf-8'));
const oldFormsMap = new Map(Object.entries(oldData.pairs || {}));
const ambiguous = new Set(Object.keys(oldData.meta?.ambiguous || {}));

const factsList = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'out/facts.json'), 'utf-8'));
const factsMap = new Map(factsList.map(f => [f.kanji, f]));

// Extract unique kanji per lesson (and track first seen)
const seenKanji = new Set();
const reportPerLesson = [];

for (let l = 1; l <= 8; l++) {
  const words = lessonWords.get(l) || [];
  const uniqueInLesson = new Set();
  for (const w of words) {
    const kanjis = w.match(/[\u4e00-\u9fff]/g) || [];
    for (const k of kanjis) {
      if (!seenKanji.has(k)) {
        uniqueInLesson.add(k);
        seenKanji.add(k);
      }
    }
  }

  const listA = []; // manual/pictographs/established
  const listB = []; // punya old_form (butuh entri manual)
  const listC = []; // khusus "makna + makna" atau angka/bentuk tunggal (butuh keputusan)
  const listD = []; // kandidat Gemini (fonetik-semantik biasa)

  for (const k of uniqueInLesson) {
    const isManual = manualSet.has(k);
    const isPictograph = pictographsSet.has(k);
    const isEstablished = establishedSet.has(k);
    const hasOld = oldFormsMap.has(k) || ambiguous.has(k);
    const fact = factsMap.get(k);

    if (isManual || isPictograph || isEstablished) {
      listA.push(k);
    } else if (hasOld) {
      listB.push(k);
    } else {
      // Cek apakah angka / bentuk tunggal / compound meaning
      const isNumber = ['一','二','三','四','五','六','七','八','九','十','百','千','万'].includes(k);
      const isSingleShape = fact?.tree?.children?.length <= 1 || (fact?.components?.length <= 1);
      // Makna + makna check
      const hasPhonetic = !!fact?.phonetic_part || (fact?.phon_hints?.length > 0);

      if (isNumber || isSingleShape || !hasPhonetic) {
        listC.push(k);
      } else {
        listD.push(k);
      }
    }
  }

  reportPerLesson.push({
    lesson: l,
    total: uniqueInLesson.size,
    kanjis: Array.from(uniqueInLesson),
    listA,
    listB,
    listC,
    listD
  });
}

console.log(JSON.stringify(reportPerLesson, null, 2));
