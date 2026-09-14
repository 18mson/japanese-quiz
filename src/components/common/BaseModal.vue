<script setup lang="ts">
import { computed, watch, onUnmounted } from 'vue';
import { X } from '@lucide/vue';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    title?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    showCloseButton?: boolean;
    dismissOnBackdrop?: boolean;
    panelClass?: string;
    headerClass?: string;
    bodyClass?: string;
  }>(),
  {
    title: '',
    maxWidth: 'lg',
    showCloseButton: true,
    dismissOnBackdrop: true,
    panelClass: '',
    headerClass: '',
    bodyClass: '',
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const maxWidthClass = computed(() => {
  const map: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };
  return map[props.maxWidth] || 'max-w-lg';
});

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget && props.dismissOnBackdrop) {
    emit('close');
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen && props.dismissOnBackdrop) {
    emit('close');
  }
};

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      @click="handleBackdropClick"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 w-full flex flex-col max-h-[90vh] overflow-hidden animate-scaleUp relative"
        :class="[maxWidthClass, panelClass]"
      >
        <!-- Header (Slot or Default Title Bar) -->
        <slot name="header">
          <div
            v-if="title || showCloseButton"
            class="px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0"
            :class="headerClass"
          >
            <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-slate-100">
              {{ title }}
            </h3>
            <button
              v-if="showCloseButton"
              type="button"
              @click="emit('close')"
              class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Tutup"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </slot>

        <!-- Content Body -->
        <div
          class="flex-1 overflow-y-auto"
          :class="bodyClass"
        >
          <slot></slot>
        </div>

        <!-- Footer -->
        <slot name="footer"></slot>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-scaleUp {
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
