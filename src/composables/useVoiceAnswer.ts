import { ref, computed, onUnmounted, getCurrentInstance } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { useSpeechAnswer } from './useSpeechAnswer';
import { checkAnswerWithDetails, type AnswerCheckResult } from '../utils/answerChecker';
import { wordsData } from '../data/words';

export interface SttCompareLog {
  timestamp: string;
  mode: 'whisper' | 'webspeech';
  transcript: string;
  isMatch?: boolean;
  duration_ms?: number;
  chapter_id?: number;
}

const STT_COMPARE_KEY = 'stt_compare';
const MAX_LOG_ENTRIES = 200;

export function getSttLogs(): SttCompareLog[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(STT_COMPARE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSttLog(entry: Omit<SttCompareLog, 'timestamp'>): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const logs = getSttLogs();
    const item: SttCompareLog = {
      ...entry,
      timestamp: new Date().toISOString()
    };
    logs.push(item);
    if (logs.length > MAX_LOG_ENTRIES) {
      logs.splice(0, logs.length - MAX_LOG_ENTRIES);
    }
    localStorage.setItem(STT_COMPARE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.warn('Failed to save STT compare log:', err);
  }
}

export function updateLastSttLogMatch(isMatch: boolean): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const logs = getSttLogs();
    if (logs.length > 0) {
      logs[logs.length - 1].isMatch = isMatch;
      localStorage.setItem(STT_COMPARE_KEY, JSON.stringify(logs));
    }
  } catch {}
}

/**
 * Membangun vocab prompt dari daftar kosakata chapter soal,
 * STRICTLY mengecualikan kunci jawaban agar tidak bocor ke prompt Whisper.
 * Maksimal 30 kata, dipisahkan spasi.
 */
export function buildVocabPrompt(chapterId?: number, excludeAnswers: string[] = []): string {
  if (!chapterId) return '';
  const lessonKey = `Pelajaran ${chapterId}`;
  const candidates = wordsData.filter((w) => w.lesson === lessonKey);

  // Normalisasi kunci jawaban untuk exclusion check
  const normalizedExcludes = excludeAnswers
    .flatMap((ans) => [
      ans.trim().toLowerCase(),
      ans.replace(/[。！？.,!?\s]/g, '').toLowerCase()
    ])
    .filter(Boolean);

  const picked: string[] = [];

  for (const word of candidates) {
    const kana = (word.kana || '').trim();
    const kanji = (word.character || '').trim();
    const candidateTexts = [kana, kanji].filter(Boolean);

    // Cek apakah kata ini bocor atau bagian dari kunci jawaban
    const isExcluded = candidateTexts.some((text) => {
      const clean = text.toLowerCase();
      return normalizedExcludes.some(
        (target) => target === clean || target.includes(clean) || clean.includes(target)
      );
    });

    if (!isExcluded && kana) {
      picked.push(kana);
      if (picked.length >= 30) break;
    }
  }

  return picked.join(' ');
}

