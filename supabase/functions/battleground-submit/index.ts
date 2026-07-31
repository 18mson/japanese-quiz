// @ts-nocheck
// =============================================================
// Supabase Edge Function: battleground-submit
// Deno runtime (TypeScript) — dijalankan di Supabase Edge, bukan Node.js.
// VS Code mungkin menampilkan error module resolution karena menggunakan
// Node.js tsconfig. File ini valid untuk runtime Deno.
// =============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ------ Types ------------------------------------------------

interface SubmitPayload {
  roomId: string;
  roundId: string;
  playerId: string;
  typedInput: string;
  completedSentences?: number;
  totalSentences?: number;
  progressPercentage?: number;
}

interface RomajiUnit {
  kana: string;
  acceptedRomaji: string[];
}

// ------ Romaji Validation Engine ----------------------------
// Port of the core matching logic from QuizSentenceTyping.vue
// This is intentionally a simplified linear matcher; it validates
// that the full typed string matches AT LEAST ONE accepted path.

function buildAcceptedStrings(
  romajiVariants: string[][],
  wordSpans?: number[]
): string[] {
  // If no wordSpans, treat each variant group as a single unit
  if (!wordSpans || wordSpans.length === 0) {
    let combos = [''];
    for (const varGroup of romajiVariants) {
      const next: string[] = [];
      for (const c of combos) {
        for (const v of varGroup) {
          next.push(c + v);
        }
      }
      combos = next;
    }
    return Array.from(new Set(combos));
  }

  // With wordSpans: flatten variant groups into full-sentence combos
  let vIdx = 0;
  let combos = [''];

  for (const span of wordSpans) {
    const wordVariants = romajiVariants.slice(vIdx, vIdx + span);
    vIdx += span;

    let wordCombos = [''];
    for (const varGroup of wordVariants) {
      const next: string[] = [];
      for (const c of wordCombos) {
        for (const v of varGroup) {
          next.push(c + v);
        }
      }
      wordCombos = next;
    }

    const merged: string[] = [];
    for (const c of combos) {
      for (const w of wordCombos) {
        merged.push(c + w);
      }
    }
    combos = merged;
  }

  return Array.from(new Set(combos));
}

function validateRomaji(
  typedInput: string,
  romajiVariants: string[][],
  wordSpans?: number[]
): boolean {
  const normalized = typedInput.trim().toLowerCase();
  const accepted = buildAcceptedStrings(romajiVariants, wordSpans);
  return accepted.includes(normalized);
}

// Estimate total romaji character count for anti-cheat speed check
function estimateRomajiLength(romajiVariants: string[][]): number {
  // Use the shortest accepted path length as the baseline
  let total = 0;
  for (const varGroup of romajiVariants) {
    if (!varGroup || varGroup.length === 0) continue;
    const shortest = varGroup.reduce((a, b) => a.length <= b.length ? a : b);
    total += shortest.length;
  }
  return total;
}

// ------ Elimination Logic -----------------------------------

interface Submission {
  player_id: string;
  is_valid: boolean;
  completion_time_ms: number;
  status: string;
}

function calculateEliminations(
  submissions: Submission[],
  eliminationRate: number
): { toEliminate: string[]; survivors: string[] } {
  // Step 1: All typo/disqualified players are eliminated immediately
  const typoPlayers = submissions
    .filter(s => s.status === 'typo' || s.status === 'disqualified')
    .map(s => s.player_id);

  const successPlayers = submissions
    .filter(s => s.status === 'success')
    .sort((a, b) => a.completion_time_ms - b.completion_time_ms);
  // Sorted fastest → slowest

  const successIds = successPlayers.map(s => s.player_id);

  // Step 2: If everyone succeeded with no typos, eliminate slowest X%
  let slowEliminated: string[] = [];

  if (successPlayers.length >= 2) {
    // Always eliminate at least 1 to keep game progressing
    const numToElim = Math.max(1, Math.floor(successPlayers.length * eliminationRate));
    // Eliminate the SLOWEST (from the end of the sorted array)
    slowEliminated = successIds.slice(successIds.length - numToElim);
  }

  const toEliminate = Array.from(new Set([...typoPlayers, ...slowEliminated]));
  const survivors = successIds.filter(id => !slowEliminated.includes(id));

  return { toEliminate, survivors };
}

