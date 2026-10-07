<script setup lang="ts">
import { Trophy, CheckCircle2, ArrowLeft, RotateCcw, PlusCircle, Sparkles } from '@lucide/vue';
import QuotaCountdown from './QuotaCountdown.vue';

defineProps<{
  resetsAt: string | null;
  totalQuestions: number;
  correctCount: number;
  canAddChapter?: boolean;
  chaptersUsed?: number[];
}>();

const emit = defineEmits<{
  (e: 'exit'): void;
  (e: 'review'): void;
  (e: 'addChapter'): void;
}>();
</script>

<template>
  <div class="w-full max-w-xl mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 flex flex-col items-center text-center animate-fadeIn my-auto">
    <!-- Animated Badge / Trophy -->
    <div class="relative mb-5">
      <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/25 flex items-center justify-center animate-scaleUp">
        <div class="w-full h-full bg-amber-50 dark:bg-slate-900 rounded-[22px] flex items-center justify-center">
          <Trophy class="w-10 h-10 sm:w-12 sm:h-12 text-amber-500 dark:text-yellow-400" />
        </div>
      </div>
      <div class="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-md border-2 border-white dark:border-slate-900">
        <CheckCircle2 class="w-5 h-5" />
      </div>
    </div>

    <!-- Title & Praise -->
    <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">
      {{ canAddChapter ? 'Latihan Bab Selesai! 🎉' : 'Latihan Hari Ini Tuntas! 🎉' }}
    </h2>
    <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mb-5">
      <template v-if="canAddChapter">
        Hebat! Kamu telah menyelesaikan <span class="font-bold text-amber-600 dark:text-amber-400">{{ correctCount }} dari {{ totalQuestions }} soal</span>. Masih ada <span class="font-bold text-indigo-600 dark:text-torii-light">kuota 1 bab lagi (5 soal)</span> untuk hari ini!
      </template>
      <template v-else>
        Hebat! Kamu telah menyelesaikan <span class="font-bold text-amber-600 dark:text-amber-400">{{ correctCount }} dari {{ totalQuestions }} soal</span> latihan kalimat harian. Kuota dibatasi maksimal 2 bab per hari agar pemahamanmu meresap secara konsisten.
      </template>
    </p>

    <!-- Quota Remaining Banner (Jika masih ada kuota 1 bab) -->
    <div 
      v-if="canAddChapter" 
      class="w-full bg-indigo-50/90 dark:bg-slate-800/90 border border-indigo-200/80 dark:border-slate-700 rounded-2xl p-4 mb-5 flex flex-col items-center gap-1.5 text-center shadow-xs"
    >
      <span class="text-xs sm:text-sm font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
        <Sparkles class="w-4 h-4 text-indigo-500" />
        Sisa Kuota: 1 Bab Tambahan (5 Soal)
      </span>
      <span class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
        Ingin terus melatih kemampuanmu? Kamu bisa memilih 1 bab lain untuk hari ini.
      </span>
    </div>

    <!-- Countdown Card (Jika kuota 2 bab habis) -->
    <div 
      v-else 
      class="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 mb-6 flex flex-col items-center gap-2"
    >
      <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
        Sesi latihan berikutnya terbuka pada:
      </span>
      <QuotaCountdown :resets-at="resetsAt" />
      <span class="text-[11px] text-slate-400 dark:text-slate-500">
        Reset harian dilakukan setiap pukul 00:00 WIB (Asia/Jakarta)
      </span>
    </div>

    <!-- Actions -->
    <div class="flex flex-col gap-2.5 w-full">
      <!-- Tombol Tambah Bab (Paling Utama bila canAddChapter) -->
      <button
        v-if="canAddChapter"
        type="button"
        @click="emit('addChapter')"
        class="w-full py-3.5 px-5 rounded-2xl font-black text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 dark:bg-torii dark:hover:bg-torii-hover text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer active:scale-98"
      >
        <PlusCircle class="w-4 h-4" />
        <span>Pilih Bab Ke-2 (+5 Soal)</span>
      </button>

      <div class="flex flex-col sm:flex-row items-center gap-2.5 w-full">
        <button
          type="button"
          @click="emit('review')"
          class="w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
        >
          <RotateCcw class="w-4 h-4" />
          <span>Tinjau Jawaban</span>
        </button>

        <button
          type="button"
          @click="emit('exit')"
          :class="[
            'w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs',
            canAddChapter
              ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-torii dark:hover:bg-torii-hover text-white shadow-md'
          ]"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>{{ canAddChapter ? 'Selesai Hari Ini' : 'Kembali ke Menu' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes scaleUp { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.animate-scaleUp { animation: scaleUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
</style>
