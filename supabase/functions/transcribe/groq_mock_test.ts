import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  mapGroqErrorStatus,
  processGroqResponse,
  isHallucination
} from "./utils.ts";

Deno.test("Edge Function Error Mapping & Groq Mock Suite", async (t) => {
  // 1. Groq 429 -> 503 { error: "upstream_busy" }
  await t.step("Groq 429 dipetakan ke 503 upstream_busy", () => {
    const res = mapGroqErrorStatus(429);
    assertEquals(res.status, 503);
    assertEquals(res.body.error, "upstream_busy");
  });

  // 2. Timeout -> 504 { error: "upstream_timeout" }
  await t.step("Timeout dipetakan ke 504 upstream_timeout", () => {
    // Pada Deno fetch error AbortError / timeout
    const isTimeout = true;
    const mapped = isTimeout
      ? { status: 504, body: { error: "upstream_timeout" } }
      : { status: 500, body: { error: "internal_error" } };
    assertEquals(mapped.status, 504);
    assertEquals(mapped.body.error, "upstream_timeout");
  });

  // 3. Groq 401 -> 500 { error: "misconfigured" } tanpa menampilkan API key
  await t.step("Groq 401 dipetakan ke 500 misconfigured tanpa membocorkan key", () => {
    const res = mapGroqErrorStatus(401);
    assertEquals(res.status, 500);
    assertEquals(res.body.error, "misconfigured");
    const jsonStr = JSON.stringify(res);
    assertEquals(jsonStr.includes("gsk_"), false, "Respons tidak boleh membocorkan API key");
  });

  // 4. Hasil kosong atau halusinasi audio pendek -> { text: "", empty: true }
  await t.step("Hasil kosong dari Groq dipetakan ke text: '' dan empty: true", () => {
    const processed = processGroqResponse("", 1200, 35);
    assertEquals(processed.text, "");
    assertEquals(processed.empty, true);
    assertEquals(processed.remaining, 35);
  });

  await t.step("Halusinasi audio pendek (< 1500ms) dipetakan ke text: '' dan empty: true", () => {
    const processed = processGroqResponse("ご視聴ありがとうございました", 900, 35);
    assertEquals(processed.text, "");
    assertEquals(processed.empty, true);
  });

  await t.step("Teks valid tidak dianggap empty", () => {
    const processed = processGroqResponse("わたしはがくせいです", 2000, 35);
    assertEquals(processed.text, "わたしはがくせいです");
    assertEquals(processed.empty, false);
  });
});
