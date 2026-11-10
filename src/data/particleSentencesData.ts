// src/data/particleSentencesData.ts
// Bank Soal Kuis Pengisian Partikel Bahasa Jepang (N5 - Minna no Nihongo Bab 1-25)
// Mendukung variasi partikel ganda yang sah (misal [へ/に], [に/と], [を/が]).

export interface ParticleQuestionItem {
  id: string;
  chapter: number;
  sentenceBefore: string;
  sentenceAfter: string;
  correctParticles: string[]; // Semua partikel yang sah diterima sebagai BENAR
  primaryParticle: string;
  distractors: string[];      // 3 partikel pengecoh untuk pilihan ganda
  meaning: string;
  romaji: string;
  explanation: string;
}

export const PARTICLE_QUESTIONS: ParticleQuestionItem[] = [
  // --- Bab 1: は, も, の, か ---
  {
    id: 'pq_1_1',
    chapter: 1,
    sentenceBefore: 'わたし',
    sentenceAfter: 'マイク・ミラーです。',
    correctParticles: ['は'],
    primaryParticle: 'は',
    distractors: ['が', 'を', 'に'],
    meaning: 'Saya adalah Mike Miller.',
    romaji: 'Watashi [wa] Maiku Miraa desu.',
    explanation: 'Partikel は (wa) berfungsi sebagai penanda topik atau subjek utama dalam kalimat nominal.'
  },
  {
    id: 'pq_1_2',
    chapter: 1,
    sentenceBefore: 'サントスさん',
    sentenceAfter: 'かいしゃいんですか。',
    correctParticles: ['は'],
    primaryParticle: 'は',
    distractors: ['の', 'も', 'で'],
    meaning: 'Apakah Sdr. Santos seorang karyawan perusahaan?',
    romaji: 'Santosu-san [wa] kaishain desu ka.',
    explanation: 'Partikel は (wa) menandai topik yang ditanyakan.'
  },
  {
    id: 'pq_1_3',
    chapter: 1,
    sentenceBefore: 'ミラーさんは アメリカ人です。サントスさん',
    sentenceAfter: 'アメリカ人ですか。',
    correctParticles: ['も'],
    primaryParticle: 'も',
    distractors: ['は', 'の', 'が'],
    meaning: 'Miller orang Amerika. Apakah Santos juga orang Amerika?',
    romaji: 'Miraa-san wa Amerikajin desu. Santosu-san [mo] Amerikajin desu ka.',
    explanation: 'Partikel も (mo) berarti "juga/pula", menggantikan は ketika predikatnya sama.'
  },
  {
    id: 'pq_1_4',
    chapter: 1,
    sentenceBefore: 'ミラさんは IMC',
    sentenceAfter: 'しゃいんです。',
    correctParticles: ['の'],
    primaryParticle: 'の',
    distractors: ['は', 'で', 'に'],
    meaning: 'Miller adalah karyawan perusahaan IMC.',
    romaji: 'Miraa-san wa IMC [no] shain desu.',
    explanation: 'Partikel の (no) menghubungkan dua kata benda untuk menunjukkan kepemilikan atau afiliasi/instansi.'
  },

  // --- Bab 2: の, は, か ---
  {
    id: 'pq_2_1',
    chapter: 2,
    sentenceBefore: 'これ',
    sentenceAfter: 'わたしのかさです。',
    correctParticles: ['は'],
    primaryParticle: 'は',
    distractors: ['が', 'を', 'の'],
    meaning: 'Ini adalah payung saya.',
    romaji: 'Kore [wa] watashi no kasa desu.',
    explanation: 'Partikel は (wa) menandai kata tunjuk benda (これ) sebagai topik kalimat.'
  },
  {
    id: 'pq_2_2',
    chapter: 2,
    sentenceBefore: 'それ',
    sentenceAfter: 'だれのノートですか。',
    correctParticles: ['は'],
    primaryParticle: 'は',
    distractors: ['が', 'も', 'に'],
    meaning: 'Itu buku catatan milik siapa?',
    romaji: 'Sore [wa] dare no nooto desu ka.',
    explanation: 'Partikel は (wa) menandai それ sebagai topik dalam kalimat tanya kepemilikan.'
  },
  {
    id: 'pq_2_3',
    chapter: 2,
    sentenceBefore: 'この本は わたし',
    sentenceAfter: 'です。',
    correctParticles: ['の'],
    primaryParticle: 'の',
    distractors: ['は', 'に', 'も'],
    meaning: 'Buku ini adalah milik saya.',
    romaji: 'Kono hon wa watashi [no] desu.',
    explanation: 'Partikel の dapat berdiri sendiri di akhir untuk menggantikan kata benda kepemilikan (わたしの = milik saya).'
  },

  // --- Bab 3: は, の, も, に ---
  {
    id: 'pq_3_1',
    chapter: 3,
    sentenceBefore: 'トイレ',
    sentenceAfter: 'あそこです。',
    correctParticles: ['は'],
    primaryParticle: 'は',
    distractors: ['が', 'に', 'で'],
    meaning: 'Toilet ada di sebelah sana.',
    romaji: 'Toire [wa] asoko desu.',
    explanation: 'Partikel は (wa) menandai lokasi keberadaan tempat.'
  },
  {
    id: 'pq_3_2',
    chapter: 3,
    sentenceBefore: 'これは 日本',
    sentenceAfter: 'くるまです。',
    correctParticles: ['の'],
    primaryParticle: 'の',
    distractors: ['は', 'で', 'に'],
    meaning: 'Ini adalah mobil buatan Jepang.',
    romaji: 'Kore wa Nihon [no] kuruma desu.',
    explanation: 'Partikel の (no) menyatakan negara asal/produsen dari suatu benda.'
  },

  // --- Bab 4: に, から, まで, と ---
  {
    id: 'pq_4_1',
    chapter: 4,
    sentenceBefore: 'まいあさ ６時',
    sentenceAfter: 'おきます。',
    correctParticles: ['に'],
    primaryParticle: 'に',
    distractors: ['で', 'を', 'へ'],
    meaning: 'Setiap pagi bangun pada jam 6.',
    romaji: 'Maiasa 6-ji [ni] okimasu.',
    explanation: 'Partikel に (ni) menandai titik waktu spesifik yang memuat angka jam/tanggal terjadinya suatu kegiatan.'
  },
  {
    id: 'pq_4_2',
    chapter: 4,
    sentenceBefore: 'ぎんこうは ９時',
    sentenceAfter: '３時までです。',
    correctParticles: ['から'],
    primaryParticle: 'から',
    distractors: ['に', 'まで', 'で'],
    meaning: 'Bank buka dari jam 9 sampai jam 3.',
    romaji: 'Ginkou wa 9-ji [kara] 3-ji made desu.',
    explanation: 'Partikel から (kara) menandai titik awal waktu ("dari").'
  },
  {
    id: 'pq_4_3',
    chapter: 4,
    sentenceBefore: 'ひるやすみは １２時半',
    sentenceAfter: 'です。',
    correctParticles: ['から', 'まで'],
    primaryParticle: 'から',
    distractors: ['に', 'で', 'を'],
    meaning: 'Istirahat siang mulai dari jam 12:30 (atau sampai jam 12:30).',
    romaji: 'Hiruyasumi wa 12-jihan [kara / made] desu.',
    explanation: 'Bisa menggunakan から (mulai dari) atau まで (sampai) tergantung konteks batas jam istirahat.'
  },
  {
    id: 'pq_4_4',
    chapter: 4,
    sentenceBefore: 'ぎんこうの やすみは どようび',
    sentenceAfter: 'にちようびです。',
    correctParticles: ['と'],
    primaryParticle: 'と',
    distractors: ['も', 'や', 'の'],
    meaning: 'Libur bank adalah hari Sabtu dan hari Minggu.',
    romaji: 'Ginkou no yasumi wa doyoubi [to] nichiyoubi desu.',
    explanation: 'Partikel と (to) menghubungkan kata benda secara lengkap ("dan").'
  },

  // --- Bab 5: へ / に (Arah Gerak), で (Kendaraan), と (Teman) ---
  {
    id: 'pq_5_1',
    chapter: 5,
    sentenceBefore: 'あした とうきょう',
    sentenceAfter: 'いきます。',
    correctParticles: ['へ', 'に'],
    primaryParticle: 'へ',
    distractors: ['で', 'を', 'から'],
    meaning: 'Besok pergi ke Tokyo.',
    romaji: 'Ashita Toukyou [e / ni] ikimasu.',
    explanation: 'Arah tujuan pergerakan kata kerja 行きます / 来ます / 帰ります dapat menggunakan partikel へ (e) atau に (ni).'
  },
  {
    id: 'pq_5_2',
    chapter: 5,
    sentenceBefore: 'らいしゅう 日本',
    sentenceAfter: 'きます。',
    correctParticles: ['へ', 'に'],
    primaryParticle: 'へ',
    distractors: ['で', 'を', 'から'],
    meaning: 'Minggu depan datang ke Jepang.',
    romaji: 'Raishuu Nihon [e / ni] kimasu.',
    explanation: 'Partikel へ (e) maupun に (ni) sama-sama sah menandai tempat tujuan kedatangan.'
  },
  {
    id: 'pq_5_3',
    chapter: 5,
    sentenceBefore: 'わたしは 電車',
    sentenceAfter: 'うちへ かえります。',
    correctParticles: ['で'],
    primaryParticle: 'で',
    distractors: ['に', 'へ', 'を'],
    meaning: 'Saya pulang ke rumah naik kereta listrik.',
    romaji: 'Watashi wa densha [de] uchi e kaerimasu.',
    explanation: 'Partikel で (de) menandai sarana transportasi atau kendaraan yang dinaiki.'
  },
  {
    id: 'pq_5_4',
    chapter: 5,
    sentenceBefore: 'かぞく',
    sentenceAfter: '日本へ きました。',
    correctParticles: ['と'],
    primaryParticle: 'と',
    distractors: ['に', 'で', 'を'],
    meaning: 'Datang ke Jepang bersama keluarga.',
    romaji: 'Kazoku [to] Nihon e kimashita.',
    explanation: 'Partikel と (to) menandai orang atau pihak yang menyertai dalam melakukan aktivitas ("bersama").'
  },

  // --- Bab 6: を (Objek), で (Tempat Kegiatan), ませんか / ましょう ---
  {
    id: 'pq_6_1',
    chapter: 6,
    sentenceBefore: 'ごはん',
    sentenceAfter: 'たべます。',
    correctParticles: ['を'],
    primaryParticle: 'を',
    distractors: ['が', 'に', 'で'],
    meaning: 'Makan nasi.',
    romaji: 'Gohan [o] tabemasu.',
    explanation: 'Partikel を (ditulis wo, dibaca o) menandai objek langsung dari kata kerja transitif.'
  },
  {
    id: 'pq_6_2',
    chapter: 6,
    sentenceBefore: 'みず',
    sentenceAfter: 'のみます。',
    correctParticles: ['を'],
    primaryParticle: 'を',
    distractors: ['が', 'に', 'で'],
    meaning: 'Minum air.',
    romaji: 'Mizu [o] nomimasu.',
    explanation: 'Partikel を (o) menandai air sebagai objek yang diminum.'
  },
  {
    id: 'pq_6_3',
    chapter: 6,
    sentenceBefore: 'レストラン',
    sentenceAfter: 'ひるごはんを たべます。',
    correctParticles: ['で'],
    primaryParticle: 'で',
    distractors: ['に', 'へ', 'を'],
    meaning: 'Makan siang di restoran.',
    romaji: 'Resutoran [de] hirugohan o tabemasu.',
    explanation: 'Partikel で (de) menandai tempat terjadinya suatu aktivitas aktif.'
  },
  {
    id: 'pq_6_4',
    chapter: 6,
    sentenceBefore: 'いっしょに きょうとへ いき',
    sentenceAfter: 'か。',
    correctParticles: ['ません'],
    primaryParticle: 'ません',
    distractors: ['ます', 'たい', 'ましょう'],
    meaning: 'Maukah pergi ke Kyoto bersama-sama?',
    romaji: 'Issho ni Kyouto e iki[masen] ka.',
    explanation: 'Pola 〜ませんか (masen ka) digunakan untuk mengajak lawan bicara secara sopan.'
  },

  // --- Bab 7: で (Alat/Bahasa), に (Pemberian/Penerimaan) ---
  {
    id: 'pq_7_1',
    chapter: 7,
    sentenceBefore: 'はし',
    sentenceAfter: 'ごはんを たべます。',
    correctParticles: ['で'],
    primaryParticle: 'で',
    distractors: ['に', 'を', 'と'],
    meaning: 'Makan nasi menggunakan sumpit.',
    romaji: 'Hashi [de] gohan o tabemasu.',
    explanation: 'Partikel で (de) menandai alat, perkakas, atau sarana yang digunakan.'
  },
  {
    id: 'pq_7_2',
    chapter: 7,
    sentenceBefore: 'にほんご',
    sentenceAfter: 'レポートを かきます。',
    correctParticles: ['で'],
    primaryParticle: 'で',
    distractors: ['に', 'を', 'は'],
    meaning: 'Menulis laporan dalam bahasa Jepang.',
    romaji: 'Nihongo [de] repooto o kakimasu.',
    explanation: 'Partikel で (de) menandai bahasa atau media yang dipakai untuk menghasilkan sesuatu.'
  },
  {
    id: 'pq_7_3',
    chapter: 7,
    sentenceBefore: '山田さん',
    sentenceAfter: 'はなを あげます。',
    correctParticles: ['に'],
    primaryParticle: 'に',
    distractors: ['で', 'を', 'へ'],
    meaning: 'Memberikan bunga kepada Sdr. Yamada.',
    romaji: 'Yamada-san [ni] hana o agemasu.',
    explanation: 'Partikel に (ni) menandai pihak penerima dalam kata kerja memberi (あげます).'
  },
  {
    id: 'pq_7_4',
    chapter: 7,
    sentenceBefore: '先生',
    sentenceAfter: 'ほんを もらいました。',
    correctParticles: ['に', 'から'],
    primaryParticle: 'に',
    distractors: ['で', 'を', 'へ'],
    meaning: 'Menerima buku dari guru.',
    romaji: 'Sensei [ni / kara] hon o moraimashita.',
    explanation: 'Pemberi pada kata kerja もらいました dapat ditandai dengan partikel に (ni) maupun から (kara).'
  },

  // --- Bab 8: Kata Sifat (na/i) ---
  {
    id: 'pq_8_1',
    chapter: 8,
    sentenceBefore: 'ふじさんは たかい やま',
    sentenceAfter: 'です。',
    correctParticles: ['な', 'の', ''],
    primaryParticle: 'な',
    distractors: ['に', 'で', 'を'],
    meaning: 'Gunung Fuji adalah gunung yang tinggi (tidak memakai partikel antara adj-i dan kata benda).',
    romaji: 'Fujisan wa takai yama desu.',
    explanation: 'Kata sifat-i langsung menerangkan kata benda tanpa partikel perantara.'
  },
  {
    id: 'pq_8_2',
    chapter: 8,
    sentenceBefore: 'ワット先生は しんせつ',
    sentenceAfter: 'せんせいです。',
    correctParticles: ['な'],
    primaryParticle: 'な',
    distractors: ['の', 'に', 'で'],
    meaning: 'Pak Watt adalah guru yang ramah.',
    romaji: 'Watto-sensei wa shinsetsu [na] sensei desu.',
    explanation: 'Kata sifat-na memerlukan partikel な (na) ketika menerangkan kata benda di belakangnya.'
  },

  // --- Bab 9: が (Objek Kesukaan, Kemampuan, Kepemilikan), から (Alasan) ---
  {
    id: 'pq_9_1',
    chapter: 9,
    sentenceBefore: 'わたしは イタリアりょうり',
    sentenceAfter: 'すきです。',
    correctParticles: ['が'],
    primaryParticle: 'が',
    distractors: ['を', 'は', 'に'],
    meaning: 'Saya suka masakan Italia.',
    romaji: 'Watashi wa Itaria-ryouri [ga] suki desu.',
    explanation: 'Objek kesukaan (好き), kebencian (嫌い), dan kemahiran (上手/下手) wajib ditandai dengan partikel が (ga).'
  },
  {
    id: 'pq_9_2',
    chapter: 9,
    sentenceBefore: '日本語',
    sentenceAfter: 'わかりますか。',
    correctParticles: ['が'],
    primaryParticle: 'が',
    distractors: ['を', 'で', 'に'],
    meaning: 'Apakah mengerti bahasa Jepang?',
    romaji: 'Nihongo [ga] wakarimasu ka.',
    explanation: 'Kata kerja pemahaman (わかります) dan kemampuan (できます) menggunakan partikel が untuk menandai objeknya.'
  },
  {
    id: 'pq_9_3',
    chapter: 9,
    sentenceBefore: 'じかんが ありません',
    sentenceAfter: '、テレビを みません。',
    correctParticles: ['から'],
    primaryParticle: 'から',
    distractors: ['ので', 'けど', 'が'],
    meaning: 'Karena tidak ada waktu, tidak menonton TV.',
    romaji: 'Jikan ga arimasen [kara], terebi o mimasen.',
    explanation: 'Partikel から (kara) di akhir klausa menyatakan alasan atau sebab ("karena").'
  },

  // --- Bab 10: に (Lokasi Ada), が (Subjek Ada) ---
  {
    id: 'pq_10_1',
    chapter: 10,
    sentenceBefore: 'あそこに コンビニ',
    sentenceAfter: 'あります。',
    correctParticles: ['が'],
    primaryParticle: 'が',
    distractors: ['は', 'を', 'に'],
    meaning: 'Di sana ada minimarket.',
    romaji: 'Asoko ni konbini [ga] arimasu.',
    explanation: 'Benda mati yang keberadaannya dinyatakan dengan あります ditandai dengan partikel が (ga).'
  },
  {
    id: 'pq_10_2',
    chapter: 10,
    sentenceBefore: 'へや',
    sentenceAfter: 'だれが いますか。',
    correctParticles: ['に'],
    primaryParticle: 'に',
    distractors: ['で', 'へ', 'を'],
    meaning: 'Di kamar ada siapa?',
    romaji: 'Heya [ni] dare ga imasu ka.',
    explanation: 'Partikel に (ni) menandai lokasi tempat keberadaan suatu makhluk hidup (います) atau benda (あります).'
  },
  {
    id: 'pq_10_3',
    chapter: 10,
    sentenceBefore: 'つくえの うえ',
    sentenceAfter: 'しゃしんが あります。',
    correctParticles: ['に'],
    primaryParticle: 'に',
    distractors: ['で', 'へ', 'を'],
    meaning: 'Di atas meja ada foto.',
    romaji: 'Tsukue no ue [ni] shashin ga arimasu.',
    explanation: 'Posisi/posisi relatif (kata benda + の + posisi) diikuti partikel に untuk menyatakan letak keberadaan.'
  },

  // --- Bab 11: Counter / Bilangan ---
  {
    id: 'pq_11_1',
    chapter: 11,
    sentenceBefore: 'りんごを ４つ',
    sentenceAfter: 'かいました。',
    correctParticles: [''],
    primaryParticle: '',
    distractors: ['を', 'に', 'で'],
    meaning: 'Membeli apel 4 buah (kata bilangan langsung diletakkan tanpa partikel tambahan setelah kata bantu bilangan).',
    romaji: 'Ringo o 4-tsu kaimashita.',
    explanation: 'Kata bilangan/counter diletakkan langsung sebelum kata kerja tanpa partikel perantara.'
  },

  // --- Bab 12: より (Perbandingan), どちら (Pilihan) ---
  {
    id: 'pq_12_1',
    chapter: 12,
    sentenceBefore: 'ひこうきは しんかんせん',
    sentenceAfter: 'はやいです。',
    correctParticles: ['より'],
    primaryParticle: 'より',
    distractors: ['から', 'ほど', 'に'],
    meaning: 'Pesawat lebih cepat daripada shinkansen.',
    romaji: 'Hikouki wa shinkansen [yori] hayai desu.',
    explanation: 'Partikel より (yori) berarti "daripada", menandai standar pembanding.'
  },
  {
    id: 'pq_12_2',
    chapter: 12,
    sentenceBefore: 'にほんごの べんきょうは おもしろかった',
    sentenceAfter: 'です。',
    correctParticles: [''],
    primaryParticle: '',
    distractors: ['な', 'の', 'に'],
    meaning: 'Belajar bahasa Jepang dulu menyenangkan (lampau adj-i: takatta desu).',
    romaji: 'Nihongo no benkyou wa omoshirokatta desu.',
    explanation: 'Bentuk lampau kata sifat-i cukup ditambah です tanpa partikel perantara.'
  },

  // --- Bab 13: 欲しい (Ingin Benda: が), 〜たい (Ingin Melakukan: を / が), に (Tujuan Pergi) ---
  {
    id: 'pq_13_1',
    chapter: 13,
    sentenceBefore: 'わたしは 新しい くるま',
    sentenceAfter: 'ほしいです。',
    correctParticles: ['が'],
    primaryParticle: 'が',
    distractors: ['を', 'に', 'は'],
    meaning: 'Saya ingin mobil baru.',
    romaji: 'Watashi wa atarashii kuruma [ga] hoshii desu.',
    explanation: 'Objek yang diinginkan pada kata sifat 欲しい (hoshii) ditandai dengan partikel が (ga).'
  },
  {
    id: 'pq_13_2',
    chapter: 13,
    sentenceBefore: 'のどが かわきましたから、水',
    sentenceAfter: 'のみたいです。',
    correctParticles: ['を', 'が'],
    primaryParticle: 'を',
    distractors: ['に', 'で', 'へ'],
    meaning: 'Karena haus, saya ingin minum air.',
    romaji: 'Nodo ga kawakimashita kara, mizu [o / ga] nomitai desu.',
    explanation: 'Objek pada bentuk keinginan 〜たい dapat ditandai dengan partikel を (fokus aksi) maupun が (fokus objek).'
  },
  {
    id: 'pq_13_3',
    chapter: 13,
    sentenceBefore: 'こうべへ インドりょうりを たべ',
    sentenceAfter: 'いきます。',
    correctParticles: ['に'],
    primaryParticle: 'に',
    distractors: ['へ', 'で', 'を'],
    meaning: 'Pergi ke Kobe untuk makan masakan India.',
    romaji: 'Koube e Indo-ryouri o tabe [ni] ikimasu.',
    explanation: 'Akar kata kerja (masu-stem) + に 行きます / 来ます menyatakan tujuan pergerakan ("untuk / guna").'
  },

  // --- Bab 14: 〜てください (Tolong), 〜ています (Sedang) ---
  {
    id: 'pq_14_1',
    chapter: 14,
    sentenceBefore: 'すみませんが、ちょっと まっ',
    sentenceAfter: 'ください。',
    correctParticles: ['て'],
    primaryParticle: 'て',
    distractors: ['で', 'た', 'ない'],
    meaning: 'Permisi, tolong tunggu sebentar.',
    romaji: 'Sumimasen ga, chotto mat[te] kudasai.',
    explanation: 'Pola 〜てください (te kudasai) digunakan untuk meminta tolong atau memberi instruksi sopan.'
  },
  {
    id: 'pq_14_2',
    chapter: 14,
    sentenceBefore: 'ミラーさんは いま でんわを かけ',
    sentenceAfter: 'います。',
    correctParticles: ['て'],
    primaryParticle: 'て',
    distractors: ['で', 'た', 'ます'],
    meaning: 'Sdr. Miller sekarang sedang menelepon.',
    romaji: 'Miraa-san wa ima denwa o kake[te] imasu.',
    explanation: 'Bentuk 〜ています (te imasu) menyatakan aksi yang sedang berlangsung saat ini.'
  },

  // --- Bab 15: 〜てもいいです (Boleh), 〜てはいけません (Tidak Boleh) ---
  {
    id: 'pq_15_1',
    chapter: 15,
    sentenceBefore: 'ここで しゃしんを とっ',
    sentenceAfter: 'も いいですか。',
    correctParticles: ['て'],
    primaryParticle: 'て',
    distractors: ['で', 'た', 'と'],
    meaning: 'Bolehkah mengambil foto di sini?',
    romaji: 'Koko de shashin o tot[te] mo ii desu ka.',
    explanation: 'Pola 〜てもいいですか (te mo ii desu ka) digunakan untuk meminta izin.'
  },
  {
    id: 'pq_15_2',
    chapter: 15,
    sentenceBefore: 'ここで たばこを すっ',
    sentenceAfter: 'は いけません。',
    correctParticles: ['て'],
    primaryParticle: 'て',
    distractors: ['で', 'た', 'に'],
    meaning: 'Dilarang merokok di sini.',
    romaji: 'Koko de tabako o sut[te] wa ikemasen.',
    explanation: 'Pola 〜てはいけません (te wa ikemasen) menyatakan larangan tegas.'
  },

  // --- Bab 16: 〜てから (Setelah), Adj-くて/で ---
  {
    id: 'pq_16_1',
    chapter: 16,
    sentenceBefore: 'くにへ かえっ',
    sentenceAfter: 'から、父の かいしゃで はたらきます。',
    correctParticles: ['て'],
    primaryParticle: 'て',
    distractors: ['た', 'で', 'る'],
    meaning: 'Setelah pulang ke negara asal, akan bekerja di perusahaan ayah.',
    romaji: 'Kuni e kaet[te] kara, chichi no kaisha de hatarakimasu.',
    explanation: 'Pola 〜てから (te kara) menegaskan bahwa aktivitas kedua baru dilakukan setelah aktivitas pertama tuntas.'
  },
  {
    id: 'pq_16_2',
    chapter: 16,
    sentenceBefore: 'マリアさんは かみが なが',
    sentenceAfter: '、きれいです。',
    correctParticles: ['くて'],
    primaryParticle: 'くて',
    distractors: ['い', 'で', 'く'],
    meaning: 'Maria rambutnya panjang dan cantik.',
    romaji: 'Maria-san wa kami ga naga[kute], kirei desu.',
    explanation: 'Untuk menyambung dua kata sifat, kata sifat-i diubah ke bentuk 〜くて (kute).'
  },

  // --- Bab 17: 〜ないでください, 〜なければなりません ---
  {
    id: 'pq_17_1',
    chapter: 17,
    sentenceBefore: 'ここで しゃしんを とら',
    sentenceAfter: 'で ください。',
    correctParticles: ['ない'],
    primaryParticle: 'ない',
    distractors: ['なくて', 'なかっ', 'ず'],
    meaning: 'Tolong jangan mengambil foto di sini.',
    romaji: 'Koko de shashin o tora[nai] de kudasai.',
    explanation: 'Pola 〜ないでください (naide kudasai) digunakan untuk memohon agar tidak melakukan sesuatu.'
  },
  {
    id: 'pq_17_2',
    chapter: 17,
    sentenceBefore: 'くすりを のま',
    sentenceAfter: 'ければ なりません。',
    correctParticles: ['な'],
    primaryParticle: 'な',
    distractors: ['に', 'で', 'て'],
    meaning: 'Harus minum obat.',
    romaji: 'Kusuri o noma[na]kereba narimasen.',
    explanation: 'Pola 〜なければなりません (nakereba narimasen) menyatakan keharusan atau kewajiban.'
  },

  // --- Bab 18: 〜ことができます (Kemampuan), 〜前に (Sebelum) ---
  {
    id: 'pq_18_1',
    chapter: 18,
    sentenceBefore: 'ミラーさんは かんじを よむ こと',
    sentenceAfter: 'できます。',
    correctParticles: ['が'],
    primaryParticle: 'が',
    distractors: ['を', 'は', 'に'],
    meaning: 'Miller bisa membaca kanji.',
    romaji: 'Miraa-san wa kanji o yomu koto [ga] dekimasu.',
    explanation: 'Pola kemampuan: Bentuk Kamus + ことができます (koto ga dekimasu).'
  },
  {
    id: 'pq_18_2',
    chapter: 18,
    sentenceBefore: 'ねる まえ',
    sentenceAfter: '、ほんを よみます。',
    correctParticles: ['に'],
    primaryParticle: 'に',
    distractors: ['で', 'を', 'は'],
    meaning: 'Sebelum tidur, membaca buku.',
    romaji: 'Neru mae [ni], hon o yomimasu.',
    explanation: 'Pola urutan waktu: Bentuk Kamus + 前に (mae ni) menyatakan "sebelum".'
  },

  // --- Bab 19: 〜たことがあります (Pengalaman) ---
  {
    id: 'pq_19_1',
    chapter: 19,
    sentenceBefore: '日本へ いっ',
    sentenceAfter: 'ことが ありますか。',
    correctParticles: ['た'],
    primaryParticle: 'た',
    distractors: ['て', 'る', 'ない'],
    meaning: 'Pernahkah pergi ke Jepang?',
    romaji: 'Nihon e it[ta] koto ga arimasu ka.',
    explanation: 'Pola pengalaman: Bentuk -Ta + ことがあります (ta koto ga arimasu).'
  },

  // --- Bab 20: Percakapan Kasual ---
  {
    id: 'pq_20_1',
    chapter: 20,
    sentenceBefore: 'あした ひま',
    sentenceAfter: '？',
    correctParticles: [''],
    primaryParticle: '',
    distractors: ['か', 'は', 'の'],
    meaning: 'Besok senggang? (Percakapan santai menanggalkan partikel か dan cukup intonasi naik).',
    romaji: 'Ashita hima?',
    explanation: 'Dalam ragam biasa (kasual), partikel か dihilangkan dan diganti intonasi naik.'
  },

  // --- Bab 21: 〜と思います (Pendapat) ---
  {
    id: 'pq_21_1',
    chapter: 21,
    sentenceBefore: 'あしたは あめが ふる',
    sentenceAfter: 'おもいます。',
    correctParticles: ['と'],
    primaryParticle: 'と',
    distractors: ['を', 'に', 'が'],
    meaning: 'Saya pikir besok akan turun hujan.',
    romaji: 'Ashita wa ame ga furu [to] omoimasu.',
    explanation: 'Partikel と (to) mengutip isi pikiran atau pendapat sebelum kata kerja 思います (omoimasu).'
  },

  // --- Bab 23: 〜とき (Ketika) ---
  {
    id: 'pq_23_1',
    chapter: 23,
    sentenceBefore: 'みちを わたる とき',
    sentenceAfter: '、くるまに きを つけます。',
    correctParticles: ['、', 'に', ''],
    primaryParticle: '',
    distractors: ['で', 'を', 'へ'],
    meaning: 'Ketika menyeberang jalan, berhati-hati terhadap mobil.',
    romaji: 'Michi o wataru toki, kuruma ni ki o tsukemasu.',
    explanation: 'Klausa 〜とき (toki) langsung diikuti koma atau partikel に untuk menegaskan waktu kejadian.'
  },

  // --- Bab 24: 〜てくれます / 〜てもらいます ---
  {
    id: 'pq_24_1',
    chapter: 24,
    sentenceBefore: 'さとうさんは わたし',
    sentenceAfter: 'えいごを おしえて くれました。',
    correctParticles: ['に'],
    primaryParticle: 'に',
    distractors: ['を', 'で', 'へ'],
    meaning: 'Sato mengajariku bahasa Inggris (untuk kebaikanku).',
    romaji: 'Satou-san wa watashi [ni] eigo o oshiete kuremashita.',
    explanation: 'Penerima kebaikan (わたし) pada kata kerja 〜てくれます ditandai dengan partikel に (ni).'
  },

  // --- Bab 25: 〜たら (Kalau/Setelah) ---
  {
    id: 'pq_25_1',
    chapter: 25,
    sentenceBefore: 'あめが ふっ',
    sentenceAfter: '、でかけません。',
    correctParticles: ['たら'],
    primaryParticle: 'たら',
    distractors: ['て', 'ば', 'なら'],
    meaning: 'Kalau hujan turun, saya tidak akan bepergian.',
    romaji: 'Ame ga fut[tara], dekakemasen.',
    explanation: 'Bentuk 〜たら (tara) menyatakan syarat pengandaian atau urutan waktu alami ("jika / setelah").'
  }
];

/**
 * Filter soal partikel berdasarkan bab
 */
export function getParticleQuestionsByBatch(batch: 'all' | 'batch1' | 'batch2'): ParticleQuestionItem[] {
  if (batch === 'batch1') {
    return PARTICLE_QUESTIONS.filter(q => q.chapter <= 10);
  }
  if (batch === 'batch2') {
    return PARTICLE_QUESTIONS.filter(q => q.chapter > 10);
  }
  return [...PARTICLE_QUESTIONS];
}
