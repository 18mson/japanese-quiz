<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { BookOpen, Globe2, MessageCircle, X, Search } from '@lucide/vue';
import { useQuizStore } from '../../stores/quizStore';
import { fetchLessonVocabulary, fetchLessonReferenceTables } from '../../services/lessonService';
import { LessonVocabulary, LessonReferenceTable } from '../../types/lesson';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const quizStore = useQuizStore();
const activeTab = ref<'kosakata' | 'frasa' | 'tabel'>('kosakata');
const searchQuery = ref('');

const vocabularyList = ref<LessonVocabulary[]>([]);
const referenceTables = ref<LessonReferenceTable[]>([]);
const isLoading = ref(false);

const loadData = async () => {
  isLoading.value = true;
  try {
    const [vocab, refs] = await Promise.all([
      fetchLessonVocabulary(quizStore.currentLessonNumber),
      fetchLessonReferenceTables(quizStore.currentLessonNumber)
    ]);
    vocabularyList.value = vocab;
    referenceTables.value = refs;
  } catch (e) {
    console.error('Error loading lesson references:', e);
  } finally {
    isLoading.value = false;
  }
};

watch(() => props.isOpen, (open) => {
  if (open) {
    loadData();
    searchQuery.value = '';
  }
});

onMounted(() => {
  if (props.isOpen) {
    loadData();
  }
});

const filteredKosakata = computed(() => {
  const list = vocabularyList.value.filter(v => v.category === 'kosakata');
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter(item => 
    item.japanese.toLowerCase().includes(q) || 
    item.meaning.toLowerCase().includes(q) ||
    (item.note && item.note.toLowerCase().includes(q))
  );
});

const filteredFrasa = computed(() => {
  const list = vocabularyList.value.filter(v => v.category === 'renshuu_c_phrase');
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter(item => 
    item.japanese.toLowerCase().includes(q) || 
    item.meaning.toLowerCase().includes(q) ||
    (item.note && item.note.toLowerCase().includes(q))
  );
});

const filteredTableRows = computed(() => {
  const list = referenceTables.value;
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter(item => {
    const dataStr = JSON.stringify(item.row_data).toLowerCase();
    return dataStr.includes(q);
  });
});
</script>

