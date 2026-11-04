// src/services/kanjiInfoService.ts
import { supabase } from '../lib/supabaseClient';
import { 
  getMultipleStoredKanji, 
  setMultipleStoredKanji, 
  getAllStoredKanji,
  getStoredKanjiCount
} from '../lib/kanjiLocalDb';
import { wordsData } from '../data/words';
import { kanjiN5Data } from '../data/kanji';

const n5KanjiSet = new Set(kanjiN5Data.map(k => k.character));

/**
 * Normalisasi level JLPT: KANJIDIC2 memakai sistem lama 1-4 (4 = N5, 3 = N4, 2 = N3/N2, 1 = N1).
 * Sistem modern menggunakan skala N1 s/d N5.
 */
export function normalizeModernJlptLevel(rawJlpt: number | null | undefined, kanji?: string): number | null {
  if (kanji && n5KanjiSet.has(kanji)) {
    return 5;
  }
  if (!rawJlpt) return null;
  if (rawJlpt === 5) return 5;
  if (rawJlpt === 4) return 5;
  if (rawJlpt === 3) return 4;
  if (rawJlpt === 2) return 3;
  if (rawJlpt === 1) return 1;
  return rawJlpt;
}

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
  tier_rank?: number;
  meaning_en?: string;
  meaning: string[];
  on: string[];
  kun: string[];
  stroke_count: number | null;
  jlpt: number | null;
  grade?: number | null;
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
  source?: string;
  words?: KanjiWordContext[];
  updated_at?: string;
}

// L1 In-Memory Cache
const memoryCache = new Map<string, KanjiDetail>();

function mapRowToDetail(row: any): KanjiDetail {
  const meaningList = Array.isArray(row.meaning)
    ? row.meaning
    : (row.meaning_en ? row.meaning_en.split(',').map((s: string) => s.trim()) : []);

  return {
    kanji: row.kanji,
    tier: row.tier || 'basic',
    tier_rank: row.tier_rank ?? (row.tier === 'manual' ? 3 : (row.tier === 'ai' ? 2 : 1)),
    meaning_en: row.meaning_en || (meaningList.length > 0 ? meaningList.join(', ') : undefined),
    meaning: meaningList,
    on: Array.isArray(row.on_yomi) ? row.on_yomi : (Array.isArray(row.on_readings) ? row.on_readings : (Array.isArray(row.on) ? row.on : [])),
    kun: Array.isArray(row.kun_yomi) ? row.kun_yomi : (Array.isArray(row.kun_readings) ? row.kun_readings : (Array.isArray(row.kun) ? row.kun : [])),
    stroke_count: row.strokes ?? row.stroke_count ?? null,
    jlpt: normalizeModernJlptLevel(row.jlpt, row.kanji),
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
    source: row.source || undefined,
    words: Array.isArray(row.words) ? row.words : [],
    updated_at: row.updated_at || new Date().toISOString()
  };
}

/**
 * Fallback data minimal langsung dari words.ts saat offline dan kanji belum ada di cache.
 */
