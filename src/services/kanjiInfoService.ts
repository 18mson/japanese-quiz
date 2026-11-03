// src/services/kanjiInfoService.ts
import { supabase } from '../lib/supabaseClient';
import { 
  getMultipleStoredKanji, 
  setMultipleStoredKanji, 
  getAllStoredKanji,
  getStoredKanjiCount
} from '../lib/kanjiLocalDb';

export interface KanjiComponent {
  part: string;
  role?: 'meaning' | 'phonetic' | 'shape';
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
  tier: 'manual' | 'ai' | 'basic';
  meaning: string[];
  on: string[];
  kun: string[];
  stroke_count: number | null;
  jlpt: number | null;
  grade: number | null;
  formation_type?: 'pictograph' | 'ideograph_simple' | 'compound_meaning' | 'phono_semantic' | 'unknown';
  components: KanjiComponent[];
  etymology_id?: string;
  etymology_confidence?: 'established' | 'traditional' | 'uncertain';
  mnemonic_id?: string;
  note_id?: string;
  phonetic_part?: string | null;
  reading_hint?: string | null;
  claim_kind?: 'structure' | 'folk' | 'unknown';
  old_form?: string | null;
  words?: KanjiWordContext[];
}

// L1 In-Memory Cache
const memoryCache = new Map<string, KanjiDetail>();

function mapRowToDetail(row: any): KanjiDetail {
  return {
    kanji: row.kanji,
    tier: row.tier || 'basic',
    meaning: Array.isArray(row.meaning) ? row.meaning : [],
    on: Array.isArray(row.on_readings) ? row.on_readings : (Array.isArray(row.on) ? row.on : []),
    kun: Array.isArray(row.kun_readings) ? row.kun_readings : (Array.isArray(row.kun) ? row.kun : []),
    stroke_count: row.stroke_count ?? null,
    jlpt: row.jlpt ?? null,
    grade: row.grade ?? null,
    formation_type: row.formation_type || undefined,
    components: Array.isArray(row.components) ? row.components : [],
    etymology_id: row.etymology_id || undefined,
    etymology_confidence: row.etymology_confidence || undefined,
    mnemonic_id: row.mnemonic_id || undefined,
    note_id: row.note_id || undefined,
    phonetic_part: row.phonetic_part || null,
    reading_hint: row.reading_hint || null,
    claim_kind: row.claim_kind || undefined,
    old_form: row.old_form || null,
    words: Array.isArray(row.words) ? row.words : []
  };
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
 * Ambil detail untuk beberapa kanji sekaligus dengan multi-tier cache:
 * L1 (Memory) -> L2 (IndexedDB Lokal) -> L3 (Supabase kanji_catalog).
 */
export async function getMultipleKanjiDetails(kanjiList: string[]): Promise<Record<string, KanjiDetail>> {
  if (!kanjiList || kanjiList.length === 0) return {};

  const result: Record<string, KanjiDetail> = {};
  const missingFromMemory: string[] = [];

  // 1. Cek L1 Memory
  for (const k of kanjiList) {
    if (memoryCache.has(k)) {
      result[k] = memoryCache.get(k)!;
    } else {
      missingFromMemory.push(k);
    }
  }

  if (missingFromMemory.length === 0) {
    return result;
  }

  // 2. Cek L2 Local DB (IndexedDB)
  const stored = await getMultipleStoredKanji(missingFromMemory);
  const missingFromDb: string[] = [];

  for (const k of missingFromMemory) {
    if (stored[k]) {
      result[k] = stored[k];
      memoryCache.set(k, stored[k]);
    } else {
      missingFromDb.push(k);
    }
  }

  if (missingFromDb.length === 0) {
    return result;
  }

  // 3. Fetch L3 Supabase
  try {
    const { data, error } = await supabase
      .from('kanji_catalog')
      .select('*')
      .in('kanji', missingFromDb);

    if (error) {
      console.warn('Gagal fetch kanji dari Supabase:', error.message);
      return result;
    }

    if (Array.isArray(data) && data.length > 0) {
      const fetchedDetails = data.map(mapRowToDetail);
      for (const d of fetchedDetails) {
        result[d.kanji] = d;
        memoryCache.set(d.kanji, d);
      }
      // Simpan ke L2 IndexedDB secara asinkron
      await setMultipleStoredKanji(fetchedDetails);
    }
  } catch (err) {
    console.error('Error saat fetch kanji dari remote:', err);
  }

  return result;
}

/**
 * Dapatkan data detail untuk satu kanji (L1 -> L2 -> L3).
 */
export async function getKanjiDetail(kanji: string): Promise<KanjiDetail | null> {
  if (!kanji) return null;
  const res = await getMultipleKanjiDetails([kanji]);
  return res[kanji] || null;
}

/**
 * Dapatkan data detail untuk seluruh kanji dalam sebuah kata.
 */
export async function getWordKanjiDetails(word: string): Promise<KanjiDetail[]> {
  const kanjiList = extractKanjiFromWord(word);
  if (kanjiList.length === 0) return [];
  const detailsMap = await getMultipleKanjiDetails(kanjiList);
  return kanjiList.map(k => detailsMap[k]).filter(Boolean);
}

/**
 * Cek apakah sebuah kata mengandung kanji yang didukung.
 */
export async function wordContainsSupportedKanji(word: string): Promise<boolean> {
  const kanjiList = extractKanjiFromWord(word);
  return kanjiList.length > 0;
}

/**
 * Muat kanji untuk target kanji tertentu (atau dari local storage jika parameter kosong).
 */
export async function loadKanjiInfo(kanjiList?: string[]): Promise<Record<string, KanjiDetail>> {
  if (kanjiList && kanjiList.length > 0) {
    return getMultipleKanjiDetails(kanjiList);
  }

  // Jika tanpa parameter, muat data yang sudah tersimpan di lokal
  const allStored = await getAllStoredKanji();
  for (const [k, v] of Object.entries(allStored)) {
    memoryCache.set(k, v);
  }
  return allStored;
}

/**
 * Sinkronkan seluruh 591 kanji dari Supabase ke IndexedDB lokal HP/browser pengguna.
 * Dipanggil saat tombol "Sinkronisasi Cloud" di menu Profil ditekan.
 */
export async function syncAllKanjiToLocal(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('kanji_catalog')
      .select('*');

    if (error) {
      console.error('Gagal download katalog kanji dari Supabase:', error);
      return { success: false, count: 0, error: error.message };
    }

    if (Array.isArray(data) && data.length > 0) {
      const details = data.map(mapRowToDetail);
      for (const d of details) {
        memoryCache.set(d.kanji, d);
      }
      await setMultipleStoredKanji(details);
      const count = await getStoredKanjiCount();
      return { success: true, count };
    }

    return { success: true, count: 0 };
  } catch (err: any) {
    console.error('Error saat syncAllKanjiToLocal:', err);
    return { success: false, count: 0, error: err.message };
  }
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
