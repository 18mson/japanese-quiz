<script setup lang="ts">
import { AlertTriangle, CloudDownload, HardDrive, ArrowRight } from '@lucide/vue';

defineProps<{
  isOpen: boolean;
  localCount: number;
  serverCount: number;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'resolve', keepServer: boolean): void;
}>();
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
  >
    <div 
      class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 border border-gray-100 dark:border-slate-800"
    >
      <!-- Header -->
      <div class="p-6 text-center border-b border-gray-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/40">
        <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-200 dark:border-amber-800">
          <AlertTriangle class="w-6 h-6" />
        </div>
        <h3 class="text-xl font-extrabold text-gray-800 dark:text-slate-100">
          Sinkronisasi Progress
        </h3>
        <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Ditemukan perbedaan data progress di perangkat ini dan di server.
        </p>
      </div>

      <!-- Comparison Content -->
      <div class="p-6 space-y-4">
        <div class="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 space-y-3">
          <div class="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-slate-300">
            <div class="flex items-center gap-2">
              <HardDrive class="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Data Lokal (Perangkat Ini)</span>
            </div>
            <span class="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-full font-bold">
              {{ localCount }} Item
            </span>
          </div>

          <div class="border-t border-gray-200/60 dark:border-slate-700/60 my-2"></div>

          <div class="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-slate-300">
            <div class="flex items-center gap-2">
              <CloudDownload class="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Data Server (Akun Online)</span>
            </div>
            <span class="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-full font-bold">
              {{ serverCount }} Item
            </span>
          </div>
        </div>

        <p class="text-xs text-gray-600 dark:text-slate-300 text-center leading-relaxed">
          Data lokal Anda akan tertimpa dengan data dari server. Apakah Anda ingin melanjutkan memakai data dari server?
        </p>

        <!-- Actions -->
        <div class="grid grid-cols-2 gap-3 pt-2">
          <button 
            @click="emit('resolve', false)"
            :disabled="loading"
            class="py-3 px-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold rounded-xl text-xs transition border border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <span>Tidak</span>
            <span class="text-[10px] font-normal text-gray-500 dark:text-slate-400">Timpa Server dgn Lokal</span>
          </button>

          <button 
            @click="emit('resolve', true)"
            :disabled="loading"
            class="py-3 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-md hover:shadow-indigo-500/20 flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <div class="flex items-center gap-1">
              <span>Ya</span>
              <ArrowRight class="w-3 h-3" />
            </div>
            <span class="text-[10px] font-normal text-indigo-100">Gunakan Data Server</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
