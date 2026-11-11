// src/services/kanjiWorksheetService.ts
import { kanjiN5Data, kanjiGroups, type JapaneseKanji } from '../data/kanji';
import { kanjiN4Data, kanjiN4Groups, type JapaneseKanjiN4 } from '../data/kanjiN4';
import { wordsData } from '../data/words';
import { resolveCharacter } from './strokeDataService';

export interface WorksheetKanjiItem {
  character: string;
  index: number;
  meaning: string;
  onyomi: string[];
  kunyomi: string[];
  formattedKun: string;
  formattedOn: string;
  examples: string[];
  strokes?: string[];
  group?: string;
  groupLabel?: string;
  jlpt: number;
}

/**
 * Format daftar Kunyomi agar rapi dengan titik okurigana diganti simbol tengah (・).
 * Misal: ['わる.い', 'わる-'] -> 'わる・い'
 */
export function formatKunyomi(kunList: string[]): string {
  if (!kunList || kunList.length === 0) return '-';
  const cleanList = kunList
    .filter(k => !k.startsWith('-') && !k.endsWith('-'))
    .map(k => k.replace(/\./g, '・').trim())
    .filter(k => k.length > 0);
  
  const unique = Array.from(new Set(cleanList));
  if (unique.length === 0) {
    return kunList[0]?.replace(/[\.-]/g, '・') || '-';
  }
  return unique.slice(0, 3).join('、 ');
}

/**
 * Format daftar Onyomi dalam Katakana.
 * Misal: ['イチ', 'イツ'] -> 'イチ、 イツ'
 */
export function formatOnyomi(onList: string[]): string {
  if (!onList || onList.length === 0) return '-';
  const cleanList = onList
    .map(o => o.trim())
    .filter(o => o.length > 0);
  
  const unique = Array.from(new Set(cleanList));
  if (unique.length === 0) return '-';
  return unique.slice(0, 3).join('、 ');
}

/**
 * Bentuk contoh kata / kalimat dengan tanda kurung bacaan yang sudah terisi lengkap.
 * Mengutamakan kata dari wordsData (Minna no Nihongo) yang memuat kanji ini,
 * atau memformat contoh dari dataset kanji dengan menambahkan bacaan di dalam kurung.
 */
export function formatKanjiExamples(
  char: string, 
  rawExamples: string[] = [], 
  kunyomi: string[] = [], 
  onyomi: string[] = []
): string[] {
  const result: string[] = [];

  // 1. Cari kosakata Minna no Nihongo di wordsData yang memuat karakter kanji ini
  const matchedWords = wordsData.filter(w => w.character && w.character.includes(char));
  for (const w of matchedWords) {
    if (result.length >= 2) break;
    // Format: "漢字(かんじ) [Arti]"
    if (w.character === w.kana) {
      result.push(`${w.character} [${w.meaning}]`);
    } else {
      result.push(`${w.character}(${w.kana}) [${w.meaning}]`);
    }
  }

  // 2. Jika belum cukup 2 contoh, gunakan rawExamples dari dataset kanji
  if (result.length < 2 && rawExamples && rawExamples.length > 0) {
    for (const ex of rawExamples) {
      if (result.length >= 2) break;
      // rawExamples biasanya berupa: "一つ (satu buah)" atau "悪い (buruk, jelek)"
      const match = ex.match(/^([^\(（]+)\s*[\(（]([^\)）]+)[\)）]/);
      if (match) {
        const kanjiPart = match[1].trim();
        const meaningPart = match[2].trim();
        
        // Cari pembacaan yang cocok dari kunyomi atau onyomi jika ada
        const cleanKun = (kunyomi[0] || '').replace(/[\.・-]/g, '');
        const cleanOn = onyomi[0] || '';
        const fallbackKana = cleanKun || cleanOn;
        
        if (fallbackKana && kanjiPart.length <= 3) {
          result.push(`${kanjiPart}(${fallbackKana}) [${meaningPart}]`);
        } else {
          result.push(`${kanjiPart} [${meaningPart}]`);
        }
      } else {
        result.push(ex);
      }
    }
  }

  // 3. Fallback jika sama sekali tidak ada contoh
  if (result.length === 0) {
    const reading = kunyomi[0] || onyomi[0] || '';
    if (reading) {
      result.push(`${char}(${reading.replace(/[\.・-]/g, '')})`);
    } else {
      result.push(`${char}`);
    }
  }

  return result;
}

/**
 * Cari label nama kelompok / bab
 */
export function getGroupLabel(category: 'kanji' | 'kanji_n4', groupKey: string): string {
  if (category === 'kanji') {
    const g = kanjiGroups.find(x => x.key === groupKey);
    return g ? g.label : groupKey;
  } else {
    const g = kanjiN4Groups.find(x => x.key === groupKey);
    return g ? g.label : groupKey;
  }
}

/**
 * Filter data kanji untuk dicetak pada lembar kerja
 */
export function filterKanjiForWorksheet(options: {
  category: 'kanji' | 'kanji_n4';
  group?: string; // 'all' atau key kelompok tertentu
  statusFilter?: string; // 'all' | 'new' | 'learning' | 'mastered' | 'crown'
  selectedKanjiList?: string[]; // kanji spesifik jika dipilih manual
  getMasteryTier?: (char: string) => string;
}): WorksheetKanjiItem[] {
  const { category, group = 'all', statusFilter = 'all', selectedKanjiList, getMasteryTier } = options;

  let rawList: (JapaneseKanji | JapaneseKanjiN4)[] = category === 'kanji' ? [...kanjiN5Data] : [...kanjiN4Data];

  // 1. Filter manual kanji jika ada daftar kanji yang dipilih spesifik
  if (selectedKanjiList && selectedKanjiList.length > 0) {
    const set = new Set(selectedKanjiList);
    rawList = rawList.filter(item => set.has(item.character));
  } else {
    // 2. Filter berdasarkan kelompok / bab
    if (group && group !== 'all') {
      rawList = rawList.filter(item => item.group === group);
    }

    // 3. Filter berdasarkan status penguasaan
    if (statusFilter && statusFilter !== 'all' && getMasteryTier) {
      rawList = rawList.filter(item => {
        const tier = getMasteryTier(item.character);
        return tier === statusFilter;
      });
    }
  }

  const jlptLevel = category === 'kanji' ? 5 : 4;

  return rawList.map((item, idx) => {
    const kunList = item.kunyomi || [];
    const onList = item.onyomi || [];
    return {
      character: item.character,
      index: idx + 1,
      meaning: item.meaning || '',
      onyomi: onList,
      kunyomi: kunList,
      formattedKun: formatKunyomi(kunList),
      formattedOn: formatOnyomi(onList),
      examples: formatKanjiExamples(item.character, item.examples, kunList, onList),
      group: item.group,
      groupLabel: item.group ? getGroupLabel(category, item.group) : undefined,
      jlpt: jlptLevel
    };
  });
}

/**
 * Pre-load SVG stroke data untuk kanji yang akan dicetak
 */
export async function loadWorksheetStrokeData(items: WorksheetKanjiItem[]): Promise<void> {
  const promises = items.map(async (item) => {
    if (item.strokes && item.strokes.length > 0) return;
    try {
      const data = await resolveCharacter(item.character);
      if (data && data.strokes && data.strokes.length > 0) {
        item.strokes = data.strokes;
      }
    } catch (e) {
      // Abaikan error jaringan jika offline, fallback font reguler
    }
  });

  await Promise.all(promises);
}
