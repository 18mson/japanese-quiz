// src/data/kanji.ts
// JLPT N5 Kanji Dataset with Indonesian Meanings, Pronunciations, and Groups

export interface JapaneseKanji {
  character: string;
  meaning: string;
  onyomi: string[];
  kunyomi: string[];
  examples?: string[];
  type: 'kanji';
  group?: string;
  lesson?: string;
}

export const kanjiGroups = [
  { key: 'all', label: 'Semua Kelompok' },
  { key: 'numbers', label: 'Angka & Jumlah (Numbers)' },
  { key: 'time', label: 'Waktu & Kalender (Time)' },
  { key: 'people', label: 'Orang & Tubuh (People & Body)' },
  { key: 'nature', label: 'Alam & Cuaca (Nature)' },
  { key: 'direction', label: 'Arah & Posisi (Directions)' },
  { key: 'adjective', label: 'Sifat & Ukuran (Adjectives)' },
  { key: 'verbs', label: 'Kata Kerja (Verbs)' },
  { key: 'places', label: 'Tempat & Kehidupan (Places & Life)' }
];

export const kanjiN5Data: JapaneseKanji[] = [
  // Numbers & Quantities (14 Kanji)
  { character: '一', meaning: 'Satu', onyomi: ['イチ', 'イツ'], kunyomi: ['ひと', 'ひとつ'], examples: ['一つ (satu buah)', '一人 (satu orang)'], type: 'kanji', group: 'numbers' },
  { character: '二', meaning: 'Dua', onyomi: ['ニ'], kunyomi: ['ふた', 'ふたつ'], examples: ['二つ (dua buah)', '二月 (Februari)'], type: 'kanji', group: 'numbers' },
  { character: '三', meaning: 'Tiga', onyomi: ['サン'], kunyomi: ['み', 'みっつ'], examples: ['三つ (tiga buah)', '三人 (tiga orang)'], type: 'kanji', group: 'numbers' },
  { character: '四', meaning: 'Empat', onyomi: ['シ'], kunyomi: ['よ', 'よっつ', 'よん'], examples: ['四つ (empat buah)', '四月 (April)'], type: 'kanji', group: 'numbers' },
  { character: '五', meaning: 'Lima', onyomi: ['ゴ'], kunyomi: ['いつ', 'いつつ'], examples: ['五つ (lima buah)', '五日 (tanggal 5)'], type: 'kanji', group: 'numbers' },
  { character: '六', meaning: 'Enam', onyomi: ['ロク'], kunyomi: ['む', 'むっつ'], examples: ['六つ (enam buah)', '六日 (tanggal 6)'], type: 'kanji', group: 'numbers' },
  { character: '七', meaning: 'Tujuh', onyomi: ['シチ'], kunyomi: ['なな', 'ななつ'], examples: ['七つ (tujuh buah)', '七月 (Juli)'], type: 'kanji', group: 'numbers' },
  { character: '八', meaning: 'Delapan', onyomi: ['ハチ'], kunyomi: ['や', 'やっつ'], examples: ['八つ (delapan buah)', '八日 (tanggal 8)'], type: 'kanji', group: 'numbers' },
  { character: '九', meaning: 'Sembilan', onyomi: ['キュウ', 'ク'], kunyomi: ['ここの', 'ここのつ'], examples: ['九つ (sembilan buah)', '九月 (September)'], type: 'kanji', group: 'numbers' },
  { character: '十', meaning: 'Sepuluh', onyomi: ['ジュウ', 'ジッ'], kunyomi: ['とお'], examples: ['十日 (tanggal 10)', '十月 (Oktober)'], type: 'kanji', group: 'numbers' },
  { character: '百', meaning: 'Ratus / Ratusan', onyomi: ['ヒャク'], kunyomi: [], examples: ['百 (seratus)', '三百 (tiga ratus)'], type: 'kanji', group: 'numbers' },
  { character: '千', meaning: 'Ribu / Ribuan', onyomi: ['セン'], kunyomi: ['ち'], examples: ['千 (seribu)', '三千 (tiga ribu)'], type: 'kanji', group: 'numbers' },
  { character: '万', meaning: 'Puluh Ribu (10.000)', onyomi: ['マン', 'バン'], kunyomi: [], examples: ['一万 (sepuluh ribu)', '万国 (seluruh negara)'], type: 'kanji', group: 'numbers' },
  { character: '円', meaning: 'Yen / Lingkaran', onyomi: ['エン'], kunyomi: ['まるい'], examples: ['円 (Yen / mata uang Jepang)', '百円 (100 Yen)'], type: 'kanji', group: 'numbers' },

  // Time & Days (19 Kanji)
  { character: '日', meaning: 'Hari / Matahari', onyomi: ['ニチ', 'ジツ'], kunyomi: ['ひ', 'か'], examples: ['日曜日 (Minggu)', '日本 (Jepang)', '今日 (Hari ini)'], type: 'kanji', group: 'time' },
  { character: '月', meaning: 'Bulan', onyomi: ['ゲツ', 'ガツ'], kunyomi: ['つき'], examples: ['月曜日 (Senin)', '一月 (Januari)', '今月 (Bulan ini)'], type: 'kanji', group: 'time' },
  { character: '火', meaning: 'Api', onyomi: ['カ'], kunyomi: ['ひ', 'ほ'], examples: ['火曜日 (Selasa)', '火 (Api)', '花火 (Kembang api)'], type: 'kanji', group: 'time' },
  { character: '水', meaning: 'Air', onyomi: ['スイ'], kunyomi: ['みず'], examples: ['水曜日 (Rabu)', '水 (Air dingin)'], type: 'kanji', group: 'time' },
  { character: '木', meaning: 'Pohon / Kayu', onyomi: ['モク', 'ボク'], kunyomi: ['き', 'こ'], examples: ['木曜日 (Kamis)', '木 (Pohon)'], type: 'kanji', group: 'time' },
  { character: '金', meaning: 'Uang / Emas / Logam', onyomi: ['キン', 'コン'], kunyomi: ['かね'], examples: ['金曜日 (Jumat)', 'お金 (Uang)'], type: 'kanji', group: 'time' },
  { character: '土', meaning: 'Tanah', onyomi: ['ド', 'ト'], kunyomi: ['つち'], examples: ['土曜日 (Sabtu)', '土 (Tanah)'], type: 'kanji', group: 'time' },
  { character: '年', meaning: 'Tahun', onyomi: ['ネン'], kunyomi: ['とし'], examples: ['今年 (Tahun ini)', '来年 (Tahun depan)', '一年 (Satu tahun)'], type: 'kanji', group: 'time' },
  { character: '時', meaning: 'Waktu / Jam', onyomi: ['ジ'], kunyomi: ['とき'], examples: ['時間 (Waktu)', '一時 (Jam 1)', '時計 (Jam dinding/tangan)'], type: 'kanji', group: 'time' },
  { character: '分', meaning: 'Menit / Membagi', onyomi: ['ブン', 'フン', 'プン'], kunyomi: ['わける'], examples: ['五分 (Lima menit)', '分かる (Mengerti)'], type: 'kanji', group: 'time' },
  { character: '今', meaning: 'Sekarang', onyomi: ['コン', 'キン'], kunyomi: ['いま'], examples: ['今 (Sekarang)', '今日 (Hari ini)', '今週 (Minggu ini)'], type: 'kanji', group: 'time' },
  { character: '先', meaning: 'Sebelumnya / Dahulu', onyomi: ['セン'], kunyomi: ['さき'], examples: ['先生 (Guru)', '先週 (Minggu lalu)'], type: 'kanji', group: 'time' },
  { character: '生', meaning: 'Lahir / Hidup', onyomi: ['セイ', 'ショウ'], kunyomi: ['いきる', 'うまれる', 'なま'], examples: ['学生 (Siswa)', '誕生日 (Ulang tahun)'], type: 'kanji', group: 'time' },
  { character: '毎', meaning: 'Setiap', onyomi: ['マイ'], kunyomi: [], examples: ['毎日 (Setiap hari)', '毎週 (Setiap minggu)', '毎月 (Setiap bulan)'], type: 'kanji', group: 'time' },
  { character: '何', meaning: 'Apa', onyomi: ['カ'], kunyomi: ['なに', 'なん'], examples: ['何 (Apa)', '何時 (Jam berapa)', '何人 (Berapa orang)'], type: 'kanji', group: 'time' },
  { character: '午', meaning: 'Siang', onyomi: ['ゴ'], kunyomi: [], examples: ['午前 (Pagi/AM)', '午後 (Sore/PM)'], type: 'kanji', group: 'time' },
  { character: '半', meaning: 'Setengah / Paruh', onyomi: ['ハン'], kunyomi: ['なかば'], examples: ['半 (Setengah/Paruh)', '半分 (Separuh)'], type: 'kanji', group: 'time' },
  { character: '週', meaning: 'Minggu (Pekan)', onyomi: ['シュウ'], kunyomi: [], examples: ['今週 (Minggu ini)', '来週 (Minggu depan)', '毎週 (Setiap minggu)'], type: 'kanji', group: 'time' },
  { character: '間', meaning: 'Antara / Jeda Waktu', onyomi: ['カン', 'ケン'], kunyomi: ['あいだ', 'ま'], examples: ['間 (Antara)', '時間 (Waktu/Durasi)'], type: 'kanji', group: 'time' },

  // People & Body (11 Kanji)
  { character: '人', meaning: 'Orang', onyomi: ['ジン', 'ニン'], kunyomi: ['ひと'], examples: ['日本人 (Orang Jepang)', '三人 (3 orang)', '大人 (Dewasa)'], type: 'kanji', group: 'people' },
  { character: '男', meaning: 'Laki-laki / Pria', onyomi: ['ダン', 'ナン'], kunyomi: ['おとこ'], examples: ['男の人 (Pria)', '男の子 (Anak laki-laki)'], type: 'kanji', group: 'people' },
  { character: '女', meaning: 'Perempuan / Wanita', onyomi: ['ジョ', 'ニョ'], kunyomi: ['おんな', 'め'], examples: ['女の人 (Wanita)', '女の子 (Anak perempuan)'], type: 'kanji', group: 'people' },
  { character: '子', meaning: 'Anak', onyomi: ['シ', 'ス'], kunyomi: ['こ'], examples: ['子供 (Anak-anak)', '女の子 (Anak perempuan)'], type: 'kanji', group: 'people' },
  { character: '父', meaning: 'Ayah', onyomi: ['フ'], kunyomi: ['ちち', 'とう'], examples: ['父 (Ayah sendiri)', 'お父さん (Ayah)'], type: 'kanji', group: 'people' },
  { character: '母', meaning: 'Ibu', onyomi: ['ボ'], kunyomi: ['はは', 'かあ'], examples: ['母 (Ibu sendiri)', 'お母さん (Ibu)'], type: 'kanji', group: 'people' },
  { character: '目', meaning: 'Mata', onyomi: ['モク', 'ボク'], kunyomi: ['め', 'ま'], examples: ['目 (Mata)', '目薬 (Obat tetes mata)'], type: 'kanji', group: 'people' },
  { character: '口', meaning: 'Mulut / Pintu Masuk', onyomi: ['コウ', 'ク'], kunyomi: ['くち', 'ぐち'], examples: ['口 (Mulut)', '出口 (Pintu keluar)', '入口 (Pintu masuk)'], type: 'kanji', group: 'people' },
  { character: '耳', meaning: 'Telinga', onyomi: ['ジ'], kunyomi: ['みみ'], examples: ['耳 (Telinga)'], type: 'kanji', group: 'people' },
  { character: '手', meaning: 'Tangan', onyomi: ['シュ'], kunyomi: ['て'], examples: ['手 (Tangan)', '上手 (Pandai/Mahir)', '下手 (Kurang pandai)'], type: 'kanji', group: 'people' },
  { character: '足', meaning: 'Kaki / Cukup', onyomi: ['ソク'], kunyomi: ['あし', 'たりる'], examples: ['足 (Kaki)', '足りる (Cukup)'], type: 'kanji', group: 'people' },

  // Nature & Elements (9 Kanji)
  { character: '山', meaning: 'Gunung', onyomi: ['サン', 'ザン'], kunyomi: ['やま'], examples: ['山 (Gunung)', '富士山 (Gunung Fuji)'], type: 'kanji', group: 'nature' },
  { character: '川', meaning: 'Sungai', onyomi: ['セン'], kunyomi: ['かわ'], examples: ['川 (Sungai)', 'ナイル川 (Sungai Nil)'], type: 'kanji', group: 'nature' },
  { character: '雨', meaning: 'Hujan', onyomi: ['ウ'], kunyomi: ['あめ', 'あま'], examples: ['雨 (Hujan)', '大雨 (Hujan lebat)'], type: 'kanji', group: 'nature' },
  { character: '空', meaning: 'Langit', onyomi: ['クウ'], kunyomi: ['そら', 'あく'], examples: ['空 (Langit)', '空気 (Udara)'], type: 'kanji', group: 'nature' },
  { character: '天', meaning: 'Surga / Langit', onyomi: ['テン'], kunyomi: ['あまつ'], examples: ['天気 (Cuaca)', '天才 (Jenius)'], type: 'kanji', group: 'nature' },
  { character: '気', meaning: 'Jiwa / Energi / Suasana', onyomi: ['キ', 'ケ'], kunyomi: [], examples: ['元気 (Sehat/Semangat)', '天気 (Cuaca)', '気持ち (Perasaan)'], type: 'kanji', group: 'nature' },
  { character: '花', meaning: 'Bunga', onyomi: ['カ'], kunyomi: ['はな'], examples: ['花 (Bunga)', '花火 (Kembang api)', '花見 (Hanami)'], type: 'kanji', group: 'nature' },
  { character: '魚', meaning: 'Ikan', onyomi: ['ギョ'], kunyomi: ['さかな', 'うお'], examples: ['魚 (Ikan)', '金魚 (Ikan mas koki)'], type: 'kanji', group: 'nature' },
  { character: '犬', meaning: 'Anjing', onyomi: ['ケン'], kunyomi: ['いぬ'], examples: ['犬 (Anjing)', '子犬 (Anak anjing)'], type: 'kanji', group: 'nature' },

  // Direction & Spatial (12 Kanji)
  { character: '上', meaning: 'Atas', onyomi: ['ジョウ', 'ショウ'], kunyomi: ['うえ', 'あがる'], examples: ['上 (Atas)', '上手 (Mahir)'], type: 'kanji', group: 'direction' },
  { character: '下', meaning: 'Bawah', onyomi: ['カ', 'ゲ'], kunyomi: ['した', 'さがる', 'くだる'], examples: ['下 (Bawah)', '下手 (Kurang mahir)', '地下鉄 (Kereta bawah tanah)'], type: 'kanji', group: 'direction' },
  { character: '中', meaning: 'Dalam / Tengah', onyomi: ['チュウ'], kunyomi: ['なか'], examples: ['中 (Di dalam)', '中国 (Tiongkok)', '一日中 (Sepanjang hari)'], type: 'kanji', group: 'direction' },
  { character: '外', meaning: 'Luar', onyomi: ['ガイ', 'ゲ'], kunyomi: ['そと', 'はずす'], examples: ['外 (Luar)', '外国 (Luar negeri)', '外国人 (Orang asing)'], type: 'kanji', group: 'direction' },
  { character: '右', meaning: 'Kanan', onyomi: ['ウ', 'ユウ'], kunyomi: ['みぎ'], examples: ['右 (Kanan)', '右手 (Tangan kanan)'], type: 'kanji', group: 'direction' },
  { character: '左', meaning: 'Kiri', onyomi: ['サ'], kunyomi: ['ひだり'], examples: ['左 (Kiri)', '左手 (Tangan kiri)'], type: 'kanji', group: 'direction' },
  { character: '前', meaning: 'Depan / Sebelum', onyomi: ['ゼン'], kunyomi: ['まえ'], examples: ['前 (Depan / Sebelum)', '午前 (Pagi/AM)', '名前 (Nama)'], type: 'kanji', group: 'direction' },
  { character: '後', meaning: 'Belakang / Sesudah', onyomi: ['ゴ', 'コウ'], kunyomi: ['うしろ', 'あと'], examples: ['後ろ (Belakang)', '午後 (Sore/PM)', '後で (Nanti)'], type: 'kanji', group: 'direction' },
  { character: '東', meaning: 'Timur', onyomi: ['トウ'], kunyomi: ['ひがし'], examples: ['東 (Timur)', '東京 (Tokyo)', '東口 (Pintu timur)'], type: 'kanji', group: 'direction' },
  { character: '西', meaning: 'Barat', onyomi: ['セイ', 'サイ'], kunyomi: ['にし'], examples: ['西 (Barat)', '東西 (Timur & barat)', '西口 (Pintu barat)'], type: 'kanji', group: 'direction' },
  { character: '南', meaning: 'Selatan', onyomi: ['ナン'], kunyomi: ['みなみ'], examples: ['南 (Selatan)', '南口 (Pintu selatan)'], type: 'kanji', group: 'direction' },
  { character: '北', meaning: 'Utara', onyomi: ['ホク'], kunyomi: ['きた'], examples: ['北 (Utara)', '北海道 (Hokkaido)', '北口 (Pintu utara)'], type: 'kanji', group: 'direction' },

  // Size & Status / Adjectives (10 Kanji)
  { character: '大', meaning: 'Besar', onyomi: ['ダイ', 'タイ'], kunyomi: ['おおきい', 'おおいに'], examples: ['大きい (Besar)', '大学 (Universitas)', '大人 (Dewasa)'], type: 'kanji', group: 'adjective' },
  { character: '小', meaning: 'Kecil', onyomi: ['ショウ'], kunyomi: ['ちいさい', 'こ', 'お'], examples: ['小さい (Kecil)', '小学校 (Sekolah Dasar)'], type: 'kanji', group: 'adjective' },
  { character: '多', meaning: 'Banyak', onyomi: ['タ'], kunyomi: ['おおい'], examples: ['多い (Banyak)', '多分 (Mungkin)'], type: 'kanji', group: 'adjective' },
  { character: '少', meaning: 'Sedikit', onyomi: ['ショウ'], kunyomi: ['すくない', 'すこし'], examples: ['少し (Sedikit)', '少ない (Sedikit jumlahnya)'], type: 'kanji', group: 'adjective' },
  { character: '高', meaning: 'Tinggi / Mahal', onyomi: ['コウ'], kunyomi: ['たかい'], examples: ['高い (Tinggi/Mahal)', '高校 (SMA)'], type: 'kanji', group: 'adjective' },
  { character: '安', meaning: 'Murah / Tenang', onyomi: ['アン'], kunyomi: ['やすい'], examples: ['安い (Murah)', '安心 (Lega/Tenang)'], type: 'kanji', group: 'adjective' },
  { character: '新', meaning: 'Baru', onyomi: ['シン'], kunyomi: ['あたらしい'], examples: ['新しい (Baru)', '新聞 (Koran)', '新年 (Tahun baru)'], type: 'kanji', group: 'adjective' },
  { character: '古', meaning: 'Lama / Tua', onyomi: ['コ'], kunyomi: ['ふるい'], examples: ['古い (Lama/Kuno)', '中古 (Barang bekas)'], type: 'kanji', group: 'adjective' },
  { character: '長', meaning: 'Panjang / Ketua', onyomi: ['チョウ'], kunyomi: ['ながい'], examples: ['長い (Panjang)', '社長 (Presiden direktur)'], type: 'kanji', group: 'adjective' },
  { character: '白', meaning: 'Putih', onyomi: ['ハク', 'ビャク'], kunyomi: ['しろ', 'しろい'], examples: ['白い (Putih)', '白鳥 (Angsa)'], type: 'kanji', group: 'adjective' },

  // Actions & Verbs (15 Kanji)
  { character: '行', meaning: 'Pergi / Melakukan', onyomi: ['コウ', 'ギョウ'], kunyomi: ['いく', 'おこなう'], examples: ['行く (Pergi)', '銀行 (Bank)', '旅行 (Liburan/Travel)'], type: 'kanji', group: 'verbs' },
  { character: '来', meaning: 'Datang', onyomi: ['ライ'], kunyomi: ['くる', 'きたる'], examples: ['来る (Datang)', '来週 (Minggu depan)', '来年 (Tahun depan)'], type: 'kanji', group: 'verbs' },
  { character: '食', meaning: 'Makan / Makanan', onyomi: ['ショク'], kunyomi: ['たべる', 'くらう'], examples: ['食べる (Makan)', '食べ物 (Makanan)', '食事 (Makan/Jamuan)'], type: 'kanji', group: 'verbs' },
  { character: '飲', meaning: 'Minum', onyomi: ['イン'], kunyomi: ['のむ'], examples: ['飲む (Minum)', '飲み物 (Minuman)'], type: 'kanji', group: 'verbs' },
  { character: '見', meaning: 'Melihat', onyomi: ['ケン'], kunyomi: ['みる', 'みせる'], examples: ['見る (Melihat/Menonton)', '見せる (Memperlihatkan)'], type: 'kanji', group: 'verbs' },
  { character: '聞', meaning: 'Mendengar / Bertanya', onyomi: ['ブン', 'モン'], kunyomi: ['きく', 'きこえる'], examples: ['聞く (Mendengar)', '新聞 (Koran)'], type: 'kanji', group: 'verbs' },
  { character: '読', meaning: 'Membaca', onyomi: ['ドク'], kunyomi: ['よむ'], examples: ['読む (Membaca)', '読書 (Membaca buku)'], type: 'kanji', group: 'verbs' },
  { character: '書', meaning: 'Menulis / Dokumen', onyomi: ['ショ'], kunyomi: ['かく'], examples: ['書く (Menulis)', '図書館 (Perpustakaan)', '辞書 (Kamus)'], type: 'kanji', group: 'verbs' },
  { character: '話', meaning: 'Bicara / Cerita', onyomi: ['ワ'], kunyomi: ['はなす', 'はなし'], examples: ['話す (Berbicara)', '電話 (Telepon)', '会話 (Percakapan)'], type: 'kanji', group: 'verbs' },
  { character: '買', meaning: 'Membeli', onyomi: ['バイ'], kunyomi: ['かう'], examples: ['買う (Membeli)', '買い物 (Belanja)'], type: 'kanji', group: 'verbs' },
  { character: '入', meaning: 'Masuk / Memasukkan', onyomi: ['ニュウ'], kunyomi: ['はいる', 'いれる'], examples: ['入る (Masuk)', '入口 (Pintu masuk)', '入れる (Memasukkan)'], type: 'kanji', group: 'verbs' },
  { character: '出', meaning: 'Keluar / Mengeluarkan', onyomi: ['シュツ', 'スイ'], kunyomi: ['でる', 'だす'], examples: ['出る (Keluar)', '出口 (Pintu keluar)', '出す (Mengeluarkan)'], type: 'kanji', group: 'verbs' },
  { character: '立', meaning: 'Berdiri', onyomi: ['リツ', 'リュウ'], kunyomi: ['たつ', 'たてる'], examples: ['立つ (Berdiri)', '立ちます (Berdiri)'], type: 'kanji', group: 'verbs' },
  { character: '休', meaning: 'Istirahat / Libur', onyomi: ['キュウ'], kunyomi: ['やすむ', 'やすみ'], examples: ['休む (Istirahat)', '休み (Hari libur)'], type: 'kanji', group: 'verbs' },
  { character: '言', meaning: 'Berkata / Bahasa', onyomi: ['ゲン', 'ゴン'], kunyomi: ['いう', 'こと'], examples: ['言う (Berkata)', '言葉 (Kosakata/Kata)'], type: 'kanji', group: 'verbs' },

  // Places, Society & Daily Life (15 Kanji)
  { character: '学', meaning: 'Belajar / Ilmu', onyomi: ['ガク'], kunyomi: ['まなぶ'], examples: ['学校 (Sekolah)', '学生 (Siswa)', '大学 (Universitas)'], type: 'kanji', group: 'places' },
  { character: '校', meaning: 'Sekolah', onyomi: ['コウ'], kunyomi: [], examples: ['学校 (Sekolah)', '高校 (SMA)', '小学校 (SD)'], type: 'kanji', group: 'places' },
  { character: '国', meaning: 'Negara', onyomi: ['コク'], kunyomi: ['くに'], examples: ['国 (Negara)', '外国 (Luar negeri)', '中国 (Tiongkok)'], type: 'kanji', group: 'places' },
  { character: '語', meaning: 'Bahasa / Kata', onyomi: ['ゴ'], kunyomi: ['かたる'], examples: ['日本語 (Bahasa Jepang)', '英語 (Bahasa Inggris)', '単語 (Kosakata)'], type: 'kanji', group: 'places' },
  { character: '本', meaning: 'Buku / Asal', onyomi: ['ホン'], kunyomi: ['もと'], examples: ['本 (Buku)', '日本 (Jepang)', '山本 (Nama marga)'], type: 'kanji', group: 'places' },
  { character: '車', meaning: 'Mobil / Roda', onyomi: ['シャ'], kunyomi: ['くるま'], examples: ['車 (Mobil)', '電車 (Kereta listrik)', '自転車 (Sepeda)'], type: 'kanji', group: 'places' },
  { character: '駅', meaning: 'Stasiun', onyomi: ['エキ'], kunyomi: [], examples: ['駅 (Stasiun)', '東京駅 (Stasiun Tokyo)'], type: 'kanji', group: 'places' },
  { character: '道', meaning: 'Jalan', onyomi: ['ドウ', 'トウ'], kunyomi: ['みち'], examples: ['道 (Jalan)', '北海道 (Hokkaido)', '柔道 (Judo)'], type: 'kanji', group: 'places' },
  { character: '社', meaning: 'Perusahaan / Kuil', onyomi: ['シャ'], kunyomi: ['やしろ'], examples: ['会社 (Perusahaan)', '神社 (Kuil Shinto)', '社会 (Masyarakat)'], type: 'kanji', group: 'places' },
  { character: '友', meaning: 'Teman', onyomi: ['ユウ'], kunyomi: ['とも'], examples: ['友達 (Teman)', '親友 (Sahabat karib)'], type: 'kanji', group: 'places' },
  { character: '家', meaning: 'Rumah / Keluarga', onyomi: ['カ', 'ケ'], kunyomi: ['いえ', 'や'], examples: ['家 (Rumah)', '家族 (Keluarga)'], type: 'kanji', group: 'places' },
  { character: '店', meaning: 'Toko', onyomi: ['テン'], kunyomi: ['みせ'], examples: ['店 (Toko)', '喫茶店 (Kafe)', '店員 (Pegawai toko)'], type: 'kanji', group: 'places' },
  { character: '電', meaning: 'Listrik', onyomi: ['デン'], kunyomi: [], examples: ['電車 (Kereta listrik)', '電話 (Telepon)', '電気 (Lampu/Listrik)'], type: 'kanji', group: 'places' },
  { character: '会', meaning: 'Bertemu / Perkumpulan', onyomi: ['カイ', 'エ'], kunyomi: ['あう'], examples: ['会う (Bertemu)', '会社 (Perusahaan)', '会話 (Percakapan)'], type: 'kanji', group: 'places' },
  { character: '名', meaning: 'Nama / Terkenal', onyomi: ['メイ', 'ミョウ'], kunyomi: ['な'], examples: ['名前 (Nama)', '有名 (Terkenal)'], type: 'kanji', group: 'places' }
];
