-- ============================================================
-- Typing Battleground — Database Migration
-- ============================================================

-- 1. ROOMS TABLE
-- Stores the game room state, configured by the host.
CREATE TABLE IF NOT EXISTS public.rooms (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              VARCHAR(6)  UNIQUE NOT NULL,
  host_player_id    TEXT        NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'waiting',
  -- 'waiting' | 'in_progress' | 'finished'
  max_players       INT         NOT NULL DEFAULT 8,
  elimination_rate  FLOAT       NOT NULL DEFAULT 0.30,
  -- Fraction of slowest alive players to eliminate per round (if no typos)
  min_ms_per_char   INT         NOT NULL DEFAULT 40,
  -- Anti-cheat: minimum ms per character. Below this = disqualified.
  current_round_num INT         NOT NULL DEFAULT 0,
  used_sentence_ids JSONB       NOT NULL DEFAULT '[]'::jsonb,
  -- Tracks which sentence IDs have been used to avoid repeats.
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ROOM_PLAYERS TABLE
-- Stores each player's membership and live status within a room.
CREATE TABLE IF NOT EXISTS public.room_players (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id             UUID        NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id           TEXT        NOT NULL,
  -- Supabase auth UID or guest session ID
  player_name         VARCHAR(60) NOT NULL,
  avatar_seed         TEXT,
  -- Used to generate deterministic avatar (e.g. DiceBear seed)
  status              VARCHAR(20) NOT NULL DEFAULT 'alive',
  -- 'alive' | 'eliminated' | 'spectator'
  eliminated_in_round INT         DEFAULT NULL,
  elimination_reason  VARCHAR(20) DEFAULT NULL,
  -- 'typo' | 'too_slow' | 'disconnect' | 'timeout'
  final_rank          INT         DEFAULT NULL,
  -- Assigned upon elimination. 1 = winner.
  joined_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, player_id)
);

-- 3. ROUNDS TABLE
-- One row per game round. Stores the sentence and timing info.
CREATE TABLE IF NOT EXISTS public.rounds (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id                UUID        NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  round_number           INT         NOT NULL,
  sentence_id            TEXT        NOT NULL,
  sentence_japanese      TEXT        NOT NULL,
  sentence_romaji_variants JSONB     NOT NULL,
  -- Serialized romaji_variants array from sentences.ts data model
  sentence_word_spans    JSONB,
  -- Serialized word_spans array
  sentence_meaning       TEXT,
  status                 VARCHAR(20) NOT NULL DEFAULT 'preparing',
  -- 'preparing' | 'active' | 'evaluating' | 'completed'
  start_at               TIMESTAMPTZ,
  -- Server timestamp when typing begins. Broadcast to clients.
  duration_seconds       INT         NOT NULL DEFAULT 30,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, round_number)
);

-- 4. ROUND_SUBMISSIONS TABLE
-- One row per player per round. Stores the validated submission result.
CREATE TABLE IF NOT EXISTS public.round_submissions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id            UUID        NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  room_id             UUID        NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id           TEXT        NOT NULL,
  typed_input         TEXT        NOT NULL,
  -- The raw string the player typed (stored for audit)
  is_valid            BOOLEAN     NOT NULL DEFAULT false,
  completion_time_ms  INT         NOT NULL,
  -- Server-calculated: now() - round.start_at at time of submission
  status              VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'success' | 'typo' | 'disqualified' | 'timeout'
  submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(round_id, player_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_rooms_code           ON public.rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_status         ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_room_players_room    ON public.room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_room_players_status  ON public.room_players(room_id, status);
CREATE INDEX IF NOT EXISTS idx_rounds_room          ON public.rounds(room_id);
CREATE INDEX IF NOT EXISTS idx_rounds_status        ON public.rounds(room_id, status);
CREATE INDEX IF NOT EXISTS idx_submissions_round    ON public.round_submissions(round_id);
CREATE INDEX IF NOT EXISTS idx_submissions_room     ON public.round_submissions(room_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.rooms              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.round_submissions  ENABLE ROW LEVEL SECURITY;

-- ROOMS: Allow anyone to read rooms (needed for join-by-code lookup).
-- Write/update controlled via Edge Functions using service role.
CREATE POLICY "rooms_select_all"
  ON public.rooms FOR SELECT
  USING (true);

-- ROOM_PLAYERS: Allow any authenticated user to read players in any room.
CREATE POLICY "room_players_select_all"
  ON public.room_players FOR SELECT
  USING (true);

-- Players can insert themselves (join a room).
CREATE POLICY "room_players_insert_self"
  ON public.room_players FOR INSERT
  WITH CHECK (player_id = auth.uid()::text OR player_id LIKE 'guest_%');

-- ROUNDS: Public read (players need to see the round sentence).
CREATE POLICY "rounds_select_all"
  ON public.rounds FOR SELECT
  USING (true);

-- ROUND_SUBMISSIONS: Players can only read their own submission.
-- Full results are broadcast via Edge Function after evaluation.
CREATE POLICY "submissions_select_own"
  ON public.round_submissions FOR SELECT
  USING (player_id = auth.uid()::text OR player_id LIKE 'guest_%');

-- Players can insert their own submission (pre-validation).
-- The Edge Function runs with service_role so it bypasses RLS for updates.
CREATE POLICY "submissions_insert_own"
  ON public.round_submissions FOR INSERT
  WITH CHECK (player_id = auth.uid()::text OR player_id LIKE 'guest_%');
