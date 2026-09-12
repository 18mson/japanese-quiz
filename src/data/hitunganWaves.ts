// src/data/hitunganWaves.ts
// Local definition and metadata for Hitungan waves, tutorials, and rules.
import { kataBantuBilanganData } from './referenceData';

export interface HitunganTutorialExample {
  numberDisplay: string;
  kanaReading: string;
  romaji: string;
  meaning?: string;
}

export interface HitunganWaveDef {
  id?: string;
  wave_key: string;
  title: string;
  shortTitle: string;
  badge: string;
  description: string;
  type: 'number_range' | 'counter' | 'mixed';
  min_value?: number;
  max_value?: number;
  counter_category?: string;
  order_index: number;
  // Tutorial material for preview cards
  tutorial: {
    pattern: string;
    explanation: string;
    irregularNote?: string;
    examples: HitunganTutorialExample[];
  };
}

export const HITUNGAN_WAVES: HitunganWaveDef[] = [
  {
    wave_key: 'basic_1_10',
    title: 'Angka Dasar (1–10)',
    shortTitle: '1–10',
    badge: '1-10',
    description: 'Pengenalan digit dasar angka 1 sampai 10 dan variasinya (4=よん/し, 7=なな/しち, 9=きゅう/く).',
    type: 'number_range',
    min_value: 1,
    max_value: 10,
    order_index: 1,
    tutorial: {
      pattern: '[digit 1 s/d 10]',
      explanation: 'Angka 1 sampai 10 adalah fondasi seluruh sistem angka Jepang. Beberapa digit memiliki dua cara baca standar.',
      irregularNote: 'Perhatikan: 4 (よん / し), 7 (なな / しち), 9 (きゅう / く). Saat berhitung mandiri, よん, なな, dan きゅう paling sering digunakan.',
      examples: [
        { numberDisplay: '1', kanaReading: 'いち', romaji: 'ichi' },
        { numberDisplay: '4', kanaReading: 'よん', romaji: 'yon' },
        { numberDisplay: '7', kanaReading: 'なな', romaji: 'nana' },
        { numberDisplay: '10', kanaReading: 'じゅう', romaji: 'juu' },
      ],
    },
  },
  {
    wave_key: 'basic_10_99',
    title: 'Puluhan (10–99)',
    shortTitle: '10–99',
    badge: '10-99',
    description: 'Kombinasi puluhan dan satuan: [puluhan] + じゅう + [satuan].',
    type: 'number_range',
    min_value: 10,
    max_value: 99,
    order_index: 2,
    tutorial: {
      pattern: '[angka] + じゅう + [angka]',
      explanation: 'Rumus puluhan sangat teratur. 20 adalah にじゅう (2 x 10), 30 adalah さんじゅう (3 x 10). Tinggal tambahkan satuan di belakangnya.',
      irregularNote: 'Angka belasan: 11 = じゅういち (bukan いちじゅういち). Angka 14 = じゅうよん, 17 = じゅうなな, 19 = じゅうきゅう.',
      examples: [
        { numberDisplay: '14', kanaReading: 'じゅうよん', romaji: 'juuyon' },
        { numberDisplay: '20', kanaReading: 'にじゅう', romaji: 'nijuu' },
        { numberDisplay: '47', kanaReading: 'よんじゅうなな', romaji: 'yonjuunana' },
        { numberDisplay: '99', kanaReading: 'きゅうじゅうきゅう', romaji: 'kyuujuukyuu' },
      ],
    },
  },
  {
    wave_key: 'hundreds',
    title: 'Ratusan (100–999)',
    shortTitle: 'Ratusan',
    badge: '100s',
    description: 'Pola ratusan dengan pengecualian bunyi wajib pada 300 (さんびゃく), 600 (ろっぴゃく), dan 800 (はっぴゃく).',
    type: 'number_range',
    min_value: 100,
    max_value: 999,
    order_index: 3,
    tutorial: {
      pattern: '[angka] + ひゃく',
      explanation: 'Pola normal menambahkan ひゃく di belakang digit (200 = にひゃく, 400 = よんひゃく, 500 = ごひゃく, 700 = ななひゃく, 900 = きゅうひゃく).',
      irregularNote: '⚠️ PENGECUALIAN BUNYI:\n• 300 = さんびゃく (bunyi b, bukan さんひゃく)\n• 600 = ろっぴゃく (bunyi pp, bukan ろくひゃく)\n• 800 = はっぴゃく (bunyi pp, bukan はちひゃく)\n• 100 = ひゃく (bukan いちひゃく)',
      examples: [
        { numberDisplay: '100', kanaReading: 'ひゃく', romaji: 'hyaku' },
        { numberDisplay: '300', kanaReading: 'さんびゃく', romaji: 'sanbyaku' },
        { numberDisplay: '347', kanaReading: 'さんびゃくよんじゅうなな', romaji: 'sanbyakuyonjuunana' },
        { numberDisplay: '600', kanaReading: 'ろっぴゃく', romaji: 'roppyaku' },
        { numberDisplay: '800', kanaReading: 'はっぴゃく', romaji: 'happyaku' },
      ],
    },
  },
  {
    wave_key: 'thousands',
    title: 'Ribuan (1.000–9.999)',
    shortTitle: 'Ribuan',
    badge: '1000s',
    description: 'Pola ribuan dengan pengecualian bunyi 3000 (さんぜん) dan 8000 (はっせん).',
    type: 'number_range',
    min_value: 1000,
    max_value: 9999,
    order_index: 4,
    tutorial: {
      pattern: '[angka] + せん',
      explanation: 'Pola normal ribuan menggunakan せん (2000 = にせん, 4000 = よんせん, 5000 = ごせん, 6000 = ろくせん, 7000 = ななせん, 9000 = きゅうせん).',
      irregularNote: '⚠️ PENGECUALIAN BUNYI:\n• 3000 = さんぜん (bunyi z, bukan さんせん)\n• 8000 = はっせん (bunyi ss, bukan はちせん)\n• 1000 = せん (bukan いちせん)',
      examples: [
        { numberDisplay: '1000', kanaReading: 'せん', romaji: 'sen' },
        { numberDisplay: '3000', kanaReading: 'さんぜん', romaji: 'sanzen' },
        { numberDisplay: '8000', kanaReading: 'はっせん', romaji: 'hassen' },
        { numberDisplay: '8888', kanaReading: 'はっせんはっぴゃくはちじゅうはち', romaji: 'hassenhappyakuhachijuuhachi' },
      ],
    },
  },
  {
    wave_key: 'ten_thousands',
    title: 'Puluhan Ribu (10.000+)',
    shortTitle: '10.000+',
    badge: '万 (まん)',
    description: 'Sistem pengelompokan 4 digit 万 (まん) dan 8 digit 億 (おく).',
    type: 'number_range',
    min_value: 10000,
    max_value: 1000000,
    order_index: 5,
    tutorial: {
      pattern: '[angka] + まん',
      explanation: 'Berbeda dari bahasa Indonesia/Inggris yang mengelompokkan kelipatan 1.000, bahasa Jepang mengelompokkan 10.000 (万 / まん). 10.000 = いちまん, 100.000 = じゅうまん, 1.000.000 = ひゃくまん.',
      irregularNote: '⚠️ PENTING: 10.000 WAJIB disebut いちまん (bukan cuma まん). Begitu pula 100.000.000 disebut いちおく.',
      examples: [
        { numberDisplay: '10000', kanaReading: 'いちまん', romaji: 'ichiman' },
        { numberDisplay: '12345', kanaReading: 'いちまんにせんさんびゃくよんじゅうご', romaji: 'ichimannisen sanbyakuyonjuugo' },
        { numberDisplay: '100000', kanaReading: 'じゅうまん', romaji: 'juuman' },
        { numberDisplay: '1000000', kanaReading: 'ひゃくまん', romaji: 'hyakuman' },
      ],
    },
  },
  // Counter Waves
  {
    wave_key: 'counter_hon',
    title: 'Counter: 本 (ほん)',
    shortTitle: '本 (Pensil/Botol)',
    badge: '本',
    description: 'Kata bantu hitung untuk benda panjang, ramping, atau silindris (pensil, botol, payung, pisang, dll).',
    type: 'counter',
    counter_category: 'benda yang kurus dan panjang',
    order_index: 6,
    tutorial: {
      pattern: '[angka] + ほん / ぼん / ぽん',
      explanation: 'Counter 本 memiliki 3 variasi bunyi tergantung angka di depannya: ほん (standar), ぼん (setelah さん dan なん), serta ぽん (setelah いち, ろく, はち, じゅう).',
      irregularNote: '⚠️ Pengecualian:\n• 1本 = いっぽん\n• 3本 = さんぼん\n• 6本 = ろっぽん\n• 8本 = はっぽん\n• 10本 = じゅっぽん (atau じっぽん)\n• Berapa batang? = なんぼん',
      examples: [
        { numberDisplay: '1本', kanaReading: 'いっぽん', romaji: 'ippon', meaning: '1 batang/botol' },
        { numberDisplay: '2本', kanaReading: 'にほん', romaji: 'nihon', meaning: '2 batang/botol' },
        { numberDisplay: '3本', kanaReading: 'さんぼん', romaji: 'sanbon', meaning: '3 batang/botol' },
        { numberDisplay: '6本', kanaReading: 'ろっぽん', romaji: 'roppon', meaning: '6 batang/botol' },
      ],
    },
  },
  {
    wave_key: 'counter_hai',
    title: 'Counter: 杯 (はい)',
    shortTitle: '杯 (Gelas/Cangkir)',
    badge: '杯',
    description: 'Kata bantu hitung untuk minuman dalam wadah cangkir, gelas, mangkuk, atau sendok.',
    type: 'counter',
    counter_category: 'minuman dalam cangkir/gelas',
    order_index: 7,
    tutorial: {
      pattern: '[angka] + はい / ばい / ぱい',
      explanation: 'Serupa dengan 本, counter 杯 berubah bunyi menjadi ぱい di angka 1, 6, 8, 10 dan ばい di angka 3 dan pertanyaan なん.',
      irregularNote: '⚠️ Pengecualian:\n• 1杯 = いっぱい\n• 3杯 = さんばい\n• 6杯 = ろっぱい\n• 8杯 = はっぱい\n• 10杯 = じゅっぱい (atau じっぱい)\n• Berapa cangkir? = なんばい',
      examples: [
        { numberDisplay: '1杯', kanaReading: 'いっぱい', romaji: 'ippai', meaning: '1 cangkir/gelas' },
        { numberDisplay: '3杯', kanaReading: 'さんばい', romaji: 'sanbai', meaning: '3 cangkir/gelas' },
        { numberDisplay: '6杯', kanaReading: 'ろっぱい', romaji: 'roppai', meaning: '6 cangkir/gelas' },
      ],
    },
  },
  {
    wave_key: 'counter_hiki',
    title: 'Counter: 匹 (ひき)',
    shortTitle: '匹 (Binatang Kecil)',
    badge: '匹',
    description: 'Kata bantu hitung untuk binatang kecil, ikan, serangga, anjing, kucing.',
    type: 'counter',
    counter_category: 'binatang kecil, ikan, dan serangga',
    order_index: 8,
    tutorial: {
      pattern: '[angka] + ひき / びき / ぴき',
      explanation: 'Counter untuk binatang berukuran sedang ke kecil (hewan besar menggunakan 頭 / とう).',
      irregularNote: '⚠️ Pengecualian:\n• 1匹 = いっぴき\n• 3匹 = さんびき\n• 6匹 = ろっぴき\n• 8匹 = はっぴき\n• 10匹 = じゅっぴき (atau じっぴき)\n• Berapa ekor? = なんびき',
      examples: [
        { numberDisplay: '1匹', kanaReading: 'いっぴき', romaji: 'ippiki', meaning: '1 ekor' },
        { numberDisplay: '2匹', kanaReading: 'にひき', romaji: 'nihiki', meaning: '2 ekor' },
        { numberDisplay: '3匹', kanaReading: 'さんびき', romaji: 'sanbiki', meaning: '3 ekor' },
        { numberDisplay: '6匹', kanaReading: 'ろっぴき', romaji: 'roppiki', meaning: '6 ekor' },
      ],
    },
  },
  {
    wave_key: 'counter_ko',
    title: 'Counter: 個 (こ)',
    shortTitle: '個 (Benda Kecil)',
    badge: '個',
    description: 'Kata bantu hitung serbaguna untuk benda kecil, bulat, telur, apel, batu, kotak kecil, dll.',
    type: 'counter',
    counter_category: 'benda kecil',
    order_index: 9,
    tutorial: {
      pattern: '[angka] + こ',
      explanation: 'Counter paling umum untuk benda kecil. Berubah bunyi menjadi double-k (っ) di angka 1, 6, 8, 10.',
      irregularNote: '⚠️ Pengecualian:\n• 1個 = いっこ\n• 6個 = ろっこ\n• 8個 = はっこ\n• 10個 = じゅっこ (atau じっこ)\n• Berapa buah? = なんこ',
      examples: [
        { numberDisplay: '1個', kanaReading: 'いっこ', romaji: 'ikko', meaning: '1 buah' },
        { numberDisplay: '2個', kanaReading: 'にこ', romaji: 'niko', meaning: '2 buah' },
        { numberDisplay: '6個', kanaReading: 'ろっこ', romaji: 'rokko', meaning: '6 buah' },
      ],
    },
  },
  {
    wave_key: 'counter_kai',
    title: 'Counter: 回 (かい)',
    shortTitle: '回 (Frekuensi)',
    badge: '回',
    description: 'Kata bantu hitung untuk frekuensi kejadian / pengulangan (1 kali, 2 kali, dst).',
    type: 'counter',
    counter_category: 'frekuensi',
    order_index: 10,
    tutorial: {
      pattern: '[angka] + かい',
      explanation: 'Menyatakan berapa kali suatu tindakan dilakukan.',
      irregularNote: '⚠️ Pengecualian:\n• 1回 = いっかい\n• 6回 = ろっかい\n• 8回 = はっかい\n• 10回 = じゅっかい (atau じっかい)\n• Berapa kali? = なんかい',
      examples: [
        { numberDisplay: '1回', kanaReading: 'いっかい', romaji: 'ikkai', meaning: '1 kali' },
        { numberDisplay: '3回', kanaReading: 'さんかい', romaji: 'sankai', meaning: '3 kali' },
        { numberDisplay: '6回', kanaReading: 'ろっかい', romaji: 'rokkai', meaning: '6 kali' },
      ],
    },
  },
  {
    wave_key: 'counter_soku',
    title: 'Counter: 足 (そく)',
    shortTitle: '足 (Alas Kaki)',
    badge: '足',
    description: 'Kata bantu hitung untuk pasang alas kaki (sepatu, sandal, kaos kaki).',
    type: 'counter',
    counter_category: 'sepatu dan kaos kaki',
    order_index: 11,
    tutorial: {
      pattern: '[angka] + そく / ぞく',
      explanation: 'Menyatakan jumlah pasang alas kaki. Angka 3 dan pertanyaan なん mengalami perubahan bunyi menjadi ぞく.',
      irregularNote: '⚠️ Pengecualian:\n• 1足 = いっそく\n• 3足 = さんぞく (bunyi z!)\n• 8足 = はっそく\n• 10足 = じゅっそく (atau じっそく)\n• Berapa pasang? = なんぞく (bunyi z!)',
      examples: [
        { numberDisplay: '1足', kanaReading: 'いっそく', romaji: 'issoku', meaning: '1 pasang' },
        { numberDisplay: '3足', kanaReading: 'さんぞく', romaji: 'sanzoku', meaning: '3 pasang' },
      ],
    },
  },
  {
    wave_key: 'counter_ken',
    title: 'Counter: 軒 (けん)',
    shortTitle: '軒 (Rumah/Bangunan)',
    badge: '軒',
    description: 'Kata bantu hitung untuk unit rumah, toko, atau bangunan tempat tinggal.',
    type: 'counter',
    counter_category: 'rumah',
    order_index: 12,
    tutorial: {
      pattern: '[angka] + けん / げん',
      explanation: 'Menyatakan jumlah rumah atau bangunan. Mengalami pelunakan menjadi げん di angka 3 dan pertanyaan なん.',
      irregularNote: '⚠️ Pengecualian:\n• 1軒 = いっけん\n• 3軒 = さんげん (bunyi g!)\n• 6軒 = ろっけん\n• 8軒 = はっけん\n• 10軒 = じゅっけん (atau じっけん)\n• Berapa rumah? = なんげん (bunyi g!)',
      examples: [
        { numberDisplay: '1軒', kanaReading: 'いっけん', romaji: 'ikken', meaning: '1 rumah' },
        { numberDisplay: '3軒', kanaReading: 'さんげん', romaji: 'sangen', meaning: '3 rumah' },
      ],
    },
  },
  {
    wave_key: 'counter_kai_floor',
    title: 'Counter: 階 (かい)',
    shortTitle: '階 (Lantai Gedung)',
    badge: '階',
    description: 'Kata bantu hitung untuk tingkat lantai suatu gedung (lantai 1, lantai 2, dst).',
    type: 'counter',
    counter_category: 'lantai dari sebuah bangunan',
    order_index: 13,
    tutorial: {
      pattern: '[angka] + かい / がい',
      explanation: 'Menyatakan lantai ke-berapa dalam bangunan. Lantai 3 dan pertanyaan なん menggunakan がい.',
      irregularNote: '⚠️ Pengecualian:\n• 1階 = いっかい\n• 3階 = さんがい (bunyi g!)\n• 6階 = ろっかい\n• 8階 = はっかい\n• 10階 = じゅっかい (atau じっかい)\n• Lantai berapa? = なんがい (bunyi g!)',
      examples: [
        { numberDisplay: '1階', kanaReading: 'いっかい', romaji: 'ikkai', meaning: 'lantai 1' },
        { numberDisplay: '3階', kanaReading: 'さんがい', romaji: 'sangai', meaning: 'lantai 3' },
        { numberDisplay: '6階', kanaReading: 'ろっかい', romaji: 'rokkai', meaning: 'lantai 6' },
      ],
    },
  },
  {
    wave_key: 'mixed_review',
    title: 'Campuran (Mixed Review)',
    shortTitle: '✨ Campuran',
    badge: 'Review',
    description: 'Latihan pengujian gabungan komprehensif. Soal diacak dari SEMUA wave yang telah Anda buka/pelajari polanya.',
    type: 'mixed',
    order_index: 99,
    tutorial: {
      pattern: 'Review Seluruh Materi',
      explanation: 'Mode ini akan menyajikan variasi soal campuran dari seluruh wave angka dan counter yang tutorialnya telah Anda lihat.',
      irregularNote: 'Gunakan mode ini untuk menguji reflek ingatan jangka panjang dan ketangkasan mengetik angka Jepang!',
      examples: [
        { numberDisplay: '347', kanaReading: 'さんびゃくよんじゅうなな', romaji: 'sanbyakuyonjuunana' },
        { numberDisplay: '3本', kanaReading: 'さんぼん', romaji: 'sanbon' },
        { numberDisplay: '8000', kanaReading: 'はっせん', romaji: 'hassen' },
      ],
    },
  },
];

/**
 * Returns counter category items from reference data given category name
 */
export function getCounterCategoryData(categoryName: string) {
  return kataBantuBilanganData.categories.find(c => c.category === categoryName) || null;
}