// ------ Main Handler ----------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Use service_role to bypass RLS for authoritative server operations
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body: SubmitPayload = await req.json();
    const { roomId, roundId, playerId, typedInput, completedSentences, totalSentences, progressPercentage } = body;

    if (!roomId || !roundId || !playerId || typedInput === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- 1. Fetch round data ----
    const { data: round, error: roundErr } = await supabase
      .from('rounds')
      .select('*')
      .eq('id', roundId)
      .eq('room_id', roomId)
      .single();

    if (roundErr || !round) {
      return new Response(JSON.stringify({ error: 'Round not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (round.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Round is not active', status: round.status }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- 2. Fetch room config for anti-cheat threshold ----
    const { data: room, error: roomErr } = await supabase
      .from('rooms')
      .select('min_ms_per_char, elimination_rate, status')
      .eq('id', roomId)
      .single();

    if (roomErr || !room) {
      return new Response(JSON.stringify({ error: 'Room not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (room.status !== 'in_progress') {
      return new Response(JSON.stringify({ error: 'Room is not in progress' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- 3. Compute completion_time_ms (server authoritative) ----
    const nowMs = Date.now();
    const startMs = new Date(round.start_at).getTime();
    const completionTimeMs = Math.max(0, nowMs - startMs);

    // ---- 4. Anti-cheat: minimum speed check ----
    const romajiVariants: string[][] = round.sentence_romaji_variants;
    const estimatedChars = estimateRomajiLength(romajiVariants);
    const minAllowedMs = estimatedChars * (room.min_ms_per_char ?? 40);

    let submissionStatus: string;
    let isValid = false;

    if (completionTimeMs < minAllowedMs) {
      // Too fast to be human — disqualify
      submissionStatus = 'disqualified';
      isValid = false;
    } else {
      // ---- 5. Validate romaji ----
      const wordSpans: number[] | undefined = round.sentence_word_spans ?? undefined;
      isValid = validateRomaji(typedInput, romajiVariants, wordSpans);
      submissionStatus = isValid ? 'success' : 'typo';
    }

    // ---- 6. Upsert submission record ----
    const { error: upsertErr } = await supabase
      .from('round_submissions')
      .upsert({
        round_id: roundId,
        room_id: roomId,
        player_id: playerId,
        typed_input: typedInput,
        is_valid: isValid,
        completion_time_ms: completionTimeMs,
        status: submissionStatus,
        completed_sentences: completedSentences ?? 0,
        total_sentences: totalSentences ?? 5,
        progress_percentage: progressPercentage ?? 0,
        submitted_at: new Date().toISOString(),
      }, { onConflict: 'round_id,player_id' });

    if (upsertErr) {
      console.error('Submission upsert error:', upsertErr);
      return new Response(JSON.stringify({ error: 'Failed to save submission' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- 7. Check if all alive players have now submitted ----
    const { data: alivePlayers } = await supabase
      .from('room_players')
      .select('player_id')
      .eq('room_id', roomId)
      .eq('status', 'alive');

    const { data: allSubmissions } = await supabase
      .from('round_submissions')
      .select('player_id, is_valid, completion_time_ms, status')
      .eq('round_id', roundId);

    const aliveIds = new Set((alivePlayers ?? []).map((p: { player_id: string }) => p.player_id));
    const submittedIds = new Set((allSubmissions ?? []).map((s: { player_id: string }) => s.player_id));

    const allSubmitted = [...aliveIds].every(id => submittedIds.has(id));

    if (allSubmitted && aliveIds.size > 0) {
      // ---- 8. Run elimination ----
      await supabase
        .from('rounds')
        .update({ status: 'evaluating' })
        .eq('id', roundId);

      const submissions: Submission[] = (allSubmissions ?? []).filter(
        (s: Submission) => aliveIds.has(s.player_id)
      );

      const { toEliminate, survivors } = calculateEliminations(
        submissions,
        room.elimination_rate ?? 0.30
      );

      // Determine final ranks for eliminated players (worst rank = eliminated first)
      const currentRoundNum = round.round_number;
      let eliminatedDetails: Array<{ playerId: string; playerName?: string; reason: string; rank?: number }> = [];

      if (toEliminate.length > 0) {
        // Assign ranks: survivors will have higher ranks (better).
        // Eliminated this round get rank = remaining_alive_count + 1..etc
        const totalPlayersLeft = aliveIds.size;
        const survivorCount = survivors.length;

        for (let i = 0; i < toEliminate.length; i++) {
          const pid = toEliminate[i];
          const sub = submissions.find((s: Submission) => s.player_id === pid);
          const reason = sub?.status === 'typo' ? 'typo' :
                        sub?.status === 'disqualified' ? 'too_fast' : 'too_slow';
          const rank = survivorCount + toEliminate.length - i; // worst first

          await supabase
            .from('room_players')
            .update({
              status: 'eliminated',
              eliminated_in_round: currentRoundNum,
              elimination_reason: reason,
              final_rank: rank,
            })
            .eq('room_id', roomId)
            .eq('player_id', pid);

          eliminatedDetails.push({ playerId: pid, reason, rank });
        }
      }

      // ---- 9. Check game over condition ----
      const isGameOver = survivors.length <= 1;

      if (isGameOver && survivors.length === 1) {
        // Crown the winner
        await supabase
          .from('room_players')
          .update({ final_rank: 1 })
          .eq('room_id', roomId)
          .eq('player_id', survivors[0]);

        await supabase
          .from('rooms')
          .update({ status: 'finished' })
          .eq('id', roomId);
      } else if (!isGameOver) {
        // Prepare next round number
        const nextRoundNum = currentRoundNum + 1;
        await supabase
          .from('rooms')
          .update({ current_round_num: nextRoundNum })
          .eq('id', roomId);
      }

      // Mark round as completed
      await supabase
        .from('rounds')
        .update({ status: 'completed' })
        .eq('id', roundId);

      // ---- 10. Broadcast results via Realtime ----
      const roundStandings = submissions
        .sort((a: Submission, b: Submission) => a.completion_time_ms - b.completion_time_ms)
        .map((s: Submission) => ({
          playerId: s.player_id,
          completionTimeMs: s.completion_time_ms,
          status: s.status,
        }));

      // Using Supabase Realtime broadcast via REST
      const broadcastPayload = isGameOver
        ? {
            event: 'game_over',
            payload: {
              winnerPlayerId: survivors[0] ?? null,
              finalRoundNumber: currentRoundNum,
              eliminatedPlayers: eliminatedDetails,
              roundStandings,
            },
          }
        : {
            event: 'round_results',
            payload: {
              roundNumber: currentRoundNum,
              eliminatedPlayers: eliminatedDetails,
              survivorPlayerIds: survivors,
              roundStandings,
              isGameOver: false,
              nextRoundInSeconds: 5,
            },
          };

      // Broadcast via Supabase Realtime channel REST API
      await fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
        },
        body: JSON.stringify({
          messages: [{
            topic: `room:${roomId}`,
            event: broadcastPayload.event,
            payload: broadcastPayload.payload,
          }],
        }),
      });

      return new Response(
        JSON.stringify({
          success: true,
          status: submissionStatus,
          completionTimeMs,
          roundCompleted: true,
          isGameOver,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Not all players submitted yet — return individual result
    return new Response(
      JSON.stringify({
        success: true,
        status: submissionStatus,
        completionTimeMs,
        roundCompleted: false,
        isGameOver: false,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
