-- Migration 011: Allow public read of user_streaks for Character Mastery Leaderboard
-- Previously, RLS restricted SELECT to (auth.uid() = user_id), preventing other players
-- from appearing in the "Huruf" mastery leaderboard.
-- INSERT, UPDATE, and DELETE policies remain strictly restricted to (auth.uid() = user_id).

DROP POLICY IF EXISTS "Users can read own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Allow public select for user_streaks" ON public.user_streaks;

CREATE POLICY "Allow public select for user_streaks" ON public.user_streaks
  FOR SELECT USING (true);
