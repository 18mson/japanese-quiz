// @ts-nocheck
// =============================================================
// Supabase Edge Function: submit-answer
// Deno runtime (TypeScript)
// Memvalidasi jawaban user, tracking percobaan & reveal jawaban
// =============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import {
  MAX_CHAPTERS_PER_DAY,
  MAX_ATTEMPTS_BEFORE_REVEAL,
  RATE_LIMIT_SUBMITS_PER_HOUR
} from '../_shared/constants.ts';
import { todayWIB, nextResetISO } from '../_shared/time.ts';
import { checkAnswerMatch, checkAnswerWithDetails } from '../_shared/normalize.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { daily_question_id, answer_text, submitted_text, input_method } = body;
    if (!daily_question_id || typeof daily_question_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'daily_question_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!input_method || (input_method !== 'text' && input_method !== 'voice')) {
      return new Response(
        JSON.stringify({ error: "input_method must be 'text' or 'voice'" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawInput = submitted_text ?? answer_text;
    const submittedText = typeof rawInput === 'string' ? rawInput : '';
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const today = todayWIB();
    const resetsAt = nextResetISO();

    // 1. Rate Limit Check: max 60 submits per hour per user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: submitsCount, error: countError } = await adminClient
      .from('answer_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo);

    if (submitsCount !== null && submitsCount >= RATE_LIMIT_SUBMITS_PER_HOUR) {
      return new Response(
        JSON.stringify({
          error: `Batas pengiriman jawaban tercapai (maksimal ${RATE_LIMIT_SUBMITS_PER_HOUR} per jam). Silakan coba lagi nanti.`
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fetch daily question + session + sentence question
    const { data: dq, error: dqError } = await adminClient
      .from('daily_questions')
      .select(`
        id,
        session_id,
        user_id,
        chapter_id,
        question_id,
        is_correct,
        attempts,
        revealed,
        daily_sessions!inner (
          id,
          user_id,
          session_date,
          status,
          chapter_ids
        ),
        sentence_questions!inner (
          jp_text,
          jp_answers
        )
      `)
      .eq('id', daily_question_id)
      .maybeSingle();

    if (dqError || !dq) {
      return new Response(
        JSON.stringify({ error: 'Soal latihan tidak ditemukan' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hak milik soal
    if (dq.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Akses ditolak: soal latihan bukan milik pengguna ini' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validasi tanggal sesi (harus hari ini di WIB)
    if (dq.daily_sessions.session_date !== today) {
      return new Response(
        JSON.stringify({ error: 'Sesi latihan ini bukan untuk hari ini (WIB)' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validasi status sesi
    if (dq.daily_sessions.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Sesi latihan sudah selesai' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Jika soal sudah benar sebelumnya: kembalikan langsung tanpa menambah attempts
    if (dq.is_correct) {
      return new Response(
        JSON.stringify({
          correct: true,
          attempts: dq.attempts,
          session_completed: false,
          quota_exhausted: false,
          resets_at: resetsAt
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Evaluasi jawaban dengan checkAnswerWithDetails
    const acceptedAnswers = dq.sentence_questions?.jp_answers || [];
    const evaluation = checkAnswerWithDetails(submittedText, acceptedAnswers, input_method);
    const isMatch = evaluation.isMatch;
    const isTolerance = evaluation.isTolerance;
    const matchedTarget = evaluation.matchedTarget || dq.sentence_questions?.jp_text;
    const newAttempts = dq.attempts + 1;

    // Catat ke answer_log
    await adminClient.from('answer_log').insert({
      user_id: user.id,
      daily_question_id: dq.id,
      input_method: input_method,
      is_correct: isMatch
    });

    // 4. Update status soal & sesi
    if (isMatch) {
      // Jawaban BENAR (baik exact maupun toleransi 1 kata)
      await adminClient
        .from('daily_questions')
        .update({
          is_correct: true,
          attempts: newAttempts,
          answered_at: new Date().toISOString()
        })
        .eq('id', dq.id);

      // Cek apakah semua soal di sesi ini sekarang sudah benar
      const { count: uncorrectCount } = await adminClient
        .from('daily_questions')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', dq.session_id)
        .eq('is_correct', false);

      const isSessionCompleted = uncorrectCount === 0;

      // Cek apakah seluruh kuota bab harian (maksimal MAX_CHAPTERS_PER_DAY) sudah terpakai
      const sessionChapters = (dq.daily_sessions?.chapter_ids || []) as number[];
      const isFullQuotaUsed = sessionChapters.length >= MAX_CHAPTERS_PER_DAY;
      const isQuotaExhausted = isSessionCompleted && isFullQuotaUsed;

      if (isQuotaExhausted) {
        await adminClient
          .from('daily_sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', dq.session_id);
      }

      return new Response(
        JSON.stringify({
          correct: true,
          is_tolerance: isTolerance,
          matched_target: matchedTarget,
          user_answer: submittedText,
          attempts: newAttempts,
          session_completed: isSessionCompleted,
          quota_exhausted: isQuotaExhausted,
          can_add_chapter: isSessionCompleted && !isFullQuotaUsed,
          resets_at: resetsAt,
          correct_answer: dq.sentence_questions?.jp_text
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Jawaban SALAH
      const shouldReveal = dq.revealed || newAttempts >= MAX_ATTEMPTS_BEFORE_REVEAL;

      await adminClient
        .from('daily_questions')
        .update({
          attempts: newAttempts,
          revealed: shouldReveal
        })
        .eq('id', dq.id);

      const respPayload: any = {
        correct: false,
        attempts: newAttempts,
        session_completed: false,
        quota_exhausted: false,
        resets_at: resetsAt
      };

      if (shouldReveal) {
        respPayload.reveal_answer = dq.sentence_questions.jp_text;
      }

      return new Response(
        JSON.stringify(respPayload),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
