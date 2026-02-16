import { ref } from 'vue';
import type { IItem } from '@/interface/IItem';

export interface HistoryEntry {
  id: number;
  label: string;
  group: string;
  weight: number;
  time: string;
}

export const History = ref<HistoryEntry[]>([]);

let counter = 0;

export function addHistory(item: IItem): void {
  const entry: HistoryEntry = {
    id: ++counter,
    label: item.label,
    group: item.group,
    weight: item.weight,
    time: new Date().toISOString()
  };

  History.value = [entry, ...History.value].slice(0, 50);
}


