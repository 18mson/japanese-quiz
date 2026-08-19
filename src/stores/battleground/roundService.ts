// src/stores/battleground/roundService.ts
import { supabase } from '../../lib/supabaseClient';
import type { ActiveRound } from './types';
import { pickMultipleRandomSentences } from './helpers';

export async function submitRoundApi(params: {
  activeRound: ActiveRound;
  myPlayerId: string;
  typedInput: string;
  isValid: boolean;
  completedSentences: number;
  totalSentences: number;
  progressPercentage: number;
  correctChars: number;
  wrongChars: number;
}) {
  const {
    activeRound,
    myPlayerId,
    typedInput,
    isValid,
    completedSentences,
    totalSentences,
    progressPercentage,
    correctChars,
    wrongChars,
  } = params;

  let completionTimeMs = activeRound.start_at ? Date.now() - new Date(activeRound.start_at).getTime() : 0;
  if (completionTimeMs < 0) completionTimeMs = 0;

  // ── Hitung Skor ──────────────────────────────────────────
  // Base score: tiap huruf benar +1, tiap salah -1, minimum 0
  const baseScore = Math.max(0, correctChars - wrongChars);
  // Time bonus: hanya jika selesai (is_valid=true), +10 poin per detik sisa waktu
  const totalDurationMs = (activeRound.duration_seconds ?? 90) * 1000;
  const remainingMs = Math.max(0, totalDurationMs - completionTimeMs);
  const timeBonus = isValid ? Math.floor(remainingMs / 1000) * 10 : 0;
  const score = baseScore + timeBonus;

  const response = await fetch('/api/battleground-submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roundId: activeRound.id,
      roomId: activeRound.room_id,
      playerId: myPlayerId,
      typedInput,
      completionTimeMs,
      isValid,
      completedSentences,
      totalSentences,
      progressPercentage,
      correctChars,
      wrongChars,
      score,
    }),
  });

  if (!response.ok) {
    // Fallback: direct Supabase insert if edge function is unavailable
    await supabase
      .from('round_submissions')
      .upsert(
        {
          round_id: activeRound.id,
          room_id: activeRound.room_id,
          player_id: myPlayerId,
          typed_input: typedInput,
          completion_time_ms: completionTimeMs,
          is_valid: isValid,
          status: isValid ? 'success' : 'typo',
          completed_sentences: completedSentences,
          total_sentences: totalSentences,
          progress_percentage: progressPercentage,
          correct_chars: correctChars,
          wrong_chars: wrongChars,
          score,
        },
        { onConflict: 'round_id,player_id' }
      );
  }

  return { completionTimeMs, score, status: isValid ? 'success' as const : 'typo' as const };
}

export async function startNextRoundApi(params: {
  roomId: string;
  roundNum: number;
  aliveCount: number;
}) {
  const { roomId, roundNum, aliveCount } = params;

  const { data: roomData } = await supabase
    .from('rooms')
    .select('used_sentence_ids')
    .eq('id', roomId)
    .single();

  const usedIds: string[] = roomData?.used_sentence_ids ?? [];
  
  let targetCount = 7;
  let durationSeconds = 90;
  if (aliveCount >= 5) {
    targetCount = 10;
    durationSeconds = 150;
  } else if (aliveCount >= 3) {
    targetCount = 8;
    durationSeconds = 120;
  }

  const sentences = pickMultipleRandomSentences(usedIds, targetCount);
  const primarySentence = sentences[0];

  const formattedSentences = sentences.map(s => ({
    id: s.id,
    japanese: s.japanese,
    romaji_variants: s.romaji_variants,
    word_spans: s.word_spans ?? null,
    meaning: s.meaning_id,
  }));

  const startAt = new Date(Date.now() + 3000).toISOString(); // 3s pre-countdown

  const { data: roundData, error: roundErr } = await supabase
    .from('rounds')
    .upsert({
      room_id: roomId,
      round_number: roundNum,
      sentence_id: primarySentence.id,
      sentence_japanese: primarySentence.japanese,
      sentence_romaji_variants: primarySentence.romaji_variants,
      sentence_word_spans: primarySentence.word_spans ?? null,
      sentence_meaning: primarySentence.meaning_id,
      status: 'active',
      start_at: startAt,
      duration_seconds: durationSeconds,
    }, { onConflict: 'room_id,round_number' })
    .select()
    .single();

  if (roundErr || !roundData) throw roundErr ?? new Error('Gagal membuat ronde baru.');

  const newUsedIds = [...usedIds, ...sentences.map(s => s.id)];

  await supabase
    .from('rooms')
    .update({ used_sentence_ids: newUsedIds, current_round_num: roundNum })
    .eq('id', roomId);

  return {
    roundData,
    primarySentence,
    formattedSentences,
    startAt,
    durationSeconds,
  };
}

