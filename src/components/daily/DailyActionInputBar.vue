<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { 
  Mic, MicOff, Send, X, AlertCircle, 
  ChevronRight, Keyboard 
} from '@lucide/vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    inputMode: 'voice' | 'keyboard';
    actionState: 'advance' | 'send' | 'mic';
    isListening: boolean;
    submitting: boolean;
    disabled?: boolean;
    isCompleted: boolean;
    isLastQuestion: boolean;
    allCompleted?: boolean;
    advanceLabel?: string;
    voiceTranscript?: string;
    voiceError?: string | null;
    isSpeechSupported?: boolean;
  }>(),
  {
    disabled: false,
    allCompleted: false,
    advanceLabel: '',
    voiceTranscript: '',
    voiceError: null,
    isSpeechSupported: true,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'update:inputMode', mode: 'voice' | 'keyboard'): void;
  (e: 'submit'): void;
  (e: 'advance'): void;
  (e: 'toggleMic'): void;
  (e: 'clear'): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const isComposing = ref(false);
const isSpinningMic = ref(false);

function focusInput() {
  nextTick(() => {
    inputRef.value?.focus();
  });
}

defineExpose({
  focusInput,
  inputRef
});

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}

function handleCompositionStart() {
  isComposing.value = true;
}

function handleCompositionEnd(e: CompositionEvent) {
  isComposing.value = false;
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}

function handleInputEnter() {
  if (props.actionState === 'advance') {
    emit('advance');
  } else {
    emit('submit');
  }
}

function handleClear() {
  emit('clear');
  focusInput();
}

function toggleMode() {
  if (props.inputMode === 'voice') {
    emit('update:inputMode', 'keyboard');
    focusInput();
  } else {
    isSpinningMic.value = true;
    setTimeout(() => {
      isSpinningMic.value = false;
    }, 450);
    emit('update:inputMode', 'voice');
  }
}

function handleMainClick() {
  if (props.actionState === 'advance') {
    emit('advance');
  } else if (props.actionState === 'send') {
    emit('submit');
  } else {
    emit('toggleMic');
  }
}

const isMainDisabled = computed(() => {
  if (props.disabled) return true;
  if (props.actionState === 'advance') return false;
  if (props.actionState === 'send') {
    return !props.modelValue.trim() || props.submitting;
  }
  return props.submitting;
});

const computedAdvanceLabel = computed(() => {
  if (props.advanceLabel) return props.advanceLabel;
  return props.isLastQuestion ? 'Selesaikan Latihan' : 'Lanjut ke Soal Berikutnya';
});

const mainActionButtonClasses = computed(() => {
  const base = 'flex items-center justify-center cursor-pointer select-none transition-all duration-300 relative z-10 ';

  if (props.actionState === 'advance') {
    return base + 'h-12 sm:h-14 px-5 sm:px-12 rounded-2xl font-black text-xs sm:text-base bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 ring-4 ring-emerald-400/40 shadow-lg min-w-[180px] sm:min-w-[240px] max-w-full';
  }

  if (props.actionState === 'send') {
    const isReady = props.modelValue.trim() && !props.submitting;
    const color = isReady
      ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-torii dark:hover:bg-torii-hover text-white active:scale-95 shadow-md ring-2 ring-indigo-400/30'
      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-300/40 dark:border-slate-700/40 shadow-xs';
    return base + `h-12 sm:h-14 px-4 sm:px-6 rounded-2xl font-extrabold text-sm sm:text-base shrink-0 min-w-[48px] sm:min-w-[90px] ${color}`;
  }

  // Mode Voice (Mic)
  const isSpin = isSpinningMic.value ? 'animate-micSpin ' : '';
  const micColor = props.isListening
    ? 'bg-rose-500 hover:bg-rose-600 text-white ring-4 sm:ring-8 ring-rose-400/40 shadow-rose-500/30 scale-105'
    : 'bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 dark:from-torii dark:to-torii-hover text-white hover:scale-105 active:scale-95 ring-4 ring-indigo-500/20 dark:ring-torii/20 shadow-xl';

  return base + `w-16 h-16 sm:w-20 sm:h-20 rounded-full shrink-0 ${isSpin} ${micColor}`;
});

