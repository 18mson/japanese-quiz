import type { Component } from 'vue';

export type HandbookTabId = 'bunkei' | 'particles' | 'vocab' | 'phrases' | 'tables';

export interface HandbookTabItem {
  id: HandbookTabId;
  name: string;
  jpName: string;
  icon: Component;
  count?: number;
  activeClass: string;
  color: string;
  isCompleted?: boolean;
}