export async function startNextQuizBlitzRoundApi(params: {
  roomId: string;
  roundNum: number;
  quizCategory: import('./types').QuizCategory;
}) {
  const { roomId, roundNum, quizCategory } = params;
  const { generateQuizBlitzQuestion } = await import('./quizBlitzHelpers');

  const { data: roomData } = await supabase
    .from('rooms')
    .select('used_sentence_ids')
    .eq('id', roomId)
    .single();

  const usedIds = new Set<string>(roomData?.used_sentence_ids ?? []);
  const question = generateQuizBlitzQuestion(quizCategory, usedIds);

  const startAt = new Date(Date.now() + 3000).toISOString(); // 3s pre-countdown
  const durationSeconds = 10; // 10s per question

  const { data: roundData, error: roundErr } = await supabase
    .from('rounds')
    .upsert({
      room_id: roomId,
      round_number: roundNum,
      sentence_id: question.id,
      sentence_japanese: question.prompt,
      sentence_romaji_variants: [[question.correctAnswer]],
      sentence_word_spans: null,
      sentence_meaning: question.meaning ?? question.questionText,
      status: 'active',
      start_at: startAt,
      duration_seconds: durationSeconds,
      question_data: question,
    }, { onConflict: 'room_id,round_number' })
    .select()
    .single();

  if (roundErr || !roundData) throw roundErr ?? new Error('Gagal membuat ronde kuis kilat.');

  const updatedUsedIds = [...Array.from(usedIds), question.id];
  await supabase
    .from('rooms')
    .update({ used_sentence_ids: updatedUsedIds, current_round_num: roundNum })
    .eq('id', roomId);

  return {
    roundData,
    question,
    startAt,
    durationSeconds,
  };
}

export async function submitQuizBlitzRoundApi(params: {
  activeRound: ActiveRound;
  myPlayerId: string;
  selectedOptionIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
}) {
  const { activeRound, myPlayerId, selectedAnswer, isCorrect } = params;

  let completionTimeMs = activeRound.start_at
    ? Date.now() - new Date(activeRound.start_at).getTime()
    : 0;
  if (completionTimeMs < 0) completionTimeMs = 0;

  const totalDurationMs = (activeRound.duration_seconds ?? 10) * 1000;
  const remainingMs = Math.max(0, totalDurationMs - completionTimeMs);

  // Speed scoring: Max 200 pts at 0s, scaling down to min 10 pts at 9.9s
  const score = isCorrect
    ? Math.max(10, Math.round((remainingMs / totalDurationMs) * 200))
    : 0;

  await supabase
    .from('round_submissions')
    .upsert(
      {
        round_id: activeRound.id,
        room_id: activeRound.room_id,
        player_id: myPlayerId,
        typed_input: selectedAnswer,
        completion_time_ms: completionTimeMs,
        is_valid: isCorrect,
        status: isCorrect ? 'success' : 'typo',
        score,
      },
      { onConflict: 'round_id,player_id' }
    );

  return {
    completionTimeMs,
    score,
    status: isCorrect ? ('success' as const) : ('typo' as const),
  };
}

export async function resetRoomApi(roomId: string) {
  await supabase.from('round_submissions').delete().eq('room_id', roomId);
  await supabase.from('rounds').delete().eq('room_id', roomId);

  await supabase
    .from('rooms')
    .update({ status: 'waiting', current_round_num: 1, used_sentence_ids: [] })
    .eq('id', roomId);

  await supabase
    .from('room_players')
    .update({
      status: 'alive',
      eliminated_in_round: null,
      elimination_reason: null,
      final_rank: null,
      score: 0,
    })
    .eq('room_id', roomId);
}