const mainActionButtonTitle = computed(() => {
  if (props.actionState === 'advance') {
    return computedAdvanceLabel.value;
  }
  if (props.actionState === 'send') {
    return 'Kirim Jawaban';
  }
  return props.isListening ? 'Hentikan rekaman mic' : 'Tekan untuk berbicara bahasa Jepang';
});

const showVoiceTranscriptPopup = computed(() => {
  return (
    props.inputMode === 'voice' &&
    !props.isCompleted &&
    props.isListening &&
    !props.submitting &&
    props.voiceTranscript.trim().length > 0
  );
});
</script>

<template>
  <div class="w-full max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[144px] gap-2.5 sm:gap-3.5 transition-all duration-300 relative z-20 pb-2">
    <!-- ================= SLOT ATAS: MODE SWITCHER ================= -->
    <transition name="fade-collapse">
      <div v-if="!isCompleted" class="flex items-center justify-center">
        <button
          v-if="isSpeechSupported"
          type="button"
          @click="toggleMode"
          class="group px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200/90 dark:border-slate-700/90 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          :title="inputMode === 'voice' ? 'Beralih ke ketik keyboard' : 'Beralih kembali ke mode suara'"
        >
          <transition name="mode-toggle-swap" mode="out-in">
            <div v-if="inputMode === 'voice'" key="mode-keyboard" class="flex items-center gap-1.5">
              <Keyboard class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-torii transition-colors" />
              <span>Ketik Jawaban</span>
            </div>
            <div v-else key="mode-voice" class="flex items-center gap-1.5">
              <Mic class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-torii group-hover:rotate-12 transition-transform duration-300" />
              <span>Mode Suara</span>
            </div>
          </transition>
        </button>
      </div>
    </transition>

    <!-- ================= SLOT UTAMA: EXPANDABLE INPUT + TRANSFORMING BUTTON ================= -->
    <div class="relative flex items-center justify-center w-full max-w-lg sm:max-w-xl mx-auto gap-2 sm:gap-3 transition-all duration-300">
      <!-- FRAMELESS INPUT BAR (KEYBOARD MODE) -->
      <transition name="input-slide-expand">
        <div 
          v-if="inputMode === 'keyboard' && !isCompleted" 
          class="relative flex-1 min-w-0 flex items-center"
        >
          <input
            ref="inputRef"
            type="text"
            :value="modelValue"
            @input="handleInput"
            @compositionstart="handleCompositionStart"
            @compositionend="handleCompositionEnd"
            @keydown.enter.prevent="handleInputEnter"
            :readonly="submitting"
            placeholder="Ketik kalimat bahasa Jepang..."
            class="w-full h-12 sm:h-14 pl-3.5 sm:pl-4 pr-9 sm:pr-10 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base font-japanese text-base sm:text-xl md:text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-torii/50 transition-all shadow-xs leading-relaxed"
          />
          <!-- Clear button -->
          <button
            v-if="modelValue"
            type="button"
            @click="handleClear"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition z-10"
            title="Hapus ketikan"
          >
            <X class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </transition>

      <!-- THE SINGLE MORPHING MAIN ACTION BUTTON -->
      <div class="relative flex items-center justify-center">
        <!-- Ripple Wave Animation saat isListening -->
        <div v-if="!isCompleted && inputMode === 'voice' && isListening" class="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-rose-500/20 animate-ping pointer-events-none"></div>
        <div v-if="!isCompleted && inputMode === 'voice' && isListening" class="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-500/30 animate-pulse pointer-events-none"></div>

        <button
          type="button"
          @click="handleMainClick"
          :disabled="isMainDisabled"
          :class="mainActionButtonClasses"
          :title="mainActionButtonTitle"
        >
          <transition name="btn-content-swap" mode="out-in">
            <!-- STATE 1: JIKA SOAL SUDAH SELESAI (LANJUT / SELESAI) -->
            <div v-if="actionState === 'advance'" key="advance-content" class="flex items-center justify-center gap-2 whitespace-nowrap">
              <span>{{ computedAdvanceLabel }}</span>
              <ChevronRight class="w-5 h-5 shrink-0" />
            </div>

            <!-- STATE 2: MODE KEYBOARD (KIRIM) -->
            <div v-else-if="inputMode === 'keyboard'" key="send-content" class="flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap">
              <div v-if="submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <Send v-else class="w-4 h-4 shrink-0" />
              <span class="hidden sm:inline">Kirim</span>
            </div>

            <!-- STATE 3: MODE VOICE (MIC) -->
            <div v-else key="mic-content" class="flex items-center justify-center">
              <Mic v-if="!isListening" class="w-7 h-7 sm:w-9 sm:h-9" />
              <MicOff v-else class="w-7 h-7 sm:w-9 sm:h-9 text-white animate-pulse" />
            </div>
          </transition>
        </button>

        <!-- FLOATING VOICE TRANSCRIPT POPUP (Muncul di atas mic saat bicara) -->
        <transition name="transcript-pop">
          <div 
            v-if="showVoiceTranscriptPopup"
            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 sm:mb-4.5 z-40 pointer-events-none select-none"
          >
            <div class="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-md text-white font-japanese text-xs sm:text-sm font-bold shadow-xl border border-slate-700/80 flex items-center gap-2 whitespace-nowrap max-w-[85vw] sm:max-w-md truncate">
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0"></span>
              <span class="truncate">{{ voiceTranscript }}</span>
            </div>
            <!-- Arrow tip pointing down to mic -->
            <div class="w-0 h-0 border-x-5 border-x-transparent border-t-5 border-t-slate-900/90 dark:border-t-slate-800/90 mx-auto"></div>
          </div>
        </transition>
      </div>
    </div>

    <!-- ================= SLOT BAWAH: VOICE STATUS CAPTION ================= -->
    <transition name="caption-fade">
      <div 
        v-if="!isCompleted && inputMode === 'voice'" 
        class="text-center text-xs font-medium overflow-hidden"
      >
        <div class="min-h-[20px] flex items-center justify-center">
          <transition name="caption-swap" mode="out-in">
            <span v-if="isListening" key="listening" class="text-rose-500 dark:text-rose-400 font-bold flex items-center gap-1.5 justify-center animate-pulse">
              <span class="w-2 h-2 rounded-full bg-rose-500"></span>
              Mendengarkan... Silakan bicara kalimat Jepang
            </span>
            <span v-else-if="submitting" key="submitting" class="text-indigo-600 dark:text-torii font-bold flex items-center gap-1.5 justify-center">
              <div class="w-3.5 h-3.5 border-2 border-indigo-600 dark:border-torii border-t-transparent rounded-full animate-spin"></div>
              Memeriksa jawaban...
            </span>
            <span v-else-if="voiceError" key="error" class="text-rose-500 dark:text-rose-400 flex items-center gap-1.5 justify-center">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" />
              <span>{{ voiceError }}</span>
            </span>
            <span v-else key="idle" class="text-slate-400 dark:text-slate-500">
              Tekan mic lalu ucapkan kalimat dalam bahasa Jepang
            </span>
          </transition>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
