export interface Lesson {
  id: string;
  lesson_number: number;
  title: string;
}

export interface GrammarExample {
  japanese: string;
  meaning: string;
  romaji?: string;
}

export interface GrammarSubPoint {
  title: string;
  explanation: string;
  example?: GrammarExample;
  examples?: GrammarExample[];
  note?: string;
}

export interface GrammarPoint {
  id?: string;
  lesson_id?: string;
  point_number?: number;
  order_index: number;
  pattern?: string;
  explanation?: string | null;
  sub_points?: GrammarSubPoint[] | null;
  examples?: GrammarExample[] | null;
  note?: string | null;
  japanese: string;
  romaji?: string;
  meaning?: string;
}

export interface LessonVocabulary {
  id?: string;
  lesson_id?: string;
  japanese: string;
  meaning: string;
  note?: string | null;
  category: 'kosakata' | 'renshuu_c_phrase';
  order_index?: number;
}

export interface LessonReferenceTable {
  id?: string;
  lesson_id?: string;
  table_type: string;
  row_data: Record<string, any>;
  order_index?: number;
}

export interface KaiwaLine {
  id?: string;
  kaiwa_id?: string;
  speaker: string;
  japanese: string;
  romaji: string;
  meaning: string;
  order_index: number;
}

export interface Kaiwa {
  id: string;
  lesson_id: string;
  title: string;
  title_romaji?: string;
  title_meaning?: string;
  context_note?: string;
  lines: KaiwaLine[];
}

export interface RenshuuAItem {
  id?: string;
  lesson_id?: string;
  question_order: number;
  type: string;
  base_template?: string;
  base_filled_example?: string;
  substitutions: any[];
  results: string[];
  meaning?: string;
}

export interface RenshuuBCharacter {
  id?: string;
  lesson_id?: string;
  table_id: string;
  key: string;
  name: string;
  romaji_name?: string;
  age?: number | null;
  country?: string | null;
  company?: string | null;
  profession?: string | null;
  image_url?: string | null;
}

export interface RenshuuBQuestion {
  id?: string;
  lesson_id?: string;
  table_ref: string;
  question_order: number;
  pattern: string;
  question_data: Record<string, any>;
}

export interface RenshuuCOption {
  id?: string;
  renshuu_c_id?: string;
  option_key: string;
  slot_values: Record<string, string>;
}

export interface RenshuuCItem {
  id: string;
  lesson_id: string;
  question_order: number;
  type: string;
  dialogue_template: Array<{
    speaker: string;
    japanese: string;
    romaji?: string;
    meaning: string;
    slot?: number;
    slots?: number[];
  }>;
  options: RenshuuCOption[];
}

// Unified drill question structure for RenshuuPlayer
export type RenshuuQuestionType = 'renshuu_a' | 'renshuu_b' | 'renshuu_c';

export type RenshuuProgressStatus = 'belum' | 'benar' | 'salah_perlu_ulang';

export interface RenshuuProgress {
  id?: string;
  user_id?: string;
  renshuu_item_id: string;
  item_type: 'a' | 'b' | 'c';
  status: RenshuuProgressStatus;
  last_attempted_at?: string;
  attempt_count: number;
}

export interface RenshuuProgressStats {
  masteredCount: number;
  totalCount: number;
  progressPercent: number;
}

export interface RenshuuSessionQuestion {
  id: string;
  atomicId: string;
  itemType: 'a' | 'b' | 'c';
  bunkeiId?: string;
  status?: RenshuuProgressStatus;
  type: RenshuuQuestionType;
  order: number;
  sectionTitle: string; // e.g. "Renshuu A · Pola Kalimat", "Renshuu B · Latihan Gambar", "Renshuu C · Role-play"
  
  // For Renshuu A
  renshuuA?: {
    baseExample: string;
    substitutionWord: string;
    targetJapanese: string;
    targetRomaji: string;
    meaning: string;
  };

  // For Renshuu B
  renshuuB?: {
    character: RenshuuBCharacter;
    pattern: string;
    promptQuestion?: string; // For yes_no or also question
    promptRomaji?: string;
    targetJapanese: string;
    targetRomaji: string;
    meaning: string;
  };

  // For Renshuu C
  renshuuC?: {
    template: Array<{
      speaker: string;
      japanese: string;
      meaning: string;
      slot?: number;
      slots?: number[];
    }>;
    options: Array<{
      key: string;
      label: string;
      slotValues: Record<string, string>;
      resolvedLines: Array<{ speaker: string; japanese: string; meaning: string }>;
    }>;
    correctOptionKey?: string;
  };
}

