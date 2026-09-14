import { ref } from 'vue';
import type { useMasteryStore } from '../stores/masteryStore';

export function useQuizPreview(
  masteryStore: ReturnType<typeof useMasteryStore>,
  onPreviewCompleted: () => void
) {
  const previewMode = ref<'none' | 'full_wave' | 'micro'>('none');
  const justClosedPreview = ref(false);
  const previewClosedTimestamp = ref<number>(0);
  const previewedItems = ref<Record<string, boolean>>({});
  const fullWaveBatches = ref<any[]>([]);
  const currentWaveIndex = ref<number>(0);
  const isWavePreviewActive = ref<boolean>(false);
  const currentWaveItems = ref<any[]>([]);
  const microPreviewItem = ref<any | null>(null);
  const showMicroPreviewModal = ref<boolean>(false);

  const completeWavePreview = () => {
    if (currentWaveItems.value.length > 0) {
      currentWaveItems.value.forEach(item => {
        previewedItems.value[item.character] = true;
        masteryStore.introducedChars[item.character] = true;
      });
      masteryStore.saveIntroducedToStorage();
    }
    isWavePreviewActive.value = false;
    justClosedPreview.value = true;
    previewClosedTimestamp.value = Date.now();
    onPreviewCompleted();
    setTimeout(() => {
      justClosedPreview.value = false;
    }, 500);
  };

  const completeMicroPreview = () => {
    if (microPreviewItem.value) {
      previewedItems.value[microPreviewItem.value.character] = true;
      masteryStore.introducedChars[microPreviewItem.value.character] = true;
      masteryStore.saveIntroducedToStorage();
    }
    showMicroPreviewModal.value = false;
    microPreviewItem.value = null;
    justClosedPreview.value = true;
    previewClosedTimestamp.value = Date.now();
    onPreviewCompleted();
    setTimeout(() => {
      justClosedPreview.value = false;
    }, 500);
  };

  return {
    previewMode,
    justClosedPreview,
    previewClosedTimestamp,
    previewedItems,
    fullWaveBatches,
    currentWaveIndex,
    isWavePreviewActive,
    currentWaveItems,
    microPreviewItem,
    showMicroPreviewModal,
    completeWavePreview,
    completeMicroPreview
  };
}
