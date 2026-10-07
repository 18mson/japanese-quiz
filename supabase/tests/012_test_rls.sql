-- ============================================================
-- SQL Test: RLS Verification for Daily Sentence Practice
-- File: supabase/tests/012_test_rls.sql
-- Run inside Supabase SQL Editor or psql to verify RLS protections.
-- ============================================================

BEGIN;

-- 1. Setup mock test users
DO $$
DECLARE
  v_user_a UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  v_user_b UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  v_session_id UUID;
  v_question_id UUID;
  v_daily_q_id UUID;
  v_count INT;
BEGIN
  RAISE NOTICE '=== START RLS SECURITY TESTS ===';

  -- Simulate Service Role: seed test data
  INSERT INTO public.sentence_questions (
    chapter_id, id_text, jp_text, jp_answers, source, source_ref, attribution, status
  ) VALUES (
    1, 'Saya seorang pelajar', 'わたしはがくせいです', ARRAY['わたしはがくせいです', '私は学生です'],
    'manual', 'test-q1', 'Test Attribution', 'approved'
  ) RETURNING id INTO v_question_id;

  -- Insert mock daily session for User A
  INSERT INTO public.daily_sessions (
    user_id, session_date, chapter_ids, status
  ) VALUES (
    v_user_a, '2026-10-06', ARRAY[1], 'active'
  ) RETURNING id INTO v_session_id;

  -- Insert mock daily question for User A
  INSERT INTO public.daily_questions (
    session_id, user_id, question_id, chapter_id, is_correct, attempts
  ) VALUES (
    v_session_id, v_user_a, v_question_id, 1, false, 0
  ) RETURNING id INTO v_daily_q_id;

  -- ------------------------------------------------------------
  -- TEST 1: Anon role cannot SELECT sentence_questions
  -- ------------------------------------------------------------
  PERFORM set_config('role', 'anon', true);
  SELECT count(*) INTO v_count FROM public.sentence_questions;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'TEST 1 FAILED: Anon should not see sentence_questions, saw %', v_count;
  END IF;
  RAISE NOTICE '✓ TEST 1 PASSED: Anon cannot view sentence_questions';

  -- ------------------------------------------------------------
  -- TEST 2: Authenticated User A cannot SELECT sentence_questions
  -- ------------------------------------------------------------
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', v_user_a::text, true);

  SELECT count(*) INTO v_count FROM public.sentence_questions;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'TEST 2 FAILED: Authenticated user should not see sentence_questions, saw %', v_count;
  END IF;
  RAISE NOTICE '✓ TEST 2 PASSED: Authenticated user cannot view sentence_questions (answers protected)';

  -- ------------------------------------------------------------
  -- TEST 3: Authenticated user cannot INSERT into daily_sessions
  -- ------------------------------------------------------------
  BEGIN
    INSERT INTO public.daily_sessions (user_id, session_date, chapter_ids, status)
    VALUES (v_user_a, '2026-10-07', ARRAY[1], 'active');
    RAISE EXCEPTION 'TEST 3 FAILED: Client should not be allowed to INSERT into daily_sessions';
  EXCEPTION WHEN insufficient_privilege OR row_security_active_violation OR integrity_constraint_violation THEN
    RAISE NOTICE '✓ TEST 3 PASSED: Direct client INSERT to daily_sessions blocked by RLS';
  END;

  -- ------------------------------------------------------------
  -- TEST 4: Authenticated user cannot UPDATE daily_questions
  -- ------------------------------------------------------------
  BEGIN
    UPDATE public.daily_questions
    SET is_correct = true
    WHERE id = v_daily_q_id;
    -- If RLS denies update, row count updated will be 0 or exception thrown
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN
      RAISE EXCEPTION 'TEST 4 FAILED: Client was able to UPDATE daily_questions directly';
    END IF;
    RAISE NOTICE '✓ TEST 4 PASSED: Direct client UPDATE to daily_questions blocked (0 rows affected)';
  END;

  -- ------------------------------------------------------------
  -- TEST 5: Authenticated User B cannot view User A daily_sessions
  -- ------------------------------------------------------------
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', v_user_b::text, true);

  SELECT count(*) INTO v_count FROM public.daily_sessions WHERE user_id = v_user_a;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'TEST 5 FAILED: User B was able to view User A sessions';
  END IF;
  RAISE NOTICE '✓ TEST 5 PASSED: Cross-user session leakage blocked by RLS';

  -- ------------------------------------------------------------
  -- TEST 6: Authenticated User A can only view their own daily_sessions
  -- ------------------------------------------------------------
  PERFORM set_config('request.jwt.claim.sub', v_user_a::text, true);
  SELECT count(*) INTO v_count FROM public.daily_sessions;
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'TEST 6 FAILED: User A should view their own 1 session, found %', v_count;
  END IF;
  RAISE NOTICE '✓ TEST 6 PASSED: User A can successfully view their own session';

  RAISE NOTICE '=== ALL RLS SECURITY TESTS PASSED! ===';
END $$;

ROLLBACK; -- Clean rollback ensures zero test data pollution
