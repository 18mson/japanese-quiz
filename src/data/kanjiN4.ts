// src/data/kanjiN4.ts
// Dataset Resmi 155 Kanji JLPT N4 yang muncul di kosakata Kotoba (Minna no Nihongo Bab 1–25)
import type { JapaneseKanji } from "./kanji";

export interface JapaneseKanjiN4 extends JapaneseKanji {
  id: number;
  romaji?: string;
  strokeCount?: number | null;
  grade?: number | null;
  jlpt: 4;
}

export const kanjiN4Data: JapaneseKanjiN4[] = [
  {
    "id": 1,
    "character": "悪",
    "romaji": "アク",
    "meaning": "Buruk / Jelek",
    "onyomi": [
      "アク",
      "オ"
    ],
    "kunyomi": [
      "わる.い",
      "わる-",
      "あ.し",
      "にく.い",
      "-にく.い",
      "ああ",
      "いずくに",
      "いずくんぞ",
      "にく.む"
    ],
    "strokeCount": 11,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "悪い (buruk, jelek)"
    ]
  },
  {
    "id": 2,
    "character": "暗",
    "romaji": "アン",
    "meaning": "Gelap",
    "onyomi": [
      "アン"
    ],
    "kunyomi": [
      "くら.い",
      "くら.む",
      "くれ.る"
    ],
    "strokeCount": 13,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "暗い (gelap)",
      "暗証番号 (nomor PIN)"
    ]
  },
  {
    "id": 3,
    "character": "意",
    "romaji": "イ",
    "meaning": "Arti / Pikiran",
    "onyomi": [
      "イ"
    ],
    "kunyomi": [],
    "strokeCount": 13,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "意見 (pendapat, opini)",
      "意味 (arti, makna)"
    ]
  },
  {
    "id": 4,
    "character": "医",
    "romaji": "イ",
    "meaning": "Dokter / Medis",
    "onyomi": [
      "イ"
    ],
    "kunyomi": [
      "い.やす",
      "い.する",
      "くすし"
    ],
    "strokeCount": 7,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "医者 (dokter)",
      "歯医者 (dokter gigi)"
    ]
  },
  {
    "id": 5,
    "character": "員",
    "romaji": "イン",
    "meaning": "Anggota / Pegawai",
    "onyomi": [
      "イン"
    ],
    "kunyomi": [],
    "strokeCount": 10,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "会社員 (karyawan perusahaan)",
      "社員 (karyawan perusahaan (dengan nama kantor))",
      "銀行員 (pegawai bank)"
    ]
  },
  {
    "id": 6,
    "character": "引",
    "romaji": "イン",
    "meaning": "Tarik",
    "onyomi": [
      "イン"
    ],
    "kunyomi": [
      "ひ.く",
      "ひ.ける"
    ],
    "strokeCount": 4,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "お引き出しですか (Mau menarik uang?)",
      "お引き出し (penarikan uang tunai)",
      "引く (menarik)"
    ]
  },
  {
    "id": 7,
    "character": "院",
    "romaji": "イン",
    "meaning": "Institusi / Gedung",
    "onyomi": [
      "イン"
    ],
    "kunyomi": [],
    "strokeCount": 10,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "病院 (rumah sakit)"
    ]
  },
  {
    "id": 8,
    "character": "運",
    "romaji": "ウン",
    "meaning": "Mengangkut / Keberuntungan",
    "onyomi": [
      "ウン"
    ],
    "kunyomi": [
      "はこ.ぶ"
    ],
    "strokeCount": 12,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "運転手 (sopir, pengemudi)",
      "運転します (menyetir, mengemudi)",
      "運動靴 (sepatu olahraga)"
    ]
  },
  {
    "id": 9,
    "character": "映",
    "romaji": "エイ",
    "meaning": "Memantulkan / Tayang",
    "onyomi": [
      "エイ"
    ],
    "kunyomi": [
      "うつ.る",
      "うつ.す",
      "は.える",
      "-ば.え"
    ],
    "strokeCount": 9,
    "grade": 6,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "映画 (film)"
    ]
  },
  {
    "id": 10,
    "character": "英",
    "romaji": "エイ",
    "meaning": "Inggris / Hebat",
    "onyomi": [
      "エイ"
    ],
    "kunyomi": [
      "はなぶさ"
    ],
    "strokeCount": 8,
    "grade": 4,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "英語 (bahasa Inggris)"
    ]
  },
  {
    "id": 11,
    "character": "遠",
    "romaji": "エン",
    "meaning": "Jauh",
    "onyomi": [
      "エン",
      "オン"
    ],
    "kunyomi": [
      "とお.い"
    ],
    "strokeCount": 13,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "遠い (jauh)"
    ]
  },
  {
    "id": 12,
    "character": "屋",
    "romaji": "オク",
    "meaning": "Toko / Atap",
    "onyomi": [
      "オク"
    ],
    "kunyomi": [
      "や"
    ],
    "strokeCount": 9,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "部屋 (kamar, ruangan)",
      "～屋 (toko ~)",
      "本屋 (toko buku)"
    ]
  },
  {
    "id": 13,
    "character": "音",
    "romaji": "オン",
    "meaning": "Suara / Bunyi",
    "onyomi": [
      "オン",
      "イン",
      "-ノン"
    ],
    "kunyomi": [
      "おと",
      "ね"
    ],
    "strokeCount": 9,
    "grade": 1,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "音楽 (musik)",
      "音楽家 (musisi)",
      "音 (bunyi, suara)"
    ]
  },
  {
    "id": 14,
    "character": "夏",
    "romaji": "カ",
    "meaning": "Musim Panas",
    "onyomi": [
      "カ",
      "ガ",
      "ゲ"
    ],
    "kunyomi": [
      "なつ"
    ],
    "strokeCount": 10,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "夏 (musim panas)"
    ]
  },
  {
    "id": 15,
    "character": "歌",
    "romaji": "カ",
    "meaning": "Lagu / Menyanyi",
    "onyomi": [
      "カ"
    ],
    "kunyomi": [
      "うた",
      "うた.う"
    ],
    "strokeCount": 14,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "歌 (lagu)",
      "歌舞伎 (kabuki (seni teater Jepang))",
      "歌手 (penyanyi)"
    ]
  },
  {
    "id": 16,
    "character": "画",
    "romaji": "ガ",
    "meaning": "Gambar / Lukisan",
    "onyomi": [
      "ガ",
      "カク",
      "エ",
      "カイ"
    ],
    "kunyomi": [
      "えが.く",
      "かく.する",
      "かぎ.る",
      "はかりごと",
      "はか.る"
    ],
    "strokeCount": 8,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "映画 (film)",
      "画家 (pelukis)"
    ]
  },
  {
    "id": 17,
    "character": "回",
    "romaji": "カイ",
    "meaning": "Kali / Berputar",
    "onyomi": [
      "カイ",
      "エ"
    ],
    "kunyomi": [
      "まわ.る",
      "-まわ.る",
      "-まわ.り",
      "まわ.す",
      "-まわ.す",
      "まわ.し-",
      "-まわ.し",
      "もとお.る",
      "か.える"
    ],
    "strokeCount": 6,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "～回 (kali, frekuensi)",
      "回します (memutar)"
    ]
  },
  {
    "id": 18,
    "character": "海",
    "romaji": "カイ",
    "meaning": "Laut",
    "onyomi": [
      "カイ"
    ],
    "kunyomi": [
      "うみ"
    ],
    "strokeCount": 9,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "海 (laut, pantai)",
      "北海道 (Hokkaido)"
    ]
  },
  {
    "id": 19,
    "character": "界",
    "romaji": "カイ",
    "meaning": "Dunia / Batas",
    "onyomi": [
      "カイ"
    ],
    "kunyomi": [],
    "strokeCount": 9,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "世界 (dunia)"
    ]
  },
  {
    "id": 20,
    "character": "開",
    "romaji": "カイ",
    "meaning": "Buka",
    "onyomi": [
      "カイ"
    ],
    "kunyomi": [
      "ひら.く",
      "ひら.き",
      "-びら.き",
      "ひら.ける",
      "あ.く",
      "あ.ける"
    ],
    "strokeCount": 12,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "開けます (membuka [ドアを～])"
    ]
  },
  {
    "id": 21,
    "character": "楽",
    "romaji": "ガク",
    "meaning": "Nyaman / Musik",
    "onyomi": [
      "ガク",
      "ラク",
      "ゴウ"
    ],
    "kunyomi": [
      "たの.しい",
      "たの.しむ",
      "この.む"
    ],
    "strokeCount": 13,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "楽しい (senang, menyenangkan)",
      "音楽 (musik)",
      "音楽家 (musisi)"
    ]
  },
  {
    "id": 22,
    "character": "寒",
    "romaji": "カン",
    "meaning": "Dingin (Cuaca)",
    "onyomi": [
      "カン"
    ],
    "kunyomi": [
      "さむ.い"
    ],
    "strokeCount": 12,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "寒い (dingin (suhu udara))",
      "寒気がします (merinding kedinginan / menggigil)"
    ]
  },
  {
    "id": 23,
    "character": "漢",
    "romaji": "カン",
    "meaning": "Tiongkok / Aksara Han",
    "onyomi": [
      "カン"
    ],
    "kunyomi": [],
    "strokeCount": 13,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "漢字 (huruf Kanji)"
    ]
  },
  {
    "id": 24,
    "character": "館",
    "romaji": "カン",
    "meaning": "Gedung / Aula",
    "onyomi": [
      "カン"
    ],
    "kunyomi": [
      "やかた",
      "たて"
    ],
    "strokeCount": 16,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "図書館 (perpustakaan)",
      "美術館 (gedung kesenian, museum seni)"
    ]
  },
  {
    "id": 25,
    "character": "顔",
    "romaji": "ガン",
    "meaning": "Wajah",
    "onyomi": [
      "ガン"
    ],
    "kunyomi": [
      "かお"
    ],
    "strokeCount": 18,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "顔 (wajah, muka)"
    ]
  },
  {
    "id": 26,
    "character": "帰",
    "romaji": "キ",
    "meaning": "Pulang / Kembali",
    "onyomi": [
      "キ"
    ],
    "kunyomi": [
      "かえ.る",
      "かえ.す",
      "おく.る",
      "とつ.ぐ"
    ],
    "strokeCount": 10,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "帰ります (pulang)",
      "お帰りなさい (Selamat datang (kembali ke rumah))",
      "もう帰らないと (saya harus pulang...)"
    ]
  },
  {
    "id": 27,
    "character": "起",
    "romaji": "キ",
    "meaning": "Bangun",
    "onyomi": [
      "キ"
    ],
    "kunyomi": [
      "お.きる",
      "お.こる",
      "お.こす",
      "おこ.す",
      "た.つ"
    ],
    "strokeCount": 10,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "起きます (bangun tidur)"
    ]
  },
  {
    "id": 28,
    "character": "急",
    "romaji": "キュウ",
    "meaning": "Cepat / Mendesak",
    "onyomi": [
      "キュウ"
    ],
    "kunyomi": [
      "いそ.ぐ",
      "いそ.ぎ",
      "せ.く"
    ],
    "strokeCount": 9,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "急行 (ekspres (kereta ekspres))",
      "特急 (super ekspres (kereta super ekspres))",
      "急ぎます (buru-buru, bergegas)"
    ]
  },
  {
    "id": 29,
    "character": "究",
    "romaji": "キュウ",
    "meaning": "Meneliti / Mempelajari",
    "onyomi": [
      "キュウ",
      "ク"
    ],
    "kunyomi": [
      "きわ.める"
    ],
    "strokeCount": 7,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "研究者 (peneliti)",
      "研究します (meneliti)"
    ]
  },
  {
    "id": 30,
    "character": "牛",
    "romaji": "ギュウ",
    "meaning": "Sapi",
    "onyomi": [
      "ギュウ"
    ],
    "kunyomi": [
      "うし"
    ],
    "strokeCount": 4,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "牛乳 (susu)",
      "牛肉 (daging sapi)",
      "牛どん (Gyudon (mangkuk nasi daging sapi))"
    ]
  },
  {
    "id": 31,
    "character": "去",
    "romaji": "キョ",
    "meaning": "Lalu / Pergi",
    "onyomi": [
      "キョ",
      "コ"
    ],
    "kunyomi": [
      "さ.る",
      "-さ.る"
    ],
    "strokeCount": 5,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "去年 (tahun lalu)"
    ]
  },
  {
    "id": 32,
    "character": "京",
    "romaji": "キョウ",
    "meaning": "Ibu Kota",
    "onyomi": [
      "キョウ",
      "ケイ",
      "キン"
    ],
    "kunyomi": [
      "みやこ"
    ],
    "strokeCount": 8,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "東京 (Tokyo)",
      "東京ディズニーランド (Tokyo Disneyland)",
      "東京スカイツリー (Tokyo Sky Tree)"
    ]
  },
  {
    "id": 33,
    "character": "強",
    "romaji": "キョウ",
    "meaning": "Kuat",
    "onyomi": [
      "キョウ",
      "ゴウ"
    ],
    "kunyomi": [
      "つよ.い",
      "つよ.まる",
      "つよ.める",
      "し.いる",
      "こわ.い"
    ],
    "strokeCount": 11,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "勉強します (belajar)",
      "勉強 (pelajaran, belajar)",
      "強い (kuat)"
    ]
  },
  {
    "id": 34,
    "character": "教",
    "romaji": "キョウ",
    "meaning": "Mengajar / Agama",
    "onyomi": [
      "キョウ"
    ],
    "kunyomi": [
      "おし.える",
      "おそ.わる"
    ],
    "strokeCount": 11,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "教師 (guru, dosen (sebagai profesi))",
      "教室 (ruang kelas)",
      "教えます (mengajar, memberitahukan)"
    ]
  },
  {
    "id": 35,
    "character": "業",
    "romaji": "ギョウ",
    "meaning": "Usaha / Bisnis",
    "onyomi": [
      "ギョウ",
      "ゴウ"
    ],
    "kunyomi": [
      "わざ"
    ],
    "strokeCount": 13,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "残業します (lembur, kerja lembur)"
    ]
  },
  {
    "id": 36,
    "character": "近",
    "romaji": "キン",
    "meaning": "Dekat",
    "onyomi": [
      "キン",
      "コン"
    ],
    "kunyomi": [
      "ちか.い"
    ],
    "strokeCount": 7,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "近く (dekat)",
      "近い (dekat)",
      "最近 (akhir-akhir ini, belakangan ini)"
    ]
  },
  {
    "id": 37,
    "character": "銀",
    "romaji": "ギン",
    "meaning": "Perak",
    "onyomi": [
      "ギン"
    ],
    "kunyomi": [
      "しろがね"
    ],
    "strokeCount": 14,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "銀行員 (pegawai bank)",
      "銀行 (bank)"
    ]
  },
  {
    "id": 38,
    "character": "兄",
    "romaji": "ケイ",
    "meaning": "Kakak Laki-laki",
    "onyomi": [
      "ケイ",
      "キョウ"
    ],
    "kunyomi": [
      "あに"
    ],
    "strokeCount": 5,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "兄弟 (saudara kandung)",
      "兄 (kakak laki-laki (sendiri))",
      "お兄さん (kakak laki-laki (orang lain))"
    ]
  },
  {
    "id": 39,
    "character": "計",
    "romaji": "ケイ",
    "meaning": "Mengukur / Rencana",
    "onyomi": [
      "ケイ"
    ],
    "kunyomi": [
      "はか.る",
      "はか.らう"
    ],
    "strokeCount": 9,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "時計 (jam, arloji)"
    ]
  },
  {
    "id": 40,
    "character": "軽",
    "romaji": "ケイ",
    "meaning": "Ringan",
    "onyomi": [
      "ケイ",
      "キョウ",
      "キン"
    ],
    "kunyomi": [
      "かる.い",
      "かろ.やか",
      "かろ.んじる"
    ],
    "strokeCount": 12,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "軽い (ringan)"
    ]
  },
  {
    "id": 41,
    "character": "建",
    "romaji": "ケン",
    "meaning": "Membangun",
    "onyomi": [
      "ケン",
      "コン"
    ],
    "kunyomi": [
      "た.てる",
      "た.て",
      "-だ.て",
      "た.つ"
    ],
    "strokeCount": 9,
    "grade": 4,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "建築家 (arsitek)",
      "建物 (gedung)"
    ]
  },
  {
    "id": 42,
    "character": "研",
    "romaji": "ケン",
    "meaning": "Mengasah / Meneliti",
    "onyomi": [
      "ケン"
    ],
    "kunyomi": [
      "と.ぐ"
    ],
    "strokeCount": 9,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "研究者 (peneliti)",
      "研究します (meneliti)"
    ]
  },
  {
    "id": 43,
    "character": "県",
    "romaji": "ケン",
    "meaning": "Prefektur",
    "onyomi": [
      "ケン"
    ],
    "kunyomi": [
      "か.ける"
    ],
    "strokeCount": 9,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "県 (prefektur)"
    ]
  },
  {
    "id": 44,
    "character": "験",
    "romaji": "ケン",
    "meaning": "Ujian / Bukti",
    "onyomi": [
      "ケン",
      "ゲン"
    ],
    "kunyomi": [
      "あかし",
      "しるし",
      "ため.す",
      "ためし"
    ],
    "strokeCount": 18,
    "grade": 4,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "試験 (ujian)"
    ]
  },
  {
    "id": 45,
    "character": "元",
    "romaji": "ゲン",
    "meaning": "Asal / Dasar",
    "onyomi": [
      "ゲン",
      "ガン"
    ],
    "kunyomi": [
      "もと"
    ],
    "strokeCount": 4,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "元気な (sehat walafiat, bersemangat)",
      "お元気ですか (apa kabar?)",
      "どうぞお元気で (Semoga sehat selalu (salam perpisahan))"
    ]
  },
  {
    "id": 46,
    "character": "好",
    "romaji": "コウ",
    "meaning": "Suka / Gemar",
    "onyomi": [
      "コウ"
    ],
    "kunyomi": [
      "この.む",
      "す.く",
      "よ.い",
      "い.い"
    ],
    "strokeCount": 6,
    "grade": 4,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "好きな (suka, gemar)"
    ]
  },
  {
    "id": 47,
    "character": "広",
    "romaji": "コウ",
    "meaning": "Luas / Lebar",
    "onyomi": [
      "コウ"
    ],
    "kunyomi": [
      "ひろ.い",
      "ひろ.まる",
      "ひろ.める",
      "ひろ.がる",
      "ひろ.げる"
    ],
    "strokeCount": 5,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "広い (luas, lebar)"
    ]
  },
  {
    "id": 48,
    "character": "考",
    "romaji": "コウ",
    "meaning": "Berpikir / Memikirkan",
    "onyomi": [
      "コウ"
    ],
    "kunyomi": [
      "かんが.える",
      "かんが.え"
    ],
    "strokeCount": 6,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "考えます (berpikir, memikirkan)"
    ]
  },
  {
    "id": 49,
    "character": "合",
    "romaji": "ゴウ",
    "meaning": "Cocok / Bergabung",
    "onyomi": [
      "ゴウ",
      "ガッ",
      "カッ"
    ],
    "kunyomi": [
      "あ.う",
      "-あ.う",
      "あ.い",
      "あい-",
      "-あ.い",
      "-あい",
      "あ.わす",
      "あ.わせる",
      "-あ.わせる"
    ],
    "strokeCount": 6,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "試合 (pertandingan [～を します : bertanding])",
      "都合 (kondisi, keadaan waktu)"
    ]
  },
  {
    "id": 50,
    "character": "黒",
    "romaji": "コク",
    "meaning": "Hitam",
    "onyomi": [
      "コク"
    ],
    "kunyomi": [
      "くろ",
      "くろ.ずむ",
      "くろ.い"
    ],
    "strokeCount": 11,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "黒い (hitam)"
    ]
  },
  {
    "id": 51,
    "character": "菜",
    "romaji": "サイ",
    "meaning": "Sayuran",
    "onyomi": [
      "サイ"
    ],
    "kunyomi": [
      "な"
    ],
    "strokeCount": 11,
    "grade": 4,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "野菜 (sayur)"
    ]
  },
  {
    "id": 52,
    "character": "作",
    "romaji": "サク",
    "meaning": "Membuat",
    "onyomi": [
      "サク",
      "サ"
    ],
    "kunyomi": [
      "つく.る",
      "つく.り",
      "-づく.り"
    ],
    "strokeCount": 7,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "作ります (membuat, memproduksi)",
      "作家 (penulis, pengarang)"
    ]
  },
  {
    "id": 53,
    "character": "産",
    "romaji": "サン",
    "meaning": "Lahir / Produksi",
    "onyomi": [
      "サン"
    ],
    "kunyomi": [
      "う.む",
      "う.まれる",
      "うぶ-",
      "む.す"
    ],
    "strokeCount": 11,
    "grade": 4,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "お土産 (oleh-oleh)"
    ]
  },
  {
    "id": 54,
    "character": "仕",
    "romaji": "シ",
    "meaning": "Melayani / Tugas",
    "onyomi": [
      "シ",
      "ジ"
    ],
    "kunyomi": [
      "つか.える"
    ],
    "strokeCount": 5,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "お仕事 (pekerjaan)",
      "仕事 (pekerjaan, kerja)"
    ]
  },
  {
    "id": 55,
    "character": "使",
    "romaji": "シ",
    "meaning": "Menggunakan",
    "onyomi": [
      "シ"
    ],
    "kunyomi": [
      "つか.う",
      "つか.い",
      "-つか.い",
      "-づか.い"
    ],
    "strokeCount": 8,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "使います (memakai, menggunakan)"
    ]
  },
  {
    "id": 56,
    "character": "始",
    "romaji": "シ",
    "meaning": "Mulai",
    "onyomi": [
      "シ"
    ],
    "kunyomi": [
      "はじ.める",
      "-はじ.める",
      "はじ.まる"
    ],
    "strokeCount": 8,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "始めます (memulai)"
    ]
  },
  {
    "id": 57,
    "character": "姉",
    "romaji": "シ",
    "meaning": "Kakak Perempuan",
    "onyomi": [
      "シ"
    ],
    "kunyomi": [
      "あね",
      "はは"
    ],
    "strokeCount": 8,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "姉 (kakak perempuan (sendiri))",
      "お姉さん (kakak perempuan (orang lain))"
    ]
  },
  {
    "id": 58,
    "character": "市",
    "romaji": "シ",
    "meaning": "Kota",
    "onyomi": [
      "シ"
    ],
    "kunyomi": [
      "いち"
    ],
    "strokeCount": 5,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "市役所 (kantor wali kota)"
    ]
  },
  {
    "id": 59,
    "character": "思",
    "romaji": "シ",
    "meaning": "Berpikir / Mengira",
    "onyomi": [
      "シ"
    ],
    "kunyomi": [
      "おも.う",
      "おもえら.く",
      "おぼ.す"
    ],
    "strokeCount": 9,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "思い出します (mengingat, teringat)",
      "思います (mengira, berpikir, berpendapat)"
    ]
  },
  {
    "id": 60,
    "character": "止",
    "romaji": "シ",
    "meaning": "Berhenti",
    "onyomi": [
      "シ"
    ],
    "kunyomi": [
      "と.まる",
      "-ど.まり",
      "と.める",
      "-と.める",
      "-ど.め",
      "とど.める",
      "とど.め",
      "とど.まる",
      "や.める",
      "や.む",
      "-や.む",
      "よ.す",
      "-さ.す",
      "-さ.し"
    ],
    "strokeCount": 4,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "止めます (menghentikan, memarkir [くるまを～])"
    ]
  },
  {
    "id": 61,
    "character": "紙",
    "romaji": "シ",
    "meaning": "Kertas",
    "onyomi": [
      "シ"
    ],
    "kunyomi": [
      "かみ"
    ],
    "strokeCount": 10,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "手紙 (surat)"
    ]
  },
  {
    "id": 62,
    "character": "試",
    "romaji": "シ",
    "meaning": "Mencoba / Ujian",
    "onyomi": [
      "シ"
    ],
    "kunyomi": [
      "こころ.みる",
      "ため.す"
    ],
    "strokeCount": 13,
    "grade": 4,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "試験 (ujian)",
      "試合 (pertandingan [～を します : bertanding])"
    ]
  },
  {
    "id": 63,
    "character": "事",
    "romaji": "ジ",
    "meaning": "Hal / Urusan",
    "onyomi": [
      "ジ",
      "ズ"
    ],
    "kunyomi": [
      "こと",
      "つか.う",
      "つか.える"
    ],
    "strokeCount": 8,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "事務所 (kantor)",
      "お仕事 (pekerjaan)",
      "仕事 (pekerjaan, kerja)"
    ]
  },
  {
    "id": 64,
    "character": "字",
    "romaji": "ジ",
    "meaning": "Huruf / Karakter",
    "onyomi": [
      "ジ"
    ],
    "kunyomi": [
      "あざ",
      "あざな",
      "-な"
    ],
    "strokeCount": 6,
    "grade": 1,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "字 (huruf, aksara)",
      "漢字 (huruf Kanji)",
      "ローマ字 (huruf latin)"
    ]
  },
  {
    "id": 65,
    "character": "持",
    "romaji": "ジ",
    "meaning": "Membawa / Memiliki",
    "onyomi": [
      "ジ"
    ],
    "kunyomi": [
      "も.つ",
      "-も.ち",
      "も.てる"
    ],
    "strokeCount": 9,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "持ちます (membawa, memegang)",
      "持って行きます (membawa pergi (barang))",
      "持って来ます (membawa datang (barang))"
    ]
  },
  {
    "id": 66,
    "character": "自",
    "romaji": "ジ",
    "meaning": "Diri Sendiri",
    "onyomi": [
      "ジ",
      "シ"
    ],
    "kunyomi": [
      "みずか.ら",
      "おの.ずから",
      "おの.ずと"
    ],
    "strokeCount": 6,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "自動販売機 (mesin jual otomatis)",
      "自転車 (sepeda)",
      "自動車 (mobil (jidousha))"
    ]
  },
  {
    "id": 67,
    "character": "室",
    "romaji": "シツ",
    "meaning": "Ruangan / Kamar",
    "onyomi": [
      "シツ"
    ],
    "kunyomi": [
      "むろ"
    ],
    "strokeCount": 9,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "教室 (ruang kelas)",
      "会議室 (ruang rapat)",
      "寝室 (kamar tidur)"
    ]
  },
  {
    "id": 68,
    "character": "写",
    "romaji": "シャ",
    "meaning": "Menyalin / Memotret",
    "onyomi": [
      "シャ",
      "ジャ"
    ],
    "kunyomi": [
      "うつ.す",
      "うつ.る",
      "うつ-",
      "うつ.し"
    ],
    "strokeCount": 5,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "写真 (foto)"
    ]
  },
  {
    "id": 69,
    "character": "者",
    "romaji": "シャ",
    "meaning": "Orang (Ahli / Pelaku)",
    "onyomi": [
      "シャ"
    ],
    "kunyomi": [
      "もの"
    ],
    "strokeCount": 8,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "医者 (dokter)",
      "研究者 (peneliti)",
      "歯医者 (dokter gigi)"
    ]
  },
  {
    "id": 70,
    "character": "借",
    "romaji": "シャク",
    "meaning": "Meminjam",
    "onyomi": [
      "シャク"
    ],
    "kunyomi": [
      "か.りる"
    ],
    "strokeCount": 10,
    "grade": 4,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "借ります (meminjam, menyewa)"
    ]
  },
  {
    "id": 71,
    "character": "弱",
    "romaji": "ジャク",
    "meaning": "Lemah",
    "onyomi": [
      "ジャク"
    ],
    "kunyomi": [
      "よわ.い",
      "よわ.る",
      "よわ.まる",
      "よわ.める"
    ],
    "strokeCount": 10,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "弱い (lemah)"
    ]
  },
  {
    "id": 72,
    "character": "主",
    "romaji": "シュ",
    "meaning": "Tuan / Utama",
    "onyomi": [
      "シュ",
      "ス",
      "シュウ"
    ],
    "kunyomi": [
      "ぬし",
      "おも",
      "あるじ"
    ],
    "strokeCount": 5,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "ご主人 (suami (orang lain))",
      "主人 (suami (sendiri))"
    ]
  },
  {
    "id": 73,
    "character": "秋",
    "romaji": "シュウ",
    "meaning": "Musim Gugur",
    "onyomi": [
      "シュウ"
    ],
    "kunyomi": [
      "あき",
      "とき"
    ],
    "strokeCount": 9,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "秋 (musim gugur)",
      "秋葉原 (Akihabara (nama daerah di Tokyo))"
    ]
  },
  {
    "id": 74,
    "character": "終",
    "romaji": "シュウ",
    "meaning": "Selesai / Akhir",
    "onyomi": [
      "シュウ"
    ],
    "kunyomi": [
      "お.わる",
      "-お.わる",
      "おわ.る",
      "お.える",
      "つい",
      "つい.に"
    ],
    "strokeCount": 11,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "終わります (selesai)",
      "終わり (akhir, selesai)"
    ]
  },
  {
    "id": 75,
    "character": "習",
    "romaji": "シュウ",
    "meaning": "Belajar / Berlatih",
    "onyomi": [
      "シュウ",
      "ジュ"
    ],
    "kunyomi": [
      "なら.う",
      "なら.い"
    ],
    "strokeCount": 11,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "習います (belajar (dari seseorang))",
      "練習 (latihan)"
    ]
  },
  {
    "id": 76,
    "character": "集",
    "romaji": "シュウ",
    "meaning": "Berkumpul",
    "onyomi": [
      "シュウ"
    ],
    "kunyomi": [
      "あつ.まる",
      "あつ.める",
      "つど.う"
    ],
    "strokeCount": 12,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "集めます (mengumpulkan)"
    ]
  },
  {
    "id": 77,
    "character": "住",
    "romaji": "ジュウ",
    "meaning": "Tinggal / Menetap",
    "onyomi": [
      "ジュウ",
      "ヂュウ",
      "チュウ"
    ],
    "kunyomi": [
      "す.む",
      "す.まう",
      "-ず.まい"
    ],
    "strokeCount": 7,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "住所 (alamat)",
      "住みます (tinggal, mendiami)",
      "住んでいます (tinggal (di suatu tempat))"
    ]
  },
  {
    "id": 78,
    "character": "重",
    "romaji": "ジュウ",
    "meaning": "Berat / Penting",
    "onyomi": [
      "ジュウ",
      "チョウ"
    ],
    "kunyomi": [
      "え",
      "おも.い",
      "おも.り",
      "おも.なう",
      "かさ.ねる",
      "かさ.なる",
      "おも"
    ],
    "strokeCount": 9,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "重い (berat)"
    ]
  },
  {
    "id": 79,
    "character": "春",
    "romaji": "シュン",
    "meaning": "Musim Semi",
    "onyomi": [
      "シュン"
    ],
    "kunyomi": [
      "はる"
    ],
    "strokeCount": 9,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "春 (musim semi)"
    ]
  },
  {
    "id": 80,
    "character": "所",
    "romaji": "ショ",
    "meaning": "Tempat",
    "onyomi": [
      "ショ"
    ],
    "kunyomi": [
      "ところ",
      "-ところ",
      "どころ",
      "とこ"
    ],
    "strokeCount": 8,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "事務所 (kantor)",
      "所 (tempat)",
      "洗面所 (tempat cuci tangan, wastafel)"
    ]
  },
  {
    "id": 81,
    "character": "暑",
    "romaji": "ショ",
    "meaning": "Panas (Cuaca)",
    "onyomi": [
      "ショ"
    ],
    "kunyomi": [
      "あつ.い"
    ],
    "strokeCount": 12,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "暑い (panas (suhu udara))"
    ]
  },
  {
    "id": 82,
    "character": "乗",
    "romaji": "ジョウ",
    "meaning": "Naik (Kendaraan)",
    "onyomi": [
      "ジョウ",
      "ショウ"
    ],
    "kunyomi": [
      "の.る",
      "-の.り",
      "の.せる"
    ],
    "strokeCount": 9,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "乗り場 (tempat naik kendaraan)",
      "乗ります (naik kendaraan [でんしゃに～])",
      "乗り換えます (ganti / pindah kendaraan)"
    ]
  },
  {
    "id": 83,
    "character": "場",
    "romaji": "ジョウ",
    "meaning": "Tempat / Lokasi",
    "onyomi": [
      "ジョウ",
      "チョウ"
    ],
    "kunyomi": [
      "ば"
    ],
    "strokeCount": 12,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "売り場 (tempat penjualan, konter)",
      "乗り場 (tempat naik kendaraan)",
      "風呂場 (kamar mandi)"
    ]
  },
  {
    "id": 84,
    "character": "心",
    "romaji": "シン",
    "meaning": "Hati / Pikiran",
    "onyomi": [
      "シン"
    ],
    "kunyomi": [
      "こころ",
      "-ごころ"
    ],
    "strokeCount": 4,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "心配します (khawatir, cemas)"
    ]
  },
  {
    "id": 85,
    "character": "真",
    "romaji": "シン",
    "meaning": "Sungguh / Sejati",
    "onyomi": [
      "シン"
    ],
    "kunyomi": [
      "ま",
      "ま-",
      "まこと"
    ],
    "strokeCount": 10,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "写真 (foto)"
    ]
  },
  {
    "id": 86,
    "character": "親",
    "romaji": "シン",
    "meaning": "Orang Tua / Akrab",
    "onyomi": [
      "シン"
    ],
    "kunyomi": [
      "おや",
      "おや-",
      "した.しい",
      "した.しむ"
    ],
    "strokeCount": 16,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "親切な (baik hati, ramah)",
      "両親 (orang tua)"
    ]
  },
  {
    "id": 87,
    "character": "図",
    "romaji": "ズ",
    "meaning": "Gambar / Peta / Rencana",
    "onyomi": [
      "ズ",
      "ト"
    ],
    "kunyomi": [
      "え",
      "はか.る"
    ],
    "strokeCount": 7,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "図書館 (perpustakaan)",
      "地図 (peta)"
    ]
  },
  {
    "id": 88,
    "character": "世",
    "romaji": "セイ",
    "meaning": "Dunia / Zaman",
    "onyomi": [
      "セイ",
      "セ",
      "ソウ"
    ],
    "kunyomi": [
      "よ"
    ],
    "strokeCount": 5,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "世界 (dunia)",
      "いろいろお世話になりました (Terima kasih banyak atas segala bantuannya)"
    ]
  },
  {
    "id": 89,
    "character": "正",
    "romaji": "セイ",
    "meaning": "Benar / Tepat",
    "onyomi": [
      "セイ",
      "ショウ"
    ],
    "kunyomi": [
      "ただ.しい",
      "ただ.す",
      "まさ",
      "まさ.に"
    ],
    "strokeCount": 5,
    "grade": 1,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "お正月 (tahun baru)"
    ]
  },
  {
    "id": 90,
    "character": "青",
    "romaji": "セイ",
    "meaning": "Biru",
    "onyomi": [
      "セイ",
      "ショウ"
    ],
    "kunyomi": [
      "あお",
      "あお-",
      "あお.い"
    ],
    "strokeCount": 8,
    "grade": 1,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "青い (biru)"
    ]
  },
  {
    "id": 91,
    "character": "赤",
    "romaji": "セキ",
    "meaning": "Merah",
    "onyomi": [
      "セキ",
      "シャク"
    ],
    "kunyomi": [
      "あか",
      "あか-",
      "あか.い",
      "あか.らむ",
      "あか.らめる"
    ],
    "strokeCount": 7,
    "grade": 1,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "赤い (merah)"
    ]
  },
  {
    "id": 92,
    "character": "切",
    "romaji": "セツ",
    "meaning": "Memotong",
    "onyomi": [
      "セツ",
      "サイ"
    ],
    "kunyomi": [
      "き.る",
      "-き.る",
      "き.り",
      "-き.り",
      "-ぎ.り",
      "き.れる",
      "-き.れる",
      "き.れ",
      "-き.れ",
      "-ぎ.れ"
    ],
    "strokeCount": 4,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "切ります (memotong, menggunting)",
      "切符 (karcis, tiket)",
      "親切な (baik hati, ramah)"
    ]
  },
  {
    "id": 93,
    "character": "説",
    "romaji": "セツ",
    "meaning": "Menjelaskan / Teori",
    "onyomi": [
      "セツ",
      "ゼイ"
    ],
    "kunyomi": [
      "と.く"
    ],
    "strokeCount": 14,
    "grade": 4,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "説明します (menjelaskan, menerangkan)"
    ]
  },
  {
    "id": 94,
    "character": "洗",
    "romaji": "セン",
    "meaning": "Mencuci",
    "onyomi": [
      "セン"
    ],
    "kunyomi": [
      "あら.う"
    ],
    "strokeCount": 9,
    "grade": 6,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "お手洗い (kamar kecil, toilet (sopan))",
      "洗面所 (tempat cuci tangan, wastafel)",
      "洗います (mencuci)"
    ]
  },
  {
    "id": 95,
    "character": "早",
    "romaji": "ソウ",
    "meaning": "Cepat / Pagi",
    "onyomi": [
      "ソウ",
      "サッ"
    ],
    "kunyomi": [
      "はや.い",
      "はや",
      "はや-",
      "はや.まる",
      "はや.める",
      "さ-"
    ],
    "strokeCount": 6,
    "grade": 1,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "早く (dengan cepat, pagi-pagi)",
      "早い (pagi, awal)"
    ]
  },
  {
    "id": 96,
    "character": "走",
    "romaji": "ソウ",
    "meaning": "Berlari",
    "onyomi": [
      "ソウ"
    ],
    "kunyomi": [
      "はし.る"
    ],
    "strokeCount": 7,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "走る (berlari)"
    ]
  },
  {
    "id": 97,
    "character": "送",
    "romaji": "ソウ",
    "meaning": "Mengirim",
    "onyomi": [
      "ソウ"
    ],
    "kunyomi": [
      "おく.る"
    ],
    "strokeCount": 9,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "送ります (mengirim, mengantar)",
      "放送 (siaran, pengumuman)"
    ]
  },
  {
    "id": 98,
    "character": "族",
    "romaji": "ゾク",
    "meaning": "Suku / Keluarga",
    "onyomi": [
      "ゾク"
    ],
    "kunyomi": [],
    "strokeCount": 11,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "家族 (keluarga)",
      "ご家族 (keluarga (orang lain))"
    ]
  },
  {
    "id": 99,
    "character": "体",
    "romaji": "タイ",
    "meaning": "Tubuh / Badan",
    "onyomi": [
      "タイ",
      "テイ"
    ],
    "kunyomi": [
      "からだ",
      "かたち"
    ],
    "strokeCount": 7,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "体 (badan, tubuh)",
      "体がだるい (badan lemas / letih)",
      "体にいい (baik untuk tubuh, sehat)"
    ]
  },
  {
    "id": 100,
    "character": "待",
    "romaji": "タイ",
    "meaning": "Menunggu",
    "onyomi": [
      "タイ"
    ],
    "kunyomi": [
      "ま.つ",
      "-ま.ち"
    ],
    "strokeCount": 9,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "少々 お待ちください (Tunggu sebentar)",
      "待ちます (menunggu)"
    ]
  },
  {
    "id": 101,
    "character": "貸",
    "romaji": "タイ",
    "meaning": "Meminjamkan",
    "onyomi": [
      "タイ"
    ],
    "kunyomi": [
      "か.す",
      "か.し-",
      "かし-"
    ],
    "strokeCount": 12,
    "grade": 5,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "貸します (meminjamkan, menyewakan)",
      "貸してください (tolong pinjamkan)"
    ]
  },
  {
    "id": 102,
    "character": "台",
    "romaji": "ダイ",
    "meaning": "Unit / Panggung (Mesin)",
    "onyomi": [
      "ダイ",
      "タイ"
    ],
    "kunyomi": [
      "うてな",
      "われ",
      "つかさ"
    ],
    "strokeCount": 5,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "台所 (dapur)",
      "～台 (unit, buah (mesin/mobil))"
    ]
  },
  {
    "id": 103,
    "character": "題",
    "romaji": "ダイ",
    "meaning": "Topik / Judul",
    "onyomi": [
      "ダイ"
    ],
    "kunyomi": [],
    "strokeCount": 18,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "宿題 (pekerjaan rumah (PR))",
      "問題 (masalah, soal)"
    ]
  },
  {
    "id": 104,
    "character": "短",
    "romaji": "タン",
    "meaning": "Pendek",
    "onyomi": [
      "タン"
    ],
    "kunyomi": [
      "みじか.い"
    ],
    "strokeCount": 12,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "短い (pendek)"
    ]
  },
  {
    "id": 105,
    "character": "知",
    "romaji": "チ",
    "meaning": "Mengetahui / Tahu",
    "onyomi": [
      "チ"
    ],
    "kunyomi": [
      "し.る",
      "し.らせる"
    ],
    "strokeCount": 8,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "知ります (mengetahui, mengenal)",
      "知っています (tahu, kenal)"
    ]
  },
  {
    "id": 106,
    "character": "地",
    "romaji": "チ",
    "meaning": "Bumi / Tanah",
    "onyomi": [
      "チ",
      "ジ"
    ],
    "kunyomi": [],
    "strokeCount": 6,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "地下 (bawah tanah, basement)",
      "地下鉄 (kereta bawah tanah)",
      "地図 (peta)"
    ]
  },
  {
    "id": 107,
    "character": "池",
    "romaji": "チ",
    "meaning": "Kolam",
    "onyomi": [
      "チ"
    ],
    "kunyomi": [
      "いけ"
    ],
    "strokeCount": 6,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "電池 (baterai)"
    ]
  },
  {
    "id": 108,
    "character": "茶",
    "romaji": "チャ",
    "meaning": "Teh",
    "onyomi": [
      "チャ",
      "サ"
    ],
    "kunyomi": [],
    "strokeCount": 9,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "お茶 (teh, teh hijau)",
      "紅茶 (teh hitam)",
      "喫茶店 (kedai kopi, cafe)"
    ]
  },
  {
    "id": 109,
    "character": "着",
    "romaji": "チャク",
    "meaning": "Tiba / Memakai",
    "onyomi": [
      "チャク",
      "ジャク"
    ],
    "kunyomi": [
      "き.る",
      "き.せる",
      "つ.く",
      "つ.ける"
    ],
    "strokeCount": 12,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "上着 (jaket, pakaian luar)",
      "下着 (pakaian dalam)",
      "着物 (kimono (pakaian tradisional))"
    ]
  },
  {
    "id": 110,
    "character": "昼",
    "romaji": "チュウ",
    "meaning": "Siang",
    "onyomi": [
      "チュウ"
    ],
    "kunyomi": [
      "ひる"
    ],
    "strokeCount": 9,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "昼 (siang)",
      "昼休み (istirahat siang)",
      "昼ごはん (makan siang)"
    ]
  },
  {
    "id": 111,
    "character": "注",
    "romaji": "チュウ",
    "meaning": "Menuang / Catatan",
    "onyomi": [
      "チュウ"
    ],
    "kunyomi": [
      "そそ.ぐ",
      "さ.す",
      "つ.ぐ"
    ],
    "strokeCount": 8,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "ご注文は？ (Mau pesan apa?)"
    ]
  },
  {
    "id": 112,
    "character": "朝",
    "romaji": "チョウ",
    "meaning": "Pagi",
    "onyomi": [
      "チョウ"
    ],
    "kunyomi": [
      "あさ"
    ],
    "strokeCount": 12,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "朝 (pagi)",
      "毎朝 (setiap pagi)",
      "朝ごはん (sarapan, makan pagi)"
    ]
  },
  {
    "id": 113,
    "character": "町",
    "romaji": "チョウ",
    "meaning": "Kota / Daerah",
    "onyomi": [
      "チョウ"
    ],
    "kunyomi": [
      "まち"
    ],
    "strokeCount": 7,
    "grade": 1,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "町 (kota)"
    ]
  },
  {
    "id": 114,
    "character": "通",
    "romaji": "ツウ",
    "meaning": "Lewat / Melalui",
    "onyomi": [
      "ツウ",
      "ツ"
    ],
    "kunyomi": [
      "とお.る",
      "とお.り",
      "-とお.り",
      "-どお.り",
      "とお.す",
      "とお.し",
      "-どお.し",
      "かよ.う"
    ],
    "strokeCount": 10,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "普通 (biasa (kereta biasa / lokal))",
      "通帳記入 (pencetakan buku tabungan)",
      "交通 (lalu lintas)"
    ]
  },
  {
    "id": 115,
    "character": "低",
    "romaji": "テイ",
    "meaning": "Rendah",
    "onyomi": [
      "テイ"
    ],
    "kunyomi": [
      "ひく.い",
      "ひく.める",
      "ひく.まる"
    ],
    "strokeCount": 7,
    "grade": 4,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "低い (rendah)"
    ]
  },
  {
    "id": 116,
    "character": "弟",
    "romaji": "テイ",
    "meaning": "Adik Laki-laki",
    "onyomi": [
      "テイ",
      "ダイ",
      "デ"
    ],
    "kunyomi": [
      "おとうと"
    ],
    "strokeCount": 7,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "兄弟 (saudara kandung)",
      "弟 (adik laki-laki (sendiri))",
      "弟さん (adik laki-laki (orang lain))"
    ]
  },
  {
    "id": 117,
    "character": "転",
    "romaji": "テン",
    "meaning": "Berputar / Terjatuh",
    "onyomi": [
      "テン"
    ],
    "kunyomi": [
      "ころ.がる",
      "ころ.げる",
      "ころ.がす",
      "ころ.ぶ",
      "まろ.ぶ",
      "うたた",
      "うつ.る",
      "くる.めく"
    ],
    "strokeCount": 11,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "自転車 (sepeda)",
      "運転手 (sopir, pengemudi)",
      "運転します (menyetir, mengemudi)"
    ]
  },
  {
    "id": 118,
    "character": "田",
    "romaji": "デン",
    "meaning": "Sawah",
    "onyomi": [
      "デン"
    ],
    "kunyomi": [
      "た"
    ],
    "strokeCount": 5,
    "grade": 1,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "梅田 (Umeda (daerah di Osaka))",
      "田舎 (desa, kampung halaman)"
    ]
  },
  {
    "id": 119,
    "character": "都",
    "romaji": "ト",
    "meaning": "Ibu Kota / Metropolitan",
    "onyomi": [
      "ト",
      "ツ"
    ],
    "kunyomi": [
      "みやこ"
    ],
    "strokeCount": 11,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "都合 (kondisi, keadaan waktu)"
    ]
  },
  {
    "id": 120,
    "character": "度",
    "romaji": "ド",
    "meaning": "Derajat / Kali",
    "onyomi": [
      "ド",
      "ト",
      "タク"
    ],
    "kunyomi": [
      "たび",
      "-た.い"
    ],
    "strokeCount": 9,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "また 今度 お願いします (maaf, lain kali saja)",
      "一度 (sekali, satu kali)",
      "一度も (sama sekali tidak, satu kali pun (diikuti negatif))"
    ]
  },
  {
    "id": 121,
    "character": "冬",
    "romaji": "トウ",
    "meaning": "Musim Dingin",
    "onyomi": [
      "トウ"
    ],
    "kunyomi": [
      "ふゆ"
    ],
    "strokeCount": 5,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "冬 (musim dingin)"
    ]
  },
  {
    "id": 122,
    "character": "答",
    "romaji": "トウ",
    "meaning": "Jawaban / Menjawab",
    "onyomi": [
      "トウ"
    ],
    "kunyomi": [
      "こた.える",
      "こた.え"
    ],
    "strokeCount": 12,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "答え (jawaban)"
    ]
  },
  {
    "id": 123,
    "character": "頭",
    "romaji": "トウ",
    "meaning": "Kepala",
    "onyomi": [
      "トウ",
      "ズ",
      "ト"
    ],
    "kunyomi": [
      "あたま",
      "かしら",
      "-がしら",
      "かぶり"
    ],
    "strokeCount": 16,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "頭 (kepala)",
      "頭が痛い (sakit kepala)"
    ]
  },
  {
    "id": 124,
    "character": "働",
    "romaji": "ドウ",
    "meaning": "Bekerja",
    "onyomi": [
      "ドウ"
    ],
    "kunyomi": [
      "はたら.く"
    ],
    "strokeCount": 13,
    "grade": 4,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "働きます (bekerja)"
    ]
  },
  {
    "id": 125,
    "character": "動",
    "romaji": "ドウ",
    "meaning": "Bergerak",
    "onyomi": [
      "ドウ"
    ],
    "kunyomi": [
      "うご.く",
      "うご.かす"
    ],
    "strokeCount": 11,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "自動販売機 (mesin jual otomatis)",
      "動物 (hewan, binatang)",
      "動きます (bergerak, jalan (mesin))"
    ]
  },
  {
    "id": 126,
    "character": "堂",
    "romaji": "ドウ",
    "meaning": "Balai / Aula",
    "onyomi": [
      "ドウ"
    ],
    "kunyomi": [],
    "strokeCount": 11,
    "grade": 5,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "食堂 (ruang makan, kantin)"
    ]
  },
  {
    "id": 127,
    "character": "特",
    "romaji": "トク",
    "meaning": "Khusus / Spesial",
    "onyomi": [
      "トク"
    ],
    "kunyomi": [],
    "strokeCount": 10,
    "grade": 4,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "特急 (super ekspres (kereta super ekspres))",
      "特に (terutama, khususnya)"
    ]
  },
  {
    "id": 128,
    "character": "肉",
    "romaji": "ニク",
    "meaning": "Daging",
    "onyomi": [
      "ニク"
    ],
    "kunyomi": [
      "しし"
    ],
    "strokeCount": 6,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "肉 (daging)",
      "豚肉 (daging babi)",
      "鶏肉 (daging ayam)"
    ]
  },
  {
    "id": 129,
    "character": "売",
    "romaji": "バイ",
    "meaning": "Menjual",
    "onyomi": [
      "バイ"
    ],
    "kunyomi": [
      "う.る",
      "う.れる"
    ],
    "strokeCount": 7,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "自動販売機 (mesin jual otomatis)",
      "売り場 (tempat penjualan, konter)",
      "売ります (menjual)"
    ]
  },
  {
    "id": 130,
    "character": "病",
    "romaji": "ビョウ",
    "meaning": "Sakit / Penyakit",
    "onyomi": [
      "ビョウ",
      "ヘイ"
    ],
    "kunyomi": [
      "や.む",
      "-や.み",
      "やまい"
    ],
    "strokeCount": 10,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "病院 (rumah sakit)",
      "病気 (sakit, penyakit)"
    ]
  },
  {
    "id": 131,
    "character": "品",
    "romaji": "ヒン",
    "meaning": "Barang / Produk",
    "onyomi": [
      "ヒン",
      "ホン"
    ],
    "kunyomi": [
      "しな"
    ],
    "strokeCount": 9,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "製品 (produk, barang buatan)"
    ]
  },
  {
    "id": 132,
    "character": "不",
    "romaji": "フ",
    "meaning": "Tidak / Bukan",
    "onyomi": [
      "フ",
      "ブ"
    ],
    "kunyomi": [],
    "strokeCount": 4,
    "grade": 4,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "不便 (tidak praktis [不便な])"
    ]
  },
  {
    "id": 133,
    "character": "風",
    "romaji": "フウ",
    "meaning": "Angin / Gaya",
    "onyomi": [
      "フウ",
      "フ"
    ],
    "kunyomi": [
      "かぜ",
      "かざ-"
    ],
    "strokeCount": 9,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "風呂場 (kamar mandi)"
    ]
  },
  {
    "id": 134,
    "character": "服",
    "romaji": "フク",
    "meaning": "Pakaian",
    "onyomi": [
      "フク"
    ],
    "kunyomi": [],
    "strokeCount": 8,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "服 (baju, pakaian)"
    ]
  },
  {
    "id": 135,
    "character": "物",
    "romaji": "ブツ",
    "meaning": "Benda / Barang",
    "onyomi": [
      "ブツ",
      "モツ"
    ],
    "kunyomi": [
      "もの",
      "もの-"
    ],
    "strokeCount": 8,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "果物 (buah-buahan)",
      "荷物 (barang, paket, bagasi, koper)",
      "食べ物 (makanan)"
    ]
  },
  {
    "id": 136,
    "character": "文",
    "romaji": "ブン",
    "meaning": "Kalimat / Tulisan",
    "onyomi": [
      "ブン",
      "モン"
    ],
    "kunyomi": [
      "ふみ",
      "あや"
    ],
    "strokeCount": 4,
    "grade": 1,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "ご注文は？ (Mau pesan apa?)",
      "文楽 (Bunraku (teater boneka tradisional))"
    ]
  },
  {
    "id": 137,
    "character": "別",
    "romaji": "ベツ",
    "meaning": "Berpisah / Berbeda",
    "onyomi": [
      "ベツ"
    ],
    "kunyomi": [
      "わか.れる",
      "わ.ける"
    ],
    "strokeCount": 7,
    "grade": 4,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "別々に (sendiri-sendiri, masing-masing (bayar terpisah))"
    ]
  },
  {
    "id": 138,
    "character": "便",
    "romaji": "ベン",
    "meaning": "Kemudahan / Pos",
    "onyomi": [
      "ベン",
      "ビン"
    ],
    "kunyomi": [
      "たよ.り"
    ],
    "strokeCount": 9,
    "grade": 4,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "郵便局 (kantor pos)",
      "便利な (praktis, nyaman)",
      "郵便ポスト (kotak pos)"
    ]
  },
  {
    "id": 139,
    "character": "勉",
    "romaji": "ベン",
    "meaning": "Berusaha / Rajin",
    "onyomi": [
      "ベン"
    ],
    "kunyomi": [
      "つと.める"
    ],
    "strokeCount": 10,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "勉強します (belajar)",
      "勉強 (pelajaran, belajar)"
    ]
  },
  {
    "id": 140,
    "character": "歩",
    "romaji": "ホ",
    "meaning": "Berjalan",
    "onyomi": [
      "ホ",
      "ブ",
      "フ"
    ],
    "kunyomi": [
      "ある.く",
      "あゆ.む"
    ],
    "strokeCount": 8,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "歩いて (dengan berjalan kaki)",
      "散歩します (berjalan-jalan [こうえんを～])",
      "歩きます (berjalan kaki)"
    ]
  },
  {
    "id": 141,
    "character": "方",
    "romaji": "ホウ",
    "meaning": "Arah / Orang (Sopan)",
    "onyomi": [
      "ホウ"
    ],
    "kunyomi": [
      "かた",
      "-かた",
      "-がた"
    ],
    "strokeCount": 4,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "あの方 (beliau (sopan))",
      "読み方 (cara membaca)",
      "～方 (cara ~)"
    ]
  },
  {
    "id": 142,
    "character": "妹",
    "romaji": "マイ",
    "meaning": "Adik Perempuan",
    "onyomi": [
      "マイ"
    ],
    "kunyomi": [
      "いもうと"
    ],
    "strokeCount": 8,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "妹 (adik perempuan (sendiri))",
      "妹さん (adik perempuan (orang lain))"
    ]
  },
  {
    "id": 143,
    "character": "味",
    "romaji": "ミ",
    "meaning": "Rasa",
    "onyomi": [
      "ミ"
    ],
    "kunyomi": [
      "あじ",
      "あじ.わう"
    ],
    "strokeCount": 8,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "趣味 (hobi)",
      "意味 (arti, makna)"
    ]
  },
  {
    "id": 144,
    "character": "明",
    "romaji": "メイ",
    "meaning": "Terang / Jelas",
    "onyomi": [
      "メイ",
      "ミョウ",
      "ミン"
    ],
    "kunyomi": [
      "あ.かり",
      "あか.るい",
      "あか.るむ",
      "あか.らむ",
      "あき.らか",
      "あ.ける",
      "-あ.け",
      "あ.く",
      "あ.くる",
      "あ.かす"
    ],
    "strokeCount": 8,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "明るい (terang, cerah)",
      "説明します (menjelaskan, menerangkan)"
    ]
  },
  {
    "id": 145,
    "character": "問",
    "romaji": "モン",
    "meaning": "Pertanyaan / Masalah",
    "onyomi": [
      "モン"
    ],
    "kunyomi": [
      "と.う",
      "と.い",
      "とん"
    ],
    "strokeCount": 11,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "問題 (masalah, soal)"
    ]
  },
  {
    "id": 146,
    "character": "門",
    "romaji": "モン",
    "meaning": "Gerbang",
    "onyomi": [
      "モン"
    ],
    "kunyomi": [
      "かど",
      "と"
    ],
    "strokeCount": 8,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "専門 (spesialisasi, bidang keahlian)"
    ]
  },
  {
    "id": 147,
    "character": "夜",
    "romaji": "ヤ",
    "meaning": "Malam",
    "onyomi": [
      "ヤ"
    ],
    "kunyomi": [
      "よ",
      "よる"
    ],
    "strokeCount": 8,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "夜 (malam)"
    ]
  },
  {
    "id": 148,
    "character": "野",
    "romaji": "ヤ",
    "meaning": "Padang / Lapangan",
    "onyomi": [
      "ヤ",
      "ショ"
    ],
    "kunyomi": [
      "の",
      "の-"
    ],
    "strokeCount": 11,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "野菜 (sayur)",
      "野球 (baseball)"
    ]
  },
  {
    "id": 149,
    "character": "薬",
    "romaji": "ヤク",
    "meaning": "Obat",
    "onyomi": [
      "ヤク"
    ],
    "kunyomi": [
      "くすり"
    ],
    "strokeCount": 16,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "薬 (obat)"
    ]
  },
  {
    "id": 150,
    "character": "有",
    "romaji": "ユウ",
    "meaning": "Ada / Memiliki",
    "onyomi": [
      "ユウ",
      "ウ"
    ],
    "kunyomi": [
      "あ.る"
    ],
    "strokeCount": 6,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "有名な (terkenal)"
    ]
  },
  {
    "id": 151,
    "character": "曜",
    "romaji": "ヨウ",
    "meaning": "Hari (Kalender)",
    "onyomi": [
      "ヨウ"
    ],
    "kunyomi": [],
    "strokeCount": 18,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "月曜日 (hari Senin)",
      "火曜日 (hari Selasa)",
      "水曜日 (hari Rabu)"
    ]
  },
  {
    "id": 152,
    "character": "用",
    "romaji": "ヨウ",
    "meaning": "Menggunakan / Keperluan",
    "onyomi": [
      "ヨウ"
    ],
    "kunyomi": [
      "もち.いる"
    ],
    "strokeCount": 5,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "用事 (urusan)"
    ]
  },
  {
    "id": 153,
    "character": "理",
    "romaji": "リ",
    "meaning": "Alasan / Teori",
    "onyomi": [
      "リ"
    ],
    "kunyomi": [
      "ことわり"
    ],
    "strokeCount": 11,
    "grade": 2,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "料理 (masakan, hidangan)",
      "調理師 (koki, juru masak)",
      "理容師 (tukang cukur rambut (pria))"
    ]
  },
  {
    "id": 154,
    "character": "旅",
    "romaji": "リョ",
    "meaning": "Perjalanan / Wisata",
    "onyomi": [
      "リョ"
    ],
    "kunyomi": [
      "たび"
    ],
    "strokeCount": 10,
    "grade": 3,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "旅行 (tamasya, perjalanan, traveling)"
    ]
  },
  {
    "id": 155,
    "character": "料",
    "romaji": "リョウ",
    "meaning": "Biaya / Bahan",
    "onyomi": [
      "リョウ"
    ],
    "kunyomi": [],
    "strokeCount": 10,
    "grade": 4,
    "jlpt": 4,
    "type": "kanji",
    "examples": [
      "料理 (masakan, hidangan)",
      "資料 (data, bahan materi)"
    ]
  }
];
