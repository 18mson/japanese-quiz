export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'shogun';

export interface Badge {
  id: string;
  levelRequired: number;
  lessonNumber: number; // 0 for starter, 1-25 for lessons
  title: string;
  japaneseTitle: string;
  icon: string;
  tier: BadgeTier;
  description: string;
  unlockedHint: string;
  accentColor: string; // Tailwind color class or hex hint
  category?: 'level' | 'alphabet' | 'kanji';
  badgeTypeLabel?: string;
}

export const BADGE_LIST: Badge[] = [
  {
    id: 'badge_lvl_1',
    levelRequired: 1,
    lessonNumber: 0,
    category: 'level',
    title: 'Shoshinsha',
    japaneseTitle: '初心者の道',
    icon: '🔰',
    tier: 'bronze',
    description: 'Langkah pertama dalam perjalanan mempelajari bahasa Jepang. Semangat pemula yang tak pernah padam!',
    unlockedHint: 'Terbuka otomatis saat memulai perjalanan belajar.',
    accentColor: 'from-emerald-500/20 to-teal-600/10'
  },
  {
    id: 'badge_hiragana_master',
    levelRequired: 0,
    lessonNumber: 0,
    category: 'alphabet',
    badgeTypeLabel: 'Huruf',
    title: 'Hiragana Master',
    japaneseTitle: 'ひらがな達人',
    icon: '💮',
    tier: 'gold',
    description: 'Berhasil menghafal dan menguasai seluruh 104 karakter Hiragana hingga 100%! Fondasi utama untuk membaca dan menulis bahasa Jepang.',
    unlockedHint: 'Kuasai 100% karakter Hiragana di Peta Penguasaan (Streak ≥ 3 pada semua huruf).',
    accentColor: 'from-amber-500/20 to-rose-600/10'
  },
  {
    id: 'badge_katakana_master',
    levelRequired: 0,
    lessonNumber: 0,
    category: 'alphabet',
    badgeTypeLabel: 'Huruf',
    title: 'Katakana Master',
    japaneseTitle: 'カタカナ達人',
    icon: '⚡',
    tier: 'gold',
    description: 'Berhasil menghafal dan menguasai seluruh 104 karakter Katakana hingga 100%! Siap membaca kata serapan, onomatope, dan nama asing dengan lancar.',
    unlockedHint: 'Kuasai 100% karakter Katakana di Peta Penguasaan (Streak ≥ 3 pada semua huruf).',
    accentColor: 'from-cyan-500/20 to-blue-600/10'
  },
  {
    id: 'badge_kanji_n5_master',
    levelRequired: 0,
    lessonNumber: 0,
    category: 'kanji',
    badgeTypeLabel: 'Kanji',
    title: 'Kanji N5 Master',
    japaneseTitle: '漢字N5達人',
    icon: '🈴',
    tier: 'platinum',
    description: 'Berhasil menghafal dan menguasai seluruh 105 karakter Kanji level JLPT N5 hingga 100%! Bukti pemahaman huruf Kanji dasar dengan mantap.',
    unlockedHint: 'Kuasai 100% karakter Kanji N5 di Peta Penguasaan (Streak ≥ 3 pada setiap kanji).',
    accentColor: 'from-purple-500/20 to-indigo-600/10'
  },
  {
    id: 'badge_lvl_2',
    levelRequired: 2,
    lessonNumber: 1,
    category: 'level',
    title: 'Sakura Hajime',
    japaneseTitle: '桜の挨拶',
    icon: '🌸',
    tier: 'bronze',
    description: 'Berhasil menguasai Pelajaran 1 (Salam & Perkenalan Diri). Bunga sakura pertama telah mekar!',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 1 (Streak ≥ 3).',
    accentColor: 'from-pink-500/20 to-rose-600/10'
  },
  {
    id: 'badge_lvl_3',
    levelRequired: 3,
    lessonNumber: 2,
    title: 'Gerbang Torii',
    japaneseTitle: '鳥居の導き',
    icon: '⛩️',
    tier: 'bronze',
    description: 'Berhasil menguasai Pelajaran 2 (Benda & Kepemilikan: Kore, Sore, Are). Memasuki gerbang pengetahuan yang lebih dalam.',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 2 (Streak ≥ 3).',
    accentColor: 'from-red-500/20 to-amber-600/10'
  },
  {
    id: 'badge_lvl_4',
    levelRequired: 4,
    lessonNumber: 3,
    title: 'Onigiri Explorer',
    japaneseTitle: 'おにぎり探検',
    icon: '🍙',
    tier: 'bronze',
    description: 'Berhasil menguasai Pelajaran 3 (Tempat & Arah: Koko, Soko, Asoko). Bekal mantap untuk menjelajah Jepang!',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 3 (Streak ≥ 3).',
    accentColor: 'from-slate-400/20 to-zinc-600/10'
  },
  {
    id: 'badge_lvl_5',
    levelRequired: 5,
    lessonNumber: 4,
    title: 'Matcha Teatime',
    japaneseTitle: '抹茶のひととき',
    icon: '🍵',
    tier: 'bronze',
    description: 'Berhasil menguasai Pelajaran 4 (Waktu & Jam: Rutinitas Harian). Menikmati proses belajar seperti ritual minum teh.',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 4 (Streak ≥ 3).',
    accentColor: 'from-emerald-500/20 to-green-600/10'
  },
  {
    id: 'badge_lvl_6',
    levelRequired: 6,
    lessonNumber: 5,
    title: 'Fuji Climber',
    japaneseTitle: '富士の旅人',
    icon: '🗻',
    tier: 'silver',
    description: 'Berhasil menguasai Pelajaran 5 (Transportasi & Arah: Pergi, Datang, Pulang). Menapaki lereng Gunung Fuji!',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 5 (Streak ≥ 3).',
    accentColor: 'from-blue-500/20 to-indigo-600/10'
  },
  {
    id: 'badge_lvl_7',
    levelRequired: 7,
    lessonNumber: 6,
    title: 'Bento Gourmet',
    japaneseTitle: '弁当の恵み',
    icon: '🍱',
    tier: 'silver',
    description: 'Berhasil menguasai Pelajaran 6 (Objek & Aksi: Makan, Minum, Melakukan). Siap menikmati ragam kuliner Jepang!',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 6 (Streak ≥ 3).',
    accentColor: 'from-amber-500/20 to-orange-600/10'
  },
  {
    id: 'badge_lvl_8',
    levelRequired: 8,
    lessonNumber: 7,
    title: 'Omiyage Giver',
    japaneseTitle: 'お土産の心',
    icon: '🎁',
    tier: 'silver',
    description: 'Berhasil menguasai Pelajaran 7 (Memberi & Menerima dengan Alat/Tangan). Berbagi kebaikan kepada sesama.',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 7 (Streak ≥ 3).',
    accentColor: 'from-purple-500/20 to-pink-600/10'
  },
  {
    id: 'badge_lvl_9',
    levelRequired: 9,
    lessonNumber: 8,
    title: 'Kitsune Mask',
    japaneseTitle: '狐の面',
    icon: '🦊',
    tier: 'silver',
    description: 'Berhasil menguasai Pelajaran 8 (Kata Sifat -i dan -na). Memahami berbagai nuansa keindahan dan sifat benda.',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 8 (Streak ≥ 3).',
    accentColor: 'from-orange-500/20 to-red-600/10'
  },
  {
    id: 'badge_lvl_10',
    levelRequired: 10,
    lessonNumber: 9,
    title: 'Sensu Fan',
    japaneseTitle: '雅な扇子',
    icon: '🪭',
    tier: 'silver',
    description: 'Berhasil menguasai Pelajaran 9 (Kemampuan & Kesukaan: Suki, Kirai, Jouzu, Heta). Kepiawaian yang kian anggun.',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 9 (Streak ≥ 3).',
    accentColor: 'from-rose-500/20 to-fuchsia-600/10'
  },
  {
    id: 'badge_lvl_11',
    levelRequired: 11,
    lessonNumber: 10,
    title: 'Shiro Fortress',
    japaneseTitle: '名城の守り',
    icon: '🏯',
    tier: 'gold',
    description: 'Berhasil menguasai Pelajaran 10 (Keberadaan Makhluk & Benda: Arimasu & Imasu). Pondasi benteng pengetahuan kokoh berdiri!',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 10 (Streak ≥ 3).',
    accentColor: 'from-amber-400/20 to-yellow-600/10'
  },
  {
    id: 'badge_lvl_12',
    levelRequired: 12,
    lessonNumber: 11,
    title: 'Koinobori Breeze',
    japaneseTitle: '鯉のぼりの風',
    icon: '🎏',
    tier: 'gold',
    description: 'Berhasil menguasai Pelajaran 11 (Kata Bantu Bilangan: Hitotsu, Futatsu, Orang, Hewan, Lembar). Berenang maju melawan arus.',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 11 (Streak ≥ 3).',
    accentColor: 'from-cyan-500/20 to-blue-600/10'
  },
  {
    id: 'badge_lvl_13',
    levelRequired: 13,
    lessonNumber: 12,
    title: 'Tanabata Wishes',
    japaneseTitle: '七夕の祈り',
    icon: '🎋',
    tier: 'gold',
    description: 'Berhasil menguasai Pelajaran 12 (Perbandingan & Lampau: Yori, No hou ga). Menuliskan impian di bawah bintang malam.',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 12 (Streak ≥ 3).',
    accentColor: 'from-emerald-400/20 to-teal-600/10'
  },
  {
    id: 'badge_lvl_14',
    levelRequired: 14,
    lessonNumber: 13,
    title: 'Chouchin Lantern',
    japaneseTitle: '提灯の灯火',
    icon: '🏮',
    tier: 'gold',
    description: 'Berhasil menguasai Pelajaran 13 (Keinginan & Tujuan: Hoshii, -tai desu). Lentera yang menerangi arah tujuan masa depan.',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 13 (Streak ≥ 3).',
    accentColor: 'from-red-500/20 to-amber-600/10'
  },
  {
    id: 'badge_lvl_15',
    levelRequired: 15,
    lessonNumber: 14,
    title: 'Origami Crane',
    japaneseTitle: '折鶴の羽ばたき',
    icon: '🕊️',
    tier: 'gold',
    description: 'Berhasil menguasai Pelajaran 14 (Bentuk -te: Permohonan & Instruksi). Ketelitian melipat seribu bangau keberhasilan.',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 14 (Streak ≥ 3).',
    accentColor: 'from-sky-400/20 to-indigo-600/10'
  },
  {
    id: 'badge_lvl_16',
    levelRequired: 16,
    lessonNumber: 15,
    title: 'Katana Ronin',
    japaneseTitle: '名刀の閃き',
    icon: '⚔️',
    tier: 'platinum',
    description: 'Berhasil menguasai Pelajaran 15 (Bentuk -te mo ii desu / Izin & Larangan). Tebasan pedang tekad yang tajam dan tak tergoyahkan!',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 15 (Streak ≥ 3).',
    accentColor: 'from-cyan-400/25 to-blue-600/15'
  },
  {
    id: 'badge_lvl_17',
    levelRequired: 17,
    lessonNumber: 16,
    title: 'Jinja Shrine',
    japaneseTitle: '神社の静寂',
    icon: '⛩️',
    tier: 'platinum',
    description: 'Berhasil menguasai Pelajaran 16 (Urutan Kegiatan: Bentuk -te kara). Ketenangan batin di pelataran kuil suci.',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 16 (Streak ≥ 3).',
    accentColor: 'from-teal-400/25 to-emerald-600/15'
  },
  {
    id: 'badge_lvl_18',
    levelRequired: 18,
    lessonNumber: 17,
    title: 'Kabuto Helm',
    japaneseTitle: '武者の兜',
    icon: '🪖',
    tier: 'platinum',
    description: 'Berhasil menguasai Pelajaran 17 (Bentuk -nai: Kewajiban & Larangan). Baju zirah pelindung seorang kesatria bahasa.',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 17 (Streak ≥ 3).',
    accentColor: 'from-indigo-400/25 to-purple-600/15'
  },
  {
    id: 'badge_lvl_19',
    levelRequired: 19,
    lessonNumber: 18,
    title: 'Kendama Focus',
    japaneseTitle: 'けん玉の極み',
    icon: '🎯',
    tier: 'platinum',
    description: 'Berhasil menguasai Pelajaran 18 (Bentuk Kamus / Jisho-kei: Kemampuan & Hobi). Fokus presisi tingkat tinggi.',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 18 (Streak ≥ 3).',
    accentColor: 'from-violet-400/25 to-fuchsia-600/15'
  },
  {
    id: 'badge_lvl_20',
    levelRequired: 20,
    lessonNumber: 19,
    title: 'Taiko Drummer',
    japaneseTitle: '和太鼓の響き',
    icon: '🥁',
    tier: 'platinum',
    description: 'Berhasil menguasai Pelajaran 19 (Bentuk -ta: Pengalaman & Variasi Aksi). Gemuruh pukulan drum taiko yang membakar semangat!',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 19 (Streak ≥ 3).',
    accentColor: 'from-rose-400/25 to-red-600/15'
  },
  {
    id: 'badge_lvl_21',
    levelRequired: 21,
    lessonNumber: 20,
    title: 'Ryu Dragon',
    japaneseTitle: '青龍の飛翔',
    icon: '🐉',
    tier: 'shogun',
    description: 'Berhasil menguasai Pelajaran 20 (Bahasa Percakapan Biasa / Futsukei). Naga biru melesat menembus awan cakrawala!',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 20 (Streak ≥ 3).',
    accentColor: 'from-emerald-400/30 via-teal-500/20 to-cyan-600/10'
  },
  {
    id: 'badge_lvl_22',
    levelRequired: 22,
    lessonNumber: 21,
    title: 'Maneki Neko',
    japaneseTitle: '招き猫の幸運',
    icon: '🐱',
    tier: 'shogun',
    description: 'Berhasil menguasai Pelajaran 21 (Opini & Dugaan: To omoimasu). Kucing keberuntungan membawa kemakmuran dan berkah ilmu.',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 21 (Streak ≥ 3).',
    accentColor: 'from-amber-400/30 via-yellow-500/20 to-orange-600/10'
  },
  {
    id: 'badge_lvl_23',
    levelRequired: 23,
    lessonNumber: 22,
    title: 'Bonsai Master',
    japaneseTitle: '盆栽の美学',
    icon: '🪴',
    tier: 'shogun',
    description: 'Berhasil menguasai Pelajaran 22 (Klausa Penjelas Kata Benda). Merawat detail bahasa dengan kesabaran sang maestro.',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 22 (Streak ≥ 3).',
    accentColor: 'from-teal-400/30 via-emerald-500/20 to-green-600/10'
  },
  {
    id: 'badge_lvl_24',
    levelRequired: 24,
    lessonNumber: 23,
    title: 'Shinobi Shadow',
    japaneseTitle: '忍の隠密',
    icon: '🥷',
    tier: 'shogun',
    description: 'Berhasil menguasai Pelajaran 23 (Kondisi Waktu: Toki & Kalimat Bertingkat). Bergerak lincah dan cerdas di balik bayangan.',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 23 (Streak ≥ 3).',
    accentColor: 'from-purple-400/30 via-indigo-500/20 to-slate-700/10'
  },
  {
    id: 'badge_lvl_25',
    levelRequired: 25,
    lessonNumber: 24,
    title: 'Daruma Wish',
    japaneseTitle: 'だるまの不撓不屈',
    icon: '🔴',
    tier: 'shogun',
    description: 'Berhasil menguasai Pelajaran 24 (Kebaikan & Bantuan: Kuremasu, Moraimasu). Jatuh tujuh kali, bangkit delapan kali!',
    unlockedHint: 'Kuasai 100% kosakata & kanji Pelajaran 24 (Streak ≥ 3).',
    accentColor: 'from-red-500/30 via-rose-500/20 to-amber-600/10'
  },
  {
    id: 'badge_lvl_26',
    levelRequired: 26,
    lessonNumber: 25,
    title: 'Nihongo Shogun',
    japaneseTitle: '日本語の覇者',
    icon: '👑',
    tier: 'shogun',
    description: 'Pencapaian Tertinggi! Berhasil menuntaskan seluruh 25 Pelajaran Minna no Nihongo dengan sempurna. Gelar Shogun Nihongo kini di tanganmu!',
    unlockedHint: 'Kuasai 100% seluruh kosakata & kanji Bab 1 sampai 25 (Streak ≥ 3).',
    accentColor: 'from-amber-400/35 via-rose-500/25 to-purple-600/15'
  }
];

