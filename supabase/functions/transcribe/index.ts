// @ts-nocheck
// ============================================================
// Supabase Edge Function: transcribe
// Whisper (Groq) Audio Transcription dengan Rate Limiting Harian
// Deno Runtime
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  wibDayStartUtc,
  nextWibDayStartUtc,
  isHallucination,
  normalizeTranscript,
  mapGroqErrorStatus,
  processGroqResponse
} from "./utils.ts";

export {
  wibDayStartUtc,
  nextWibDayStartUtc,
  isHallucination,
  normalizeTranscript,
  mapGroqErrorStatus,
  processGroqResponse
};

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_BYTES = 2_000_000; // 2 MB
const GROQ_TIMEOUT_MS = 12000; // 12 detik

Deno.serve(async (req: Request) => {
  // 1. CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 2. Only POST allowed
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 3. Verifikasi Auth Header & User
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Parse multipart/form-data
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(JSON.stringify({ error: "Content-Type must be multipart/form-data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid multipart form data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Validasi Field Audio
    const audioEntry = formData.get("audio");
    if (!audioEntry || !(audioEntry instanceof File)) {
      return new Response(JSON.stringify({ error: "Field 'audio' is required and must be a file" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (audioEntry.size > MAX_BYTES) {
      return new Response(JSON.stringify({ error: "Audio file exceeds maximum allowed size of 2MB" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isAudioType = audioEntry.type && audioEntry.type.startsWith("audio/");
    const isAudioExt = /\.(m4a|mp3|webm|ogg|wav|mp4|aac)$/i.test(audioEntry.name || "");
    if (!isAudioType && !isAudioExt) {
      return new Response(JSON.stringify({ error: "File must be an audio file" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const vocabRaw = formData.get("vocab");
    const vocab = typeof vocabRaw === "string" ? vocabRaw.slice(0, 400) : "";

    const durationMsRaw = formData.get("duration_ms");
    const durationMs = durationMsRaw ? parseInt(String(durationMsRaw), 10) : undefined;

    // 6. Batas Harian (WIB, UTC+7 tanpa DST)
    const DAILY_LIMIT = parseInt(Deno.env.get("DAILY_LIMIT") || "40", 10);
    const now = new Date();
    const wibStart = wibDayStartUtc(now);
    const nextResetIso = nextWibDayStartUtc(now).toISOString();

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { count: currentUsage, error: countErr } = await supabaseAdmin
      .from("transcribe_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", wibStart.toISOString());

    if (countErr) {
      console.error("Failed to query transcribe_log count:", countErr.message);
    }

    const usedCount = currentUsage || 0;
    if (usedCount >= DAILY_LIMIT) {
      return new Response(JSON.stringify({
        error: "daily_limit",
        resets_at: nextResetIso,
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 7. Panggil Groq Whisper API
    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) {
      console.error("Transcription service misconfigured: GROQ_API_KEY missing");
      return new Response(JSON.stringify({ error: "misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const whisperModel = Deno.env.get("WHISPER_MODEL") || "whisper-large-v3";

    const groqForm = new FormData();
    groqForm.append("file", audioEntry, audioEntry.name || "audio.m4a");
    groqForm.append("model", whisperModel);
    groqForm.append("language", "ja");
    groqForm.append("temperature", "0");
    groqForm.append("response_format", "json");
    if (vocab) {
      groqForm.append("prompt", vocab);
    }

    const abortCtrl = new AbortController();
    const timeoutId = setTimeout(() => abortCtrl.abort(), GROQ_TIMEOUT_MS);

    let groqRes: Response;
    try {
      groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: groqForm,
        signal: abortCtrl.signal,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      const isTimeout = fetchErr.name === "AbortError";
      
      // Catat log kegagalan jaringan / timeout (tanpa teks/audio)
      await supabaseAdmin.from("transcribe_log").insert({
        user_id: user.id,
        audio_bytes: audioEntry.size,
        duration_ms: durationMs || null,
        status: isTimeout ? 504 : 500,
        ok: false,
      });

      return new Response(JSON.stringify({ error: "upstream_timeout" }), {
        status: 504,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } finally {
      clearTimeout(timeoutId);
    }

    // 8. Pemetaan Status & Logging Groq
    if (!groqRes.ok) {
      const groqStatus = groqRes.status;
      
      await supabaseAdmin.from("transcribe_log").insert({
        user_id: user.id,
        audio_bytes: audioEntry.size,
        duration_ms: durationMs || null,
        status: groqStatus,
        ok: false,
      });

      const mapped = mapGroqErrorStatus(groqStatus);
      return new Response(JSON.stringify(mapped.body), {
        status: mapped.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 9. Berhasil dari Groq
    let groqData: any = {};
    try {
      groqData = await groqRes.json();
    } catch {
      groqData = {};
    }

    const rawText = typeof groqData.text === "string" ? groqData.text : "";

    // Catat log sukses (Metadata saja, DILARANG mencatat audio atau teks)
    await supabaseAdmin.from("transcribe_log").insert({
      user_id: user.id,
      audio_bytes: audioEntry.size,
      duration_ms: durationMs || null,
      status: 200,
      ok: true,
    });

    // 10. Pasca-Proses Teks & Deteksi Halusinasi
    const remaining = Math.max(0, DAILY_LIMIT - (usedCount + 1));
    const processed = processGroqResponse(rawText, durationMs, remaining);

    return new Response(JSON.stringify(processed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("Transcribe function unexpected error:", err.message || err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
