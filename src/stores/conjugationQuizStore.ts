// src/stores/conjugationQuizStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { toRomaji, toHiragana } from 'wanakana';
import { konjugasiKataKerjaData, type VerbItem } from '../data/referenceData';
import { ADJECTIVE_ITEMS, type AdjectiveItem, type AdjectiveForms } from '../services/adjectiveConjugationService';
import { playCorrectSound, playIncorrectSound } from '../utils/battleSoundManager';

export type ConjugationSubMode = 'verb' | 'adjective' | 'mixed';
export type VerbTargetForm = 'te' | 'kamus' | 'nai' | 'ta' | 'random';
export type AdjectiveTargetForm = 'presentNegative' | 'pastPositive' | 'pastNegative' | 'teForm' | 'random';

export interface ConjugationQuestion {
  id: string;
  category: 'verb' | 'adjective';
  baseWord: string;         // e.g. 食べます / 静か
  baseReading?: string;     // e.g. たべます / しずか
  meaning: string;          // e.g. makan / tenang
  targetFormKey: string;    // e.g. 'te' / 'pastPositive'
  targetFormLabel: string;  // e.g. 'Bentuk -Te (て形)'
  correctAnswer: string;    // e.g. 食べて / 静かだった
  correctReading: string;   // e.g. たべて / しずかだった
  acceptedAnswers: string[];// Variasi yang diterima (kanji, kana, romaji, alts)
  options: string[];        // 4 opsi pilihan ganda
  formulaTip: string;       // e.g. '~みます -> ~んで' / '~い -> ~くない'
}

export interface ConjugationAnswerRecord {
  questionId: string;
  givenAnswer: string;
  isCorrect: boolean;
  question: ConjugationQuestion;
}