export const TIER_CONFIG: Record<BadgeTier, { label: string; color: string; bgBadge: string; border: string }> = {
  bronze: {
    label: 'Perunggu (Tingkat Dasar)',
    color: 'text-amber-500 dark:text-amber-400',
    bgBadge: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30',
    border: 'border-amber-500/40'
  },
  silver: {
    label: 'Perak (Tingkat Menengah)',
    color: 'text-slate-400 dark:text-slate-300',
    bgBadge: 'bg-slate-400/10 text-slate-700 dark:text-slate-200 border-slate-400/30',
    border: 'border-slate-400/40'
  },
  gold: {
    label: 'Emas (Tingkat Lanjut)',
    color: 'text-yellow-500 dark:text-yellow-400',
    bgBadge: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-300 border-yellow-500/30',
    border: 'border-yellow-500/40'
  },
  platinum: {
    label: 'Platinum (Pendekar Kotoba)',
    color: 'text-cyan-500 dark:text-cyan-300',
    bgBadge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/30',
    border: 'border-cyan-400/40'
  },
  shogun: {
    label: 'Shogun (Legenda Nihongo)',
    color: 'text-amber-400 dark:text-amber-300',
    bgBadge: 'bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border-amber-400/40',
    border: 'border-amber-400/50 shadow-amber-500/20'
  }
};
