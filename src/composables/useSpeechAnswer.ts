import { ref, onUnmounted, getCurrentInstance } from 'vue';

// Deklarasi type untuk SpeechRecognition browser
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export function useSpeechAnswer() {
  const isListening = ref(false);
  const transcript = ref('');
  const interimTranscript = ref('');
  const error = ref<string | null>(null);
  const errorCode = ref<string | null>(null);

  const isBrowser = typeof window !== 'undefined';
  const SpeechRecognitionConstructor = isBrowser
    ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    : null;

  const isSupported = ref(!!SpeechRecognitionConstructor);

  let recognitionInstance: any = null;

  function mapErrorMessage(code: string): string {
    switch (code) {
      case 'not-allowed':
        return 'Izin mikrofon ditolak. Izinkan akses mikrofon di pengaturan browser.';
      case 'no-speech':
        return 'Suara tidak terdengar. Coba bicara lebih dekat atau ulangi kalimat.';
      case 'network':
        return 'Gangguan jaringan untuk layanan pengenalan suara.';
      case 'audio-capture':
        return 'Mikrofon tidak terdeteksi atau sedang dipakai aplikasi lain.';
      case 'aborted':
        return 'Perekaman suara dibatalkan.';
      default:
        return `Kendala pengenalan suara: ${code}`;
    }
  }

  function initRecognition() {
    if (!SpeechRecognitionConstructor) return null;
    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = 'ja-JP';
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    recognition.onstart = () => {
      isListening.value = true;
      error.value = null;
      errorCode.value = null;
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalStr += item[0].transcript;
        } else {
          interimStr += item[0].transcript;
        }
      }

      if (finalStr) {
        transcript.value = (transcript.value + ' ' + finalStr).trim();
        interimTranscript.value = '';
      } else {
        interimTranscript.value = interimStr;
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      errorCode.value = event.error;
      error.value = mapErrorMessage(event.error);
      isListening.value = false;
    };

    recognition.onend = () => {
      isListening.value = false;
      interimTranscript.value = '';
    };

    return recognition;
  }

  function startListening() {
    if (!isSupported.value) {
      error.value = 'Browser Anda tidak mendukung Web Speech Recognition. Gunakan keyboard.';
      return;
    }

    try {
      if (!recognitionInstance) {
        recognitionInstance = initRecognition();
      }
      error.value = null;
      errorCode.value = null;
      recognitionInstance.start();
    } catch (err: any) {
      // Jika sudah running atau re-triggered cepat
      if (err.name === 'InvalidStateError') {
        try {
          recognitionInstance.stop();
          setTimeout(() => {
            try { recognitionInstance.start(); } catch {}
          }, 150);
        } catch {}
      } else {
        error.value = err.message || 'Gagal memulai mikrofon.';
      }
    }
  }

  function stopListening() {
    if (recognitionInstance && isListening.value) {
      try {
        recognitionInstance.stop();
      } catch {}
    }
    isListening.value = false;
  }

  function resetTranscript() {
    transcript.value = '';
    interimTranscript.value = '';
    error.value = null;
    errorCode.value = null;
  }

  if (getCurrentInstance()) {
    onUnmounted(() => {
      stopListening();
      recognitionInstance = null;
    });
  }

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    errorCode,
    startListening,
    stopListening,
    resetTranscript,
  };
}
