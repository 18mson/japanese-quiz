// src/services/adjectiveConjugationService.ts
// Layanan Pembentukan Konjugasi Kata Sifat-i dan Kata Sifat-na Bahasa Jepang (N5)

export type AdjectiveType = 'i' | 'na';

export interface AdjectiveForms {
  presentPositive: string;   // e.g. 高い / 静か
  presentNegative: string;   // e.g. 高くない / 静かじゃない
  pastPositive: string;      // e.g. 高かった / 静かだった
  pastNegative: string;      // e.g. 高くなかった / 静かじゃなかった
  teForm: string;            // e.g. 高くて / 静かで
}

export interface AdjectiveItem {
  id: string;
  kanji: string;
  kana: string;
  romaji: string;
  meaning: string;
  type: AdjectiveType;
  forms: AdjectiveForms;
  alts?: Partial<Record<keyof AdjectiveForms, string[]>>;
}

/**
 * Generate konjugasi kata sifat-i
 */
function conjugateIAdjective(kanji: string, kana: string): { forms: AdjectiveForms; alts?: Partial<Record<keyof AdjectiveForms, string[]>> } {
  // Pengecualian khusus: いい (bagus)
  if (kana === 'いい' || kanji === '良い') {
    return {
      forms: {
        presentPositive: 'いい',
        presentNegative: 'よくない',
        pastPositive: 'よかった',
        pastNegative: 'よくなかった',
        teForm: 'よくて'
      },
      alts: {
        presentPositive: ['よい']
      }
    };
  }

  // Pengecualian: かっこいい (keren)
  if (kana === 'かっこいい') {
    return {
      forms: {
        presentPositive: 'かっこいい',
        presentNegative: 'かっこよくない',
        pastPositive: 'かっこよかった',
        pastNegative: 'かっこよくなかった',
        teForm: 'かっこよくて'
      }
    };
  }

  // Reguler: hilangkan akhiran 'い'
  const stem = kanji.endsWith('い') ? kanji.slice(0, -1) : kanji;
  return {
    forms: {
      presentPositive: kanji,
      presentNegative: `${stem}くない`,
      pastPositive: `${stem}かった`,
      pastNegative: `${stem}くなかった`,
      teForm: `${stem}くて`
    }
  };
}

/**
 * Generate konjugasi kata sifat-na
 */
function conjugateNaAdjective(kanji: string): { forms: AdjectiveForms; alts?: Partial<Record<keyof AdjectiveForms, string[]>> } {
  // Bersihkan akhiran 'な' jika ada di kamus
  const stem = kanji.endsWith('な') ? kanji.slice(0, -1) : kanji;

  return {
    forms: {
      presentPositive: stem,
      presentNegative: `${stem}じゃない`,
      pastPositive: `${stem}だった`,
      pastNegative: `${stem}じゃなかった`,
      teForm: `${stem}で`
    },
    alts: {
      presentNegative: [`${stem}ではありません`, `${stem}じゃありません`],
      pastPositive: [`${stem}でした`],
      pastNegative: [`${stem}ではありませんでした`, `${stem}じゃありませんでした`]
    }
  };
}