<template>
  <Transition name="fade-scale">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn"
      @click.self="emit('close')"
    >
      <div 
        class="w-full max-w-2xl bg-slate-900/95 border border-indigo-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-indigo-950/60 flex flex-col relative overflow-hidden text-slate-100 max-h-[90vh]"
      >
        <!-- Top Glows -->
        <div class="absolute -top-24 -right-24 w-60 h-60 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-60 h-60 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4 flex-shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold shadow-xs">
              <BookOpen class="w-5 h-5" />
            </div>
            <div>
              <div class="text-[11px] font-bold text-slate-400">Pelajaran {{ quizStore.currentLessonNumber }} · Referensi Resmi</div>
              <h2 class="text-base sm:text-lg font-black text-indigo-300">
                Kosakata, Frasa & Tabel Negara
              </h2>
            </div>
          </div>

          <button 
            type="button" 
            @click="emit('close')"
            class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700 cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Tab Controls & Search -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 flex-shrink-0">
          <!-- Tab Pills -->
          <div class="flex items-center gap-1 bg-slate-950/70 p-1 rounded-2xl border border-slate-800 flex-shrink-0">
            <button
              type="button"
              @click="activeTab = 'kosakata'"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer',
                activeTab === 'kosakata'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              ]"
            >
              <BookOpen class="w-3.5 h-3.5" />
              <span>Kosakata ({{ vocabularyList.filter(v => v.category === 'kosakata').length }})</span>
            </button>

            <button
              type="button"
              @click="activeTab = 'frasa'"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer',
                activeTab === 'frasa'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              ]"
            >
              <MessageCircle class="w-3.5 h-3.5" />
              <span>Frasa Percakapan ({{ vocabularyList.filter(v => v.category === 'renshuu_c_phrase').length }})</span>
            </button>

            <button
              type="button"
              @click="activeTab = 'tabel'"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer',
                activeTab === 'tabel'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              ]"
            >
              <Globe2 class="w-3.5 h-3.5" />
              <span>Negara & Bahasa ({{ referenceTables.length }})</span>
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative flex-1 sm:max-w-[200px]">
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Cari..."
              class="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <!-- Scrollable Tab Content Body -->
        <div class="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[55vh]">
          <!-- TAB 1: KOSAKATA -->
          <div v-if="activeTab === 'kosakata'" class="space-y-2">
            <div 
              v-for="item in filteredKosakata" 
              :key="item.id || item.order_index"
              class="bg-slate-950/60 border border-slate-800/90 hover:border-indigo-500/40 rounded-2xl p-3.5 transition flex flex-col gap-1.5"
            >
              <div class="flex items-start justify-between gap-3">
                <span class="text-base font-black text-amber-300 font-jp tracking-wide">
                  {{ item.japanese }}
                </span>
                <span class="text-xs font-bold text-slate-200 text-right">
                  {{ item.meaning }}
                </span>
              </div>
              <div v-if="item.note" class="bg-indigo-950/40 border border-indigo-800/40 rounded-xl px-2.5 py-1.5 text-[11px] text-indigo-200 flex items-start gap-1.5">
                <span class="text-indigo-400 font-bold flex-shrink-0">💡 Catatan:</span>
                <span>{{ item.note }}</span>
              </div>
            </div>

            <div v-if="filteredKosakata.length === 0" class="text-center py-8 text-slate-500 text-xs">
              Tidak ada kosakata yang cocok dengan pencarian.
            </div>
          </div>

          <!-- TAB 2: FRASA RENSHUU C -->
          <div v-else-if="activeTab === 'frasa'" class="space-y-2">
            <div 
              v-for="item in filteredFrasa" 
              :key="item.id || item.order_index"
              class="bg-slate-950/60 border border-slate-800/90 hover:border-violet-500/40 rounded-2xl p-3.5 transition flex flex-col gap-1.5"
            >
              <div class="flex items-start justify-between gap-3">
                <span class="text-base font-black text-emerald-300 font-jp tracking-wide">
                  {{ item.japanese }}
                </span>
                <span class="text-xs font-bold text-slate-200 text-right">
                  {{ item.meaning }}
                </span>
              </div>
              <div v-if="item.note" class="bg-emerald-950/30 border border-emerald-800/40 rounded-xl px-2.5 py-1.5 text-[11px] text-emerald-200 flex items-start gap-1.5">
                <span class="text-emerald-400 font-bold flex-shrink-0">💡 Penggunaan:</span>
                <span>{{ item.note }}</span>
              </div>
            </div>

            <div v-if="filteredFrasa.length === 0" class="text-center py-8 text-slate-500 text-xs">
              Tidak ada frasa yang cocok dengan pencarian.
            </div>
          </div>

          <!-- TAB 3: TABEL NEGARA, ORANG & BAHASA -->
          <div v-else-if="activeTab === 'tabel'" class="space-y-2">
            <div class="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-extrabold">
                    <th class="py-2.5 px-3">Negara</th>
                    <th class="py-2.5 px-3">Orang (Warga Negara)</th>
                    <th class="py-2.5 px-3">Bahasa</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  <tr 
                    v-for="row in filteredTableRows" 
                    :key="row.id || row.order_index"
                    class="hover:bg-indigo-950/20 transition text-slate-200"
                  >
                    <td class="py-2.5 px-3 font-semibold text-slate-300">
                      {{ row.row_data.negara }}
                    </td>
                    <td class="py-2.5 px-3 font-black text-amber-300 font-jp">
                      {{ row.row_data.orang }}
                    </td>
                    <td class="py-2.5 px-3 font-medium text-emerald-300 font-jp">
                      {{ row.row_data.bahasa }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="filteredTableRows.length === 0" class="text-center py-8 text-slate-500 text-xs">
              Tidak ada data negara yang cocok dengan pencarian.
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-3 text-[11px] text-slate-500">
          <span>Sumber: Terjemahan dan Keterangan Tata Bahasa N5</span>
          <button 
            type="button" 
            @click="emit('close')"
            class="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.2s ease-out;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
