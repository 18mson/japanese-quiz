-- Migration: 002_scoring.sql
-- Tambah kolom penilaian ke tabel round_submissions
-- correct_chars : total huruf yang berhasil diketik dengan benar
-- wrong_chars   : total kesalahan ketik (tiap kali penalty dipicu)
-- score         : skor akhir yang dihitung oleh server sebelum disimpan

ALTER TABLE public.round_submissions
  ADD COLUMN IF NOT EXISTS correct_chars INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wrong_chars   INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score         INT NOT NULL DEFAULT 0;