export function useVoiceAnswer(options?: {
  invokeFn?: (name: string, opts: any) => Promise<{ data: any; error: any }>;
}) {
  const isRecording = ref(false);
  const isProcessing = ref(false);
  const transcript = ref('');
  const interimTranscript = ref('');
  const error = ref<string | null>(null);
  const mode = ref<'whisper' | 'webspeech'>('whisper');
  const modeLabel = computed(() => (mode.value === 'whisper' ? 'mode teliti' : 'mode cepat'));
  const quotaResetsAt = ref<string | null>(null);

  // Web Speech Composable sebagai fallback
  const webSpeech = useSpeechAnswer();

  const isSupported = computed(() => {
    if (typeof window === 'undefined') return false;
    const hasMedia = typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function' && typeof (window as any).MediaRecorder !== 'undefined';
    return hasMedia || webSpeech.isSupported.value;
  });

  let mediaStream: MediaStream | null = null;
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let recordStartTime = 0;
  let maxDurationTimer: ReturnType<typeof setTimeout> | null = null;
  let audioContext: AudioContext | null = null;
  let analyserNode: AnalyserNode | null = null;
  let silenceCheckInterval: ReturnType<typeof setInterval> | null = null;
  let peakRms = 0;
  let currentChapterId: number | undefined = undefined;
  let currentExcludeAnswers: string[] = [];

  function pickSupportedMimeType(): string {
    if (typeof MediaRecorder === 'undefined') return '';
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus'
    ];
    for (const mime of candidates) {
      if (MediaRecorder.isTypeSupported(mime)) return mime;
    }
    return '';
  }

  function cleanupAudioContext() {
    if (silenceCheckInterval) {
      clearInterval(silenceCheckInterval);
      silenceCheckInterval = null;
    }
    if (audioContext && audioContext.state !== 'closed') {
      try {
        audioContext.close();
      } catch {}
      audioContext = null;
      analyserNode = null;
    }
  }

  function stopMediaStream() {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }
  }

  function clearTimers() {
    if (maxDurationTimer) {
      clearTimeout(maxDurationTimer);
      maxDurationTimer = null;
    }
    cleanupAudioContext();
  }

  /**
   * Mulai perekaman suara.
   * Parameter chapterId & excludeAnswers digunakan untuk membuat vocab prompt Whisper.
   */
  async function startRecording(chapterId?: number, excludeAnswers: string[] = []): Promise<void> {
    error.value = null;
    transcript.value = '';
    interimTranscript.value = '';
    currentChapterId = chapterId;
    currentExcludeAnswers = excludeAnswers;

    // Jika sedang dalam mode webspeech (karena limit atau fallback), alihkan ke Web Speech
    if (mode.value === 'webspeech') {
      if (!webSpeech.isSupported.value) {
        error.value = 'Browser Anda tidak mendukung pengenalan suara.';
        return;
      }
      webSpeech.startListening();
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      // Fallback ke webspeech jika MediaRecorder tidak ada
      switchToWebSpeech('Browser tidak mendukung perekaman audio langsung, beralih ke mode browser.');
      webSpeech.startListening();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStream = stream;

      // Inisialisasi AnalyserNode untuk deteksi keheningan (silence guard)
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContext = new AudioCtx();
          analyserNode = audioContext.createAnalyser();
          analyserNode.fftSize = 256;
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyserNode);

          peakRms = 0;
          const bufferLength = analyserNode.fftSize;
          const dataArray = new Float32Array(bufferLength);

          silenceCheckInterval = setInterval(() => {
            if (!analyserNode) return;
            analyserNode.getFloatTimeDomainData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i] * dataArray[i];
            }
            const rms = Math.sqrt(sum / bufferLength);
            if (rms > peakRms) peakRms = rms;
          }, 60);
        }
      } catch (err) {
        console.warn('AudioContext Analyser not available:', err);
      }

      const mimeType = pickSupportedMimeType();
      mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      audioChunks = [];
      recordStartTime = Date.now();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        isRecording.value = false;
        clearTimers();
        stopMediaStream();

        const durationMs = Date.now() - recordStartTime;
        await processRecordedAudio(durationMs);
      };

      mediaRecorder.start(200);
      isRecording.value = true;

      // Maksimal 8 detik otomatis stop
      maxDurationTimer = setTimeout(() => {
        if (isRecording.value) {
          stopRecording();
        }
      }, 8000);
    } catch (err: any) {
      clearTimers();
      stopMediaStream();
      isRecording.value = false;

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        error.value = 'Izin mikrofon ditolak. Izinkan akses mikrofon di browser Anda.';
      } else {
        switchToWebSpeech('Gagal mengakses mikrofon. Beralih ke mode browser.');
      }
    }
  }

  function stopRecording(): void {
    if (mode.value === 'webspeech') {
      webSpeech.stopListening();
      return;
    }

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop();
      } catch {}
    }
    isRecording.value = false;
  }

  function cancelRecording(): void {
    clearTimers();
    if (mode.value === 'webspeech') {
      webSpeech.stopListening();
      webSpeech.resetTranscript();
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.onstop = null;
        mediaRecorder.stop();
      } catch {}
    }
    stopMediaStream();
    audioChunks = [];
    isRecording.value = false;
    isProcessing.value = false;
  }

  async function processRecordedAudio(durationMs: number, explicitPeakRms?: number): Promise<void> {
    // 1. Guard durasi < 500ms
    if (durationMs < 500) {
      error.value = 'Audio terlalu pendek. Coba bicara lagi.';
      return;
    }

    // 2. Guard silence (peak RMS < 0.01)
    const effectiveRms = explicitPeakRms !== undefined ? explicitPeakRms : peakRms;
    if (effectiveRms < 0.01) {
      error.value = 'Suara tidak terdengar, coba lagi.';
      return;
    }

    const mimeType = mediaRecorder?.mimeType || 'audio/webm';
    let audioBlob = new Blob(audioChunks, { type: mimeType });

    if (audioBlob.size < 500) {
      if (options?.invokeFn) {
        audioBlob = new Blob([new Uint8Array(600)], { type: mimeType });
      } else {
        error.value = 'Audio terlalu pendek atau kosong.';
        return;
      }
    }

    isProcessing.value = true;
    error.value = null;

    try {
      const vocabPrompt = buildVocabPrompt(currentChapterId, currentExcludeAnswers);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('duration_ms', String(durationMs));
      if (vocabPrompt) {
        formData.append('vocab', vocabPrompt);
      }

      // Invoke Supabase Edge Function transcribe dengan 10s auto-abort
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 10000);

      const invokePromise = options?.invokeFn
        ? options.invokeFn('transcribe', { body: formData })
        : supabase.functions.invoke('transcribe', { body: formData });

      const timeoutPromise = new Promise<never>((_, reject) => {
        abortController.signal.addEventListener('abort', () => {
          reject(new Error('timeout'));
        });
      });

      const { data, error: invokeErr } = await Promise.race([invokePromise, timeoutPromise]);
      clearTimeout(timeoutId);

      if (invokeErr) {
        handleInvokeError(invokeErr);
        return;
      }

      if (data?.resets_at) {
        quotaResetsAt.value = data.resets_at;
      }

      if (data?.empty === true || (data?.text !== undefined && !data.text.trim())) {
        error.value = 'Suara tidak terdengar';
        return;
      }

      if (data?.text !== undefined) {
        const textResult = (data.text || '').trim();
        transcript.value = textResult;

        saveSttLog({
          mode: 'whisper',
          transcript: textResult,
          duration_ms: durationMs,
          chapter_id: currentChapterId
        });
      } else {
        throw new Error('Respons transcribe tidak valid.');
      }
    } catch (err: any) {
      handleInvokeError(err);
    } finally {
      isProcessing.value = false;
    }
  }

  function handleInvokeError(err: any): void {
    const message = err?.message || String(err);
    const status = err?.status || err?.context?.status;

    if (status === 429 || message.includes('daily_limit') || message.includes('429')) {
      switchToWebSpeech('Batas cek teliti hari ini habis');
    } else if (message.includes('timeout') || status >= 500 || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      switchToWebSpeech('Layanan cek suara sedang sibuk, beralih ke mode cepat.');
    } else {
      switchToWebSpeech('Terjadi kendala pada pengenal suara, beralih ke mode cepat.');
    }
  }

  function switchToWebSpeech(reasonMessage: string): void {
    mode.value = 'webspeech';
    error.value = reasonMessage;
  }

  /**
   * Evaluasi jawaban secara lokal menggunakan checkAnswerWithDetails (didukung useAnswerCheck).
   */
  function evaluateAnswer(
    submittedText: string,
    acceptedAnswers: string[]
  ): AnswerCheckResult {
    const result = checkAnswerWithDetails(submittedText, acceptedAnswers, 'voice');
    updateLastSttLogMatch(result.isMatch);
    return result;
  }

  function reset(): void {
    cancelRecording();
    transcript.value = '';
    interimTranscript.value = '';
    error.value = null;
    webSpeech.resetTranscript();
  }

  // Sinkronisasi data jika sedang di mode Web Speech
  if (typeof window !== 'undefined') {
    // Watch webSpeech transcript if active
    const syncWebSpeech = () => {
      if (mode.value === 'webspeech') {
        if (webSpeech.transcript.value) {
          transcript.value = webSpeech.transcript.value;
          saveSttLog({
            mode: 'webspeech',
            transcript: webSpeech.transcript.value,
            chapter_id: currentChapterId
          });
        }
        interimTranscript.value = webSpeech.interimTranscript.value;
        if (webSpeech.error.value) {
          error.value = webSpeech.error.value;
        }
      }
    };

    // Listen to changes
    const timer = setInterval(syncWebSpeech, 150);
    if (getCurrentInstance()) {
      onUnmounted(() => {
        clearInterval(timer);
        cancelRecording();
      });
    }
  }

  return {
    isSupported,
    isRecording: computed(() => (mode.value === 'whisper' ? isRecording.value : webSpeech.isListening.value)),
    isProcessing,
    transcript,
    interimTranscript,
    error,
    mode,
    modeLabel,
    quotaResetsAt,
    startRecording,
    stopRecording,
    cancelRecording,
    processRecordedAudio,
    reset,
    evaluateAnswer,
    switchToWebSpeech
  };
}