@keyframes micSpin {
  0% { transform: scale(0.9) rotate(0deg); }
  50% { transform: scale(1.15) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}

.animate-micSpin {
  animation: micSpin 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-collapse-enter-active,
.fade-collapse-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-collapse-enter-from,
.fade-collapse-leave-to {
  opacity: 0;
  transform: translateY(-6px);
  max-height: 0;
}

.input-slide-expand-enter-active,
.input-slide-expand-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.3, 0.64, 1);
}
.input-slide-expand-enter-from,
.input-slide-expand-leave-to {
  opacity: 0;
  transform: scaleX(0.7) translateX(-20px);
  max-width: 0;
}

.btn-content-swap-enter-active,
.btn-content-swap-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-content-swap-enter-from,
.btn-content-swap-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

.mode-toggle-swap-enter-active,
.mode-toggle-swap-leave-active {
  transition: all 0.18s ease;
}
.mode-toggle-swap-enter-from,
.mode-toggle-swap-leave-to {
  opacity: 0;
  transform: translateY(3px);
}

.caption-swap-enter-active,
.caption-swap-leave-active {
  transition: all 0.2s ease;
}
.caption-swap-enter-from,
.caption-swap-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.transcript-pop-enter-active,
.transcript-pop-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.transcript-pop-enter-from,
.transcript-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px) scale(0.92);
}
</style>
