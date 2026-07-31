-- Migration 003: Fix RLS permissions for non-logged-in (guest) players and round evaluation

-- Disable RLS on round_submissions, room_players, rooms, rounds for seamless multiplayer
ALTER TABLE public.round_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms              DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds             DISABLE ROW LEVEL SECURITY;

-- If RLS is re-enabled in the future, ensure fully permissive policies exist
DROP POLICY IF EXISTS "submissions_select_own" ON public.round_submissions;
DROP POLICY IF EXISTS "submissions_insert_own" ON public.round_submissions;
DROP POLICY IF EXISTS "submissions_all_permissive" ON public.round_submissions;
CREATE POLICY "submissions_all_permissive" ON public.round_submissions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "room_players_select_all" ON public.room_players;
DROP POLICY IF EXISTS "room_players_insert_self" ON public.room_players;
DROP POLICY IF EXISTS "room_players_all_permissive" ON public.room_players;
CREATE POLICY "room_players_all_permissive" ON public.room_players FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "rooms_select_all" ON public.rooms;
DROP POLICY IF EXISTS "rooms_all_permissive" ON public.rooms;
CREATE POLICY "rooms_all_permissive" ON public.rooms FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "rounds_select_all" ON public.rounds;
DROP POLICY IF EXISTS "rounds_all_permissive" ON public.rounds;
CREATE POLICY "rounds_all_permissive" ON public.rounds FOR ALL USING (true) WITH CHECK (true);
