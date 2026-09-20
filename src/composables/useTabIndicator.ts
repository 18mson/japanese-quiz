import { ref, watch, nextTick, onMounted, onUnmounted, type Ref } from 'vue';

export interface TabIndicatorOptions {
  isOpen?: Ref<boolean>;
}

export function useTabIndicator<T extends string | number | boolean>(
  activeTab: Ref<T>,
  options?: TabIndicatorOptions
) {
  const containerRef = ref<HTMLElement | null>(null);
  const tabRefs = ref<Record<string, HTMLElement | null>>({});
  const isInitialized = ref(false);

  const indicatorStyle = ref<{
    left: string;
    top: string;
    width: string;
    height: string;
    opacity: number;
  }>({
    left: '0px',
    top: '0px',
    width: '0px',
    height: '0px',
    opacity: 0,
  });

  const setTabRef = (key: T) => (el: any) => {
    if (el) {
      tabRefs.value[String(key)] = el.$el || el;
    }
  };

  const applyStyle = (el: HTMLElement) => {
    indicatorStyle.value = {
      left: `${el.offsetLeft}px`,
      top: `${el.offsetTop}px`,
      width: `${el.offsetWidth}px`,
      height: `${el.offsetHeight}px`,
      opacity: 1,
    };
    isInitialized.value = true;
  };

  const updateIndicator = () => {
    nextTick(() => {
      const activeEl = tabRefs.value[String(activeTab.value)];
      if (!activeEl || activeEl.offsetWidth === 0) {
        requestAnimationFrame(() => {
          const retryEl = tabRefs.value[String(activeTab.value)];
          if (retryEl && retryEl.offsetWidth > 0) {
            applyStyle(retryEl);
          }
        });
        return;
      }
      applyStyle(activeEl);
    });
  };

  watch(
    () => activeTab.value,
    () => {
      updateIndicator();
    },
    { flush: 'post' }
  );

  if (options?.isOpen) {
    watch(
      () => options.isOpen!.value,
      (open) => {
        if (open) {
          isInitialized.value = false;
          nextTick(() => {
            setTimeout(updateIndicator, 40);
            setTimeout(updateIndicator, 150);
            setTimeout(updateIndicator, 320);
          });
        }
      }
    );
  }

  onMounted(() => {
    nextTick(() => {
      updateIndicator();
    });
    window.addEventListener('resize', updateIndicator);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateIndicator);
  });

  return {
    containerRef,
    tabRefs,
    setTabRef,
    indicatorStyle,
    updateIndicator,
    isInitialized,
  };
}
