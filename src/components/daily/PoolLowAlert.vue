<script setup lang="ts">
import { ref } from 'vue';
import { AlertCircle, X } from '@lucide/vue';

defineProps<{
  poolLow: boolean;
  recycled: boolean;
}>();

const dismissed = ref(false);
</script>

<template>
  <div 
    v-if="(poolLow || recycled) && !dismissed" 
    class="w-full max-w-xl mx-auto mb-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 rounded-2xl px-3.5 py-2.5 flex items-start justify-between gap-2.5 text-xs text-amber-900 dark:text-amber-200 shadow-2xs animate-fadeIn"
  >
    <div class="flex items-start gap-2 min-w-0">
      <AlertCircle class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div class="leading-relaxed">
        <span class="font-bold">Info Bank Soal: </span>
        <span v-if="poolLow && !recycled">
          Stok soal baru untuk bab ini tersisa sedikit. Variasi soal tambahan akan terus diperbarui secara berkala.
        </span>
        <span v-else-if="recycled">
          Kamu telah melatih semua soal unik bab ini! Sebagian soal didaur ulang untuk penguatan ingatan jangka panjang.
        </span>
      </div>
    </div>
    <button 
      @click="dismissed = true" 
      class="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-100 p-0.5 rounded cursor-pointer transition shrink-0"
      title="Tutup pemberitahuan"
    >
      <X class="w-3.5 h-3.5" />
    </button>
  </div>
</template>
