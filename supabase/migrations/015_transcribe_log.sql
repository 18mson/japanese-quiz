-- Migration 015: transcribe_log
-- Logging panggilan transkripsi Whisper (Groq) untuk rate limiting harian & monitoring.
-- PENTING: Jangan menyimpan audio maupun teks hasil transkripsi di mana pun.

CREATE TABLE IF NOT EXISTS public.transcribe_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  audio_bytes int NOT NULL,
  duration_ms int,
  status int NOT NULL,           -- HTTP status dari Groq (200, 429, 5xx)
  ok boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_transcribe_log_user_created 
  ON public.transcribe_log (user_id, created_at DESC);

-- RLS: Pengguna terautentikasi hanya dapat membaca (SELECT) log mereka sendiri.
-- TIDAK ADA policy INSERT/UPDATE/DELETE untuk role authenticated atau anon.
-- Hanya service_role yang dapat menulis/mengelola data.
ALTER TABLE public.transcribe_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own transcribe logs"
  ON public.transcribe_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
