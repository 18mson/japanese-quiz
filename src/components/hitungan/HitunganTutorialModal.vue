<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { BookOpen, X, ArrowRight, Volume2, AlertTriangle, Sparkles } from '@lucide/vue';
import type { HitunganWaveDef } from '../../data/hitunganWaves';
import { useTextToSpeech } from '../../composables/useTextToSpeech';
import BaseModal from '../common/BaseModal.vue';

const props = defineProps<{
  isOpen: boolean;
  wave: HitunganWaveDef | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'start'): void;
}>();

const { speak } = useTextToSpeech();

const playAudio = (text: string) => {
  speak(text);
};

const handleStart = () => {
  emit('start');
  emit('close');
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.isOpen) return;
  if (e.key === 'Enter') {
    e.preventDefault();
    handleStart();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <BaseModal
    :is-open="isOpen && !!wave"
    max-width="lg"
    :show-close-button="false"
    panel-class="bg-slate-900 border-slate-700/80 text-slate-100 p-5 sm:p-6"
    @close="emit('close')"
  >
    <div v-if="wave" class="flex flex-col h-full">
      <!-- Top Header Row -->
      <div class="flex items-center justify-between pb-3.5 border-b border-slate-800 flex-shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm shadow-xs">
            <BookOpen class="w-4 h-4" />
          </div>
          <div>
            <div class="text-[11px] font-black uppercase tracking-wider text-amber-400">
              Panduan Pola Materi
            </div>
            <h3 class="text-base sm:text-lg font-black text-white truncate max-w-[260px] sm:max-w-sm">
              {{ wave.title }}
            </h3>
          </div>
        </div>

        <button 
          type="button"
          @click="emit('close')"
          class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          title="Tutup"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Scrollable Tutorial Body -->
      <div class="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
        <!-- 1. Formula / Pattern Card -->
        <div class="w-full bg-slate-950/70 border border-amber-500/30 rounded-2xl p-4 shadow-inner text-center">
          <div class="text-[11px] font-extrabold uppercase tracking-wider text-amber-400/80 mb-1">
            Rumus / Pola Dasar
          </div>
          <div class="text-lg sm:text-xl font-black text-amber-300 font-jp tracking-wide leading-snug">
            {{ wave.tutorial.pattern }}
          </div>
        </div>

        <!-- 2. Explanation Note -->
        <div class="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {{ wave.tutorial.explanation }}
        </div>

        <!-- 3. Irregular Sound Alert Box (Crucial) -->
        <div 
          v-if="wave.tutorial.irregularNote" 
          class="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-3.5 text-amber-200 text-xs sm:text-sm flex flex-col gap-1.5 shadow-sm"
        >
          <div class="flex items-center gap-1.5 font-bold text-amber-400">
            <AlertTriangle class="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Pengecualian Bunyi (Wajib Diperhatikan):</span>
          </div>
          <div class="text-amber-100/90 whitespace-pre-line leading-relaxed pl-1 text-[11px] sm:text-xs">
            {{ wave.tutorial.irregularNote }}
          </div>
        </div>

        <!-- 4. Examples List -->
        <div v-if="wave.tutorial.examples && wave.tutorial.examples.length > 0" class="space-y-2">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles class="w-3.5 h-3.5 text-indigo-400" />
            <span>Contoh Bacaan:</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div 
              v-for="(ex, idx) in wave.tutorial.examples" 
              :key="idx"
              class="bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 flex items-center justify-between gap-2 transition"
            >
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-black text-indigo-300 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/60 font-mono">
                    {{ ex.numberDisplay }}
                  </span>
                  <span class="text-xs font-bold text-emerald-400 font-jp truncate">
                    {{ ex.kanaReading }}
                  </span>
                </div>
                <div class="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  {{ ex.romaji }} <span v-if="ex.meaning" class="text-slate-500">({{ ex.meaning }})</span>
                </div>
              </div>

              <button 
                type="button"
                @click="playAudio(ex.kanaReading)"
                class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-indigo-600/40 text-slate-300 hover:text-indigo-200 flex items-center justify-center transition flex-shrink-0 cursor-pointer"
                title="Dengarkan Audio"
              >
                <Volume2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Button Footer -->
      <div class="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
        <button 
          type="button"
          @click="emit('close')"
          class="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
        >
          Tutup
        </button>

        <button 
          type="button"
          @click="handleStart"
          class="flex-1 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98]"
        >
          <span>Mulai Latihan</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </BaseModal>
</template>
