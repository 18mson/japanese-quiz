export interface SentenceItem {
  id: string;
  japanese: string;
  meaning_id: string;
  difficulty: 'n5';
  romaji_variants: string[][];
  word_spans?: number[];
}

export const sentencesData: SentenceItem[] = [
  {
    id: 's1',
    japanese: 'わたしはがくせいです',
    meaning_id: 'Saya adalah seorang siswa',
    difficulty: 'n5',
    romaji_variants: [['wa'], ['ta'], ['shi', 'si'], ['wa', 'ha'], ['ga'], ['ku'], ['se'], ['i'], ['de'], ['su']],
    word_spans: [3, 1, 4, 2]
  },
  {
    id: 's2',
    japanese: 'きょうはいいてんきです',
    meaning_id: 'Hari ini cuacanya bagus',
    difficulty: 'n5',
    romaji_variants: [['kyo'], ['u'], ['wa', 'ha'], ['i'], ['i'], ['te'], ['n', 'nn', 'm'], ['ki'], ['de'], ['su']],
    word_spans: [2, 1, 2, 3, 2]
  },
  {
    id: 's3',
    japanese: 'ほんをよみます',
    meaning_id: 'Membaca buku',
    difficulty: 'n5',
    romaji_variants: [['ho'], ['n', 'nn', 'm'], ['wo', 'o'], ['yo'], ['mi'], ['ma'], ['su']],
    word_spans: [2, 1, 4]
  },
  {
    id: 's4',
    japanese: 'これはなんですか',
    meaning_id: 'Apakah ini?',
    difficulty: 'n5',
    romaji_variants: [['ko'], ['re'], ['wa', 'ha'], ['na'], ['n', 'nn'], ['de'], ['su'], ['ka']],
    word_spans: [2, 1, 2, 2, 1]
  },
  {
    id: 's5',
    japanese: 'みずをのみます',
    meaning_id: 'Minum air',
    difficulty: 'n5',
    romaji_variants: [['mi'], ['zu'], ['wo', 'o'], ['no'], ['mi'], ['ma'], ['su']],
    word_spans: [2, 1, 4]
  },
  {
    id: 's6',
    japanese: 'あしたとうきょうへいきます',
    meaning_id: 'Besok pergi ke Tokyo',
    difficulty: 'n5',
    romaji_variants: [['a'], ['shi', 'si'], ['ta'], ['to'], ['u'], ['kyo'], ['u'], ['e', 'he'], ['i'], ['ki'], ['ma'], ['su']],
    word_spans: [3, 4, 1, 4]
  },
  {
    id: 's7',
    japanese: 'にほんごはおもしろいです',
    meaning_id: 'Bahasa Jepang menarik',
    difficulty: 'n5',
    romaji_variants: [['ni'], ['ho'], ['n', 'nn'], ['go'], ['wa', 'ha'], ['o'], ['mo'], ['shi', 'si'], ['ro'], ['i'], ['de'], ['su']],
    word_spans: [4, 1, 5, 2]
  },
  {
    id: 's8',
    japanese: 'まいあさろくじにおきます',
    meaning_id: 'Setiap pagi bangun jam 6',
    difficulty: 'n5',
    romaji_variants: [['ma'], ['i'], ['a'], ['sa'], ['ro'], ['ku'], ['ji', 'zi'], ['ni'], ['o'], ['ki'], ['ma'], ['su']],
    word_spans: [4, 3, 1, 4]
  },
  {
    id: 's9',
    japanese: 'きのうすしをたべました',
    meaning_id: 'Kemarin makan sushi',
    difficulty: 'n5',
    romaji_variants: [['ki'], ['no'], ['u'], ['su'], ['shi', 'si'], ['wo', 'o'], ['ta'], ['be'], ['ma'], ['shi', 'si'], ['ta']],
    word_spans: [3, 2, 1, 5]
  },
  {
    id: 's10',
    japanese: 'ともだちとえいがをみます',
    meaning_id: 'Nonton film bersama teman',
    difficulty: 'n5',
    romaji_variants: [['to'], ['mo'], ['da'], ['chi', 'ti'], ['to'], ['e'], ['i'], ['ga'], ['wo', 'o'], ['mi'], ['ma'], ['su']],
    word_spans: [4, 1, 3, 1, 3]
  },
  {
    id: 's11',
    japanese: 'わたしはにほんごをべんきょうします',
    meaning_id: 'Saya belajar bahasa Jepang',
    difficulty: 'n5',
    romaji_variants: [['wa'], ['ta'], ['shi', 'si'], ['wa', 'ha'], ['ni'], ['ho'], ['n', 'nn'], ['go'], ['wo', 'o'], ['be'], ['n', 'nn'], ['kyo'], ['u'], ['shi', 'si'], ['ma'], ['su']],
    word_spans: [3, 1, 4, 1, 7]
  },
  {
    id: 's12',
    japanese: 'すみません、いまなんじですか',
    meaning_id: 'Permisi, sekarang jam berapa?',
    difficulty: 'n5',
    romaji_variants: [['su'], ['mi'], ['ma'], ['se'], ['n', 'nn'], [',', ' ', ''], ['i'], ['ma'], ['na'], ['n', 'nn'], ['ji', 'zi'], ['de'], ['su'], ['ka']],
    word_spans: [5, 1, 2, 3, 2, 1]
  },
  {
    id: 's13',
    japanese: 'このりょうりはとてもおいしいです',
    meaning_id: 'Masakan ini sangat enak',
    difficulty: 'n5',
    romaji_variants: [['ko'], ['no'], ['ryo'], ['u'], ['ri'], ['wa', 'ha'], ['to'], ['te'], ['mo'], ['o'], ['i'], ['shi', 'si'], ['i'], ['de'], ['su']],
    word_spans: [2, 3, 1, 3, 4, 2]
  },
  {
    id: 's14',
    japanese: 'がっこうへいきます',
    meaning_id: 'Pergi ke sekolah',
    difficulty: 'n5',
    romaji_variants: [['ga'], ['kko', 'kko'], ['u'], ['e', 'he'], ['i'], ['ki'], ['ma'], ['su']],
    word_spans: [3, 1, 4]
  },
  {
    id: 's15',
    japanese: 'いえでてがみをかきます',
    meaning_id: 'Menulis surat di rumah',
    difficulty: 'n5',
    romaji_variants: [['i'], ['e'], ['de'], ['te'], ['ga'], ['mi'], ['wo', 'o'], ['ka'], ['ki'], ['ma'], ['su']],
    word_spans: [2, 1, 3, 1, 4]
  },
  {
    id: 's16',
    japanese: 'どこでしゃしんをとりましか',
    meaning_id: 'Di mana mengambil foto?',
    difficulty: 'n5',
    romaji_variants: [['do'], ['ko'], ['de'], ['sha', 'sya'], ['shi', 'si'], ['n', 'nn'], ['wo', 'o'], ['to'], ['ri'], ['ma'], ['shi', 'si'], ['ka']],
    word_spans: [2, 1, 3, 1, 5]
  },
  {
    id: 's17',
    japanese: 'たなかさんはしんせつなひとです',
    meaning_id: 'Tanaka-san adalah orang yang ramah',
    difficulty: 'n5',
    romaji_variants: [['ta'], ['na'], ['ka'], ['sa'], ['n', 'nn'], ['wa', 'ha'], ['shi', 'si'], ['n', 'nn'], ['se'], ['tsu', 'tu'], ['na'], ['hi'], ['to'], ['de'], ['su']],
    word_spans: [5, 1, 4, 1, 2, 2]
  },
  {
    id: 's18',
    japanese: 'へやにテレビがあります',
    meaning_id: 'Ada TV di kamar',
    difficulty: 'n5',
    romaji_variants: [['he'], ['ya'], ['ni'], ['te'], ['re'], ['bi'], ['ga'], ['a'], ['ri'], ['ma'], ['su']],
    word_spans: [2, 1, 3, 1, 4]
  },
  {
    id: 's19',
    japanese: 'にわにねこがいます',
    meaning_id: 'Ada kucing di halaman',
    difficulty: 'n5',
    romaji_variants: [['ni'], ['wa'], ['ni'], ['ne'], ['ko'], ['ga'], ['i'], ['ma'], ['su']],
    word_spans: [2, 1, 2, 1, 3]
  },
  {
    id: 's20',
    japanese: 'あさごはんをたべませんでした',
    meaning_id: 'Tidak makan sarapan',
    difficulty: 'n5',
    romaji_variants: [['a'], ['sa'], ['go'], ['ha'], ['n', 'nn'], ['wo', 'o'], ['ta'], ['be'], ['ma'], ['se'], ['n', 'nn'], ['de'], ['shi', 'si'], ['ta']],
    word_spans: [5, 1, 8]
  },
  {
    id: 's21',
    japanese: 'としょかんでほんをかりました',
    meaning_id: 'Meminjam buku di perpustakaan',
    difficulty: 'n5',
    romaji_variants: [['to'], ['sho', 'syo'], ['ka'], ['n', 'nn'], ['de'], ['ho'], ['n', 'nn'], ['wo', 'o'], ['ka'], ['ri'], ['ma'], ['shi', 'si'], ['ta']],
    word_spans: [4, 1, 2, 1, 5]
  },
  {
    id: 's22',
    japanese: 'きのうはあめがふりました',
    meaning_id: 'Kemarin hujan turun',
    difficulty: 'n5',
    romaji_variants: [['ki'], ['no'], ['u'], ['wa', 'ha'], ['a'], ['me'], ['ga'], ['fu', 'hu'], ['ri'], ['ma'], ['shi', 'si'], ['ta']],
    word_spans: [3, 1, 2, 1, 4]
  },
  {
    id: 's23',
    japanese: 'でんしゃでおおさかへいきます',
    meaning_id: 'Pergi ke Osaka naik kereta',
    difficulty: 'n5',
    romaji_variants: [['de'], ['n', 'nn'], ['sha', 'sya'], ['de'], ['o'], ['o'], ['sa'], ['ka'], ['e', 'he'], ['i'], ['ki'], ['ma'], ['su']],
    word_spans: [3, 1, 4, 1, 4]
  },
  {
    id: 's24',
    japanese: 'デパートでおみやげをかいました',
    meaning_id: 'Membeli oleh-oleh di department store',
    difficulty: 'n5',
    romaji_variants: [['de'], ['pa', 'paa'], ['-', 'ー', '_'], ['to'], ['de'], ['o'], ['mi'], ['ya'], ['ge'], ['wo', 'o'], ['ka'], ['i'], ['ma'], ['shi', 'si'], ['ta']],
    word_spans: [4, 1, 4, 1, 5]
  },
  {
    id: 's25',
    japanese: 'おとうとうはカフェでコーヒーをのみます',
    meaning_id: 'Adik laki-laki minum kopi di kafe',
    difficulty: 'n5',
    romaji_variants: [['o'], ['to'], ['u'], ['to'], ['u'], ['wa', 'ha'], ['ka'], ['fe'], ['de'], ['ko', 'koo'], ['-', 'ー', '_'], ['hi', 'hii'], ['-', 'ー', '_'], ['wo', 'o'], ['no'], ['mi'], ['ma'], ['su']],
    word_spans: [5, 1, 2, 1, 4, 1, 4]
  },
  {
    id: 's26',
    japanese: 'ライブラリでしゅくだいをします',
    meaning_id: 'Mengerjakan PR di perpustakaan',
    difficulty: 'n5',
    romaji_variants: [['ra'], ['i'], ['bu'], ['ra'], ['ri'], ['de'], ['shu', 'syu'], ['ku'], ['da'], ['i'], ['wo', 'o'], ['shi', 'si'], ['ma'], ['su']],
    word_spans: [5, 1, 4, 1, 3]
  },
  {
    id: 's27',
    japanese: 'まいばんじゅういちじにおやすみます',
    meaning_id: 'Setiap malam tidur jam 11',
    difficulty: 'n5',
    romaji_variants: [['ma'], ['i'], ['ba'], ['n', 'nn'], ['ju', 'jyu', 'zu'], ['u'], ['i'], ['chi', 'ti'], ['ji', 'zi'], ['ni'], ['o'], ['ya'], ['su'], ['mi'], ['ma'], ['su']],
    word_spans: [4, 6, 1, 5]
  },
  {
    id: 's28',
    japanese: 'つくえのうえにほんがあります',
    meaning_id: 'Ada buku di atas meja',
    difficulty: 'n5',
    romaji_variants: [['tsu', 'tu'], ['ku'], ['e'], ['no'], ['u'], ['e'], ['ni'], ['ho'], ['n', 'nn'], ['ga'], ['a'], ['ri'], ['ma'], ['su']],
    word_spans: [3, 1, 2, 1, 2, 1, 4]
  },
  {
    id: 's29',
    japanese: 'いっしょにおちゃをのみませんか',
    meaning_id: 'Mau minum teh bersama?',
    difficulty: 'n5',
    romaji_variants: [['i'], ['ssho', 'ssyo'], ['ni'], ['o'], ['cha', 'tya'], ['wo', 'o'], ['no'], ['mi'], ['ma'], ['se'], ['n', 'nn'], ['ka']],
    word_spans: [2, 1, 2, 1, 6]
  },
  {
    id: 's30',
    japanese: 'せんせいはきょうしつにいます',
    meaning_id: 'Guru ada di dalam kelas',
    difficulty: 'n5',
    romaji_variants: [['se'], ['n', 'nn'], ['se'], ['i'], ['wa', 'ha'], ['kyo'], ['u'], ['shi', 'si'], ['tsu', 'tu'], ['ni'], ['i'], ['ma'], ['su']],
    word_spans: [4, 1, 4, 1, 3]
  },
  {
    id: 's31',
    japanese: 'きょうはとてもあついです',
    meaning_id: 'Hari ini sangat panas',
    difficulty: 'n5',
    romaji_variants: [['kyou', 'kyo'], ['wa', 'ha'], ['to'], ['te'], ['mo'], ['a'], ['tsu', 'tu'], ['i'], ['de'], ['su']],
    word_spans: [1, 1, 3, 3, 2]
  },
  {
    id: 's32',
    japanese: 'ふじさんはたかいやまです',
    meaning_id: 'Gunung Fuji adalah gunung yang tinggi',
    difficulty: 'n5',
    romaji_variants: [['fu', 'hu'], ['ji', 'zi'], ['sa'], ['n', 'nn'], ['wa', 'ha'], ['ta'], ['ka'], ['i'], ['ya'], ['ma'], ['de'], ['su']],
    word_spans: [4, 1, 3, 2, 2]
  },
  {
    id: 's33',
    japanese: 'このかばんはいくらですか',
    meaning_id: 'Berapa harga tas ini?',
    difficulty: 'n5',
    romaji_variants: [['ko'], ['no'], ['ka'], ['ba'], ['n', 'nn'], ['wa', 'ha'], ['i'], ['ku'], ['ra'], ['de'], ['su'], ['ka']],
    word_spans: [2, 3, 1, 3, 2, 1]
  },
  {
    id: 's34',
    japanese: 'えきまであるいていきます',
    meaning_id: 'Pergi jalan kaki sampai stasiun',
    difficulty: 'n5',
    romaji_variants: [['e'], ['ki'], ['ma'], ['de'], ['a'], ['ru'], ['i'], ['te'], ['i'], ['ki'], ['ma'], ['su']],
    word_spans: [2, 2, 4, 4]
  },
  {
    id: 's35',
    japanese: 'らいしゅうのどようびにあいましょう',
    meaning_id: 'Mari bertemu hari Sabtu minggu depan',
    difficulty: 'n5',
    romaji_variants: [['ra'], ['i'], ['shu', 'syu'], ['u'], ['no'], ['do'], ['yo'], ['u'], ['bi'], ['ni'], ['a'], ['i'], ['ma'], ['sho', 'syo']],
    word_spans: [4, 1, 4, 1, 5]
  }
];