export const useConjugationQuizStore = defineStore('conjugationQuiz', () => {
  const subMode = ref<ConjugationSubMode>('verb');
  const targetFormFilter = ref<string>('random');
  const questions = ref<ConjugationQuestion[]>([]);
  const currentIndex = ref(0);
  const userAnswers = ref<ConjugationAnswerRecord[]>([]);
  const isQuizFinished = ref(false);
  const score = ref(0);
  const streak = ref(0);
  const highestStreak = ref(0);

  const currentQuestion = computed<ConjugationQuestion | null>(() => {
    return questions.value[currentIndex.value] || null;
  });

  const totalQuestions = computed(() => questions.value.length);
  const correctCount = computed(() => userAnswers.value.filter(a => a.isCorrect).length);
  const accuracy = computed(() => {
    if (userAnswers.value.length === 0) return 0;
    return Math.round((correctCount.value / userAnswers.value.length) * 100);
  });

  // Semua kata kerja N5 dari referensi (154 kata kerja)
  const allVerbs = computed<VerbItem[]>(() => {
    return [
      ...konjugasiKataKerjaData.kelompok_1.verbs,
      ...konjugasiKataKerjaData.kelompok_2.verbs,
      ...konjugasiKataKerjaData.kelompok_3.verbs
    ];
  });

  function shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /**
   * Menghasilkan soal kata kerja
   */
  function createVerbQuestion(verb: VerbItem, formKey?: VerbTargetForm): ConjugationQuestion {
    const forms: Array<{ key: 'te' | 'kamus' | 'nai' | 'ta'; label: string }> = [
      { key: 'te', label: 'Bentuk -Te (て形)' },
      { key: 'kamus', label: 'Bentuk Kamus (辞書形)' },
      { key: 'nai', label: 'Bentuk -Nai (ない形)' },
      { key: 'ta', label: 'Bentuk -Ta (た形)' }
    ];

    let chosen = forms[0];
    if (formKey && formKey !== 'random') {
      chosen = forms.find(f => f.key === formKey) || forms[0];
    } else {
      chosen = forms[Math.floor(Math.random() * forms.length)];
    }

    const rawCorrect = (verb as any)[chosen.key] as string;
    // Bersihkan spasi atau tanda hubung jika ada (misal: "あわ ない" -> "あわない", "－ない" -> "ない")
    const cleanCorrect = rawCorrect.replace(/[\s－-]/g, '');

    // Buat distraktor dari bentuk lain kata yang sama
    const distractorCandidates = forms
      .filter(f => f.key !== chosen.key)
      .map(f => ((verb as any)[f.key] as string).replace(/[\s－-]/g, ''));

    // Distraktor tambahan jika kurang dari 3
    while (distractorCandidates.length < 3) {
      distractorCandidates.push(verb.masu.replace(/[\s－-]/g, ''));
    }

    const options = shuffle([cleanCorrect, ...distractorCandidates.slice(0, 3)]);

    const accepted = [cleanCorrect, rawCorrect];
    // Variasi Romaji
    accepted.push(toRomaji(cleanCorrect));

    // Variasi Kanji jika kata berkanji (misal: "会います" -> "会って")
    if (verb.masu_reading) {
      const cleanReading = verb.masu_reading.replace(/\s+/g, '');
      const stemReading = cleanReading.replace(/ます$/, '');
      const stemKanji = verb.masu.replace(/ます$/, '');
      if (stemKanji !== stemReading && cleanCorrect.startsWith(stemReading)) {
        const kanjiForm = cleanCorrect.replace(stemReading, stemKanji);
        accepted.push(kanjiForm);
      }
    }

    return {
      id: `vq_${verb.masu}_${chosen.key}_${Math.random().toString(36).substring(2, 7)}`,
      category: 'verb',
      baseWord: verb.masu,
      baseReading: verb.masu_reading?.replace(/\s+/g, ''),
      meaning: verb.meaning,
      targetFormKey: chosen.key,
      targetFormLabel: chosen.label,
      correctAnswer: cleanCorrect,
      correctReading: cleanCorrect,
      acceptedAnswers: accepted,
      options,
      formulaTip: `Pelajaran ${verb.pelajaran} • Kata Kerja Minna no Nihongo`
    };
  }

  /**
   * Menghasilkan soal kata sifat
   */
  function createAdjectiveQuestion(adj: AdjectiveItem, formKey?: AdjectiveTargetForm): ConjugationQuestion {
    const forms: Array<{ key: keyof AdjectiveForms; label: string }> = [
      { key: 'presentNegative', label: 'Bentuk Negatif (〜くない / 〜じゃない)' },
      { key: 'pastPositive', label: 'Bentuk Lampau (〜かった / 〜だった)' },
      { key: 'pastNegative', label: 'Bentuk Negatif Lampau (〜くなかった / 〜じゃなかった)' },
      { key: 'teForm', label: 'Bentuk Sambung (〜くて / 〜で)' }
    ];

    let chosen = forms[0];
    if (formKey && formKey !== 'random') {
      chosen = forms.find(f => f.key === formKey) || forms[0];
    } else {
      chosen = forms[Math.floor(Math.random() * forms.length)];
    }

    const correct = adj.forms[chosen.key];
    const accepted = [correct];
    if (adj.alts && adj.alts[chosen.key]) {
      accepted.push(...(adj.alts[chosen.key] as string[]));
    }

    // Variasi Kana & Romaji
    if (adj.type === 'i') {
      const kanaStem = adj.kana.endsWith('い') ? adj.kana.slice(0, -1) : adj.kana;
      const kanjiStem = adj.kanji.endsWith('い') ? adj.kanji.slice(0, -1) : adj.kanji;
      if (correct.startsWith(kanjiStem)) {
        const kanaForm = correct.replace(kanjiStem, kanaStem);
        accepted.push(kanaForm);
        accepted.push(toRomaji(kanaForm));
      }
    } else {
      if (correct.startsWith(adj.kanji)) {
        const kanaForm = correct.replace(adj.kanji, adj.kana);
        accepted.push(kanaForm);
        accepted.push(toRomaji(kanaForm));
      }
    }
    accepted.push(toRomaji(correct));

    // Distraktor dari bentuk lain kata sifat yang sama
    const distractorCandidates = forms
      .filter(f => f.key !== chosen.key)
      .map(f => adj.forms[f.key]);

    while (distractorCandidates.length < 3) {
      distractorCandidates.push(adj.kanji);
    }

    const options = shuffle([correct, ...distractorCandidates.slice(0, 3)]);

    return {
      id: `aq_${adj.kanji}_${chosen.key}_${Math.random().toString(36).substring(2, 7)}`,
      category: 'adjective',
      baseWord: adj.kanji,
      baseReading: adj.kana,
      meaning: adj.meaning,
      targetFormKey: chosen.key,
      targetFormLabel: chosen.label,
      correctAnswer: correct,
      correctReading: correct,
      acceptedAnswers: accepted,
      options,
      formulaTip: adj.type === 'i' ? 'Kata Sifat-i (い形容詞)' : 'Kata Sifat-na (な形容詞)'
    };
  }

  /**
   * Inisialisasi sesi kuis konjugasi
   */
  function initSession(mode: ConjugationSubMode = 'verb', formFilter = 'random', count = 10) {
    subMode.value = mode;
    targetFormFilter.value = formFilter;
    currentIndex.value = 0;
    userAnswers.value = [];
    isQuizFinished.value = false;
    score.value = 0;
    streak.value = 0;
    highestStreak.value = 0;

    const generated: ConjugationQuestion[] = [];

    if (mode === 'verb') {
      const shuffledVerbs = shuffle(allVerbs.value);
      for (const v of shuffledVerbs.slice(0, count)) {
        generated.push(createVerbQuestion(v, formFilter as VerbTargetForm));
      }
    } else if (mode === 'adjective') {
      const shuffledAdjs = shuffle(ADJECTIVE_ITEMS);
      for (const a of shuffledAdjs.slice(0, count)) {
        generated.push(createAdjectiveQuestion(a, formFilter as AdjectiveTargetForm));
      }
    } else {
      // Mixed: separuh kata kerja, separuh kata sifat
      const halfCount = Math.ceil(count / 2);
      const shuffledVerbs = shuffle(allVerbs.value).slice(0, halfCount);
      const shuffledAdjs = shuffle(ADJECTIVE_ITEMS).slice(0, count - halfCount);

      shuffledVerbs.forEach(v => generated.push(createVerbQuestion(v, 'random')));
      shuffledAdjs.forEach(a => generated.push(createAdjectiveQuestion(a, 'random')));
    }

    questions.value = shuffle(generated);
  }

  /**
   * Evaluasi jawaban konjugasi
   */
  function checkAnswer(rawInput: string): { isCorrect: boolean } {
    if (!currentQuestion.value) {
      return { isCorrect: false };
    }

    const q = currentQuestion.value;
    const cleanInput = (rawInput || '').trim().replace(/\s+/g, '');
    const inputHiragana = toHiragana(cleanInput).toLowerCase();
    const inputRomaji = toRomaji(cleanInput).toLowerCase();

    const isCorrect = q.acceptedAnswers.some(ans => {
      const cleanAns = ans.trim().replace(/\s+/g, '');
      const ansHiragana = toHiragana(cleanAns).toLowerCase();
      const ansRomaji = toRomaji(cleanAns).toLowerCase();

      return (
        cleanInput.toLowerCase() === cleanAns.toLowerCase() ||
        inputHiragana === ansHiragana ||
        inputRomaji === ansRomaji
      );
    });

    if (isCorrect) {
      score.value += 10 + Math.min(streak.value * 2, 10);
      streak.value++;
      if (streak.value > highestStreak.value) {
        highestStreak.value = streak.value;
      }
      playCorrectSound();
    } else {
      streak.value = 0;
      playIncorrectSound();
    }

    userAnswers.value.push({
      questionId: q.id,
      givenAnswer: rawInput,
      isCorrect,
      question: q
    });

    return { isCorrect };
  }

  function nextQuestion(): boolean {
    if (currentIndex.value < questions.value.length - 1) {
      currentIndex.value++;
      return true;
    } else {
      isQuizFinished.value = true;
      return false;
    }
  }

  function restartQuiz() {
    initSession(subMode.value, targetFormFilter.value, questions.value.length || 10);
  }

  return {
    subMode,
    targetFormFilter,
    questions,
    currentIndex,
    userAnswers,
    isQuizFinished,
    score,
    streak,
    highestStreak,
    currentQuestion,
    totalQuestions,
    correctCount,
    accuracy,
    initSession,
    checkAnswer,
    nextQuestion,
    restartQuiz
  };
});

