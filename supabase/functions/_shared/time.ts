// ============================================================
// Utilitas waktu zona Asia/Jakarta (WIB)
// ============================================================

import { TIMEZONE_WIB } from './constants.ts';

/**
 * Mengembalikan tanggal hari ini di zona waktu Asia/Jakarta dalam format 'YYYY-MM-DD'
 */
export function todayWIB(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE_WIB,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
}

/**
 * Mengembalikan ISO string untuk pergantian hari berikutnya (00:00 WIB)
 */
export function nextResetISO(now: Date = new Date()): string {
  const todayStr = todayWIB(now);
  const [year, month, day] = todayStr.split('-').map(Number);
  // Jam 00:00:00 WIB hari berikutnya adalah (UTC hari berikutnya - 7 jam)
  const nextResetMs = Date.UTC(year, month - 1, day + 1, 0, 0, 0) - 7 * 60 * 60 * 1000;
  return new Date(nextResetMs).toISOString();
}
