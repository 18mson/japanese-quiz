// src/lib/kanjiLocalDb.ts
import type { KanjiDetail } from '../services/kanjiInfoService';

const DB_NAME = 'nihongo_master_kanji_db';
const STORE_NAME = 'kanjiinfo';
const DB_VERSION = 2;

let dbPromise: Promise<IDBDatabase | null> | null = null;

function getDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'kanji' });
          }
          if (!db.objectStoreNames.contains('kanji_catalog')) {
            db.createObjectStore('kanji_catalog', { keyPath: 'kanji' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          console.warn('Gagal membuka IndexedDB kanji, fallback aktif:', req.error);
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB tidak dapat diakses:', err);
        resolve(null);
      }
    });
  }

  return dbPromise;
}

// Fallback localStorage key prefix
const LS_PREFIX = 'kanji_info_';

let cachedNodeFallback: Record<string, KanjiDetail> | null = null;
export function setLocalFallbackData(data: Record<string, KanjiDetail> | null) {
  cachedNodeFallback = data;
}

function getNodeFallback(): Record<string, KanjiDetail> | null {
  if (typeof window !== 'undefined' && 'indexedDB' in window && (window as any).indexedDB) {
    return null;
  }
  if (!cachedNodeFallback) {
    try {
      // In Node.js environment (e.g. tests / scripts)
      const proc = (globalThis as any).process;
      if (proc?.versions?.node && typeof proc.getBuiltinModule === 'function') {
        const fs = proc.getBuiltinModule('node:fs');
        const path = proc.getBuiltinModule('node:path');
        if (fs && path) {
          const p = path.resolve('scripts/kanji/out/kanjiInfo.json');
          if (fs.existsSync(p)) {
            cachedNodeFallback = JSON.parse(fs.readFileSync(p, 'utf-8'));
          }
        }
      }
    } catch { }
  }
  return cachedNodeFallback;
}

export async function getStoredKanji(kanji: string): Promise<KanjiDetail | null> {
  const nodeData = getNodeFallback();
  if (nodeData) {
    return nodeData[kanji] || null;
  }

  const db = await getDb();
  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(kanji);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  // Fallback ke localStorage
  try {
    const raw = localStorage.getItem(LS_PREFIX + kanji);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function getMultipleStoredKanji(kanjiList: string[]): Promise<Record<string, KanjiDetail>> {
  const result: Record<string, KanjiDetail> = {};
  if (!kanjiList.length) return result;

  const nodeData = getNodeFallback();
  if (nodeData) {
    for (const k of kanjiList) {
      if (nodeData[k]) result[k] = nodeData[k];
    }
    return result;
  }

  const db = await getDb();
  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        let completed = 0;

        for (const k of kanjiList) {
          const req = store.get(k);
          req.onsuccess = () => {
            if (req.result) {
              result[k] = req.result;
            }
            completed++;
            if (completed === kanjiList.length) resolve(result);
          };
          req.onerror = () => {
            completed++;
            if (completed === kanjiList.length) resolve(result);
          };
        }
      } catch {
        resolve(result);
      }
    });
  }

  // Fallback localStorage
  for (const k of kanjiList) {
    try {
      const raw = localStorage.getItem(LS_PREFIX + k);
      if (raw) result[k] = JSON.parse(raw);
    } catch { }
  }
  return result;
}

export async function setStoredKanji(detail: KanjiDetail): Promise<void> {
  if (!detail || !detail.kanji) return;

  const db = await getDb();
  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(detail);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  // Fallback localStorage
  try {
    localStorage.setItem(LS_PREFIX + detail.kanji, JSON.stringify(detail));
  } catch { }
}

export async function setMultipleStoredKanji(entries: KanjiDetail[]): Promise<void> {
  if (!entries.length) return;

  const db = await getDb();
  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        for (const item of entries) {
          store.put(item);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  // Fallback localStorage
  for (const item of entries) {
    try {
      localStorage.setItem(LS_PREFIX + item.kanji, JSON.stringify(item));
    } catch { }
  }
}

export async function getAllStoredKanji(): Promise<Record<string, KanjiDetail>> {
  const result: Record<string, KanjiDetail> = {};
  const db = await getDb();
  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          if (Array.isArray(req.result)) {
            for (const item of req.result) {
              if (item?.kanji) result[item.kanji] = item;
            }
          }
          resolve(result);
        };
        req.onerror = () => resolve(result);
      } catch {
        resolve(result);
      }
    });
  }

  // Fallback localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LS_PREFIX)) {
        const k = key.replace(LS_PREFIX, '');
        const raw = localStorage.getItem(key);
        if (raw) result[k] = JSON.parse(raw);
      }
    }
  } catch { }

  return result;
}

export async function getStoredKanjiCount(): Promise<number> {
  const db = await getDb();
  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.count();
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => resolve(0);
      } catch {
        resolve(0);
      }
    });
  }

  let count = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LS_PREFIX)) count++;
    }
  } catch { }
  return count;
}
