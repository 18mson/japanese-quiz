<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, toRef } from 'vue';
import { 
  X, 
  BookMarked, 
  Hash, 
  Clock, 
  Layers, 
  BookOpen, 
  Loader2,
  Volume2
} from '@lucide/vue';
import { useTabIndicator } from '../../composables/useTabIndicator';
import { useSettingsStore } from '../../stores/settingsStore';
import TabKataBilangan from './TabKataBilangan.vue';
import TabUngkapanWaktu from './TabUngkapanWaktu.vue';
import TabKataBantuBilangan from './TabKataBantuBilangan.vue';
import TabKonjugasiKataKerja from './TabKonjugasiKataKerja.vue';
import { 
  fetchKataBilangan, 
  fetchUngkapanWaktu, 
  fetchKataBantuBilangan, 
  fetchKonjugasiKataKerja 
} from '../../services/referenceService';
import {
  kataBilanganData,
  ungkapanWaktuData,
  kataBantuBilanganData,
  konjugasiKataKerjaData,
  type KataBilanganData,
  type UngkapanWaktuData,
  type KataBantuBilanganData,
  type KonjugasiKataKerjaData
} from '../../data/referenceData';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    initialTab?: 'kata_bilangan' | 'ungkapan_waktu' | 'kata_bantu_bilangan' | 'konjugasi_kata_kerja';
  }>(),
  {
    initialTab: 'kata_bilangan'
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const settingsStore = useSettingsStore();
const activeTab = ref<'kata_bilangan' | 'ungkapan_waktu' | 'kata_bantu_bilangan' | 'konjugasi_kata_kerja'>(props.initialTab);
const isOpenRef = toRef(props, 'isOpen');
const { setTabRef, indicatorStyle, isInitialized } = useTabIndicator(activeTab, { isOpen: isOpenRef });
const isLoading = ref(false);

// Local state for fetched data
const bilangan = ref<KataBilanganData>(kataBilanganData);
const waktu = ref<UngkapanWaktuData>(ungkapanWaktuData);
const counter = ref<KataBantuBilanganData>(kataBantuBilanganData);
const verba = ref<KonjugasiKataKerjaData>(konjugasiKataKerjaData);

const loadAllData = async () => {
  isLoading.value = true;
  try {
    const [b, w, c, v] = await Promise.all([
      fetchKataBilangan(),
      fetchUngkapanWaktu(),
      fetchKataBantuBilangan(),
      fetchKonjugasiKataKerja()
    ]);
    bilangan.value = b;
    waktu.value = w;
    counter.value = c;
    verba.value = v;
  } catch (err) {
    console.error('Error loading Furoku reference data:', err);
  } finally {
    isLoading.value = false;
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close');
  }
};

watch(() => props.isOpen, (open) => {
  if (open) {
    activeTab.value = props.initialTab || 'kata_bilangan';
    loadAllData();
  }
});

watch(() => props.initialTab, (newTab) => {
  if (newTab) {
    activeTab.value = newTab;
  }
});

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  if (props.isOpen) {
    loadAllData();
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 bg-slate-950/50 dark:bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2.5 sm:p-5 select-none animate-fadeIn"
        @click.self="emit('close')"
      >
        <div 
          class="max-w-5xl w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[880px] animate-scaleUp relative text-slate-800 dark:text-slate-100"
        >
          <!-- Top Decorative Glows -->
          <div class="absolute -right-16 -top-16 w-48 h-48 bg-indigo-600/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -left-16 -bottom-16 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Header Bar -->
          <div class="px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-gray-50 via-indigo-50/50 to-gray-50 dark:from-slate-900 dark:via-indigo-950/80 dark:to-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between shadow-xs flex-shrink-0 relative z-10">
            <div class="flex items-center gap-2.5 sm:gap-3">
              <div class="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-amber-300 shadow-inner flex-shrink-0">
                <BookMarked class="w-5 h-5 text-indigo-600 dark:text-amber-300" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-base sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">Furoku (付録)</h2>
                  <span class="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-500/30">Referensi Cepat</span>
                </div>
                <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5 hidden sm:block">
                  Buku saku lampiran: kata bilangan, ungkapan waktu, kata bantu bilangan, dan konjugasi kata kerja.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2.5">
              <!-- Quick TTS Speed Toggle -->
              <div class="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-slate-950/80 border border-gray-200 dark:border-slate-700/60 p-1 rounded-xl shadow-inner">
                <Volume2 class="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 ml-1 mr-0.5" />
                <button
                  v-for="rate in ([0.6, 0.9, 1.2] as const)"
                  :key="rate"
                  type="button"
                  @click="settingsStore.setSpeechRate(rate)"
                  :class="[
                    'px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer',
                    settingsStore.speechRate === rate
                      ? 'bg-indigo-600 text-white shadow-xs font-black'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                  ]"
                  :title="`Kecepatan Suara ${rate}x`"
                >
                  {{ rate }}x
                </button>
              </div>

              <!-- Close Button -->
              <button 
                @click="emit('close')"
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition cursor-pointer border border-gray-200 dark:border-slate-700/60"
                title="Tutup (Esc)"
              >
                <X class="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <!-- 4 Main Navigation Tabs with Sliding Pill Indicator -->
          <div class="px-3 sm:px-6 py-2.5 bg-gray-100/70 dark:bg-slate-950/70 border-b border-gray-200 dark:border-slate-800/80 flex items-center overflow-x-auto no-scrollbar flex-shrink-0 z-10">
            <div class="relative flex items-center bg-gray-200/70 dark:bg-slate-900 p-1 rounded-2xl border border-gray-300/60 dark:border-slate-800 w-fit shrink-0">
              <!-- Sliding Pill Indicator -->
              <div 
                class="absolute rounded-xl bg-indigo-600 shadow-md shadow-indigo-500/20 pointer-events-none"
                :class="isInitialized ? 'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]' : 'transition-none'"
                :style="indicatorStyle"
              ></div>

              <!-- Tab 1: Kata Bilangan -->
              <button
                :ref="setTabRef('kata_bilangan')"
                @click="activeTab = 'kata_bilangan'"
                class="relative z-10 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-colors duration-200 cursor-pointer flex items-center gap-2 shrink-0 select-none"
                :class="activeTab === 'kata_bilangan' ? 'text-white font-black' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'"
              >
                <Hash class="w-4 h-4" />
                <span>Kata Bilangan</span>
              </button>

              <!-- Tab 2: Ungkapan Waktu -->
              <button
                :ref="setTabRef('ungkapan_waktu')"
                @click="activeTab = 'ungkapan_waktu'"
                class="relative z-10 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-colors duration-200 cursor-pointer flex items-center gap-2 shrink-0 select-none"
                :class="activeTab === 'ungkapan_waktu' ? 'text-white font-black' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'"
              >
                <Clock class="w-4 h-4" />
                <span>Ungkapan Waktu</span>
              </button>

              <!-- Tab 3: Kata Bantu Bilangan -->
              <button
                :ref="setTabRef('kata_bantu_bilangan')"
                @click="activeTab = 'kata_bantu_bilangan'"
                class="relative z-10 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-colors duration-200 cursor-pointer flex items-center gap-2 shrink-0 select-none"
                :class="activeTab === 'kata_bantu_bilangan' ? 'text-white font-black' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'"
              >
                <Layers class="w-4 h-4" />
                <span>Kata Bantu Bilangan</span>
              </button>

              <!-- Tab 4: Konjugasi Kata Kerja -->
              <button
                :ref="setTabRef('konjugasi_kata_kerja')"
                @click="activeTab = 'konjugasi_kata_kerja'"
                class="relative z-10 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-colors duration-200 cursor-pointer flex items-center gap-2 shrink-0 select-none"
                :class="activeTab === 'konjugasi_kata_kerja' ? 'text-white font-black' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'"
              >
                <BookOpen class="w-4 h-4" />
                <span>Konjugasi Kata Kerja</span>
              </button>
            </div>
          </div>

          <!-- Content Body (Scrollable) -->
          <div class="p-3.5 sm:p-6 overflow-y-auto flex-1 bg-gray-50/60 dark:bg-slate-950/50 min-h-0 relative">
            <!-- Loading Indicator Overlay (Non-blocking) -->
            <div v-if="isLoading" class="absolute top-2 right-4 flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
              <Loader2 class="w-3.5 h-3.5 animate-spin text-indigo-500 dark:text-indigo-400" />
              <span>Sinkronisasi...</span>
            </div>

            <!-- Tab Views with Smooth Transition -->
            <Transition name="tab-fade" mode="out-in">
              <div :key="activeTab">
                <TabKataBilangan 
                  v-if="activeTab === 'kata_bilangan'" 
                  :data="bilangan" 
                />

                <TabUngkapanWaktu 
                  v-else-if="activeTab === 'ungkapan_waktu'" 
                  :data="waktu" 
                />

                <TabKataBantuBilangan 
                  v-else-if="activeTab === 'kata_bantu_bilangan'" 
                  :data="counter" 
                />

                <TabKonjugasiKataKerja 
                  v-else-if="activeTab === 'konjugasi_kata_kerja'" 
                  :data="verba" 
                />
              </div>
            </Transition>
          </div>

          <!-- Footer Bar -->
          <div class="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 font-medium flex-shrink-0">
            <span class="text-[11px] sm:text-xs">
              Sumber: <em>Terjemahan dan Keterangan Tata Bahasa Minna no Nihongo (Indonesian Edition)</em>
            </span>
            <button 
              @click="emit('close')"
              class="px-4 py-1.5 bg-white hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer text-xs sm:text-sm border border-gray-200 dark:border-slate-700 shadow-2xs"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
@keyframes scaleUp { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
.animate-scaleUp { animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
