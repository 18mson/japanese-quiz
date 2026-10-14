import { assertEquals } from "jsr:@std/assert";
import { wibDayStartUtc, nextWibDayStartUtc, isHallucination, normalizeTranscript } from "./utils.ts";

Deno.test("wibDayStartUtc - menghitung awal hari WIB dengan benar sesuai spesifikasi", () => {
  // 1. 2026-10-14T20:00:00Z (+7h = 2026-10-15 03:00 WIB)
  // Awal hari WIB harus 2026-10-15 00:00 WIB = 2026-10-14T17:00:00.000Z
  const d1 = new Date("2026-10-14T20:00:00.000Z");
  const start1 = wibDayStartUtc(d1);
  assertEquals(start1.toISOString(), "2026-10-14T17:00:00.000Z");

  // 2. 2026-10-14T16:59:00Z (+7h = 2026-10-14 23:59 WIB)
  // Awal hari WIB harus 2026-10-14 00:00 WIB = 2026-10-13T17:00:00.000Z
  const d2 = new Date("2026-10-14T16:59:00.000Z");
  const start2 = wibDayStartUtc(d2);
  assertEquals(start2.toISOString(), "2026-10-13T17:00:00.000Z");

  // 3. Tepat jam 17:00:00Z (00:00 WIB)
  const d3 = new Date("2026-10-14T17:00:00.000Z");
  const start3 = wibDayStartUtc(d3);
  assertEquals(start3.toISOString(), "2026-10-14T17:00:00.000Z");

  // 4. Reset ISO berikutnya harus +24 jam dari awal hari saat ini
  const reset1 = nextWibDayStartUtc(d1);
  assertEquals(reset1.toISOString(), "2026-10-15T17:00:00.000Z");
});

Deno.test("isHallucination - mendeteksi halusinasi audio pendek dan teks kosong", () => {
  // Teks kosong -> dianggap empty/halusinasi
  assertEquals(isHallucination(""), true);
  assertEquals(isHallucination("   "), true);

  // Frasa halusinasi khas dengan duration < 1500 ms -> true
  assertEquals(isHallucination("ご視聴ありがとうございました", 1200), true);
  assertEquals(isHallucination("ご視聴ありがとうございます", 800), true);
  assertEquals(isHallucination("ありがとうございました", 500), true);

  // Frasa halusinasi tetapi duration >= 1500 ms (mungkin memang pengguna mengucapkan terima kasih) -> false
  assertEquals(isHallucination("ありがとうございました", 2500), false);

  // Teks kalimat normal bahasa Jepang -> false
  assertEquals(isHallucination("これは本です", 1200), false);
  assertEquals(isHallucination("おはようございます", 1000), false);
});

Deno.test("normalizeTranscript - melakukan trim dan NFKC normalization", () => {
  assertEquals(normalizeTranscript("  こんにちは  "), "こんにちは");
  // NFKC: fullwidth alphanumeric / kana compatibility
  assertEquals(normalizeTranscript(" ＡＢＣ １２３ "), "ABC 123");
});