export function getMinimalFallbackDetail(kanji: string, targetWord?: string): KanjiDetail {
  const matched = (targetWord ? wordsData.find(w => w.character === targetWord && w.character.includes(kanji)) : null)
    || wordsData.find(w => w.character && w.character.includes(kanji));

  return {
    kanji,
    tier: 'basic',
    tier_rank: 1,
    meaning: matched?.meaning ? [matched.meaning] : ['Kosakata bahasa Jepang'],
    meaning_en: undefined,
    on: [],
    kun: [],
    stroke_count: null,
    jlpt: normalizeModernJlptLevel(null, kanji),
    components: [],
    source: 'words.ts',
    words: matched ? [{
      jp: matched.character,
      kana: matched.kana,
      meaning: matched.meaning,
      lesson: matched.lesson ? `Bab ${matched.lesson}` : undefined
    }] : [],
    updated_at: new Date().toISOString()
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
 * Prefetch semua kanji pada kata-kata di sesi / pelajaran aktif dengan 1 query .in('kanji', [...]).
 * Hasil disimpan di IndexedDB dengan kunci kanji dan field updated_at.
 */
export async function prefetchKanjiForSession(kanjiList: string[]): Promise<Record<string, KanjiDetail>> {
  if (!kanjiList || kanjiList.length === 0) return {};

  const uniqueKanji = Array.from(new Set(kanjiList.filter(k => k && /[\u4e00-\u9fff]/.test(k))));
  if (uniqueKanji.length === 0) return {};

  // 1. Muat dari IndexedDB / Memory
  const stored = await getMultipleStoredKanji(uniqueKanji);
  for (const [k, d] of Object.entries(stored)) {
    memoryCache.set(k, d);
  }

  // Jika device sedang offline, langsung gunakan cache lokal tanpa tunggu network timeout
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return stored;
  }

  // 2. Satu query .in('kanji', [...]) ke tabel public.kanjiinfo
  try {
    const { data, error } = await supabase
      .from('kanjiinfo')
      .select('*')
      .in('kanji', uniqueKanji);

    if (error) {
      console.warn('Gagal prefetch kanji dari Supabase:', error.message);
      return stored;
    }

    if (Array.isArray(data) && data.length > 0) {
      const fetchedDetails = data.map(mapRowToDetail);
      for (const d of fetchedDetails) {
        stored[d.kanji] = d;
        memoryCache.set(d.kanji, d);
      }
      await setMultipleStoredKanji(fetchedDetails);
    }
  } catch (err) {
    console.warn('Error saat prefetch kanji session:', err);
  }

  return stored;
}

/**
 * Ambil detail untuk beberapa kanji sekaligus dengan multi-tier cache:
 * L1 (Memory) -> L2 (IndexedDB Lokal) -> L3 (Supabase kanjiinfo).
 */
export async function getMultipleKanjiDetails(kanjiList: string[]): Promise<Record<string, KanjiDetail>> {
  if (!kanjiList || kanjiList.length === 0) return {};

  const validKanji = Array.from(new Set(kanjiList.filter(k => k && /[\u4e00-\u9fff]/.test(k))));
  if (validKanji.length === 0) return {};

  const result: Record<string, KanjiDetail> = {};
  const missingFromMemory: string[] = [];

  // 1. Cek L1 Memory
  for (const k of validKanji) {
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

  // Fast-path: bila offline, gunakan minimal fallback tanpa menunggu network timeout
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    for (const k of missingFromDb) {
      if (!result[k]) {
        result[k] = getMinimalFallbackDetail(k);
      }
    }
    return result;
  }

  // 3. Fetch L3 Supabase kanjiinfo
  try {
    const { data, error } = await supabase
      .from('kanjiinfo')
      .select('*')
      .in('kanji', missingFromDb);

    if (error) {
      console.warn('Gagal fetch kanji dari Supabase:', error.message);
      // Fallback minimal dari words.ts agar popup tidak error saat offline
      for (const k of missingFromDb) {
        if (!result[k]) {
          result[k] = getMinimalFallbackDetail(k);
        }
      }
      return result;
    }

    if (Array.isArray(data) && data.length > 0) {
      const fetchedDetails = data.map(mapRowToDetail);
      for (const d of fetchedDetails) {
        result[d.kanji] = d;
        memoryCache.set(d.kanji, d);
      }
      await setMultipleStoredKanji(fetchedDetails);
    }

    // Pastikan tidak ada yang null
    for (const k of missingFromDb) {
      if (!result[k]) {
        result[k] = getMinimalFallbackDetail(k);
      }
    }
  } catch (err) {
    console.error('Error saat fetch kanji dari remote:', err);
    for (const k of missingFromDb) {
      if (!result[k]) {
        result[k] = getMinimalFallbackDetail(k);
      }
    }
  }

  return result;
}

/**
 * Dapatkan data detail untuk satu kanji (L1 -> L2 -> L3).
 */
export async function getKanjiDetail(kanji: string): Promise<KanjiDetail | null> {
  if (!kanji || !/[\u4e00-\u9fff]/.test(kanji)) return null;
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
 * Muat kanji untuk target kanji tertentu (Stale-While-Revalidate: baca cache dulu, update di latar belakang).
 */
export async function loadKanjiInfo(
  kanjiList?: string[],
  onBackgroundUpdated?: (updated: Record<string, KanjiDetail>) => void
): Promise<Record<string, KanjiDetail>> {
  if (!kanjiList || kanjiList.length === 0) {
    const allStored = await getAllStoredKanji();
    for (const [k, v] of Object.entries(allStored)) {
      memoryCache.set(k, v);
    }
    return allStored;
  }

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

  // 2. Cek L2 Local DB (IndexedDB)
  if (missingFromMemory.length > 0) {
    const stored = await getMultipleStoredKanji(missingFromMemory);
    for (const k of missingFromMemory) {
      if (stored[k]) {
        result[k] = stored[k];
        memoryCache.set(k, stored[k]);
      }
    }
  }

  // 3. Fallback minimal dari words.ts untuk kanji yang belum dicache sama sekali
  for (const k of kanjiList) {
    if (!result[k]) {
      result[k] = getMinimalFallbackDetail(k);
    }
  }

  // Jika offline, skip background revalidation remote
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return result;
  }

  // 4. Background revalidation: fetch dari Supabase kanjiinfo dan perbarui cache
  (async () => {
    try {
      const { data, error } = await supabase
        .from('kanjiinfo')
        .select('*')
        .in('kanji', kanjiList);

      if (!error && Array.isArray(data) && data.length > 0) {
        const fetchedDetails = data.map(mapRowToDetail);
        const updated: Record<string, KanjiDetail> = {};
        for (const d of fetchedDetails) {
          memoryCache.set(d.kanji, d);
          result[d.kanji] = d;
          updated[d.kanji] = d;
        }
        await setMultipleStoredKanji(fetchedDetails);
        if (onBackgroundUpdated) {
          onBackgroundUpdated(updated);
        }
      }
    } catch {}
  })();

  return result;
}

/**
 * Sinkronkan seluruh 13.108 kanji (atau tier manual/ai) dari Supabase ke IndexedDB lokal.
 */
export async function syncAllKanjiToLocal(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('kanjiinfo')
      .select('*')
      .order('tier_rank', { ascending: false });

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
 * Simpan laporan penjelasan kanji ke tabel public.kanji_reports di Supabase.
 */
export async function reportKanjiExplanation(
  kanji: string, 
  note: string = ''
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Silakan login terlebih dahulu untuk mengirim laporan.' };
    }

    const { error } = await supabase
      .from('kanji_reports')
      .insert({
        user_id: user.id,
        kanji,
        note
      });

    if (error) {
      console.warn('Gagal menyimpan laporan kanji ke Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error saat reportKanjiExplanation:', err);
    return { success: false, error: err.message };
  }
}
