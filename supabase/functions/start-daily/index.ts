// @ts-nocheck
// =============================================================
// Supabase Edge Function: start-daily
// Deno runtime (TypeScript)
// Memulai atau mengambil sesi latihan harian secara idempoten
// =============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import {
  QUESTIONS_PER_CHAPTER,
  FOCUS_PER_CHAPTER,
  MAX_CHAPTERS_PER_DAY,
  MAX_ATTEMPTS_BEFORE_REVEAL
} from '../_shared/constants.ts';
import { todayWIB, nextResetISO } from '../_shared/time.ts';

function shuffle<T>(arr: T[]): T[] {
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

async function pickQuestionsForChapters(
  adminClient: any,
  userId: string,
  chapters: number[],
  alreadyUsedQuestionIds: Set<string> = new Set()
): Promise<{
  chosenQuestions: any[];
  isPoolLow: boolean;
  isRecycled: boolean;
  error?: string;
}> {
  // Ambil semua id soal yang pernah dilihat user
  const { data: seenRecords } = await adminClient
    .from('daily_questions')
    .select('question_id, attempts, is_correct, created_at')
    .eq('user_id', userId);

  const seenMap = new Map<string, any>();
  (seenRecords || []).forEach((r: any) => {
    seenMap.set(r.question_id, r);
  });
  const seenIds = new Set(seenMap.keys());

  const chosenQuestionsPerChapter: any[] = [];
  let isPoolLowOverall = false;
  let isRecycledOverall = false;
  const globalChosenQuestionIds = new Set<string>(alreadyUsedQuestionIds);

  for (const ch of chapters) {
    const { data: allApprovedInChapter } = await adminClient
      .from('sentence_questions')
      .select('id, chapter_id, id_text, is_focus', { count: 'exact' })
      .eq('chapter_id', ch)
      .eq('status', 'approved');

    if (!allApprovedInChapter || allApprovedInChapter.length === 0) {
      return {
        chosenQuestions: [],
        isPoolLow: false,
        isRecycled: false,
        error: `Bab ${ch} tidak memiliki bank soal yang disetujui (approved)`
      };
    }

    const unseenInChapter = allApprovedInChapter.filter(
      (q: any) => !seenIds.has(q.id) && !globalChosenQuestionIds.has(q.id)
    );
    if (unseenInChapter.length < QUESTIONS_PER_CHAPTER) {
      isPoolLowOverall = true;
    }

    const focusUnseen = shuffle(unseenInChapter.filter((q: any) => q.is_focus));
    const nonFocusUnseen = shuffle(unseenInChapter.filter((q: any) => !q.is_focus));

    let reviewEarlierUnseen: any[] = [];
    if (ch > 1) {
      const { data: earlierApproved } = await adminClient
        .from('sentence_questions')
        .select('id, chapter_id, id_text, is_focus')
        .lt('chapter_id', ch)
        .eq('status', 'approved');

      if (earlierApproved && earlierApproved.length > 0) {
        reviewEarlierUnseen = shuffle(
          earlierApproved.filter((q: any) => !seenIds.has(q.id) && !globalChosenQuestionIds.has(q.id))
        );
      }
    }

    const chapterSelected: any[] = [];

    // a. FOKUS
    const focusPicks = focusUnseen.splice(0, FOCUS_PER_CHAPTER);
    for (const p of focusPicks) {
      chapterSelected.push(p);
      globalChosenQuestionIds.add(p.id);
    }

    // b. REVIEW
    const reviewCandidates = [...reviewEarlierUnseen, ...nonFocusUnseen];
    while (chapterSelected.length < QUESTIONS_PER_CHAPTER && reviewCandidates.length > 0) {
      const candidate = reviewCandidates.shift();
      if (candidate && !globalChosenQuestionIds.has(candidate.id)) {
        chapterSelected.push(candidate);
        globalChosenQuestionIds.add(candidate.id);
      }
    }

    // c. Sisa FOKUS
    while (chapterSelected.length < QUESTIONS_PER_CHAPTER && focusUnseen.length > 0) {
      const candidate = focusUnseen.shift();
      if (candidate && !globalChosenQuestionIds.has(candidate.id)) {
        chapterSelected.push(candidate);
        globalChosenQuestionIds.add(candidate.id);
      }
    }

    // d. DAUR ULANG
    if (chapterSelected.length < QUESTIONS_PER_CHAPTER) {
      isRecycledOverall = true;
      const seenInThisChapter = allApprovedInChapter.filter(
        (q: any) => seenIds.has(q.id) && !globalChosenQuestionIds.has(q.id)
      );

      seenInThisChapter.sort((a: any, b: any) => {
        const statsA = seenMap.get(a.id) || { attempts: 0, is_correct: true, created_at: '' };
        const statsB = seenMap.get(b.id) || { attempts: 0, is_correct: true, created_at: '' };

        const aWrong = statsA.is_correct ? 0 : 1;
        const bWrong = statsB.is_correct ? 0 : 1;
        if (bWrong !== aWrong) return bWrong - aWrong;

        if (statsB.attempts !== statsA.attempts) {
          return statsB.attempts - statsA.attempts;
        }

        return new Date(statsA.created_at).getTime() - new Date(statsB.created_at).getTime();
      });

      while (chapterSelected.length < QUESTIONS_PER_CHAPTER && seenInThisChapter.length > 0) {
        const recycledPick = seenInThisChapter.shift();
        if (recycledPick && !globalChosenQuestionIds.has(recycledPick.id)) {
          chapterSelected.push(recycledPick);
          globalChosenQuestionIds.add(recycledPick.id);
        }
      }
    }

    chosenQuestionsPerChapter.push(...chapterSelected);
  }

  return {
    chosenQuestions: chosenQuestionsPerChapter,
    isPoolLow: isPoolLowOverall,
    isRecycled: isRecycledOverall
  };
}

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

    // User client untuk verifikasi JWT auth
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

    // Parse body input
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { chapter_ids } = body;
    if (
      !Array.isArray(chapter_ids) ||
      chapter_ids.length < 1 ||
      chapter_ids.length > MAX_CHAPTERS_PER_DAY
    ) {
      return new Response(
        JSON.stringify({
          error: `chapter_ids harus berupa array dengan 1 sampai ${MAX_CHAPTERS_PER_DAY} bab`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validasi elemen bab (1..25, unik, integer)
    const uniqueChapters = new Set<number>();
    for (const c of chapter_ids) {
      if (typeof c !== 'number' || !Number.isInteger(c) || c < 1 || c > 25) {
        return new Response(
          JSON.stringify({ error: 'Setiap elemen chapter_ids harus berupa integer antara 1 s.d. 25' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      uniqueChapters.add(c);
    }

    if (uniqueChapters.size !== chapter_ids.length) {
      return new Response(
        JSON.stringify({ error: 'chapter_ids tidak boleh memuat bab duplikat' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const today = todayWIB();
    const resetsAt = nextResetISO();

    // 1. Cek sesi eksisting hari ini (Idempotensi atau Tambah Bab)
    const { data: existingSession } = await adminClient
      .from('daily_sessions')
      .select('id, session_date, chapter_ids, status, completed_at')
      .eq('user_id', user.id)
      .eq('session_date', today)
      .maybeSingle();

    if (existingSession) {
      const existingChapters = (existingSession.chapter_ids || []) as number[];
      const newChapters = chapter_ids.filter((c: number) => !existingChapters.includes(c));

      // Jika ada bab baru yang ingin ditambahkan ke sesi hari ini
      if (newChapters.length > 0) {
        if (existingChapters.length + newChapters.length > MAX_CHAPTERS_PER_DAY) {
          return new Response(
            JSON.stringify({
              error: `Kuota maksimal bab harian (${MAX_CHAPTERS_PER_DAY} bab) telah tercapai.`
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Ambil soal yang sudah ada di sesi ini untuk di-exclude
        const { data: currentSessionQuestions } = await adminClient
          .from('daily_questions')
          .select('question_id')
          .eq('session_id', existingSession.id);

        const sessionQuestionIds = new Set<string>((currentSessionQuestions || []).map((q: any) => q.question_id));

        const selectionResult = await pickQuestionsForChapters(
          adminClient,
          user.id,
          newChapters,
          sessionQuestionIds
        );

        if (selectionResult.error) {
          return new Response(
            JSON.stringify({ error: selectionResult.error }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const newQuestionsToInsert = selectionResult.chosenQuestions.map((q: any) => ({
          session_id: existingSession.id,
          user_id: user.id,
          question_id: q.id,
          chapter_id: q.chapter_id,
          is_correct: false,
          attempts: 0,
          revealed: false
        }));

        if (newQuestionsToInsert.length > 0) {
          await adminClient.from('daily_questions').insert(newQuestionsToInsert);
        }

        const updatedChapters = [...existingChapters, ...newChapters];
        await adminClient
          .from('daily_sessions')
          .update({
            chapter_ids: updatedChapters,
            status: 'active',
            completed_at: null
          })
          .eq('id', existingSession.id);

        existingSession.chapter_ids = updatedChapters;
        existingSession.status = 'active';
      }

      // Ambil seluruh soal untuk sesi ini
      const { data: existingQuestions } = await adminClient
        .from('daily_questions')
        .select(`
          id,
          chapter_id,
          question_id,
          is_correct,
          attempts,
          revealed,
          sentence_questions!inner (
            id_text,
            jp_text
          )
        `)
        .eq('session_id', existingSession.id)
        .order('created_at', { ascending: true });

      const safeQuestions = (existingQuestions || []).map((q: any) => {
        const item: any = {
          daily_question_id: q.id,
          chapter_id: q.chapter_id,
          id_text: q.sentence_questions?.id_text || '',
          is_correct: q.is_correct,
          attempts: q.attempts,
          revealed: q.revealed || false
        };
        // Jika sudah pernah dijawab benar atau sudah di-reveal, sertakan jawaban resminya
        if (q.is_correct || q.revealed || q.attempts >= MAX_ATTEMPTS_BEFORE_REVEAL) {
          item.correct_answer = q.sentence_questions?.jp_text || '';
        }
        return item;
      });

      return new Response(
        JSON.stringify({
          session: {
            id: existingSession.id,
            date: existingSession.session_date,
            status: existingSession.status,
            chapter_ids: existingSession.chapter_ids,
            resets_at: resetsAt
          },
          questions: safeQuestions,
          pool_low: false,
          recycled: false
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Sesi baru: Pemilihan soal untuk tiap bab
    const selectionResult = await pickQuestionsForChapters(adminClient, user.id, chapter_ids);
    if (selectionResult.error) {
      return new Response(
        JSON.stringify({ error: selectionResult.error }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const chosenQuestionsPerChapter = selectionResult.chosenQuestions;
    const isPoolLowOverall = selectionResult.isPoolLow;
    const isRecycledOverall = selectionResult.isRecycled;

    // 3. Simpan session dan questions secara atomik
    const { data: newSession, error: sessionInsertError } = await adminClient
      .from('daily_sessions')
      .insert({
        user_id: user.id,
        session_date: today,
        chapter_ids: chapter_ids,
        status: 'active'
      })
      .select('id, session_date, chapter_ids, status')
      .single();

    // Tangani race condition bila dua request tiba bersamaan
    if (sessionInsertError) {
      if (sessionInsertError.code === '23505') {
        // Unique violation uq_daily_sessions_user_date: ambil sesi yang menang
        const { data: winnerSession } = await adminClient
          .from('daily_sessions')
          .select('id, session_date, chapter_ids, status')
          .eq('user_id', user.id)
          .eq('session_date', today)
          .single();

        if (winnerSession) {
          const { data: winnerQuestions } = await adminClient
            .from('daily_questions')
            .select(`
              id,
              chapter_id,
              is_correct,
              attempts,
              sentence_questions!inner (
                id_text
              )
            `)
            .eq('session_id', winnerSession.id)
            .order('created_at', { ascending: true });

          return new Response(
            JSON.stringify({
              session: {
                id: winnerSession.id,
                date: winnerSession.session_date,
                status: winnerSession.status,
                chapter_ids: winnerSession.chapter_ids,
                resets_at: resetsAt
              },
              questions: (winnerQuestions || []).map((q: any) => ({
                daily_question_id: q.id,
                chapter_id: q.chapter_id,
                id_text: q.sentence_questions?.id_text || '',
                is_correct: q.is_correct,
                attempts: q.attempts
              })),
              pool_low: false,
              recycled: false
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({ error: `Gagal membuat sesi latihan: ${sessionInsertError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert baris-baris soal ke daily_questions
    const questionsToInsert = chosenQuestionsPerChapter.map(q => ({
      session_id: newSession.id,
      user_id: user.id,
      question_id: q.id,
      chapter_id: q.chapter_id,
      is_correct: false,
      attempts: 0,
      revealed: false
    }));

    const { data: insertedQuestions, error: questionsInsertError } = await adminClient
      .from('daily_questions')
      .insert(questionsToInsert)
      .select('id, chapter_id, question_id, is_correct, attempts');

    if (questionsInsertError || !insertedQuestions) {
      return new Response(
        JSON.stringify({ error: `Gagal menyimpan soal latihan: ${questionsInsertError?.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Bentuk map id_text dari chosenQuestionsPerChapter
    const idTextMap = new Map<string, string>();
    chosenQuestionsPerChapter.forEach(q => idTextMap.set(q.id, q.id_text));

    const finalQuestions = insertedQuestions.map(iq => ({
      daily_question_id: iq.id,
      chapter_id: iq.chapter_id,
      id_text: idTextMap.get(iq.question_id) || '',
      is_correct: iq.is_correct,
      attempts: iq.attempts
    }));

    return new Response(
      JSON.stringify({
        session: {
          id: newSession.id,
          date: newSession.session_date,
          status: newSession.status,
          chapter_ids: newSession.chapter_ids,
          resets_at: resetsAt
        },
        questions: finalQuestions,
        pool_low: isPoolLowOverall,
        recycled: isRecycledOverall
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
