// ============================================================
// Utilitas Transkripsi & Waktu WIB (Deno Runtime)
// ============================================================

const MS_PER_HOUR = 3600 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const WIB_OFFSET_MS = 7 * MS_PER_HOUR;

/**
 * Menghitung awal hari WIB (00:00:00 WIB) dalam waktu UTC.
 * Rumus: floor((now + 7h) / 24h) * 24h - 7h
 * Contoh:
 * 2026-10-14T20:00:00Z (+7h = Oct 15 03:00 WIB) -> awal hari WIB 2026-10-14T17:00:00Z (Oct 15 00:00 WIB)
 * 2026-10-14T16:59:00Z (+7h = Oct 14 23:59 WIB) -> awal hari WIB 2026-10-13T17:00:00Z (Oct 14 00:00 WIB)
 */
export function wibDayStartUtc(now: Date = new Date()): Date {
  const t = now.getTime();
  const dayStartMs = Math.floor((t + WIB_OFFSET_MS) / MS_PER_DAY) * MS_PER_DAY - WIB_OFFSET_MS;
  return new Date(dayStartMs);
}

/**
 * Menghitung awal hari WIB berikutnya dalam waktu UTC (waktu reset kuota harian).
 */
export function nextWibDayStartUtc(now: Date = new Date()): Date {
  const currentStart = wibDayStartUtc(now);
  return new Date(currentStart.getTime() + MS_PER_DAY);
}

/**
 * Frasa halusinasi khas Whisper pada audio pendek / hening.
 */
export const HALLUCINATION_PHRASES = [
  "ご視聴ありがとうございました",
  "ご視聴ありがとうございます",
  "ありがとうございました"
];

/**
 * Memeriksa apakah teks hasil transkripsi merupakan teks kosong atau halusinasi audio pendek (< 1500 ms).
 */
export function isHallucination(text: string, durationMs?: number | null): boolean {
  const clean = (text || "").trim();
  if (!clean) return true;

  if (durationMs !== undefined && durationMs !== null && durationMs < 1500) {
    for (const phrase of HALLUCINATION_PHRASES) {
      if (clean === phrase || clean.includes(phrase)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Normalisasi NFKC dan trim untuk teks transkripsi Jepang.
 */
export function normalizeTranscript(text: string): string {
  if (!text) return "";
  return text.trim().normalize("NFKC");
}

/**
 * Pemetaan status error dari Groq API ke respons Edge Function:
 * - Groq 429 -> 503 { error: "upstream_busy" }
 * - Timeout / Abort -> 504 { error: "upstream_timeout" }
 * - Groq 401 / 403 -> 500 { error: "misconfigured" } (tanpa menampilkan API key)
 */
export function mapGroqErrorStatus(groqStatus: number): { status: number; body: { error: string } } {
  if (groqStatus === 429) {
    return { status: 503, body: { error: "upstream_busy" } };
  }
  if (groqStatus === 401 || groqStatus === 403) {
    return { status: 500, body: { error: "misconfigured" } };
  }
  return { status: 503, body: { error: "upstream_busy" } };
}

/**
 * Memproses respons sukses dari Groq dengan deteksi teks kosong atau halusinasi audio pendek.
 */
export function processGroqResponse(rawText: string, durationMs?: number | null, remainingQuota = 0): {
  text: string;
  empty: boolean;
  remaining: number;
} {
  const normalized = normalizeTranscript(rawText);
  const empty = isHallucination(normalized, durationMs);
  return {
    text: empty ? "" : normalized,
    empty,
    remaining: remainingQuota,
  };
}
