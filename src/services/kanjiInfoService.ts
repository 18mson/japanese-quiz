// src/services/kanjiInfoService.ts

export interface KanjiComponent {
  part: string;
  role: 'meaning' | 'phonetic' | 'shape';
  meaning_id: string;
}

export interface KanjiWordContext {
  jp: string;
  kana: string;
  meaning: string;
  lesson?: string;
}

export interface KanjiDetail {
  kanji: string;
  meaning: string[];
  on: string[];
  kun: string[];
  stroke_count: number | null;
  jlpt: number | null;
  grade: number | null;
  formation_type: 'pictograph' | 'ideograph_simple' | 'compound_meaning' | 'phono_semantic' | 'unknown';
  components: KanjiComponent[];
  etymology_id: string;
  etymology_confidence: 'established' | 'traditional' | 'uncertain';
  mnemonic_id: string;
  note_id?: string;
  words?: KanjiWordContext[];
}

let cachedKanjiInfo: Record<string, KanjiDetail> | null = null;
let loadPromise: Promise<Record<string, KanjiDetail>> | null = null;

/**
 * Muat LAZY lewat dynamic import saat popup dibuka pertama kali.
 * Memastikan data kanjiInfo tidak masuk ke initial bundle utama.
 */
export async function loadKanjiInfo(): Promise<Record<string, KanjiDetail>> {
  if (cachedKanjiInfo) {
    return cachedKanjiInfo;
  }
  if (!loadPromise) {
    loadPromise = import('../data/kanjiInfo.json')
      .then((module) => {
        cachedKanjiInfo = (module.default || module) as Record<string, KanjiDetail>;
        return cachedKanjiInfo;
      })
      .catch((err) => {
        console.error('Gagal memuat kanjiInfo.json secara lazy:', err);
        cachedKanjiInfo = {};
        return cachedKanjiInfo;
      });
  }
  return loadPromise;
}

/**
 * Ekstrak semua kanji unik dari sebuah string kata (rentang \u4e00-\u9fff, abaikan 々).
 */
export function extractKanjiFromWord(word: string): string[] {
  if (!word) return [];
  const matches = word.match(/[\u4e00-\u9fff]/g) || [];
  return Array.from(new Set(matches));
}

/**
 * Cek apakah sebuah kata mengandung kanji yang didukung.
 */
export async function wordContainsSupportedKanji(word: string): Promise<boolean> {
  const kanjiList = extractKanjiFromWord(word);
  if (kanjiList.length === 0) return false;
  const data = await loadKanjiInfo();
  return kanjiList.some((k) => !!data[k]);
}

/**
 * Dapatkan data detail untuk satu kanji.
 */
export async function getKanjiDetail(kanji: string): Promise<KanjiDetail | null> {
  const data = await loadKanjiInfo();
  return data[kanji] || null;
}

/**
 * Dapatkan data detail untuk seluruh kanji dalam sebuah kata.
 */
export async function getWordKanjiDetails(word: string): Promise<KanjiDetail[]> {
  const kanjiList = extractKanjiFromWord(word);
  if (kanjiList.length === 0) return [];
  const data = await loadKanjiInfo();
  return kanjiList.map((k) => data[k]).filter(Boolean) as KanjiDetail[];
}

/**
 * Simpan laporan penjelasan kanji ke localStorage 'kanji_reports' (maks 100 entri).
 */
export function reportKanjiExplanation(kanji: string): { success: boolean; totalReports: number } {
  try {
    const STORAGE_KEY = 'kanji_reports';
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: Array<{ kanji: string; ts: number }> = [];
    if (raw) {
      try {
        list = JSON.parse(raw);
        if (!Array.isArray(list)) list = [];
      } catch {
        list = [];
      }
    }

    list.unshift({ kanji, ts: Date.now() });
    // Batas maks 100 entri
    if (list.length > 100) {
      list = list.slice(0, 100);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return { success: true, totalReports: list.length };
  } catch (err) {
    console.error('Gagal menyimpan laporan kanji:', err);
    return { success: false, totalReports: 0 };
  }
}
