import { supabase } from '../lib/supabaseClient';
import { lesson1Data } from '../data/lesson1';
import {
  GrammarPoint,
  Kaiwa,
  RenshuuBCharacter,
  RenshuuSessionQuestion,
  LessonVocabulary,
  LessonReferenceTable
} from '../types/lesson';
import { toRomaji } from 'wanakana';

export const DEFAULT_RENSHUU_SESSION_SIZE = 10;

const LOCAL_STORAGE_PROGRESS_KEY = 'renshuu_progress_v2';

function getLocalProgressMap(): Record<string, { status: 'belum' | 'benar' | 'salah_perlu_ulang'; attemptCount: number; itemType: 'a' | 'b' | 'c' }> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalProgress(itemId: string, itemType: 'a' | 'b' | 'c', status: 'benar' | 'salah_perlu_ulang') {
  try {
    const map = getLocalProgressMap();
    const prev = map[itemId] || { status: 'belum', attemptCount: 0, itemType };
    map[itemId] = {
      status,
      attemptCount: prev.attemptCount + 1,
      itemType
    };
    localStorage.setItem(LOCAL_STORAGE_PROGRESS_KEY, JSON.stringify(map));
  } catch {}
}

export async function fetchLessonBunkei(lessonNumber: number = 1): Promise<GrammarPoint[]> {
  try {
    const { data: lesson } = await supabase
      .from('lessons')
      .select('id')
      .eq('lesson_number', lessonNumber)
      .maybeSingle();

    if (lesson?.id) {
      const { data, error } = await supabase
        .from('grammar_points')
        .select('*')
        .eq('lesson_id', lesson.id)
        .order('order_index', { ascending: true });

      if (!error && data && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Falling back to local bunkei data:', e);
  }

  return lesson1Data.bunkei;
}

export async function fetchLessonVocabulary(lessonNumber: number = 1): Promise<LessonVocabulary[]> {
  try {
    const { data: lesson } = await supabase
      .from('lessons')
      .select('id')
      .eq('lesson_number', lessonNumber)
      .maybeSingle();

    if (lesson?.id) {
      const { data, error } = await supabase
        .from('lesson_vocabulary')
        .select('*')
        .eq('lesson_id', lesson.id)
        .order('order_index', { ascending: true });

      if (!error && data) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Error fetching lesson vocabulary:', e);
  }

  return [];
}

export async function fetchLessonReferenceTables(lessonNumber: number = 1, tableType?: string): Promise<LessonReferenceTable[]> {
  try {
    const { data: lesson } = await supabase
      .from('lessons')
      .select('id')
      .eq('lesson_number', lessonNumber)
      .maybeSingle();

    if (lesson?.id) {
      let query = supabase
        .from('lesson_reference_tables')
        .select('*')
        .eq('lesson_id', lesson.id)
        .order('order_index', { ascending: true });

      if (tableType) {
        query = query.eq('table_type', tableType);
      }

      const { data, error } = await query;

      if (!error && data) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Error fetching lesson reference tables:', e);
  }

  return [];
}

export async function fetchLessonKaiwa(lessonNumber: number = 1): Promise<Kaiwa> {
  try {
    const { data: lesson } = await supabase
      .from('lessons')
      .select('id')
      .eq('lesson_number', lessonNumber)
      .maybeSingle();

    if (lesson?.id) {
      const { data: kaiwaData, error: kaiwaError } = await supabase
        .from('kaiwa')
        .select('*')
        .eq('lesson_id', lesson.id)
        .maybeSingle();

      if (!kaiwaError && kaiwaData) {
        const { data: lines, error: linesError } = await supabase
          .from('kaiwa_lines')
          .select('*')
          .eq('kaiwa_id', kaiwaData.id)
          .order('order_index', { ascending: true });

        if (!linesError && lines && lines.length > 0) {
          return {
            ...kaiwaData,
            lines
          };
        }
      }
    }
  } catch (e) {
    console.warn('Falling back to local kaiwa data:', e);
  }

  return lesson1Data.kaiwa;
}

const kanjiToKanaMap: Array<[RegExp, string]> = [
  [/あの方/g, 'あの かた'],
  [/あのひと/g, 'あの ひと'],
  [/あの人/g, 'あの ひと'],
  [/わたし/g, 'わたし'],
  [/私/g, 'わたし'],
  [/あなた/g, 'あなた'],
  [/貴方/g, 'あなた'],
  [/会社員/g, 'かいしゃいん'],
  [/社員/g, 'しゃいん'],
  [/銀行員/g, 'ぎんこういん'],
  [/医者/g, 'いしゃ'],
  [/先生/g, 'せんせい'],
  [/学生/g, 'がくせい'],
  [/研究者/g, 'けんきゅうしゃ'],
  [/教師/g, 'きょうし'],
  [/教員/g, 'きょういん'],
  [/エンジニア/g, 'エンジニア'],
  [/富士大学/g, 'ふじ だいがく'],
  [/さくら大学/g, 'さくら だいがく'],
  [/大学/g, 'だいがく'],
  [/神戸病院/g, 'こうべ びょういん'],
  [/病院/g, 'びょういん'],
  [/パワー電気/g, 'パワー でんき'],
  [/電気/g, 'でんき'],
  [/ブラジルエアー/g, 'ブラジル エアー'],
  [/アメリカ人/g, 'アメリカじん'],
  [/日本人/g, 'にほんじん'],
  [/イギリス人/g, 'イギリスじん'],
  [/タイ人/g, 'タイじん'],
  [/ドイツ人/g, 'ドイツじん'],
  [/フランス人/g, 'フランスじん'],
  [/韓国人/g, 'かんこくじん'],
  [/中国人/g, 'ちゅうごくじん'],
  [/インド人/g, 'インドじん'],
  [/インドネシア人/g, 'インドネシアじん'],
  [/ブラジル人/g, 'ブラジルじん'],
  [/アメリカ/g, 'アメリカ'],
  [/日本/g, 'にほん'],
  [/イギリス/g, 'イギリス'],
  [/タイ/g, 'タイ'],
  [/ドイツ/g, 'ドイツ'],
  [/フランス/g, 'フランス'],
  [/韓国/g, 'かんこく'],
  [/中国/g, 'ちゅうごく'],
  [/インド/g, 'インド'],
  [/インドネシア/g, 'インドネシア'],
  [/ブラジル/g, 'ブラジル'],
  [/人/g, 'じん'],
  [/何歳/g, 'なんさい'],
  [/おいくつ/g, 'おいくつ'],
  [/8歳/g, 'はっさい'],
  [/8さい/g, 'はっさい'],
  [/9歳/g, 'きゅうさい'],
  [/9さい/g, 'きゅうさい'],
  [/24歳/g, 'にじゅうよんさい'],
  [/29歳/g, 'にじゅうきゅうさい'],
  [/35歳/g, 'さんじゅうごさい'],
  [/39歳/g, 'さんじゅうきゅうさい'],
  [/42歳/g, 'よんじゅうにさい'],
  [/歳/g, 'さい'],
  [/初めまして/g, 'はじめまして'],
  [/来ました/g, 'きました'],
  [/失礼ですが/g, 'しつれい ですが'],
  [/お名前は/g, 'おなまえ は'],
  [/名前/g, 'なまえ']
];

export function japaneseSentenceToRomaji(japanese: string): string {
  let text = (japanese || '').trim();

  // 1. Convert known Kanji to Kana
  for (const [regex, replacement] of kanjiToKanaMap) {
    text = text.replace(regex, replacement);
  }

  // 2. Separate topic particle 'は' (ha -> wa), 'へ' (he -> e), 'を' (wo -> o)
  text = text
    .replace(/([^\s])は([^\s]|$)/g, '$1 wa $2')
    .replace(/\s+は\s+/g, ' wa ')
    .replace(/^は\s+/g, 'wa ')
    .replace(/\s+も\s+/g, ' mo ')
    .replace(/([^\s])も([^\s]|$)/g, '$1 mo $2')
    .replace(/\s+の\s+/g, ' no ')
    .replace(/([^\s])の([^\s]|$)/g, '$1 no $2')
    .replace(/\s+です\s*か/g, ' desu ka')
    .replace(/\s+です/g, ' desu')
    .replace(/\s+じゃ\s*ありません/g, ' ja arimasen')
    .replace(/\s+では\s*ありません/g, ' dewa arimasen')
    .replace(/・/g, ' ')
    .replace(/。/g, '.')
    .replace(/？|\?/g, '?')
    .replace(/（/g, ' (')
    .replace(/）/g, ') ')
    .replace(/\s+/g, ' ')
    .trim();

  // 3. Convert Kana to Romaji using wanakana
  const tokens = text.split(' ');
  const romajiTokens = tokens.map(tok => {
    if (tok === 'wa') return 'wa';
    if (tok === 'mo') return 'mo';
    if (tok === 'no') return 'no';
    if (tok === 'ka') return 'ka';
    if (tok === 'desu') return 'desu';
    if (tok.startsWith('(') && tok.endsWith(')')) {
      const inner = tok.slice(1, -1);
      return `(${toRomaji(inner)})`;
    }
    return toRomaji(tok);
  });

  let result = romajiTokens.join(' ')
    .replace(/\s+\./g, '.')
    .replace(/\s+\?/g, '?')
    .replace(/\s+,/g, ',')
    .replace(/\s+/g, ' ')
    .trim();

  return result;
}

export async function fetchRenshuuProgress(lessonNumber: number = 1, userId?: string | null): Promise<{ masteredCount: number; totalCount: number; progressPercent: number }> {
  let allAtomicItems: Array<{ id: string }> = [];

  try {
    const { data: lesson } = await supabase
      .from('lessons')
      .select('id')
      .eq('lesson_number', lessonNumber)
      .maybeSingle();

    if (lesson?.id) {
      const [resA, resB, resC] = await Promise.all([
        supabase.from('renshuu_a_items').select('id').eq('lesson_id', lesson.id),
        supabase.from('renshuu_b_items').select('id').eq('lesson_id', lesson.id),
        supabase.from('renshuu_c_items').select('id').eq('lesson_id', lesson.id)
      ]);

      allAtomicItems = [
        ...(resA.data || []),
        ...(resB.data || []),
        ...(resC.data || [])
      ];
    }
  } catch (e) {
    console.warn('Error fetching atomic items count from Supabase, using fallback count:', e);
  }

  const totalCount = allAtomicItems.length > 0 ? allAtomicItems.length : 45;
  const localMap = getLocalProgressMap();
  let masteredSet = new Set<string>();

  // Check Supabase if user is logged in
  if (userId) {
    try {
      const { data: progressRows } = await supabase
        .from('renshuu_progress')
        .select('renshuu_item_id, status')
        .eq('user_id', userId);

      if (progressRows) {
        progressRows.forEach(r => {
          if (r.status === 'benar') masteredSet.add(r.renshuu_item_id);
        });
      }
    } catch {}
  }

  // Also include localStorage mastered items
  Object.entries(localMap).forEach(([id, val]) => {
    if (val.status === 'benar') masteredSet.add(id);
  });

  const masteredCount = Math.min(masteredSet.size, totalCount);
  const progressPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  return {
    masteredCount,
    totalCount,
    progressPercent
  };
}

export async function saveRenshuuItemResult(
  itemId: string,
  itemType: 'a' | 'b' | 'c',
  isCorrect: boolean,
  userId?: string | null
): Promise<void> {
  const status: 'benar' | 'salah_perlu_ulang' = isCorrect ? 'benar' : 'salah_perlu_ulang';

  // 1. Save to local storage for instant sync
  saveLocalProgress(itemId, itemType, status);

  // 2. Save to Supabase if logged in
  if (userId) {
    try {
      await supabase
        .from('renshuu_progress')
        .upsert(
          {
            user_id: userId,
            renshuu_item_id: itemId,
            item_type: itemType,
            status,
            last_attempted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id,renshuu_item_id' }
        );
    } catch (e) {
      console.warn('Failed to upsert renshuu_progress to Supabase:', e);
    }
  }
}

export async function buildRenshuuSession(
  lessonNumber: number = 1,
  userId?: string | null,
  sessionSize: number = DEFAULT_RENSHUU_SESSION_SIZE
): Promise<{
  questions: RenshuuSessionQuestion[];
  relevantBunkeiIds: string[];
  totalMastered: number;
  totalAtomic: number;
}> {
  let atomicA: any[] = [];
  let atomicB: any[] = [];
  let atomicC: any[] = [];
  let charMap: Record<string, RenshuuBCharacter> = {};

  try {
    const { data: lesson } = await supabase
      .from('lessons')
      .select('id')
      .eq('lesson_number', lessonNumber)
      .maybeSingle();

    if (lesson?.id) {
      const [resA, resB, resC, resChars] = await Promise.all([
        supabase.from('renshuu_a_items').select('*').eq('lesson_id', lesson.id).order('question_order', { ascending: true }).order('sub_order', { ascending: true }),
        supabase.from('renshuu_b_items').select('*').eq('lesson_id', lesson.id).order('question_order', { ascending: true }).order('sub_order', { ascending: true }),
        supabase.from('renshuu_c_items').select('*').eq('lesson_id', lesson.id).order('question_order', { ascending: true }).order('option_key', { ascending: true }),
        supabase.from('renshuu_b_characters').select('*').eq('lesson_id', lesson.id)
      ]);

      if (resA.data && resA.data.length > 0) atomicA = resA.data;
      if (resB.data && resB.data.length > 0) atomicB = resB.data;
      if (resC.data && resC.data.length > 0) atomicC = resC.data;
      if (resChars.data) {
        resChars.data.forEach(c => {
          charMap[c.id] = c;
          charMap[`${c.table_id}_${c.key}`] = c;
        });
      }
    }
  } catch (e) {
    console.warn('Error fetching atomic items from Supabase, generating fallback pool:', e);
  }

  // Fallback if atomic tables not yet reachable
  if (atomicA.length === 0 || atomicB.length === 0 || atomicC.length === 0) {
    atomicA = [
      { id: 'ra-1-1', bunkei_id: 'bunkei-1', question_order: 1, sub_order: 1, base_example: 'わたしは マイク・ミラーです。', substitution_word: 'かいしゃいん', target_japanese: 'わたしは かいしゃいんです。', target_romaji: 'watashi wa kaishain desu.', meaning: 'Saya karyawan perusahaan.' },
      { id: 'ra-2-1', bunkei_id: 'bunkei-2', question_order: 2, sub_order: 1, base_example: 'わたしは カール・シュミットじゃ ありません。', substitution_word: 'エンジニア', target_japanese: 'わたしは エンジニアじゃ ありません。', target_romaji: 'watashi wa enjinia ja arimasen.', meaning: 'Saya bukan insinyur.' },
      { id: 'ra-3-1', bunkei_id: 'bunkei-3', question_order: 3, sub_order: 1, base_example: 'あの方は きむらさんですか。', substitution_word: 'マリアさん', target_japanese: 'あの方は マリアさんですか。', target_romaji: 'ano kata wa maria-san desu ka.', meaning: 'Apakah orang itu Maria-san?' },
      { id: 'ra-3-2', bunkei_id: 'bunkei-3', question_order: 3, sub_order: 2, base_example: 'あの方は きむらさんですか。', substitution_word: 'だれ（どなた）', target_japanese: 'あの方は だれ（どなた）ですか。', target_romaji: 'ano kata wa dare (donata) desu ka.', meaning: 'Siapakah orang itu?' },
      { id: 'ra-4-1', bunkei_id: 'bunkei-4', question_order: 4, sub_order: 1, base_example: 'サントスさんは ブラジル人です。マリアさんも ブラジル人です。', substitution_word: 'あの ひと', target_japanese: 'サントスさんは ブラジル人です。あのひとも ブラジル人です。', target_romaji: 'santosu-san wa burajirujin desu. ano hito mo burajirujin desu.', meaning: 'Santos-san orang Brazil. Orang itu juga orang Brazil.' },
      { id: 'ra-5-1', bunkei_id: 'bunkei-1', question_order: 5, sub_order: 1, base_example: 'ミラーさんは IMCの しゃいんです。', substitution_word: 'カリナさん · ふじだいがく · がくせい', target_japanese: 'カリナさんは ふじだいがくの がくせいです。', target_romaji: 'karina-san wa fuji daigaku no gakusei desu.', meaning: 'Karina-san murid Universitas Fuji.' },
      { id: 'ra-6-1', bunkei_id: 'bunkei-1', question_order: 6, sub_order: 1, base_example: 'テレサちゃんは 9さいです。', substitution_word: 'たろうくん · 8さい', target_japanese: 'たろうくんは 8さいです。', target_romaji: 'tarou-kun wa hassai desu.', meaning: 'Taro-kun berusia 8 tahun.' },
      { id: 'ra-6-2', bunkei_id: 'bunkei-3', question_order: 6, sub_order: 2, base_example: 'テレサちゃんは 9さいです。', substitution_word: 'なんさい（おいくつ） · ……か。', target_japanese: 'なんさい（おいくつ）ですか。', target_romaji: 'nansai (oikutsu) desu ka.', meaning: 'Berapa umurnya?' }
    ];
  }

  // Fetch progress status for all items
  const localMap = getLocalProgressMap();
  const progressMap: Record<string, 'belum' | 'benar' | 'salah_perlu_ulang'> = {};

  if (userId) {
    try {
      const { data: pRows } = await supabase
        .from('renshuu_progress')
        .select('renshuu_item_id, status')
        .eq('user_id', userId);

      if (pRows) {
        pRows.forEach(r => {
          progressMap[r.renshuu_item_id] = r.status as any;
        });
      }
    } catch {}
  }

  // Merge with localStorage
  Object.entries(localMap).forEach(([id, val]) => {
    if (!progressMap[id]) {
      progressMap[id] = val.status;
    }
  });

  // Calculate overall stats
  const totalAtomic = atomicA.length + atomicB.length + atomicC.length;
  let totalMastered = 0;
  [...atomicA, ...atomicB, ...atomicC].forEach(item => {
    const st = progressMap[item.id] || 'belum';
    if (st === 'benar') totalMastered++;
  });

  // Helper to categorize pool by priority: belum (1) -> salah_perlu_ulang (2) -> benar (3)
  const categorizePool = (items: any[]) => {
    const belum: any[] = [];
    const ulang: any[] = [];
    const benar: any[] = [];

    items.forEach(item => {
      const status = progressMap[item.id] || 'belum';
      const augmented = { ...item, status };
      if (status === 'belum') belum.push(augmented);
      else if (status === 'salah_perlu_ulang') ulang.push(augmented);
      else benar.push(augmented);
    });

    // In 'benar' (review mode), shuffle slightly for variety
    const shuffledBenar = [...benar].sort(() => 0.5 - Math.random());

    return [...belum, ...ulang, ...shuffledBenar];
  };

  const prioritizedA = categorizePool(atomicA);
  const prioritizedB = categorizePool(atomicB);
  const prioritizedC = categorizePool(atomicC);

  // Target proportions: ~40% A (4), ~40% B (4), ~20% C (2)
  let targetA = Math.max(1, Math.round(sessionSize * 0.4));
  let targetB = Math.max(1, Math.round(sessionSize * 0.4));
  let targetC = sessionSize - targetA - targetB;

  let selectedA = prioritizedA.slice(0, targetA);
  let selectedB = prioritizedB.slice(0, targetB);
  let selectedC = prioritizedC.slice(0, targetC);

  let currentTotal = selectedA.length + selectedB.length + selectedC.length;

  // If deficit, fill dynamically from remaining pools
  if (currentTotal < sessionSize) {
    const remainingA = prioritizedA.slice(selectedA.length);
    const remainingB = prioritizedB.slice(selectedB.length);
    const remainingC = prioritizedC.slice(selectedC.length);

    while (currentTotal < sessionSize && (remainingA.length > 0 || remainingB.length > 0 || remainingC.length > 0)) {
      if (remainingB.length > 0 && currentTotal < sessionSize) {
        selectedB.push(remainingB.shift());
        currentTotal++;
      }
      if (remainingA.length > 0 && currentTotal < sessionSize) {
        selectedA.push(remainingA.shift());
        currentTotal++;
      }
      if (remainingC.length > 0 && currentTotal < sessionSize) {
        selectedC.push(remainingC.shift());
        currentTotal++;
      }
    }
  }

  // Build unified RenshuuSessionQuestion[] preserving order inside type groups
  selectedA.sort((x, y) => x.question_order - y.question_order || x.sub_order - y.sub_order);
  selectedB.sort((x, y) => x.question_order - y.question_order || x.sub_order - y.sub_order);
  selectedC.sort((x, y) => x.question_order - y.question_order);

  const sessionQuestions: RenshuuSessionQuestion[] = [];
  let orderIndex = 1;
  const relevantBunkeiSet = new Set<string>();

  // 1. Push Renshuu A items
  selectedA.forEach(a => {
    if (a.bunkei_id) relevantBunkeiSet.add(a.bunkei_id);
    sessionQuestions.push({
      id: `ra-${a.id}`,
      atomicId: a.id,
      itemType: 'a',
      bunkeiId: a.bunkei_id,
      status: a.status,
      type: 'renshuu_a',
      order: orderIndex++,
      sectionTitle: `Renshuu A · Substitusi (${a.question_order}.${a.sub_order})`,
      renshuuA: {
        baseExample: a.base_example,
        substitutionWord: a.substitution_word,
        targetJapanese: a.target_japanese,
        targetRomaji: a.target_romaji,
        meaning: a.meaning || 'Latihan substitusi pola kalimat'
      }
    });
  });

  // 2. Push Renshuu B items
  selectedB.forEach(b => {
    if (b.bunkei_id) relevantBunkeiSet.add(b.bunkei_id);
    const char = charMap[b.character_id] || charMap[`table_1_${b.character_key}`] || charMap[`table_2_${b.character_key}`] || b.character || {
      name: 'Tokoh',
      table_id: 'table_1',
      key: b.character_key || '1'
    };

    sessionQuestions.push({
      id: `rb-${b.id}`,
      atomicId: b.id,
      itemType: 'b',
      bunkeiId: b.bunkei_id,
      status: b.status,
      type: 'renshuu_b',
      order: orderIndex++,
      sectionTitle: `Renshuu B · Drill Gambar (${b.question_order}.${b.sub_order})`,
      renshuuB: {
        character: char,
        pattern: b.pattern,
        promptQuestion: b.prompt_question,
        promptRomaji: b.prompt_romaji,
        targetJapanese: b.target_japanese,
        targetRomaji: b.target_romaji,
        meaning: b.meaning || 'Latihan pola kalimat dengan gambar'
      }
    });
  });

  // 3. Push Renshuu C items
  selectedC.forEach(c => {
    if (c.bunkei_id) relevantBunkeiSet.add(c.bunkei_id);
    const template = c.dialogue_template || [];
    const resolvedLines = c.resolved_lines || [];
    const options = [
      {
        key: c.option_key || '1',
        label: `Pilihan ${c.option_key || '1'}`,
        slotValues: c.slot_values || {},
        resolvedLines: resolvedLines
      }
    ];

    sessionQuestions.push({
      id: `rc-${c.id}`,
      atomicId: c.id,
      itemType: 'c',
      bunkeiId: c.bunkei_id,
      status: c.status,
      type: 'renshuu_c',
      order: orderIndex++,
      sectionTitle: `Renshuu C · Percakapan Role-play (${c.question_order})`,
      renshuuC: {
        template: template,
        options: options,
        correctOptionKey: c.option_key || '1'
      }
    });
  });

  return {
    questions: sessionQuestions,
    relevantBunkeiIds: Array.from(relevantBunkeiSet),
    totalMastered,
    totalAtomic
  };
}

export async function fetchRenshuuSessionQuestions(lessonNumber: number = 1): Promise<RenshuuSessionQuestion[]> {
  const { questions } = await buildRenshuuSession(lessonNumber, null, 25);
  return questions;
}
