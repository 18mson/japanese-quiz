// src/data/kanji.ts
// JLPT N5 Kanji Dataset with Indonesian Meanings and Pronunciations

export interface JapaneseKanji {
  character: string;
  meaning: string;
  onyomi: string[];
  kunyomi: string[];
  examples?: string[];
  type: 'kanji';
  lesson?: string;
}

export const kanjiN5Data: JapaneseKanji[] = [
  // Numbers & Quantities
  { character: '一', meaning: 'Satu', onyomi: ['イチ', 'イツ'], kunyomi: ['ひと', 'ひとつ'], examples: ['一つ (satu buah)', '一人 (satu orang)'], type: 'kanji' },
  { character: '二', meaning: 'Dua', onyomi: ['ニ'], kunyomi: ['ふた', 'ふたつ'], examples: ['二つ (dua buah)', '二月 (Februari)'], type: 'kanji' },
  { character: '三', meaning: 'Tiga', onyomi: ['サン'], kunyomi: ['み', 'みっつ'], examples: ['三つ (tiga buah)', '三人 (tiga orang)'], type: 'kanji' },
  { character: '四', meaning: 'Empat', onyomi: ['シ'], kunyomi: ['よ', 'よっつ', 'よん'], examples: ['四つ (empat buah)', '四月 (April)'], type: 'kanji' },
  { character: '五', meaning: 'Lima', onyomi: ['ゴ'], kunyomi: ['いつ', 'いつつ'], examples: ['五つ (lima buah)', '五日 (tanggal 5)'], type: 'kanji' },
  { character: '六', meaning: 'Enam', onyomi: ['ロク'], kunyomi: ['む', 'むっつ'], examples: ['六つ (enam buah)', '六日 (tanggal 6)'], type: 'kanji' },
  { character: '七', meaning: 'Tujuh', onyomi: ['シチ'], kunyomi: ['なな', 'ななつ'], examples: ['七つ (tujuh buah)', '七月 (Juli)'], type: 'kanji' },
  { character: '八', meaning: 'Delapan', onyomi: ['ハチ'], kunyomi: ['や', 'やっつ'], examples: ['八つ (delapan buah)', '八日 (tanggal 8)'], type: 'kanji' },
  { character: '九', meaning: 'Sembilan', onyomi: ['キュウ', 'ク'], kunyomi: ['ここの', 'ここのつ'], examples: ['九つ (sembilan buah)', '九月 (September)'], type: 'kanji' },
  { character: '十', meaning: 'Sepuluh', onyomi: ['ジュウ', 'ジッ'], kunyomi: ['とお'], examples: ['十日 (tanggal 10)', '十月 (Oktober)'], type: 'kanji' },
  { character: '百', meaning: 'Ratus / Ratusan', onyomi: ['ヒャク'], kunyomi: [], examples: ['百 (seratus)', '三百 (tiga ratus)'], type: 'kanji' },
  { character: '千', meaning: 'Ribu / Ribuan', onyomi: ['セン'], kunyomi: ['ち'], examples: ['千 (seribu)', '三千 (tiga ribu)'], type: 'kanji' },
  { character: '万', meaning: 'Puluh Ribu (10.000)', onyomi: ['マン', 'バン'], kunyomi: [], examples: ['一万 (sepuluh ribu)', '万国 (seluruh negara)'], type: 'kanji' },
  { character: '円', meaning: 'Yen / Lingkaran', onyomi: ['エン'], kunyomi: ['まるい'], examples: ['円 (Yen / mata uang Jepang)', '百円 (100 Yen)'], type: 'kanji' },

  // Time & Days
  { character: '日', meaning: 'Hari / Matahari', onyomi: ['ニチ', 'ジツ'], kunyomi: ['ひ', 'か'], examples: ['日曜日 (Minggu)', '日本 (Jepang)', '今日 (Hari ini)'], type: 'kanji' },
  { character: '月', meaning: 'Bulan', onyomi: ['ゲツ', 'ガツ'], kunyomi: ['つき'], examples: ['月曜日 (Senin)', '一月 (Januari)', '今月 (Bulan ini)'], type: 'kanji' },
  { character: '火', meaning: 'Api', onyomi: ['カ'], kunyomi: ['ひ', 'ほ'], examples: ['火曜日 (Selasa)', '火 (Api)', '花火 (Kembang api)'], type: 'kanji' },
  { character: '水', meaning: 'Air', onyomi: ['スイ'], kunyomi: ['みず'], examples: ['水曜日 (Rabu)', '水 (Air dingin)'], type: 'kanji' },
  { character: '木', meaning: 'Pohon / Kayu', onyomi: ['モク', 'ボク'], kunyomi: ['き', 'こ'], examples: ['木曜日 (Kamis)', '木 (Pohon)'], type: 'kanji' },
  { character: '金', meaning: 'Uang / Emas / Logam', onyomi: ['キン', 'コン'], kunyomi: ['かね'], examples: ['金曜日 (Jumat)', 'お金 (Uang)'], type: 'kanji' },
  { character: '土', meaning: 'Tanah', onyomi: ['ド', 'ト'], kunyomi: ['つち'], examples: ['土曜日 (Sabtu)', '土 (Tanah)'], type: 'kanji' },
  { character: '年', meaning: 'Tahun', onyomi: ['ネン'], kunyomi: ['とし'], examples: ['今年 (Tahun ini)', '来年 (Tahun depan)', '一年 (Satu tahun)'], type: 'kanji' },
  { character: '時', meaning: 'Waktu / Jam', onyomi: ['ジ'], kunyomi: ['とき'], examples: ['時間 (Waktu)', '一時 (Jam 1)', '時計 (Jam dinding/tangan)'], type: 'kanji' },
  { character: '分', meaning: 'Menit / Membagi', onyomi: ['ブン', 'フン', 'プン'], kunyomi: ['わける'], examples: ['五分 (Lima menit)', '分かる (Mengerti)'], type: 'kanji' },
  { character: '今', meaning: 'Sekarang', onyomi: ['コン', 'キン'], kunyomi: ['いま'], examples: ['今 (Sekarang)', '今日 (Hari ini)', '今週 (Minggu ini)'], type: 'kanji' },
  { character: '先', meaning: 'Sebelumnya / Dahulu', onyomi: ['セン'], kunyomi: ['さき'], examples: ['先生 (Guru)', '先週 (Minggu lalu)'], type: 'kanji' },
  { character: '生', meaning: 'Lahir / Hidup', onyomi: ['セイ', 'ショウ'], kunyomi: ['いきる', 'うまれる', 'なま'], examples: ['学生 (Siswa)', '誕生日 (Ulang tahun)'], type: 'kanji' },
  { character: '毎', meaning: 'Setiap', onyomi: ['マイ'], kunyomi: [], examples: ['毎日 (Setiap hari)', '毎週 (Setiap minggu)', '毎月 (Setiap bulan)'], type: 'kanji' },
  { character: '何', meaning: 'Apa', onyomi: ['カ'], kunyomi: ['なに', 'なん'], examples: ['何 (Apa)', '何時 (Jam berapa)', '何人 (Berapa orang)'], type: 'kanji' },

  // People & Body
  { character: '人', meaning: 'Orang', onyomi: ['ジン', 'ニン'], kunyomi: ['ひと'], examples: ['日本人 (Orang Jepang)', '三人 (3 orang)', '大人 (Dewasa)'], type: 'kanji' },
  { character: '男', meaning: 'Laki-laki / Pria', onyomi: ['ダン', 'ナン'], kunyomi: ['おとこ'], examples: ['男の人 (Pria)', '男の子 (Anak laki-laki)'], type: 'kanji' },
  { character: '女', meaning: 'Perempuan / Wanita', onyomi: ['ジョ', 'ニョ'], kunyomi: ['おんな', 'め'], examples: ['女の人 (Wanita)', '女の子 (Anak perempuan)'], type: 'kanji' },
  { character: '子', meaning: 'Anak', onyomi: ['シ', 'ス'], kunyomi: ['こ'], examples: ['子供 (Anak-anak)', '女の子 (Anak perempuan)'], type: 'kanji' },
  { character: '目', meaning: 'Mata', onyomi: ['モク', 'ボク'], kunyomi: ['め', 'ま'], examples: ['目 (Mata)', '目薬 (Obat tetes mata)'], type: 'kanji' },
  { character: '口', meaning: 'Mulut / Pintu Masuk', onyomi: ['コウ', 'ク'], kunyomi: ['くち', 'ぐち'], examples: ['口 (Mulut)', '出口 (Pintu keluar)', '入口 (Pintu masuk)'], type: 'kanji' },
  { character: '手', meaning: 'Tangan', onyomi: ['シュ'], kunyomi: ['て'], examples: ['手 (Tangan)', '上手 (Pandai/Mahir)', '下手 (Kurang pandai)'], type: 'kanji' },
  { character: '足', meaning: 'Kaki', onyomi: ['ソク'], kunyomi: ['あし', 'たりる'], examples: ['足 (Kaki)', '足りる (Cukup)'], type: 'kanji' },

  // Nature & Elements
  { character: '山', meaning: 'Gunung', onyomi: ['サン', 'ザン'], kunyomi: ['やま'], examples: ['山 (Gunung)', '富士山 (Gunung Fuji)'], type: 'kanji' },
  { character: '川', meaning: 'Sungai', onyomi: ['セン'], kunyomi: ['かわ'], examples: ['川 (Sungai)', 'ナイル川 (Sungai Nil)'], type: 'kanji' },
  { character: '雨', meaning: 'Hujan', onyomi: ['ウ'], kunyomi: ['あめ', 'あま'], examples: ['雨 (Hujan)', '大雨 (Hujan lebat)'], type: 'kanji' },
  { character: '空', meaning: 'Langit', onyomi: ['クウ'], kunyomi: ['そら', 'あく'], examples: ['空 (Langit)', '空気 (Udara)'], type: 'kanji' },
  { character: '天', meaning: 'Surga / Langit', onyomi: ['テン'], kunyomi: ['あまつ'], examples: ['天気 (Cuaca)', '天才 (Jenius)'], type: 'kanji' },
  { character: '気', meaning: 'Jiwa / Energi / Suasana', onyomi: ['キ', 'ケ'], kunyomi: [], examples: ['元気 (Sehat/Semangat)', '天気 (Cuaca)', '気持ち (Perasaan)'], type: 'kanji' },
  { character: '花', meaning: 'Bunga', onyomi: ['カ'], kunyomi: ['はな'], examples: ['花 (Bunga)', '花火 (Kembang api)', '花見 (Hanami)'], type: 'kanji' },
  { character: '魚', meaning: 'Ikan', onyomi: ['ギョ'], kunyomi: ['さかな', 'うお'], examples: ['魚 (Ikan)', '金魚 (Ikan mas koki)'], type: 'kanji' },
  { character: '犬', meaning: 'Anjing', onyomi: ['ケン'], kunyomi: ['いぬ'], examples: ['犬 (Anjing)', '子犬 (Anak anjing)'], type: 'kanji' },

  // Direction & Spatial
  { character: '上', meaning: 'Atas', onyomi: ['ジョウ', 'ショウ'], kunyomi: ['うえ', 'あがる'], examples: ['上 (Atas)', '上手 (Mahir)'], type: 'kanji' },
  { character: '下', meaning: 'Bawah', onyomi: ['カ', 'ゲ'], kunyomi: ['した', 'さがる', 'くだる'], examples: ['下 (Bawah)', '下手 (Kurang mahir)', '地下鉄 (Kereta bawah tanah)'], type: 'kanji' },
  { character: '中', meaning: 'Dalam / Tengah', onyomi: ['チュウ'], kunyomi: ['なか'], examples: ['中 (Di dalam)', '中国 (Tiongkok)', '一日中 (Sepanjang hari)'], type: 'kanji' },
  { character: '外', meaning: 'Luar', onyomi: ['ガイ', 'ゲ'], kunyomi: ['そと', 'はずす'], examples: ['外 (Luar)', '外国 (Luar negeri)', '外国人 (Orang asing)'], type: 'kanji' },
  { character: '右', meaning: 'Kanan', onyomi: ['ウ', 'ユウ'], kunyomi: ['みぎ'], examples: ['右 (Kanan)', '右手 (Tangan kanan)'], type: 'kanji' },
  { character: '左', meaning: 'Kiri', onyomi: ['サ'], kunyomi: ['ひだり'], examples: ['左 (Kiri)', '左手 (Tangan kiri)'], type: 'kanji' },
  { character: '前', meaning: 'Depan / Sebelum', onyomi: ['ゼン'], kunyomi: ['まえ'], examples: ['前 (Depan / Sebelum)', '午前 (Pagi/AM)', '名前 (Nama)'], type: 'kanji' },
  { character: '後', meaning: 'Belakang / Sesudah', onyomi: ['ゴ', 'コウ'], kunyomi: ['うしろ', 'あと'], examples: ['後ろ (Belakang)', '午後 (Sore/PM)', '後で (Nanti)'], type: 'kanji' },
  { character: '東', meaning: 'Timur', onyomi: ['トウ'], kunyomi: ['ひがし'], examples: ['東 (Timur)', '東京 (Tokyo)', '東口 (Pintu timur)'], type: 'kanji' },
  { character: '西', meaning: 'Barat', onyomi: ['セイ', 'サイ'], kunyomi: ['にし'], examples: ['西 (Barat)', '東西 (Timur & barat)', '西口 (Pintu barat)'], type: 'kanji' },
  { character: '南', meaning: 'Selatan', onyomi: ['ナン'], kunyomi: ['みなみ'], examples: ['南 (Selatan)', '南口 (Pintu selatan)'], type: 'kanji' },
  { character: '北', meaning: 'Utara', onyomi: ['ホク'], kunyomi: ['きた'], examples: ['北 (Utara)', '北海道 (Hokkaido)', '北口 (Pintu utara)'], type: 'kanji' },

  // Size & Status
  { character: '大', meaning: 'Besar', onyomi: ['ダイ', 'タイ'], kunyomi: ['おおきい', 'おおいに'], examples: ['大きい (Besar)', '大学 (Universitas)', '大人 (Dewasa)'], type: 'kanji' },
  { character: '小', meaning: 'Kecil', onyomi: ['ショウ'], kunyomi: ['ちいさい', 'こ', 'お'], examples: ['小さい (Kecil)', '小学校 (Sekolah Dasar)'], type: 'kanji' },
  { character: '多', meaning: 'Banyak', onyomi: ['タ'], kunyomi: ['おおい'], examples: ['多い (Banyak)', '多分 (Mungkin)'], type: 'kanji' },
  { character: '少', meaning: 'Sedikit', onyomi: ['ショウ'], kunyomi: ['すくない', 'すこし'], examples: ['少し (Sedikit)', '少ない (Sedikit jumlahnya)'], type: 'kanji' },
  { character: '高', meaning: 'Tinggi / Mahal', onyomi: ['コウ'], kunyomi: ['たかい'], examples: ['高い (Tinggi/Mahal)', '高校 (SMA)'], type: 'kanji' },
  { character: '安', meaning: 'Murah / Tenang', onyomi: ['アン'], kunyomi: ['やすい'], examples: ['安い (Murah)', '安心 (Lega/Tenang)'], type: 'kanji' },
  { character: '新', meaning: 'Baru', onyomi: ['シン'], kunyomi: ['あたらしい'], examples: ['新しい (Baru)', '新聞 (Koran)', '新年 (Tahun baru)'], type: 'kanji' },
  { character: '古', meaning: 'Lama / Tua', onyomi: ['コ'], kunyomi: ['ふるい'], examples: ['古い (Lama/Kuno)', '中古 (Barang bekas)'], type: 'kanji' },
  { character: '長', meaning: 'Panjang / Ketua', onyomi: ['チョウ'], kunyomi: ['ながい'], examples: ['長い (Panjang)', '社長 (Presiden direktur)'], type: 'kanji' },
  { character: '白', meaning: 'Putih', onyomi: ['ハク', 'ビャク'], kunyomi: ['しろ', 'しろい'], examples: ['白い (Putih)', '白鳥 (Angsa)'], type: 'kanji' },

  // Actions & Verbs
  { character: '行', meaning: 'Pergi / Melakukan', onyomi: ['コウ', 'ギョウ'], kunyomi: ['いく', 'おこなう'], examples: ['行く (Pergi)', '銀行 (Bank)', '旅行 (Liburan/Travel)'], type: 'kanji' },
  { character: '来', meaning: 'Datang', onyomi: ['ライ'], kunyomi: ['くる', 'きたる'], examples: ['来る (Datang)', '来週 (Minggu depan)', '来年 (Tahun depan)'], type: 'kanji' },
  { character: '食', meaning: 'Makan / Makanan', onyomi: ['ショク'], kunyomi: ['たべる', 'くらう'], examples: ['食べる (Makan)', '食べ物 (Makanan)', '食事 (Makan/Jamuan)'], type: 'kanji' },
  { character: '飲', meaning: 'Minum', onyomi: ['イン'], kunyomi: ['のむ'], examples: ['飲む (Minum)', '飲み物 (Minuman)'], type: 'kanji' },
  { character: '見', meaning: 'Melihat', onyomi: ['ケン'], kunyomi: ['みる', 'みせる'], examples: ['見る (Melihat/Menonton)', '見せる (Memperlihatkan)'], type: 'kanji' },
  { character: '聞', meaning: 'Mendengar / Bertanya', onyomi: ['ブン', 'モン'], kunyomi: ['きく', 'きこえる'], examples: ['聞く (Mendengar)', '新聞 (Koran)'], type: 'kanji' },
  { character: '読', meaning: 'Membaca', onyomi: ['ドク'], kunyomi: ['よむ'], examples: ['読む (Membaca)', '読書 (Membaca buku)'], type: 'kanji' },
  { character: '書', meaning: 'Menulis / Dokumen', onyomi: ['ショ'], kunyomi: ['かく'], examples: ['書く (Menulis)', '図書館 (Perpustakaan)', '辞書 (Kamus)'], type: 'kanji' },
  { character: '話', meaning: 'Bicara / Cerita', onyomi: ['ワ'], kunyomi: ['はなす', 'はなし'], examples: ['話す (Berbicara)', '電話 (Telepon)', '会話 (Percakapan)'], type: 'kanji' },
  { character: '買', meaning: 'Membeli', onyomi: ['バイ'], kunyomi: ['かう'], examples: ['買う (Membeli)', '買い物 (Belanja)'], type: 'kanji' },

  // Places, Society & Daily Life
  { character: '学', meaning: 'Belajar / Ilmu', onyomi: ['ガク'], kunyomi: ['まなぶ'], examples: ['学校 (Sekolah)', '学生 (Siswa)', '大学 (Universitas)'], type: 'kanji' },
  { character: '校', meaning: 'Sekolah', onyomi: ['コウ'], kunyomi: [], examples: ['学校 (Sekolah)', '高校 (SMA)', '小学校 (SD)'], type: 'kanji' },
  { character: '国', meaning: 'Negara', onyomi: ['コク'], kunyomi: ['くに'], examples: ['国 (Negara)', '外国 (Luar negeri)', '中国 (Tiongkok)'], type: 'kanji' },
  { character: '語', meaning: 'Bahasa / Kata', onyomi: ['ゴ'], kunyomi: ['かたる'], examples: ['日本語 (Bahasa Jepang)', '英語 (Bahasa Inggris)', '単語 (Kosakata)'], type: 'kanji' },
  { character: '本', meaning: 'Buku / Asal', onyomi: ['ホン'], kunyomi: ['もと'], examples: ['本 (Buku)', '日本 (Jepang)', '山本 (Nama marga)'], type: 'kanji' },
  { character: '車', meaning: 'Mobil / Roda', onyomi: ['シャ'], kunyomi: ['くるま'], examples: ['車 (Mobil)', '電車 (Kereta listrik)', '自転車 (Sepeda)'], type: 'kanji' },
  { character: '駅', meaning: 'Stasiun', onyomi: ['エキ'], kunyomi: [], examples: ['駅 (Stasiun)', '東京駅 (Stasiun Tokyo)'], type: 'kanji' },
  { character: '道', meaning: 'Jalan', onyomi: ['ドウ', 'トウ'], kunyomi: ['みち'], examples: ['道 (Jalan)', '北海道 (Hokkaido)', '柔道 (Judo)'], type: 'kanji' },
  { character: '社', meaning: 'Perusahaan / Kuil', onyomi: ['シャ'], kunyomi: ['やしろ'], examples: ['会社 (Perusahaan)', '神社 (Kuil Shinto)', '社会 (Masyarakat)'], type: 'kanji' },
  { character: '友', meaning: 'Teman', onyomi: ['ユウ'], kunyomi: ['とも'], examples: ['友達 (Teman)', '親友 (Sahabat karib)'], type: 'kanji' },
  { character: '家', meaning: 'Rumah / Keluarga', onyomi: ['カ', 'ケ'], kunyomi: ['いえ', 'や'], examples: ['家 (Rumah)', '家族 (Keluarga)'], type: 'kanji' },
  { character: '店', meaning: 'Toko', onyomi: ['テン'], kunyomi: ['みせ'], examples: ['店 (Toko)', '喫茶店 (Kafe)', '店員 (Pegawai toko)'], type: 'kanji' },
  { character: '電', meaning: 'Listrik', onyomi: ['デン'], kunyomi: [], examples: ['電車 (Kereta listrik)', '電話 (Telepon)', '電気 (Lampu/Listrik)'], type: 'kanji' }
];