// Koleksi Kata Sifat N5 Terpopuler
export const ADJECTIVE_ITEMS: AdjectiveItem[] = [
  // --- Kata Sifat-i (い形容詞) ---
  {
    id: 'adj_i_1',
    kanji: '大きい',
    kana: 'おおきい',
    romaji: 'ookii',
    meaning: 'besar',
    type: 'i',
    ...conjugateIAdjective('大きい', 'おおきい')
  },
  {
    id: 'adj_i_2',
    kanji: '小さい',
    kana: 'ちいさい',
    romaji: 'chiisai',
    meaning: 'kecil',
    type: 'i',
    ...conjugateIAdjective('小さい', 'ちいさい')
  },
  {
    id: 'adj_i_3',
    kanji: '新しい',
    kana: 'あたらしい',
    romaji: 'atarashii',
    meaning: 'baru',
    type: 'i',
    ...conjugateIAdjective('新しい', 'あたらしい')
  },
  {
    id: 'adj_i_4',
    kanji: '古い',
    kana: 'ふるい',
    romaji: 'furui',
    meaning: 'tua / usang',
    type: 'i',
    ...conjugateIAdjective('古い', 'ふるい')
  },
  {
    id: 'adj_i_5',
    kanji: 'いい',
    kana: 'いい',
    romaji: 'ii',
    meaning: 'baik / bagus',
    type: 'i',
    ...conjugateIAdjective('いい', 'いい')
  },
  {
    id: 'adj_i_6',
    kanji: '悪い',
    kana: 'わるい',
    romaji: 'warui',
    meaning: 'buruk / jahat',
    type: 'i',
    ...conjugateIAdjective('悪い', 'わるい')
  },
  {
    id: 'adj_i_7',
    kanji: '暑い',
    kana: 'あつい',
    romaji: 'atsui',
    meaning: 'panas (cuaca)',
    type: 'i',
    ...conjugateIAdjective('暑い', 'あつい')
  },
  {
    id: 'adj_i_8',
    kanji: '寒い',
    kana: 'さむい',
    romaji: 'samui',
    meaning: 'dingin (cuaca)',
    type: 'i',
    ...conjugateIAdjective('寒い', 'さむい')
  },
  {
    id: 'adj_i_9',
    kanji: '熱い',
    kana: 'あつい',
    romaji: 'atsui',
    meaning: 'panas (benda)',
    type: 'i',
    ...conjugateIAdjective('熱い', 'あつい')
  },
  {
    id: 'adj_i_10',
    kanji: '冷たい',
    kana: 'つめたい',
    romaji: 'tsumetai',
    meaning: 'dingin (benda/sikap)',
    type: 'i',
    ...conjugateIAdjective('冷たい', 'つめたい')
  },
  {
    id: 'adj_i_11',
    kanji: '難しい',
    kana: 'むずかしい',
    romaji: 'muzukashii',
    meaning: 'sulit',
    type: 'i',
    ...conjugateIAdjective('難しい', 'むずかしい')
  },
  {
    id: 'adj_i_12',
    kanji: '易しい',
    kana: 'やさしい',
    romaji: 'yasashii',
    meaning: 'mudah',
    type: 'i',
    ...conjugateIAdjective('易しい', 'やさしい')
  },
  {
    id: 'adj_i_13',
    kanji: '高い',
    kana: 'たかい',
    romaji: 'takai',
    meaning: 'tinggi / mahal',
    type: 'i',
    ...conjugateIAdjective('高い', 'たかい')
  },
  {
    id: 'adj_i_14',
    kanji: '安い',
    kana: 'やすい',
    romaji: 'yasui',
    meaning: 'murah',
    type: 'i',
    ...conjugateIAdjective('安い', 'やすい')
  },
  {
    id: 'adj_i_15',
    kanji: '低い',
    kana: 'ひくい',
    romaji: 'hikui',
    meaning: 'rendah',
    type: 'i',
    ...conjugateIAdjective('低い', 'ひくい')
  },
  {
    id: 'adj_i_16',
    kanji: '面白い',
    kana: 'おもしろい',
    romaji: 'omoshiroi',
    meaning: 'menarik / lucu',
    type: 'i',
    ...conjugateIAdjective('面白い', 'おもしろい')
  },
  {
    id: 'adj_i_17',
    kanji: 'おいしい',
    kana: 'おいしい',
    romaji: 'oishii',
    meaning: 'enak / lezat',
    type: 'i',
    ...conjugateIAdjective('おいしい', 'おいしい')
  },
  {
    id: 'adj_i_18',
    kanji: '忙しい',
    kana: 'いそがしい',
    romaji: 'isogashii',
    meaning: 'sibuk',
    type: 'i',
    ...conjugateIAdjective('忙しい', 'いそがしい')
  },
  {
    id: 'adj_i_19',
    kanji: '楽しい',
    kana: 'たのしい',
    romaji: 'tanoshii',
    meaning: 'menyenangkan',
    type: 'i',
    ...conjugateIAdjective('楽しい', 'たのしい')
  },
  {
    id: 'adj_i_20',
    kanji: '白い',
    kana: 'しろい',
    romaji: 'shiroi',
    meaning: 'putih',
    type: 'i',
    ...conjugateIAdjective('白い', 'しろい')
  },
  {
    id: 'adj_i_21',
    kanji: '黒い',
    kana: 'くろい',
    romaji: 'kuroi',
    meaning: 'hitam',
    type: 'i',
    ...conjugateIAdjective('黒い', 'くろい')
  },
  {
    id: 'adj_i_22',
    kanji: '赤い',
    kana: 'あかい',
    romaji: 'akai',
    meaning: 'merah',
    type: 'i',
    ...conjugateIAdjective('赤い', 'あかい')
  },
  {
    id: 'adj_i_23',
    kanji: '青い',
    kana: 'あおい',
    romaji: 'aoi',
    meaning: 'biru',
    type: 'i',
    ...conjugateIAdjective('青い', 'あおい')
  },
  {
    id: 'adj_i_24',
    kanji: '近い',
    kana: 'ちかい',
    romaji: 'chikai',
    meaning: 'dekat',
    type: 'i',
    ...conjugateIAdjective('近い', 'ちかい')
  },
  {
    id: 'adj_i_25',
    kanji: '遠い',
    kana: 'とおい',
    romaji: 'tooi',
    meaning: 'jauh',
    type: 'i',
    ...conjugateIAdjective('遠い', 'とおい')
  },

  // --- Kata Sifat-na (な形容詞) ---
  {
    id: 'adj_na_1',
    kanji: '静か',
    kana: 'しずか',
    romaji: 'shizuka',
    meaning: 'tenang / sunyi',
    type: 'na',
    ...conjugateNaAdjective('静か')
  },
  {
    id: 'adj_na_2',
    kanji: '有名',
    kana: 'ゆうめい',
    romaji: 'yuumei',
    meaning: 'terkenal',
    type: 'na',
    ...conjugateNaAdjective('有名')
  },
  {
    id: 'adj_na_3',
    kanji: '親切',
    kana: 'しんせつ',
    romaji: 'shinsetsu',
    meaning: 'ramah / baik hati',
    type: 'na',
    ...conjugateNaAdjective('親切')
  },
  {
    id: 'adj_na_4',
    kanji: '元気',
    kana: 'げんき',
    romaji: 'genki',
    meaning: 'sehat / bersemangat',
    type: 'na',
    ...conjugateNaAdjective('元気')
  },
  {
    id: 'adj_na_5',
    kanji: '暇',
    kana: 'ひま',
    romaji: 'hima',
    meaning: 'senggang / luang',
    type: 'na',
    ...conjugateNaAdjective('暇')
  },
  {
    id: 'adj_na_6',
    kanji: '便利',
    kana: 'べんり',
    romaji: 'benri',
    meaning: 'praktis / nyaman',
    type: 'na',
    ...conjugateNaAdjective('便利')
  },
  {
    id: 'adj_na_7',
    kanji: 'きれい',
    kana: 'きれい',
    romaji: 'kirei',
    meaning: 'cantik / bersih',
    type: 'na',
    ...conjugateNaAdjective('きれい')
  },
  {
    id: 'adj_na_8',
    kanji: '好き',
    kana: 'すき',
    romaji: 'suki',
    meaning: 'suka',
    type: 'na',
    ...conjugateNaAdjective('好き')
  },
  {
    id: 'adj_na_9',
    kanji: '嫌い',
    kana: 'きらい',
    romaji: 'kirai',
    meaning: 'benci / tidak suka',
    type: 'na',
    ...conjugateNaAdjective('嫌い')
  },
  {
    id: 'adj_na_10',
    kanji: '上手',
    kana: 'じょうず',
    romaji: 'jouzu',
    meaning: 'pandai / mahir',
    type: 'na',
    ...conjugateNaAdjective('上手')
  },
  {
    id: 'adj_na_11',
    kanji: '下手',
    kana: 'へた',
    romaji: 'heta',
    meaning: 'kurang mahir',
    type: 'na',
    ...conjugateNaAdjective('下手')
  },
  {
    id: 'adj_na_12',
    kanji: '簡単',
    kana: 'かんたん',
    romaji: 'kantan',
    meaning: 'mudah / sederhana',
    type: 'na',
    ...conjugateNaAdjective('簡単')
  },
  {
    id: 'adj_na_13',
    kanji: '大変',
    kana: 'たいへん',
    romaji: 'taihen',
    meaning: 'berat / gawat',
    type: 'na',
    ...conjugateNaAdjective('大変')
  },
  {
    id: 'adj_na_14',
    kanji: 'にぎやか',
    kana: 'にぎやか',
    romaji: 'nigiyaka',
    meaning: 'ramai',
    type: 'na',
    ...conjugateNaAdjective('にぎやか')
  },
  {
    id: 'adj_na_15',
    kanji: 'ハンサム',
    kana: 'ハンサム',
    romaji: 'hansamu',
    meaning: 'tampan / ganteng',
    type: 'na',
    ...conjugateNaAdjective('ハンサム')
  }
];
