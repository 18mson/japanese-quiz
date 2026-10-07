import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from './authStore';
import { getTodayWIB, getNextResetWIB } from '../utils/dailyTime';

export interface DailySessionData {
  id: string;
  date: string;
  status: 'active' | 'in_progress' | 'completed';
  chapter_ids: number[];
  resets_at: string;
}

export interface DailyQuestionData {
  daily_question_id: string;
  chapter_id: number;
  id_text: string;
  is_correct: boolean;
  attempts: number;
  revealed?: boolean;
  correct_answer?: string;
}

export interface SubmitAnswerResponse {
  correct: boolean;
  attempts: number;
  session_completed: boolean;
  quota_exhausted: boolean;
  resets_at?: string;
  reveal_answer?: string;
  correct_answer?: string;
}

export const useDailyPracticeStore = defineStore('dailyPractice', () => {
  const authStore = useAuthStore();

  const session = ref<DailySessionData | null>(null);
  const questions = ref<DailyQuestionData[]>([]);
  const currentIndex = ref(0);

  const loading = ref(false);
  const submitting = ref(false);
  const error = ref<string | null>(null);

  const poolLowWarning = ref(false);
  const recycledNotice = ref(false);
  const quotaExhausted = ref(false);
  const resetsAt = ref<string | null>(null);

  // Map daily_question_id -> reveal_answer (hanya didapat dari server setelah >= 3 gagal)
  const revealedAnswers = ref<Record<string, string>>({});

  // Auto-Kana preference (Romaji -> Hiragana conversion via wanakana)
  const autoKana = ref<boolean>(localStorage.getItem('daily_auto_kana') !== 'false');

  function toggleAutoKana() {
    autoKana.value = !autoKana.value;
    localStorage.setItem('daily_auto_kana', autoKana.value ? 'true' : 'false');
  }

  const currentQuestion = computed<DailyQuestionData | null>(() => {
    if (questions.value.length === 0) return null;
    return questions.value[currentIndex.value] || null;
  });

  const totalQuestions = computed(() => questions.value.length);
  const correctCount = computed(() => questions.value.filter(q => q.is_correct).length);
  const progressPercent = computed(() => {
    if (totalQuestions.value === 0) return 0;
    return Math.round((correctCount.value / totalQuestions.value) * 100);
  });

  const canAddChapter = computed(() => {
    if (!session.value) return false;
    const chapters = session.value.chapter_ids || [];
    return chapters.length < 2;
  });

  const allCurrentQuestionsCorrect = computed(() => {
    return questions.value.length > 0 && questions.value.every(q => q.is_correct);
  });

  const isSessionCompleted = computed(() => {
    if (!session.value) return false;
    return (session.value.status === 'completed' || quotaExhausted.value) && !canAddChapter.value;
  });

  const currentRevealedAnswer = computed(() => {
    if (!currentQuestion.value) return null;
    return revealedAnswers.value[currentQuestion.value.daily_question_id] || null;
  });

  /**
   * Pengecekan sesi hari ini:
   * 1. Cek apakah pengguna sudah memiliki sesi hari ini di database Supabase.
   * 2. Jika ada, panggil edge function `start-daily` dengan chapter_ids tersebut untuk memulihkan sesi.
   * 3. Jika belum ada, biarkan session = null agar pengguna memilih bab di ChapterPicker.
   */
  async function checkTodaySession(): Promise<boolean> {
    if (!authStore.user) {
      error.value = 'Silakan masuk terlebih dahulu untuk mengakses Latihan Kalimat Harian.';
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      const today = getTodayWIB();
      const { data: existingSession, error: fetchErr } = await supabase
        .from('daily_sessions')
        .select('id, session_date, chapter_ids, status, completed_at')
        .eq('user_id', authStore.user.id)
        .eq('session_date', today)
        .maybeSingle();

      if (fetchErr) {
        throw new Error(fetchErr.message);
      }

      if (existingSession) {
        // Pulihkan sesi hari ini melalui edge function start-daily
        return await startNewSession(existingSession.chapter_ids);
      } else {
        // Belum ada sesi hari ini
        session.value = null;
        questions.value = [];
        currentIndex.value = 0;
        quotaExhausted.value = false;
        resetsAt.value = getNextResetWIB().toISOString();
        return false;
      }
    } catch (err: any) {
      console.error('Error checking today daily session:', err);
      error.value = err.message || 'Gagal memeriksa sesi harian.';
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Memulai atau memuat sesi harian dengan memanggil Edge Function `start-daily`.
   */
  async function startNewSession(chapterIds: number[]): Promise<boolean> {
    if (!authStore.user) {
      error.value = 'Silakan login terlebih dahulu.';
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('start-daily', {
        body: { chapter_ids: chapterIds }
      });

      if (fnError || !data) {
        let msg = fnError?.message || data?.error || 'Gagal memulai sesi latihan harian.';
        if (fnError && (fnError as any).context) {
          try {
            const errJson = await (fnError as any).context.json();
            if (errJson?.error) msg = errJson.error;
          } catch {}
        }
        throw new Error(msg);
      }

      session.value = {
        id: data.session.id,
        date: data.session.date,
        status: data.session.status,
        chapter_ids: data.session.chapter_ids,
        resets_at: data.session.resets_at
      };

      questions.value = (data.questions || []).map((q: any) => {
        if (q.correct_answer) {
          revealedAnswers.value[q.daily_question_id] = q.correct_answer;
        }
        return {
          daily_question_id: q.daily_question_id,
          chapter_id: q.chapter_id,
          id_text: q.id_text,
          is_correct: q.is_correct ?? false,
          attempts: q.attempts ?? 0,
          revealed: q.revealed ?? false,
          correct_answer: q.correct_answer
        };
      });

      poolLowWarning.value = !!data.pool_low;
      recycledNotice.value = !!data.recycled;
      resetsAt.value = data.session.resets_at || getNextResetWIB().toISOString();

      // Cek apakah sesi sudah selesai (misal semua soal sudah benar dan sudah 2 bab)
      const allCorrect = questions.value.length > 0 && questions.value.every(q => q.is_correct);
      const isFullQuota = (data.session.chapter_ids || []).length >= 2;
      if (data.session.status === 'completed' || (allCorrect && isFullQuota)) {
        quotaExhausted.value = true;
      } else {
        quotaExhausted.value = false;
        // Cari soal pertama yang belum benar
        const firstUnfinished = questions.value.findIndex(q => !q.is_correct);
        currentIndex.value = firstUnfinished >= 0 ? firstUnfinished : (questions.value.length > 0 ? questions.value.length - 1 : 0);
      }

      return true;
    } catch (err: any) {
      console.error('startNewSession error:', err);
      error.value = err.message || 'Gagal memuat soal latihan.';
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Mengirim jawaban untuk soal yang sedang aktif ke Edge Function `submit-answer`.
   */
  async function submitCurrentAnswer(
    submittedText: string,
    inputMethod: 'text' | 'voice' = 'text'
  ): Promise<SubmitAnswerResponse | null> {
    const q = currentQuestion.value;
    if (!q || !session.value) {
      error.value = 'Tidak ada soal aktif untuk dijawab.';
      return null;
    }

    if (submitting.value) return null;

    submitting.value = true;
    error.value = null;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('submit-answer', {
        body: {
          daily_question_id: q.daily_question_id,
          submitted_text: submittedText,
          answer_text: submittedText,
          input_method: inputMethod
        }
      });

      if (fnError || !data) {
        let msg = fnError?.message || data?.error || 'Gagal memeriksa jawaban.';
        if (fnError && (fnError as any).context) {
          try {
            const errJson = await (fnError as any).context.json();
            if (errJson?.error) msg = errJson.error;
          } catch {}
        }
        throw new Error(msg);
      }

      const res: SubmitAnswerResponse = {
        correct: !!data.correct,
        attempts: data.attempts ?? (q.attempts + 1),
        session_completed: !!data.session_completed,
        quota_exhausted: !!data.quota_exhausted,
        resets_at: data.resets_at,
        reveal_answer: data.reveal_answer
      };

      // Update data soal lokal
      q.attempts = res.attempts;
      if (res.correct) {
        q.is_correct = true;
        const answerText = data.correct_answer || submittedText;
        if (answerText) {
          q.correct_answer = answerText;
          revealedAnswers.value[q.daily_question_id] = answerText;
        }
      }

      if (res.reveal_answer) {
        q.revealed = true;
        revealedAnswers.value[q.daily_question_id] = res.reveal_answer;
      }

      if (res.resets_at) {
        resetsAt.value = res.resets_at;
      }

      if (res.session_completed || res.quota_exhausted) {
        quotaExhausted.value = true;
        if (session.value) {
          session.value.status = 'completed';
        }
      }

      return res;
    } catch (err: any) {
      console.error('submitCurrentAnswer error:', err);
      error.value = err.message || 'Gagal mengirim jawaban.';
      return null;
    } finally {
      submitting.value = false;
    }
  }

  function nextQuestion() {
    if (currentIndex.value < questions.value.length - 1) {
      currentIndex.value++;
    }
  }

  function prevQuestion() {
    if (currentIndex.value > 0) {
      currentIndex.value--;
    }
  }

  function jumpToQuestion(idx: number) {
    if (idx >= 0 && idx < questions.value.length) {
      currentIndex.value = idx;
    }
  }

  function resetStore() {
    session.value = null;
    questions.value = [];
    currentIndex.value = 0;
    loading.value = false;
    submitting.value = false;
    error.value = null;
    poolLowWarning.value = false;
    recycledNotice.value = false;
    quotaExhausted.value = false;
    revealedAnswers.value = {};
  }

  return {
    // State
    session,
    questions,
    currentIndex,
    loading,
    submitting,
    error,
    poolLowWarning,
    recycledNotice,
    quotaExhausted,
    resetsAt,
    autoKana,
    revealedAnswers,

    // Getters
    currentQuestion,
    totalQuestions,
    correctCount,
    progressPercent,
    isSessionCompleted,
    currentRevealedAnswer,
    canAddChapter,
    allCurrentQuestionsCorrect,

    // Actions
    toggleAutoKana,
    checkTodaySession,
    startNewSession,
    submitCurrentAnswer,
    nextQuestion,
    prevQuestion,
    jumpToQuestion,
    resetStore
  };
});
