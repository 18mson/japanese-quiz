// src/types/reference.ts

export interface ReferenceCategory {
  id: string;
  slug: 'kata_bilangan' | 'ungkapan_waktu' | 'kata_bantu_bilangan' | 'konjugasi_kata_kerja';
  title: string;
  description: string | null;
  order_index: number;
  created_at?: string;
}

export interface ReferenceEntry<T = any> {
  id: string;
  category_id: string;
  group_label: string;
  entry_data: T;
  note: string | null;
  order_index: number;
  created_at?: string;
}

// 1. Kata Bilangan
export interface NumberUnit {
  value: number;
  japanese: string;
}

export interface ExampleValue {
  value: string;
  japanese: string;
}

export interface KataBilanganData {
  title: string;
  units: NumberUnit[];
  decimal_examples: ExampleValue[];
  fraction_examples: ExampleValue[];
  note_irregular: string;
}

// 2. Ungkapan Waktu
export interface CalendarEntry {
  japanese: string;
  meaning: string;
}

export interface DurationEntry {
  value: number | string;
  japanese: string;
}

export interface UngkapanWaktuData {
  kalender: {
    title: string;
    hari: CalendarEntry[];
    pagi: CalendarEntry[];
    malam: CalendarEntry[];
    minggu: CalendarEntry[];
    bulan: CalendarEntry[];
    tahun: CalendarEntry[];
  };
  durasi: {
    title: string;
    jam_menit: {
      jam: DurationEntry[];
      menit: DurationEntry[];
    };
    jangka_waktu: {
      hari: DurationEntry[];
      minggu: DurationEntry[];
      bulan: DurationEntry[];
      tahun: DurationEntry[];
    };
    note_irregular: string;
  };
}

// 3. Kata Bantu Bilangan
export interface CounterValueItem {
  value: number | string;
  japanese: string;
}

export interface CounterCategoryItem {
  category: string;
  counter: string;
  counter_reading: string;
  usage_example: string;
  values: CounterValueItem[];
}

export interface KataBantuBilanganData {
  title: string;
  categories: CounterCategoryItem[];
  note: string;
}

// 4. Konjugasi Kata Kerja
export interface VerbItem {
  masu: string;
  masu_reading: string;
  te: string;
  kamus: string;
  nai: string;
  ta: string;
  meaning: string;
  pelajaran: number;
}

export interface VerbGroupData {
  title: string;
  description: string;
  verbs: VerbItem[];
}

export interface KonjugasiKataKerjaData {
  title: string;
  note_umum: string;
  kelompok_1: VerbGroupData;
  kelompok_2: VerbGroupData;
  kelompok_3: VerbGroupData;
}
