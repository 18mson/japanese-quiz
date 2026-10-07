// src/utils/dailyTime.ts
// Helper waktu zona Asia/Jakarta (WIB = UTC+7) untuk Latihan Kalimat Harian

export function getTodayWIB(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 7 * 3600000);
  const y = wib.getFullYear();
  const m = String(wib.getMonth() + 1).padStart(2, '0');
  const d = String(wib.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getNextResetWIB(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 7 * 3600000);

  // Tengah malam besok pukul 00:00:00 WIB
  const tomorrowWIB = new Date(wib);
  tomorrowWIB.setDate(tomorrowWIB.getDate() + 1);
  tomorrowWIB.setHours(0, 0, 0, 0);

  // Konversi kembali dari WIB ke Date lokal
  const diffMs = tomorrowWIB.getTime() - wib.getTime();
  return new Date(now.getTime() + diffMs);
}

export function formatRemainingTime(targetDateOrIso: string | Date | null): { hours: string; minutes: string; seconds: string; totalSeconds: number } {
  if (!targetDateOrIso) {
    return { hours: '00', minutes: '00', seconds: '00', totalSeconds: 0 };
  }

  const targetMs = typeof targetDateOrIso === 'string'
    ? new Date(targetDateOrIso).getTime()
    : targetDateOrIso.getTime();

  const diffMs = Math.max(0, targetMs - Date.now());
  const totalSeconds = Math.floor(diffMs / 1000);

  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return { hours, minutes, seconds, totalSeconds };
}
