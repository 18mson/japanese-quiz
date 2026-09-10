// src/data/kanjiWritingPrompts.ts
// Curated Japanese N5 Kanji Writing Dataset with Multi-Kotoba Prompts & Lesson Progression

export interface KanjiPromptVariation {
  id: string;
  word: string;
  fullKana: string;
  prefixKana: string;
  targetKana: string;
  suffixKana: string;
  meaning: string;
  lesson: string;
  lessonNumber: number;
}

export interface KanjiWritingEntry {
  kanji: string;
  primaryLesson: string;
  primaryLessonNumber: number;
  meaning: string;
  onyomi: string[];
  kunyomi: string[];
  examples: Array<{
    word: string;
    kana: string;
    meaning: string;
  }>;
  prompts: KanjiPromptVariation[];
}

export const kanjiWritingEntries: KanjiWritingEntry[] = [
  {
    "kanji": "一",
    "primaryLesson": "Pelajaran 1",
    "primaryLessonNumber": 1,
    "meaning": "Satu",
    "onyomi": [
      "イチ",
      "イツ"
    ],
    "kunyomi": [
      "ひと",
      "ひとつ"
    ],
    "examples": [
      {
        "word": "一歳",
        "kana": "いっさい",
        "meaning": "umur satu tahun"
      },
      {
        "word": "一つ",
        "kana": "ひとつ",
        "meaning": "satu buah"
      },
      {
        "word": "一人",
        "kana": "ひとり",
        "meaning": "seorang, 1 orang"
      },
      {
        "word": "一度",
        "kana": "いちど",
        "meaning": "sekali, satu kali"
      }
    ],
    "prompts": [
      {
        "id": "一_一歳_1",
        "word": "一歳",
        "fullKana": "いっさい",
        "prefixKana": "",
        "targetKana": "いっ",
        "suffixKana": "さい",
        "meaning": "umur satu tahun",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "一_一つ_2",
        "word": "一つ",
        "fullKana": "ひとつ",
        "prefixKana": "",
        "targetKana": "ひと",
        "suffixKana": "つ",
        "meaning": "satu buah",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      },
      {
        "id": "一_一人_3",
        "word": "一人",
        "fullKana": "ひとり",
        "prefixKana": "",
        "targetKana": "ひと",
        "suffixKana": "り",
        "meaning": "seorang, 1 orang",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      },
      {
        "id": "一_一度_4",
        "word": "一度",
        "fullKana": "いちど",
        "prefixKana": "",
        "targetKana": "いち",
        "suffixKana": "ど",
        "meaning": "sekali, satu kali",
        "lesson": "Pelajaran 19",
        "lessonNumber": 19
      }
    ]
  },
  {
    "kanji": "日",
    "primaryLesson": "Pelajaran 1",
    "primaryLessonNumber": 1,
    "meaning": "Hari / Matahari",
    "onyomi": [
      "ニチ",
      "ジツ"
    ],
    "kunyomi": [
      "ひ",
      "か"
    ],
    "examples": [
      {
        "word": "日本",
        "kana": "にほん",
        "meaning": "Jepang"
      },
      {
        "word": "日本語",
        "kana": "にほんご",
        "meaning": "bahasa Jepang"
      },
      {
        "word": "毎日",
        "kana": "まいにち",
        "meaning": "setiap hari"
      },
      {
        "word": "月曜日",
        "kana": "げつようび",
        "meaning": "hari Senin"
      }
    ],
    "prompts": [
      {
        "id": "日_日本_1",
        "word": "日本",
        "fullKana": "にほん",
        "prefixKana": "",
        "targetKana": "に",
        "suffixKana": "ほん",
        "meaning": "Jepang",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "日_日本語_2",
        "word": "日本語",
        "fullKana": "にほんご",
        "prefixKana": "",
        "targetKana": "に",
        "suffixKana": "ほんご",
        "meaning": "bahasa Jepang",
        "lesson": "Pelajaran 2",
        "lessonNumber": 2
      },
      {
        "id": "日_毎日_3",
        "word": "毎日",
        "fullKana": "まいにち",
        "prefixKana": "まい",
        "targetKana": "にち",
        "suffixKana": "",
        "meaning": "setiap hari",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "日_月曜日_4",
        "word": "月曜日",
        "fullKana": "げつようび",
        "prefixKana": "げつよう",
        "targetKana": "び",
        "suffixKana": "",
        "meaning": "hari Senin",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "日_火曜日_5",
        "word": "火曜日",
        "fullKana": "かようび",
        "prefixKana": "かよう",
        "targetKana": "び",
        "suffixKana": "",
        "meaning": "hari Selasa",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "日_水曜日_6",
        "word": "水曜日",
        "fullKana": "すいようび",
        "prefixKana": "すいよう",
        "targetKana": "び",
        "suffixKana": "",
        "meaning": "hari Rabu",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "日_木曜日_7",
        "word": "木曜日",
        "fullKana": "もくようび",
        "prefixKana": "もくよう",
        "targetKana": "び",
        "suffixKana": "",
        "meaning": "hari Kamis",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "日_金曜日_8",
        "word": "金曜日",
        "fullKana": "きんようび",
        "prefixKana": "きんよう",
        "targetKana": "び",
        "suffixKana": "",
        "meaning": "hari Jumat",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "日_土曜日_9",
        "word": "土曜日",
        "fullKana": "どようび",
        "prefixKana": "どよう",
        "targetKana": "び",
        "suffixKana": "",
        "meaning": "hari Sabtu",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "日_日曜日_10",
        "word": "日曜日",
        "fullKana": "にちようび",
        "prefixKana": "",
        "targetKana": "にち",
        "suffixKana": "ようび",
        "meaning": "hari Minggu",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "日_何曜日_11",
        "word": "何曜日",
        "fullKana": "なんようび",
        "prefixKana": "なんよう",
        "targetKana": "び",
        "suffixKana": "",
        "meaning": "hari apa",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "日_誕生日_12",
        "word": "誕生日",
        "fullKana": "たんじょうび",
        "prefixKana": "たんじょう",
        "targetKana": "び",
        "suffixKana": "",
        "meaning": "hari ulang tahun",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "日_日記_13",
        "word": "日記",
        "fullKana": "にっき",
        "prefixKana": "",
        "targetKana": "に",
        "suffixKana": "っき",
        "meaning": "catatan harian, diari",
        "lesson": "Pelajaran 18",
        "lessonNumber": 18
      },
      {
        "id": "日_日_14",
        "word": "日",
        "fullKana": "ひ",
        "prefixKana": "",
        "targetKana": "ひ",
        "suffixKana": "",
        "meaning": "hari, tanggal",
        "lesson": "Pelajaran 19",
        "lessonNumber": 19
      },
      {
        "id": "日_母の日_15",
        "word": "母の日",
        "fullKana": "ははのひ",
        "prefixKana": "ははの",
        "targetKana": "ひ",
        "suffixKana": "",
        "meaning": "Hari Ibu",
        "lesson": "Pelajaran 24",
        "lessonNumber": 24
      }
    ]
  },
  {
    "kanji": "先",
    "primaryLesson": "Pelajaran 1",
    "primaryLessonNumber": 1,
    "meaning": "Sebelumnya / Dahulu",
    "onyomi": [
      "セン"
    ],
    "kunyomi": [
      "さき"
    ],
    "examples": [
      {
        "word": "先生",
        "kana": "せんせい",
        "meaning": "guru, dosen"
      },
      {
        "word": "先週",
        "kana": "せんしゅう",
        "meaning": "minggu lalu"
      },
      {
        "word": "先月",
        "kana": "せんげつ",
        "meaning": "bulan lalu"
      }
    ],
    "prompts": [
      {
        "id": "先_先生_1",
        "word": "先生",
        "fullKana": "せんせい",
        "prefixKana": "",
        "targetKana": "せん",
        "suffixKana": "せい",
        "meaning": "guru, dosen",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "先_先週_2",
        "word": "先週",
        "fullKana": "せんしゅう",
        "prefixKana": "",
        "targetKana": "せん",
        "suffixKana": "しゅう",
        "meaning": "minggu lalu",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "先_先月_3",
        "word": "先月",
        "fullKana": "せんげつ",
        "prefixKana": "",
        "targetKana": "せん",
        "suffixKana": "げつ",
        "meaning": "bulan lalu",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      }
    ]
  },
  {
    "kanji": "生",
    "primaryLesson": "Pelajaran 1",
    "primaryLessonNumber": 1,
    "meaning": "Lahir / Hidup",
    "onyomi": [
      "セイ",
      "ショウ"
    ],
    "kunyomi": [
      "いきる",
      "うまれる",
      "なま"
    ],
    "examples": [
      {
        "word": "先生",
        "kana": "せんせい",
        "meaning": "guru, dosen"
      },
      {
        "word": "学生",
        "kana": "がくせい",
        "meaning": "mahasiswa, siswa"
      },
      {
        "word": "誕生日",
        "kana": "たんじょうび",
        "meaning": "hari ulang tahun"
      },
      {
        "word": "留学生",
        "kana": "りゅうがくせい",
        "meaning": "pelajar asing, mahasiswa asing"
      }
    ],
    "prompts": [
      {
        "id": "生_先生_1",
        "word": "先生",
        "fullKana": "せんせい",
        "prefixKana": "せん",
        "targetKana": "せい",
        "suffixKana": "",
        "meaning": "guru, dosen",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "生_学生_2",
        "word": "学生",
        "fullKana": "がくせい",
        "prefixKana": "がく",
        "targetKana": "せい",
        "suffixKana": "",
        "meaning": "mahasiswa, siswa",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "生_誕生日_3",
        "word": "誕生日",
        "fullKana": "たんじょうび",
        "prefixKana": "たんじょ",
        "targetKana": "う",
        "suffixKana": "び",
        "meaning": "hari ulang tahun",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "生_留学生_4",
        "word": "留学生",
        "fullKana": "りゅうがくせい",
        "prefixKana": "りゅうがく",
        "targetKana": "せい",
        "suffixKana": "",
        "meaning": "pelajar asing, mahasiswa asing",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      },
      {
        "id": "生_生け花_5",
        "word": "生け花",
        "fullKana": "いけばな",
        "prefixKana": "",
        "targetKana": "い",
        "suffixKana": "けばな",
        "meaning": "seni merangkai bunga",
        "lesson": "Pelajaran 12",
        "lessonNumber": 12
      },
      {
        "id": "生_生まれます_6",
        "word": "生まれます",
        "fullKana": "うまれます",
        "prefixKana": "",
        "targetKana": "う",
        "suffixKana": "まれます",
        "meaning": "lahir",
        "lesson": "Pelajaran 22",
        "lessonNumber": 22
      }
    ]
  },
  {
    "kanji": "何",
    "primaryLesson": "Pelajaran 1",
    "primaryLessonNumber": 1,
    "meaning": "Apa",
    "onyomi": [
      "カ"
    ],
    "kunyomi": [
      "なに",
      "なん"
    ],
    "examples": [
      {
        "word": "何歳",
        "kana": "なんさい",
        "meaning": "umur berapa"
      },
      {
        "word": "何",
        "kana": "なん",
        "meaning": "apa"
      },
      {
        "word": "何階",
        "kana": "なんがい",
        "meaning": "lantai berapa, tingkat berapa"
      },
      {
        "word": "何時",
        "kana": "なんじ",
        "meaning": "jam berapa"
      }
    ],
    "prompts": [
      {
        "id": "何_何歳_1",
        "word": "何歳",
        "fullKana": "なんさい",
        "prefixKana": "",
        "targetKana": "なん",
        "suffixKana": "さい",
        "meaning": "umur berapa",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "何_何_2",
        "word": "何",
        "fullKana": "なん",
        "prefixKana": "",
        "targetKana": "なん",
        "suffixKana": "",
        "meaning": "apa",
        "lesson": "Pelajaran 2",
        "lessonNumber": 2
      },
      {
        "id": "何_何階_3",
        "word": "何階",
        "fullKana": "なんがい",
        "prefixKana": "",
        "targetKana": "なん",
        "suffixKana": "がい",
        "meaning": "lantai berapa, tingkat berapa",
        "lesson": "Pelajaran 3",
        "lessonNumber": 3
      },
      {
        "id": "何_何時_4",
        "word": "何時",
        "fullKana": "なんじ",
        "prefixKana": "",
        "targetKana": "なん",
        "suffixKana": "じ",
        "meaning": "jam berapa",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "何_何曜日_5",
        "word": "何曜日",
        "fullKana": "なんようび",
        "prefixKana": "",
        "targetKana": "なん",
        "suffixKana": "ようび",
        "meaning": "hari apa",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      }
    ]
  },
  {
    "kanji": "人",
    "primaryLesson": "Pelajaran 1",
    "primaryLessonNumber": 1,
    "meaning": "Orang",
    "onyomi": [
      "ジン",
      "ニン"
    ],
    "kunyomi": [
      "ひと"
    ],
    "examples": [
      {
        "word": "あの人",
        "kana": "あのひと",
        "meaning": "orang itu"
      },
      {
        "word": "～人",
        "kana": "～じん",
        "meaning": "orang ~ (warga negara)"
      },
      {
        "word": "人",
        "kana": "ひと",
        "meaning": "orang"
      },
      {
        "word": "ご主人",
        "kana": "ごしゅじん",
        "meaning": "suami (orang lain)"
      }
    ],
    "prompts": [
      {
        "id": "人_あの人_1",
        "word": "あの人",
        "fullKana": "あのひと",
        "prefixKana": "あの",
        "targetKana": "ひと",
        "suffixKana": "",
        "meaning": "orang itu",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "人_～人_2",
        "word": "～人",
        "fullKana": "～じん",
        "prefixKana": "～",
        "targetKana": "じん",
        "suffixKana": "",
        "meaning": "orang ~ (warga negara)",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "人_人_3",
        "word": "人",
        "fullKana": "ひと",
        "prefixKana": "",
        "targetKana": "ひと",
        "suffixKana": "",
        "meaning": "orang",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "人_ご主人_4",
        "word": "ご主人",
        "fullKana": "ごしゅじん",
        "prefixKana": "ごしゅ",
        "targetKana": "じん",
        "suffixKana": "",
        "meaning": "suami (orang lain)",
        "lesson": "Pelajaran 9",
        "lessonNumber": 9
      },
      {
        "id": "人_男の人_5",
        "word": "男の人",
        "fullKana": "おとこのひと",
        "prefixKana": "おとこの",
        "targetKana": "ひと",
        "suffixKana": "",
        "meaning": "orang laki-laki, pria",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      },
      {
        "id": "人_女の人_6",
        "word": "女の人",
        "fullKana": "おんなのひと",
        "prefixKana": "おんなの",
        "targetKana": "ひと",
        "suffixKana": "",
        "meaning": "orang perempuan, wanita",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      },
      {
        "id": "人_一人_7",
        "word": "一人",
        "fullKana": "ひとり",
        "prefixKana": "",
        "targetKana": "ひと",
        "suffixKana": "り",
        "meaning": "seorang, 1 orang",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      }
    ]
  },
  {
    "kanji": "中",
    "primaryLesson": "Pelajaran 1",
    "primaryLessonNumber": 1,
    "meaning": "Dalam / Tengah",
    "onyomi": [
      "チュウ"
    ],
    "kunyomi": [
      "なか"
    ],
    "examples": [
      {
        "word": "中国",
        "kana": "ちゅうごく",
        "meaning": "Cina"
      },
      {
        "word": "中",
        "kana": "なか",
        "meaning": "dalam, tengah"
      }
    ],
    "prompts": [
      {
        "id": "中_中国_1",
        "word": "中国",
        "fullKana": "ちゅうごく",
        "prefixKana": "",
        "targetKana": "ちゅう",
        "suffixKana": "ごく",
        "meaning": "Cina",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "中_中_2",
        "word": "中",
        "fullKana": "なか",
        "prefixKana": "",
        "targetKana": "なか",
        "suffixKana": "",
        "meaning": "dalam, tengah",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      }
    ]
  },
  {
    "kanji": "前",
    "primaryLesson": "Pelajaran 1",
    "primaryLessonNumber": 1,
    "meaning": "Depan / Sebelum",
    "onyomi": [
      "ゼン"
    ],
    "kunyomi": [
      "まえ"
    ],
    "examples": [
      {
        "word": "お名前は？",
        "kana": "おなまえは？",
        "meaning": "Siapa namanya?"
      },
      {
        "word": "午前",
        "kana": "ごぜん",
        "meaning": "a.m. (pagi)"
      },
      {
        "word": "前",
        "kana": "まえ",
        "meaning": "depan, muka"
      }
    ],
    "prompts": [
      {
        "id": "前_お名前は？_1",
        "word": "お名前は？",
        "fullKana": "おなまえは？",
        "prefixKana": "おな",
        "targetKana": "まえ",
        "suffixKana": "は？",
        "meaning": "Siapa namanya?",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "前_午前_2",
        "word": "午前",
        "fullKana": "ごぜん",
        "prefixKana": "ご",
        "targetKana": "ぜん",
        "suffixKana": "",
        "meaning": "a.m. (pagi)",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "前_前_3",
        "word": "前",
        "fullKana": "まえ",
        "prefixKana": "",
        "targetKana": "まえ",
        "suffixKana": "",
        "meaning": "depan, muka",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      }
    ]
  },
  {
    "kanji": "大",
    "primaryLesson": "Pelajaran 1",
    "primaryLessonNumber": 1,
    "meaning": "Besar",
    "onyomi": [
      "ダイ",
      "タイ"
    ],
    "kunyomi": [
      "おおきい",
      "おおいに"
    ],
    "examples": [
      {
        "word": "大学",
        "kana": "だいがく",
        "meaning": "universitas"
      },
      {
        "word": "大きい",
        "kana": "おおきい",
        "meaning": "besar"
      },
      {
        "word": "大変な",
        "kana": "たいへん",
        "meaning": "berat, susah, gawat"
      },
      {
        "word": "大切な",
        "kana": "たいせつ",
        "meaning": "penting, bernilai, berharga"
      }
    ],
    "prompts": [
      {
        "id": "大_大学_1",
        "word": "大学",
        "fullKana": "だいがく",
        "prefixKana": "",
        "targetKana": "だい",
        "suffixKana": "がく",
        "meaning": "universitas",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "大_大きい_2",
        "word": "大きい",
        "fullKana": "おおきい",
        "prefixKana": "",
        "targetKana": "おお",
        "suffixKana": "きい",
        "meaning": "besar",
        "lesson": "Pelajaran 8",
        "lessonNumber": 8
      },
      {
        "id": "大_大変な_3",
        "word": "大変な",
        "fullKana": "たいへん",
        "prefixKana": "",
        "targetKana": "たい",
        "suffixKana": "へん",
        "meaning": "berat, susah, gawat",
        "lesson": "Pelajaran 13",
        "lessonNumber": 13
      },
      {
        "id": "大_大切な_4",
        "word": "大切な",
        "fullKana": "たいせつ",
        "prefixKana": "",
        "targetKana": "たい",
        "suffixKana": "せつ",
        "meaning": "penting, bernilai, berharga",
        "lesson": "Pelajaran 17",
        "lessonNumber": 17
      },
      {
        "id": "大_大丈夫な_5",
        "word": "大丈夫な",
        "fullKana": "だいじょうぶ",
        "prefixKana": "",
        "targetKana": "だい",
        "suffixKana": "じょうぶ",
        "meaning": "tidak apa-apa, aman",
        "lesson": "Pelajaran 17",
        "lessonNumber": 17
      }
    ]
  },
  {
    "kanji": "行",
    "primaryLesson": "Pelajaran 1",
    "primaryLessonNumber": 1,
    "meaning": "Pergi / Melakukan",
    "onyomi": [
      "コウ",
      "ギョウ"
    ],
    "kunyomi": [
      "いく",
      "おこなう"
    ],
    "examples": [
      {
        "word": "銀行員",
        "kana": "ぎんこういん",
        "meaning": "pegawai bank"
      },
      {
        "word": "銀行",
        "kana": "ぎんこう",
        "meaning": "bank"
      },
      {
        "word": "飛行機",
        "kana": "ひこうき",
        "meaning": "pesawat terbang"
      },
      {
        "word": "旅行",
        "kana": "りょこう",
        "meaning": "tamasya, perjalanan, traveling"
      }
    ],
    "prompts": [
      {
        "id": "行_銀行員_1",
        "word": "銀行員",
        "fullKana": "ぎんこういん",
        "prefixKana": "ぎんこう",
        "targetKana": "い",
        "suffixKana": "ん",
        "meaning": "pegawai bank",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "行_銀行_2",
        "word": "銀行",
        "fullKana": "ぎんこう",
        "prefixKana": "ぎん",
        "targetKana": "こう",
        "suffixKana": "",
        "meaning": "bank",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "行_飛行機_3",
        "word": "飛行機",
        "fullKana": "ひこうき",
        "prefixKana": "ひ",
        "targetKana": "こう",
        "suffixKana": "き",
        "meaning": "pesawat terbang",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "行_旅行_4",
        "word": "旅行",
        "fullKana": "りょこう",
        "prefixKana": "りょ",
        "targetKana": "こう",
        "suffixKana": "",
        "meaning": "tamasya, perjalanan, traveling",
        "lesson": "Pelajaran 9",
        "lessonNumber": 9
      },
      {
        "id": "行_連れて行きます_5",
        "word": "連れて行きます",
        "fullKana": "つれていきます",
        "prefixKana": "つれて",
        "targetKana": "い",
        "suffixKana": "きます",
        "meaning": "membawa, mengajak pergi (orang)",
        "lesson": "Pelajaran 24",
        "lessonNumber": 24
      }
    ]
  },
  {
    "kanji": "来",
    "primaryLesson": "Pelajaran 1",
    "primaryLessonNumber": 1,
    "meaning": "Datang",
    "onyomi": [
      "ライ"
    ],
    "kunyomi": [
      "くる",
      "きたる"
    ],
    "examples": [
      {
        "word": "～から来ました",
        "kana": "～からきました",
        "meaning": "datang dari ~, berasal dari ~"
      },
      {
        "word": "来週",
        "kana": "らいしゅう",
        "meaning": "minggu depan"
      },
      {
        "word": "来月",
        "kana": "らいげつ",
        "meaning": "bulan depan"
      },
      {
        "word": "来年",
        "kana": "らいねん",
        "meaning": "tahun depan"
      }
    ],
    "prompts": [
      {
        "id": "来_～から来ました_1",
        "word": "～から来ました",
        "fullKana": "～からきました",
        "prefixKana": "～から",
        "targetKana": "き",
        "suffixKana": "ました",
        "meaning": "datang dari ~, berasal dari ~",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "来_来週_2",
        "word": "来週",
        "fullKana": "らいしゅう",
        "prefixKana": "",
        "targetKana": "らい",
        "suffixKana": "しゅう",
        "meaning": "minggu depan",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "来_来月_3",
        "word": "来月",
        "fullKana": "らいげつ",
        "prefixKana": "",
        "targetKana": "らい",
        "suffixKana": "げつ",
        "meaning": "bulan depan",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "来_来年_4",
        "word": "来年",
        "fullKana": "らいねん",
        "prefixKana": "",
        "targetKana": "らい",
        "suffixKana": "ねん",
        "meaning": "tahun depan",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "来_連れて来ます_5",
        "word": "連れて来ます",
        "fullKana": "つれてきます",
        "prefixKana": "つれて",
        "targetKana": "き",
        "suffixKana": "ます",
        "meaning": "membawa, mengajak datang (orang)",
        "lesson": "Pelajaran 24",
        "lessonNumber": 24
      }
    ]
  },
  {
    "kanji": "学",
    "primaryLesson": "Pelajaran 1",
    "primaryLessonNumber": 1,
    "meaning": "Belajar / Ilmu",
    "onyomi": [
      "ガク"
    ],
    "kunyomi": [
      "まなぶ"
    ],
    "examples": [
      {
        "word": "学生",
        "kana": "がくせい",
        "meaning": "mahasiswa, siswa"
      },
      {
        "word": "大学",
        "kana": "だいがく",
        "meaning": "universitas"
      },
      {
        "word": "学校",
        "kana": "がっこう",
        "meaning": "sekolah"
      },
      {
        "word": "留学生",
        "kana": "りゅうがくせい",
        "meaning": "pelajar asing, mahasiswa asing"
      }
    ],
    "prompts": [
      {
        "id": "学_学生_1",
        "word": "学生",
        "fullKana": "がくせい",
        "prefixKana": "",
        "targetKana": "がく",
        "suffixKana": "せい",
        "meaning": "mahasiswa, siswa",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "学_大学_2",
        "word": "大学",
        "fullKana": "だいがく",
        "prefixKana": "だい",
        "targetKana": "がく",
        "suffixKana": "",
        "meaning": "universitas",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "学_学校_3",
        "word": "学校",
        "fullKana": "がっこう",
        "prefixKana": "",
        "targetKana": "がっ",
        "suffixKana": "こう",
        "meaning": "sekolah",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "学_留学生_4",
        "word": "留学生",
        "fullKana": "りゅうがくせい",
        "prefixKana": "りゅう",
        "targetKana": "がく",
        "suffixKana": "せい",
        "meaning": "pelajar asing, mahasiswa asing",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      },
      {
        "id": "学_見学します_5",
        "word": "見学します",
        "fullKana": "けんがくします",
        "prefixKana": "けん",
        "targetKana": "がく",
        "suffixKana": "します",
        "meaning": "mengunjungi, studi banding",
        "lesson": "Pelajaran 16",
        "lessonNumber": 16
      },
      {
        "id": "学_留学します_6",
        "word": "留学します",
        "fullKana": "りゅうがくします",
        "prefixKana": "りゅう",
        "targetKana": "がく",
        "suffixKana": "します",
        "meaning": "studi di luar negeri",
        "lesson": "Pelajaran 21",
        "lessonNumber": 21
      }
    ]
  },
  {
    "kanji": "国",
    "primaryLesson": "Pelajaran 1",
    "primaryLessonNumber": 1,
    "meaning": "Negara",
    "onyomi": [
      "コク"
    ],
    "kunyomi": [
      "くに"
    ],
    "examples": [
      {
        "word": "韓国",
        "kana": "かんこく",
        "meaning": "Korea Selatan"
      },
      {
        "word": "中国",
        "kana": "ちゅうごく",
        "meaning": "Cina"
      },
      {
        "word": "お国",
        "kana": "おくに",
        "meaning": "negara, negeri"
      },
      {
        "word": "外国",
        "kana": "がいこく",
        "meaning": "luar negeri"
      }
    ],
    "prompts": [
      {
        "id": "国_韓国_1",
        "word": "韓国",
        "fullKana": "かんこく",
        "prefixKana": "かん",
        "targetKana": "こく",
        "suffixKana": "",
        "meaning": "Korea Selatan",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "国_中国_2",
        "word": "中国",
        "fullKana": "ちゅうごく",
        "prefixKana": "ちゅう",
        "targetKana": "ごく",
        "suffixKana": "",
        "meaning": "Cina",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "国_お国_3",
        "word": "お国",
        "fullKana": "おくに",
        "prefixKana": "お",
        "targetKana": "くに",
        "suffixKana": "",
        "meaning": "negara, negeri",
        "lesson": "Pelajaran 3",
        "lessonNumber": 3
      },
      {
        "id": "国_外国_4",
        "word": "外国",
        "fullKana": "がいこく",
        "prefixKana": "がい",
        "targetKana": "こく",
        "suffixKana": "",
        "meaning": "luar negeri",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      }
    ]
  },
  {
    "kanji": "本",
    "primaryLesson": "Pelajaran 1",
    "primaryLessonNumber": 1,
    "meaning": "Buku / Asal",
    "onyomi": [
      "ホン"
    ],
    "kunyomi": [
      "もと"
    ],
    "examples": [
      {
        "word": "日本",
        "kana": "にほん",
        "meaning": "Jepang"
      },
      {
        "word": "本",
        "kana": "ほん",
        "meaning": "buku"
      },
      {
        "word": "日本語",
        "kana": "にほんご",
        "meaning": "bahasa Jepang"
      }
    ],
    "prompts": [
      {
        "id": "本_日本_1",
        "word": "日本",
        "fullKana": "にほん",
        "prefixKana": "に",
        "targetKana": "ほん",
        "suffixKana": "",
        "meaning": "Jepang",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "本_本_2",
        "word": "本",
        "fullKana": "ほん",
        "prefixKana": "",
        "targetKana": "ほん",
        "suffixKana": "",
        "meaning": "buku",
        "lesson": "Pelajaran 2",
        "lessonNumber": 2
      },
      {
        "id": "本_日本語_3",
        "word": "日本語",
        "fullKana": "にほんご",
        "prefixKana": "に",
        "targetKana": "ほん",
        "suffixKana": "ご",
        "meaning": "bahasa Jepang",
        "lesson": "Pelajaran 2",
        "lessonNumber": 2
      }
    ]
  },
  {
    "kanji": "社",
    "primaryLesson": "Pelajaran 1",
    "primaryLessonNumber": 1,
    "meaning": "Perusahaan / Kuil",
    "onyomi": [
      "シャ"
    ],
    "kunyomi": [
      "やしろ"
    ],
    "examples": [
      {
        "word": "会社員",
        "kana": "かいしゃいん",
        "meaning": "karyawan perusahaan"
      },
      {
        "word": "社員",
        "kana": "しゃいん",
        "meaning": "karyawan perusahaan (dengan nama kantor)"
      },
      {
        "word": "会社",
        "kana": "かいしゃ",
        "meaning": "perusahaan"
      },
      {
        "word": "社長",
        "kana": "しゃちょう",
        "meaning": "direktur utama, presiden direktur"
      }
    ],
    "prompts": [
      {
        "id": "社_会社員_1",
        "word": "会社員",
        "fullKana": "かいしゃいん",
        "prefixKana": "かい",
        "targetKana": "しゃ",
        "suffixKana": "いん",
        "meaning": "karyawan perusahaan",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "社_社員_2",
        "word": "社員",
        "fullKana": "しゃいん",
        "prefixKana": "",
        "targetKana": "しゃ",
        "suffixKana": "いん",
        "meaning": "karyawan perusahaan (dengan nama kantor)",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "社_会社_3",
        "word": "会社",
        "fullKana": "かいしゃ",
        "prefixKana": "かい",
        "targetKana": "しゃ",
        "suffixKana": "",
        "meaning": "perusahaan",
        "lesson": "Pelajaran 3",
        "lessonNumber": 3
      },
      {
        "id": "社_社長_4",
        "word": "社長",
        "fullKana": "しゃちょう",
        "prefixKana": "",
        "targetKana": "しゃ",
        "suffixKana": "ちょう",
        "meaning": "direktur utama, presiden direktur",
        "lesson": "Pelajaran 18",
        "lessonNumber": 18
      }
    ]
  },
  {
    "kanji": "会",
    "primaryLesson": "Pelajaran 1",
    "primaryLessonNumber": 1,
    "meaning": "Bertemu / Perkumpulan",
    "onyomi": [
      "カイ",
      "エ"
    ],
    "kunyomi": [
      "あう"
    ],
    "examples": [
      {
        "word": "会社員",
        "kana": "かいしゃいん",
        "meaning": "karyawan perusahaan"
      },
      {
        "word": "会議室",
        "kana": "かいぎしつ",
        "meaning": "ruang rapat"
      },
      {
        "word": "会社",
        "kana": "かいしゃ",
        "meaning": "perusahaan"
      },
      {
        "word": "会議",
        "kana": "かいぎ",
        "meaning": "rapat"
      }
    ],
    "prompts": [
      {
        "id": "会_会社員_1",
        "word": "会社員",
        "fullKana": "かいしゃいん",
        "prefixKana": "",
        "targetKana": "かい",
        "suffixKana": "しゃいん",
        "meaning": "karyawan perusahaan",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "会_会議室_2",
        "word": "会議室",
        "fullKana": "かいぎしつ",
        "prefixKana": "",
        "targetKana": "かい",
        "suffixKana": "ぎしつ",
        "meaning": "ruang rapat",
        "lesson": "Pelajaran 3",
        "lessonNumber": 3
      },
      {
        "id": "会_会社_3",
        "word": "会社",
        "fullKana": "かいしゃ",
        "prefixKana": "",
        "targetKana": "かい",
        "suffixKana": "しゃ",
        "meaning": "perusahaan",
        "lesson": "Pelajaran 3",
        "lessonNumber": 3
      },
      {
        "id": "会_会議_4",
        "word": "会議",
        "fullKana": "かいぎ",
        "prefixKana": "",
        "targetKana": "かい",
        "suffixKana": "ぎ",
        "meaning": "rapat",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      }
    ]
  },
  {
    "kanji": "名",
    "primaryLesson": "Pelajaran 1",
    "primaryLessonNumber": 1,
    "meaning": "Nama / Terkenal",
    "onyomi": [
      "メイ",
      "ミョウ"
    ],
    "kunyomi": [
      "な"
    ],
    "examples": [
      {
        "word": "お名前は？",
        "kana": "おなまえは？",
        "meaning": "Siapa namanya?"
      },
      {
        "word": "名刺",
        "kana": "めいし",
        "meaning": "kartu nama"
      },
      {
        "word": "有名な",
        "kana": "ゆうめい",
        "meaning": "terkenal"
      }
    ],
    "prompts": [
      {
        "id": "名_お名前は？_1",
        "word": "お名前は？",
        "fullKana": "おなまえは？",
        "prefixKana": "お",
        "targetKana": "な",
        "suffixKana": "まえは？",
        "meaning": "Siapa namanya?",
        "lesson": "Pelajaran 1",
        "lessonNumber": 1
      },
      {
        "id": "名_名刺_2",
        "word": "名刺",
        "fullKana": "めいし",
        "prefixKana": "",
        "targetKana": "めい",
        "suffixKana": "し",
        "meaning": "kartu nama",
        "lesson": "Pelajaran 2",
        "lessonNumber": 2
      },
      {
        "id": "名_有名な_3",
        "word": "有名な",
        "fullKana": "ゆうめい",
        "prefixKana": "ゆう",
        "targetKana": "めい",
        "suffixKana": "",
        "meaning": "terkenal",
        "lesson": "Pelajaran 8",
        "lessonNumber": 8
      }
    ]
  },
  {
    "kanji": "手",
    "primaryLesson": "Pelajaran 2",
    "primaryLessonNumber": 2,
    "meaning": "Tangan",
    "onyomi": [
      "シュ"
    ],
    "kunyomi": [
      "て"
    ],
    "examples": [
      {
        "word": "手帳",
        "kana": "てちょう",
        "meaning": "buku agenda"
      },
      {
        "word": "お手洗い",
        "kana": "おてあらい",
        "meaning": "kamar kecil, toilet (sopan)"
      },
      {
        "word": "手紙",
        "kana": "てがみ",
        "meaning": "surat"
      },
      {
        "word": "手",
        "kana": "て",
        "meaning": "tangan"
      }
    ],
    "prompts": [
      {
        "id": "手_手帳_1",
        "word": "手帳",
        "fullKana": "てちょう",
        "prefixKana": "",
        "targetKana": "て",
        "suffixKana": "ちょう",
        "meaning": "buku agenda",
        "lesson": "Pelajaran 2",
        "lessonNumber": 2
      },
      {
        "id": "手_お手洗い_2",
        "word": "お手洗い",
        "fullKana": "おてあらい",
        "prefixKana": "お",
        "targetKana": "て",
        "suffixKana": "あらい",
        "meaning": "kamar kecil, toilet (sopan)",
        "lesson": "Pelajaran 3",
        "lessonNumber": 3
      },
      {
        "id": "手_手紙_3",
        "word": "手紙",
        "fullKana": "てがみ",
        "prefixKana": "",
        "targetKana": "て",
        "suffixKana": "がみ",
        "meaning": "surat",
        "lesson": "Pelajaran 6",
        "lessonNumber": 6
      },
      {
        "id": "手_手_4",
        "word": "手",
        "fullKana": "て",
        "prefixKana": "",
        "targetKana": "て",
        "suffixKana": "",
        "meaning": "tangan",
        "lesson": "Pelajaran 7",
        "lessonNumber": 7
      },
      {
        "id": "手_下手な_5",
        "word": "下手な",
        "fullKana": "へた",
        "prefixKana": "へ",
        "targetKana": "た",
        "suffixKana": "",
        "meaning": "tidak pandai, kurang mahir",
        "lesson": "Pelajaran 9",
        "lessonNumber": 9
      },
      {
        "id": "手_切手_6",
        "word": "切手",
        "fullKana": "きって",
        "prefixKana": "きっ",
        "targetKana": "て",
        "suffixKana": "",
        "meaning": "perangko",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      },
      {
        "id": "手_手伝います_7",
        "word": "手伝います",
        "fullKana": "てつだいます",
        "prefixKana": "",
        "targetKana": "て",
        "suffixKana": "つだいます",
        "meaning": "membantu, menolong",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      }
    ]
  },
  {
    "kanji": "新",
    "primaryLesson": "Pelajaran 2",
    "primaryLessonNumber": 2,
    "meaning": "Baru",
    "onyomi": [
      "シン"
    ],
    "kunyomi": [
      "あたらしい"
    ],
    "examples": [
      {
        "word": "新聞",
        "kana": "しんぶん",
        "meaning": "koran, surat kabar"
      },
      {
        "word": "新幹線",
        "kana": "しんかんせん",
        "meaning": "Shinkansen, kereta cepat"
      },
      {
        "word": "新しい",
        "kana": "あたらしい",
        "meaning": "baru"
      }
    ],
    "prompts": [
      {
        "id": "新_新聞_1",
        "word": "新聞",
        "fullKana": "しんぶん",
        "prefixKana": "",
        "targetKana": "しん",
        "suffixKana": "ぶん",
        "meaning": "koran, surat kabar",
        "lesson": "Pelajaran 2",
        "lessonNumber": 2
      },
      {
        "id": "新_新幹線_2",
        "word": "新幹線",
        "fullKana": "しんかんせん",
        "prefixKana": "",
        "targetKana": "しん",
        "suffixKana": "かんせん",
        "meaning": "Shinkansen, kereta cepat",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "新_新しい_3",
        "word": "新しい",
        "fullKana": "あたらしい",
        "prefixKana": "",
        "targetKana": "あたら",
        "suffixKana": "しい",
        "meaning": "baru",
        "lesson": "Pelajaran 8",
        "lessonNumber": 8
      }
    ]
  },
  {
    "kanji": "聞",
    "primaryLesson": "Pelajaran 2",
    "primaryLessonNumber": 2,
    "meaning": "Mendengar / Bertanya",
    "onyomi": [
      "ブン",
      "モン"
    ],
    "kunyomi": [
      "きく",
      "きこえる"
    ],
    "examples": [
      {
        "word": "新聞",
        "kana": "しんぶん",
        "meaning": "koran, surat kabar"
      },
      {
        "word": "聞きます",
        "kana": "ききます",
        "meaning": "bertanya kepada guru [せんせいに～]"
      }
    ],
    "prompts": [
      {
        "id": "聞_新聞_1",
        "word": "新聞",
        "fullKana": "しんぶん",
        "prefixKana": "しん",
        "targetKana": "ぶん",
        "suffixKana": "",
        "meaning": "koran, surat kabar",
        "lesson": "Pelajaran 2",
        "lessonNumber": 2
      },
      {
        "id": "聞_聞きます_2",
        "word": "聞きます",
        "fullKana": "ききます",
        "prefixKana": "",
        "targetKana": "き",
        "suffixKana": "きます",
        "meaning": "bertanya kepada guru [せんせいに～]",
        "lesson": "Pelajaran 23",
        "lessonNumber": 23
      }
    ]
  },
  {
    "kanji": "書",
    "primaryLesson": "Pelajaran 2",
    "primaryLessonNumber": 2,
    "meaning": "Menulis / Dokumen",
    "onyomi": [
      "ショ"
    ],
    "kunyomi": [
      "かく"
    ],
    "examples": [
      {
        "word": "辞書",
        "kana": "じしょ",
        "meaning": "kamus"
      },
      {
        "word": "図書館",
        "kana": "としょかん",
        "meaning": "perpustakaan"
      }
    ],
    "prompts": [
      {
        "id": "書_辞書_1",
        "word": "辞書",
        "fullKana": "じしょ",
        "prefixKana": "じ",
        "targetKana": "しょ",
        "suffixKana": "",
        "meaning": "kamus",
        "lesson": "Pelajaran 2",
        "lessonNumber": 2
      },
      {
        "id": "書_図書館_2",
        "word": "図書館",
        "fullKana": "としょかん",
        "prefixKana": "としょ",
        "targetKana": "か",
        "suffixKana": "ん",
        "meaning": "perpustakaan",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      }
    ]
  },
  {
    "kanji": "語",
    "primaryLesson": "Pelajaran 2",
    "primaryLessonNumber": 2,
    "meaning": "Bahasa / Kata",
    "onyomi": [
      "ゴ"
    ],
    "kunyomi": [
      "かたる"
    ],
    "examples": [
      {
        "word": "～語",
        "kana": "～ご",
        "meaning": "bahasa ~"
      },
      {
        "word": "英語",
        "kana": "えいご",
        "meaning": "bahasa Inggris"
      },
      {
        "word": "日本語",
        "kana": "にほんご",
        "meaning": "bahasa Jepang"
      }
    ],
    "prompts": [
      {
        "id": "語_～語_1",
        "word": "～語",
        "fullKana": "～ご",
        "prefixKana": "～",
        "targetKana": "ご",
        "suffixKana": "",
        "meaning": "bahasa ~",
        "lesson": "Pelajaran 2",
        "lessonNumber": 2
      },
      {
        "id": "語_英語_2",
        "word": "英語",
        "fullKana": "えいご",
        "prefixKana": "えい",
        "targetKana": "ご",
        "suffixKana": "",
        "meaning": "bahasa Inggris",
        "lesson": "Pelajaran 2",
        "lessonNumber": 2
      },
      {
        "id": "語_日本語_3",
        "word": "日本語",
        "fullKana": "にほんご",
        "prefixKana": "にほん",
        "targetKana": "ご",
        "suffixKana": "",
        "meaning": "bahasa Jepang",
        "lesson": "Pelajaran 2",
        "lessonNumber": 2
      }
    ]
  },
  {
    "kanji": "車",
    "primaryLesson": "Pelajaran 2",
    "primaryLessonNumber": 2,
    "meaning": "Mobil / Roda",
    "onyomi": [
      "シャ"
    ],
    "kunyomi": [
      "くるま"
    ],
    "examples": [
      {
        "word": "車",
        "kana": "くるま",
        "meaning": "mobil"
      },
      {
        "word": "電車",
        "kana": "でんしゃ",
        "meaning": "kereta rel listrik"
      },
      {
        "word": "自転車",
        "kana": "じてんしゃ",
        "meaning": "sepeda"
      },
      {
        "word": "駐車場",
        "kana": "ちゅうしゃじょう",
        "meaning": "tempat parkir"
      }
    ],
    "prompts": [
      {
        "id": "車_車_1",
        "word": "車",
        "fullKana": "くるま",
        "prefixKana": "",
        "targetKana": "くるま",
        "suffixKana": "",
        "meaning": "mobil",
        "lesson": "Pelajaran 2",
        "lessonNumber": 2
      },
      {
        "id": "車_電車_2",
        "word": "電車",
        "fullKana": "でんしゃ",
        "prefixKana": "でん",
        "targetKana": "しゃ",
        "suffixKana": "",
        "meaning": "kereta rel listrik",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "車_自転車_3",
        "word": "自転車",
        "fullKana": "じてんしゃ",
        "prefixKana": "じてん",
        "targetKana": "しゃ",
        "suffixKana": "",
        "meaning": "sepeda",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "車_駐車場_4",
        "word": "駐車場",
        "fullKana": "ちゅうしゃじょう",
        "prefixKana": "ちゅう",
        "targetKana": "しゃ",
        "suffixKana": "じょう",
        "meaning": "tempat parkir",
        "lesson": "Pelajaran 23",
        "lessonNumber": 23
      }
    ]
  },
  {
    "kanji": "百",
    "primaryLesson": "Pelajaran 3",
    "primaryLessonNumber": 3,
    "meaning": "Ratus / Ratusan",
    "onyomi": [
      "ヒャク"
    ],
    "kunyomi": [],
    "examples": [
      {
        "word": "百",
        "kana": "ひゃく",
        "meaning": "ratus, seratus"
      }
    ],
    "prompts": [
      {
        "id": "百_百_1",
        "word": "百",
        "fullKana": "ひゃく",
        "prefixKana": "",
        "targetKana": "ひゃく",
        "suffixKana": "",
        "meaning": "ratus, seratus",
        "lesson": "Pelajaran 3",
        "lessonNumber": 3
      }
    ]
  },
  {
    "kanji": "千",
    "primaryLesson": "Pelajaran 3",
    "primaryLessonNumber": 3,
    "meaning": "Ribu / Ribuan",
    "onyomi": [
      "セン"
    ],
    "kunyomi": [
      "ち"
    ],
    "examples": [
      {
        "word": "千",
        "kana": "せん",
        "meaning": "ribu, seribu"
      }
    ],
    "prompts": [
      {
        "id": "千_千_1",
        "word": "千",
        "fullKana": "せん",
        "prefixKana": "",
        "targetKana": "せん",
        "suffixKana": "",
        "meaning": "ribu, seribu",
        "lesson": "Pelajaran 3",
        "lessonNumber": 3
      }
    ]
  },
  {
    "kanji": "万",
    "primaryLesson": "Pelajaran 3",
    "primaryLessonNumber": 3,
    "meaning": "Puluh Ribu (10.000)",
    "onyomi": [
      "マン",
      "バン"
    ],
    "kunyomi": [],
    "examples": [
      {
        "word": "万",
        "kana": "まん",
        "meaning": "puluh ribu (10.000)"
      }
    ],
    "prompts": [
      {
        "id": "万_万_1",
        "word": "万",
        "fullKana": "まん",
        "prefixKana": "",
        "targetKana": "まん",
        "suffixKana": "",
        "meaning": "puluh ribu (10.000)",
        "lesson": "Pelajaran 3",
        "lessonNumber": 3
      }
    ]
  },
  {
    "kanji": "円",
    "primaryLesson": "Pelajaran 3",
    "primaryLessonNumber": 3,
    "meaning": "Yen / Lingkaran",
    "onyomi": [
      "エン"
    ],
    "kunyomi": [
      "まるい"
    ],
    "examples": [
      {
        "word": "～円",
        "kana": "～えん",
        "meaning": "~ yen"
      }
    ],
    "prompts": [
      {
        "id": "円_～円_1",
        "word": "～円",
        "fullKana": "～えん",
        "prefixKana": "～",
        "targetKana": "えん",
        "suffixKana": "",
        "meaning": "~ yen",
        "lesson": "Pelajaran 3",
        "lessonNumber": 3
      }
    ]
  },
  {
    "kanji": "下",
    "primaryLesson": "Pelajaran 3",
    "primaryLessonNumber": 3,
    "meaning": "Bawah",
    "onyomi": [
      "カ",
      "ゲ"
    ],
    "kunyomi": [
      "した",
      "さがる",
      "くだる"
    ],
    "examples": [
      {
        "word": "地下",
        "kana": "ちか",
        "meaning": "bawah tanah, basement"
      },
      {
        "word": "地下鉄",
        "kana": "ちかてつ",
        "meaning": "kereta bawah tanah"
      },
      {
        "word": "下",
        "kana": "した",
        "meaning": "bawah"
      },
      {
        "word": "下ろします",
        "kana": "おろします",
        "meaning": "menarik uang (dari bank)"
      }
    ],
    "prompts": [
      {
        "id": "下_地下_1",
        "word": "地下",
        "fullKana": "ちか",
        "prefixKana": "ち",
        "targetKana": "か",
        "suffixKana": "",
        "meaning": "bawah tanah, basement",
        "lesson": "Pelajaran 3",
        "lessonNumber": 3
      },
      {
        "id": "下_地下鉄_2",
        "word": "地下鉄",
        "fullKana": "ちかてつ",
        "prefixKana": "ち",
        "targetKana": "か",
        "suffixKana": "てつ",
        "meaning": "kereta bawah tanah",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "下_下_3",
        "word": "下",
        "fullKana": "した",
        "prefixKana": "",
        "targetKana": "した",
        "suffixKana": "",
        "meaning": "bawah",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      },
      {
        "id": "下_下ろします_4",
        "word": "下ろします",
        "fullKana": "おろします",
        "prefixKana": "",
        "targetKana": "お",
        "suffixKana": "ろします",
        "meaning": "menarik uang (dari bank)",
        "lesson": "Pelajaran 16",
        "lessonNumber": 16
      }
    ]
  },
  {
    "kanji": "食",
    "primaryLesson": "Pelajaran 3",
    "primaryLessonNumber": 3,
    "meaning": "Makan / Makanan",
    "onyomi": [
      "ショク"
    ],
    "kunyomi": [
      "たべる",
      "くらう"
    ],
    "examples": [
      {
        "word": "食堂",
        "kana": "しょくどう",
        "meaning": "ruang makan, kantin"
      },
      {
        "word": "食べ物",
        "kana": "たべもの",
        "meaning": "makanan"
      },
      {
        "word": "食事します",
        "kana": "しょくじします",
        "meaning": "makan (bersama)"
      }
    ],
    "prompts": [
      {
        "id": "食_食堂_1",
        "word": "食堂",
        "fullKana": "しょくどう",
        "prefixKana": "",
        "targetKana": "しょく",
        "suffixKana": "どう",
        "meaning": "ruang makan, kantin",
        "lesson": "Pelajaran 3",
        "lessonNumber": 3
      },
      {
        "id": "食_食べ物_2",
        "word": "食べ物",
        "fullKana": "たべもの",
        "prefixKana": "",
        "targetKana": "た",
        "suffixKana": "べもの",
        "meaning": "makanan",
        "lesson": "Pelajaran 8",
        "lessonNumber": 8
      },
      {
        "id": "食_食事します_3",
        "word": "食事します",
        "fullKana": "しょくじします",
        "prefixKana": "",
        "targetKana": "しょく",
        "suffixKana": "じします",
        "meaning": "makan (bersama)",
        "lesson": "Pelajaran 13",
        "lessonNumber": 13
      }
    ]
  },
  {
    "kanji": "話",
    "primaryLesson": "Pelajaran 3",
    "primaryLessonNumber": 3,
    "meaning": "Bicara / Cerita",
    "onyomi": [
      "ワ"
    ],
    "kunyomi": [
      "はなす",
      "はなし"
    ],
    "examples": [
      {
        "word": "電話",
        "kana": "でんわ",
        "meaning": "telepon"
      },
      {
        "word": "話します",
        "kana": "はなします",
        "meaning": "berbicara"
      },
      {
        "word": "いろいろお世話になりました",
        "kana": "いろいろおせわになりました",
        "meaning": "Terima kasih banyak atas segala bantuannya"
      }
    ],
    "prompts": [
      {
        "id": "話_電話_1",
        "word": "電話",
        "fullKana": "でんわ",
        "prefixKana": "でん",
        "targetKana": "わ",
        "suffixKana": "",
        "meaning": "telepon",
        "lesson": "Pelajaran 3",
        "lessonNumber": 3
      },
      {
        "id": "話_話します_2",
        "word": "話します",
        "fullKana": "はなします",
        "prefixKana": "",
        "targetKana": "はな",
        "suffixKana": "します",
        "meaning": "berbicara",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      },
      {
        "id": "話_いろいろお世話になりました_3",
        "word": "いろいろお世話になりました",
        "fullKana": "いろいろおせわになりました",
        "prefixKana": "いろいろおせ",
        "targetKana": "わ",
        "suffixKana": "になりました",
        "meaning": "Terima kasih banyak atas segala bantuannya",
        "lesson": "Pelajaran 25",
        "lessonNumber": 25
      }
    ]
  },
  {
    "kanji": "電",
    "primaryLesson": "Pelajaran 3",
    "primaryLessonNumber": 3,
    "meaning": "Listrik",
    "onyomi": [
      "デン"
    ],
    "kunyomi": [],
    "examples": [
      {
        "word": "電話",
        "kana": "でんわ",
        "meaning": "telepon"
      },
      {
        "word": "電車",
        "kana": "でんしゃ",
        "meaning": "kereta rel listrik"
      },
      {
        "word": "電池",
        "kana": "でんち",
        "meaning": "baterai"
      },
      {
        "word": "電気",
        "kana": "でんき",
        "meaning": "listrik, lampu"
      }
    ],
    "prompts": [
      {
        "id": "電_電話_1",
        "word": "電話",
        "fullKana": "でんわ",
        "prefixKana": "",
        "targetKana": "でん",
        "suffixKana": "わ",
        "meaning": "telepon",
        "lesson": "Pelajaran 3",
        "lessonNumber": 3
      },
      {
        "id": "電_電車_2",
        "word": "電車",
        "fullKana": "でんしゃ",
        "prefixKana": "",
        "targetKana": "でん",
        "suffixKana": "しゃ",
        "meaning": "kereta rel listrik",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "電_電池_3",
        "word": "電池",
        "fullKana": "でんち",
        "prefixKana": "",
        "targetKana": "でん",
        "suffixKana": "ち",
        "meaning": "baterai",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      },
      {
        "id": "電_電気_4",
        "word": "電気",
        "fullKana": "でんき",
        "prefixKana": "",
        "targetKana": "でん",
        "suffixKana": "き",
        "meaning": "listrik, lampu",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      }
    ]
  },
  {
    "kanji": "月",
    "primaryLesson": "Pelajaran 4",
    "primaryLessonNumber": 4,
    "meaning": "Bulan",
    "onyomi": [
      "ゲツ",
      "ガツ"
    ],
    "kunyomi": [
      "つき"
    ],
    "examples": [
      {
        "word": "月曜日",
        "kana": "げつようび",
        "meaning": "hari Senin"
      },
      {
        "word": "先月",
        "kana": "せんげつ",
        "meaning": "bulan lalu"
      },
      {
        "word": "今月",
        "kana": "こんげつ",
        "meaning": "bulan ini"
      },
      {
        "word": "来月",
        "kana": "らいげつ",
        "meaning": "bulan depan"
      }
    ],
    "prompts": [
      {
        "id": "月_月曜日_1",
        "word": "月曜日",
        "fullKana": "げつようび",
        "prefixKana": "",
        "targetKana": "げつ",
        "suffixKana": "ようび",
        "meaning": "hari Senin",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "月_先月_2",
        "word": "先月",
        "fullKana": "せんげつ",
        "prefixKana": "せん",
        "targetKana": "げつ",
        "suffixKana": "",
        "meaning": "bulan lalu",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "月_今月_3",
        "word": "今月",
        "fullKana": "こんげつ",
        "prefixKana": "こん",
        "targetKana": "げつ",
        "suffixKana": "",
        "meaning": "bulan ini",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "月_来月_4",
        "word": "来月",
        "fullKana": "らいげつ",
        "prefixKana": "らい",
        "targetKana": "げつ",
        "suffixKana": "",
        "meaning": "bulan depan",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "月_～か月_5",
        "word": "～か月",
        "fullKana": "～かげつ",
        "prefixKana": "～か",
        "targetKana": "げつ",
        "suffixKana": "",
        "meaning": "durasi bulan",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      }
    ]
  },
  {
    "kanji": "火",
    "primaryLesson": "Pelajaran 4",
    "primaryLessonNumber": 4,
    "meaning": "Api",
    "onyomi": [
      "カ"
    ],
    "kunyomi": [
      "ひ",
      "ほ"
    ],
    "examples": [
      {
        "word": "火曜日",
        "kana": "かようび",
        "meaning": "hari Selasa"
      }
    ],
    "prompts": [
      {
        "id": "火_火曜日_1",
        "word": "火曜日",
        "fullKana": "かようび",
        "prefixKana": "",
        "targetKana": "か",
        "suffixKana": "ようび",
        "meaning": "hari Selasa",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      }
    ]
  },
  {
    "kanji": "水",
    "primaryLesson": "Pelajaran 4",
    "primaryLessonNumber": 4,
    "meaning": "Air",
    "onyomi": [
      "スイ"
    ],
    "kunyomi": [
      "みず"
    ],
    "examples": [
      {
        "word": "水曜日",
        "kana": "すいようび",
        "meaning": "hari Rabu"
      },
      {
        "word": "水",
        "kana": "みず",
        "meaning": "air"
      }
    ],
    "prompts": [
      {
        "id": "水_水曜日_1",
        "word": "水曜日",
        "fullKana": "すいようび",
        "prefixKana": "",
        "targetKana": "すい",
        "suffixKana": "ようび",
        "meaning": "hari Rabu",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "水_水_2",
        "word": "水",
        "fullKana": "みず",
        "prefixKana": "",
        "targetKana": "みず",
        "suffixKana": "",
        "meaning": "air",
        "lesson": "Pelajaran 6",
        "lessonNumber": 6
      }
    ]
  },
  {
    "kanji": "木",
    "primaryLesson": "Pelajaran 4",
    "primaryLessonNumber": 4,
    "meaning": "Pohon / Kayu",
    "onyomi": [
      "モク",
      "ボク"
    ],
    "kunyomi": [
      "き",
      "こ"
    ],
    "examples": [
      {
        "word": "木曜日",
        "kana": "もくようび",
        "meaning": "hari Kamis"
      },
      {
        "word": "木",
        "kana": "き",
        "meaning": "pohon, kayu"
      }
    ],
    "prompts": [
      {
        "id": "木_木曜日_1",
        "word": "木曜日",
        "fullKana": "もくようび",
        "prefixKana": "",
        "targetKana": "もく",
        "suffixKana": "ようび",
        "meaning": "hari Kamis",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "木_木_2",
        "word": "木",
        "fullKana": "き",
        "prefixKana": "",
        "targetKana": "き",
        "suffixKana": "",
        "meaning": "pohon, kayu",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      }
    ]
  },
  {
    "kanji": "金",
    "primaryLesson": "Pelajaran 4",
    "primaryLessonNumber": 4,
    "meaning": "Uang / Emas / Logam",
    "onyomi": [
      "キン",
      "コン"
    ],
    "kunyomi": [
      "かね"
    ],
    "examples": [
      {
        "word": "金曜日",
        "kana": "きんようび",
        "meaning": "hari Jumat"
      },
      {
        "word": "細かいお金",
        "kana": "こまかいおかね",
        "meaning": "uang kecil, receh"
      },
      {
        "word": "現金",
        "kana": "げんきん",
        "meaning": "uang tunai, cash"
      }
    ],
    "prompts": [
      {
        "id": "金_金曜日_1",
        "word": "金曜日",
        "fullKana": "きんようび",
        "prefixKana": "",
        "targetKana": "きん",
        "suffixKana": "ようび",
        "meaning": "hari Jumat",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "金_細かいお金_2",
        "word": "細かいお金",
        "fullKana": "こまかいおかね",
        "prefixKana": "こまかいお",
        "targetKana": "かね",
        "suffixKana": "",
        "meaning": "uang kecil, receh",
        "lesson": "Pelajaran 9",
        "lessonNumber": 9
      },
      {
        "id": "金_現金_3",
        "word": "現金",
        "fullKana": "げんきん",
        "prefixKana": "げん",
        "targetKana": "きん",
        "suffixKana": "",
        "meaning": "uang tunai, cash",
        "lesson": "Pelajaran 18",
        "lessonNumber": 18
      }
    ]
  },
  {
    "kanji": "土",
    "primaryLesson": "Pelajaran 4",
    "primaryLessonNumber": 4,
    "meaning": "Tanah",
    "onyomi": [
      "ド",
      "ト"
    ],
    "kunyomi": [
      "つち"
    ],
    "examples": [
      {
        "word": "土曜日",
        "kana": "どようび",
        "meaning": "hari Sabtu"
      }
    ],
    "prompts": [
      {
        "id": "土_土曜日_1",
        "word": "土曜日",
        "fullKana": "どようび",
        "prefixKana": "",
        "targetKana": "ど",
        "suffixKana": "ようび",
        "meaning": "hari Sabtu",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      }
    ]
  },
  {
    "kanji": "時",
    "primaryLesson": "Pelajaran 4",
    "primaryLessonNumber": 4,
    "meaning": "Waktu / Jam",
    "onyomi": [
      "ジ"
    ],
    "kunyomi": [
      "とき"
    ],
    "examples": [
      {
        "word": "何時",
        "kana": "なんじ",
        "meaning": "jam berapa"
      },
      {
        "word": "～時",
        "kana": "～じ",
        "meaning": "jam ~, pukul ~"
      },
      {
        "word": "時々",
        "kana": "ときどき",
        "meaning": "kadang-kadang"
      },
      {
        "word": "時間",
        "kana": "じかん",
        "meaning": "jam, waktu"
      }
    ],
    "prompts": [
      {
        "id": "時_何時_1",
        "word": "何時",
        "fullKana": "なんじ",
        "prefixKana": "なん",
        "targetKana": "じ",
        "suffixKana": "",
        "meaning": "jam berapa",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "時_～時_2",
        "word": "～時",
        "fullKana": "～じ",
        "prefixKana": "～",
        "targetKana": "じ",
        "suffixKana": "",
        "meaning": "jam ~, pukul ~",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "時_時々_3",
        "word": "時々",
        "fullKana": "ときどき",
        "prefixKana": "",
        "targetKana": "とき",
        "suffixKana": "どき",
        "meaning": "kadang-kadang",
        "lesson": "Pelajaran 6",
        "lessonNumber": 6
      },
      {
        "id": "時_時間_4",
        "word": "時間",
        "fullKana": "じかん",
        "prefixKana": "",
        "targetKana": "じ",
        "suffixKana": "かん",
        "meaning": "jam, waktu",
        "lesson": "Pelajaran 9",
        "lessonNumber": 9
      },
      {
        "id": "時_～時間_5",
        "word": "～時間",
        "fullKana": "～じかん",
        "prefixKana": "～",
        "targetKana": "じ",
        "suffixKana": "かん",
        "meaning": "durasi jam",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      },
      {
        "id": "時_時刻表_6",
        "word": "時刻表",
        "fullKana": "じこくひょう",
        "prefixKana": "",
        "targetKana": "じ",
        "suffixKana": "こくひょう",
        "meaning": "jadwal waktu",
        "lesson": "Pelajaran 15",
        "lessonNumber": 15
      }
    ]
  },
  {
    "kanji": "分",
    "primaryLesson": "Pelajaran 4",
    "primaryLessonNumber": 4,
    "meaning": "Menit / Membagi",
    "onyomi": [
      "ブン",
      "フン",
      "プン"
    ],
    "kunyomi": [
      "わける"
    ],
    "examples": [
      {
        "word": "～分",
        "kana": "～ふん",
        "meaning": "menit"
      },
      {
        "word": "自分で",
        "kana": "じぶんで",
        "meaning": "dengan sendiri, sendiri"
      }
    ],
    "prompts": [
      {
        "id": "分_～分_1",
        "word": "～分",
        "fullKana": "～ふん",
        "prefixKana": "～",
        "targetKana": "ふん",
        "suffixKana": "",
        "meaning": "menit",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "分_自分で_2",
        "word": "自分で",
        "fullKana": "じぶんで",
        "prefixKana": "じ",
        "targetKana": "ぶん",
        "suffixKana": "で",
        "meaning": "dengan sendiri, sendiri",
        "lesson": "Pelajaran 24",
        "lessonNumber": 24
      }
    ]
  },
  {
    "kanji": "今",
    "primaryLesson": "Pelajaran 4",
    "primaryLessonNumber": 4,
    "meaning": "Sekarang",
    "onyomi": [
      "コン",
      "キン"
    ],
    "kunyomi": [
      "いま"
    ],
    "examples": [
      {
        "word": "今",
        "kana": "いま",
        "meaning": "sekarang"
      },
      {
        "word": "今週",
        "kana": "こんしゅう",
        "meaning": "minggu ini"
      },
      {
        "word": "今月",
        "kana": "こんげつ",
        "meaning": "bulan ini"
      }
    ],
    "prompts": [
      {
        "id": "今_今_1",
        "word": "今",
        "fullKana": "いま",
        "prefixKana": "",
        "targetKana": "いま",
        "suffixKana": "",
        "meaning": "sekarang",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "今_今週_2",
        "word": "今週",
        "fullKana": "こんしゅう",
        "prefixKana": "",
        "targetKana": "こん",
        "suffixKana": "しゅう",
        "meaning": "minggu ini",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "今_今月_3",
        "word": "今月",
        "fullKana": "こんげつ",
        "prefixKana": "",
        "targetKana": "こん",
        "suffixKana": "げつ",
        "meaning": "bulan ini",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      }
    ]
  },
  {
    "kanji": "毎",
    "primaryLesson": "Pelajaran 4",
    "primaryLessonNumber": 4,
    "meaning": "Setiap",
    "onyomi": [
      "マイ"
    ],
    "kunyomi": [],
    "examples": [
      {
        "word": "毎日",
        "kana": "まいにち",
        "meaning": "setiap hari"
      }
    ],
    "prompts": [
      {
        "id": "毎_毎日_1",
        "word": "毎日",
        "fullKana": "まいにち",
        "prefixKana": "",
        "targetKana": "まい",
        "suffixKana": "にち",
        "meaning": "setiap hari",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      }
    ]
  },
  {
    "kanji": "午",
    "primaryLesson": "Pelajaran 4",
    "primaryLessonNumber": 4,
    "meaning": "Siang",
    "onyomi": [
      "ゴ"
    ],
    "kunyomi": [],
    "examples": [
      {
        "word": "午前",
        "kana": "ごぜん",
        "meaning": "a.m. (pagi)"
      },
      {
        "word": "午後",
        "kana": "ごご",
        "meaning": "p.m. (sore/malam)"
      }
    ],
    "prompts": [
      {
        "id": "午_午前_1",
        "word": "午前",
        "fullKana": "ごぜん",
        "prefixKana": "",
        "targetKana": "ご",
        "suffixKana": "ぜん",
        "meaning": "a.m. (pagi)",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "午_午後_2",
        "word": "午後",
        "fullKana": "ごご",
        "prefixKana": "",
        "targetKana": "ご",
        "suffixKana": "ご",
        "meaning": "p.m. (sore/malam)",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      }
    ]
  },
  {
    "kanji": "半",
    "primaryLesson": "Pelajaran 4",
    "primaryLessonNumber": 4,
    "meaning": "Setengah / Paruh",
    "onyomi": [
      "ハン"
    ],
    "kunyomi": [
      "なかば"
    ],
    "examples": [
      {
        "word": "半",
        "kana": "はん",
        "meaning": "setengah (jam)"
      }
    ],
    "prompts": [
      {
        "id": "半_半_1",
        "word": "半",
        "fullKana": "はん",
        "prefixKana": "",
        "targetKana": "はん",
        "suffixKana": "",
        "meaning": "setengah (jam)",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      }
    ]
  },
  {
    "kanji": "後",
    "primaryLesson": "Pelajaran 4",
    "primaryLessonNumber": 4,
    "meaning": "Belakang / Sesudah",
    "onyomi": [
      "ゴ",
      "コウ"
    ],
    "kunyomi": [
      "うしろ",
      "あと"
    ],
    "examples": [
      {
        "word": "午後",
        "kana": "ごご",
        "meaning": "p.m. (sore/malam)"
      }
    ],
    "prompts": [
      {
        "id": "後_午後_1",
        "word": "午後",
        "fullKana": "ごご",
        "prefixKana": "",
        "targetKana": "ご",
        "suffixKana": "ご",
        "meaning": "p.m. (sore/malam)",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      }
    ]
  },
  {
    "kanji": "東",
    "primaryLesson": "Pelajaran 4",
    "primaryLessonNumber": 4,
    "meaning": "Timur",
    "onyomi": [
      "トウ"
    ],
    "kunyomi": [
      "ひがし"
    ],
    "examples": [
      {
        "word": "東京",
        "kana": "とうきょう",
        "meaning": "Tokyo"
      },
      {
        "word": "東口",
        "kana": "ひがしぐち",
        "meaning": "pintu timur (stasiun)"
      }
    ],
    "prompts": [
      {
        "id": "東_東京_1",
        "word": "東京",
        "fullKana": "とうきょう",
        "prefixKana": "",
        "targetKana": "とう",
        "suffixKana": "きょう",
        "meaning": "Tokyo",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      },
      {
        "id": "東_東口_2",
        "word": "東口",
        "fullKana": "ひがしぐち",
        "prefixKana": "",
        "targetKana": "ひがし",
        "suffixKana": "ぐち",
        "meaning": "pintu timur (stasiun)",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      }
    ]
  },
  {
    "kanji": "休",
    "primaryLesson": "Pelajaran 4",
    "primaryLessonNumber": 4,
    "meaning": "Istirahat / Libur",
    "onyomi": [
      "キュウ"
    ],
    "kunyomi": [
      "やすむ",
      "やすみ"
    ],
    "examples": [
      {
        "word": "休みます",
        "kana": "やすみます",
        "meaning": "beristirahat, libur, tidak masuk"
      }
    ],
    "prompts": [
      {
        "id": "休_休みます_1",
        "word": "休みます",
        "fullKana": "やすみます",
        "prefixKana": "",
        "targetKana": "やす",
        "suffixKana": "みます",
        "meaning": "beristirahat, libur, tidak masuk",
        "lesson": "Pelajaran 4",
        "lessonNumber": 4
      }
    ]
  },
  {
    "kanji": "年",
    "primaryLesson": "Pelajaran 5",
    "primaryLessonNumber": 5,
    "meaning": "Tahun",
    "onyomi": [
      "ネン"
    ],
    "kunyomi": [
      "とし"
    ],
    "examples": [
      {
        "word": "去年",
        "kana": "きょねん",
        "meaning": "tahun lalu"
      },
      {
        "word": "来年",
        "kana": "らいねん",
        "meaning": "tahun depan"
      },
      {
        "word": "～年",
        "kana": "～ねん",
        "meaning": "durasi tahun"
      }
    ],
    "prompts": [
      {
        "id": "年_去年_1",
        "word": "去年",
        "fullKana": "きょねん",
        "prefixKana": "きょ",
        "targetKana": "ねん",
        "suffixKana": "",
        "meaning": "tahun lalu",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "年_来年_2",
        "word": "来年",
        "fullKana": "らいねん",
        "prefixKana": "らい",
        "targetKana": "ねん",
        "suffixKana": "",
        "meaning": "tahun depan",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "年_～年_3",
        "word": "～年",
        "fullKana": "～ねん",
        "prefixKana": "～",
        "targetKana": "ねん",
        "suffixKana": "",
        "meaning": "durasi tahun",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      }
    ]
  },
  {
    "kanji": "週",
    "primaryLesson": "Pelajaran 5",
    "primaryLessonNumber": 5,
    "meaning": "Minggu (Pekan)",
    "onyomi": [
      "シュウ"
    ],
    "kunyomi": [],
    "examples": [
      {
        "word": "先週",
        "kana": "せんしゅう",
        "meaning": "minggu lalu"
      },
      {
        "word": "今週",
        "kana": "こんしゅう",
        "meaning": "minggu ini"
      },
      {
        "word": "来週",
        "kana": "らいしゅう",
        "meaning": "minggu depan"
      },
      {
        "word": "～週間",
        "kana": "～しゅうかん",
        "meaning": "durasi minggu"
      }
    ],
    "prompts": [
      {
        "id": "週_先週_1",
        "word": "先週",
        "fullKana": "せんしゅう",
        "prefixKana": "せん",
        "targetKana": "しゅう",
        "suffixKana": "",
        "meaning": "minggu lalu",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "週_今週_2",
        "word": "今週",
        "fullKana": "こんしゅう",
        "prefixKana": "こん",
        "targetKana": "しゅう",
        "suffixKana": "",
        "meaning": "minggu ini",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "週_来週_3",
        "word": "来週",
        "fullKana": "らいしゅう",
        "prefixKana": "らい",
        "targetKana": "しゅう",
        "suffixKana": "",
        "meaning": "minggu depan",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "週_～週間_4",
        "word": "～週間",
        "fullKana": "～しゅうかん",
        "prefixKana": "～",
        "targetKana": "しゅう",
        "suffixKana": "かん",
        "meaning": "durasi minggu",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      },
      {
        "id": "週_週末_5",
        "word": "週末",
        "fullKana": "しゅうまつ",
        "prefixKana": "",
        "targetKana": "しゅう",
        "suffixKana": "まつ",
        "meaning": "akhir pekan, weekend",
        "lesson": "Pelajaran 13",
        "lessonNumber": 13
      }
    ]
  },
  {
    "kanji": "女",
    "primaryLesson": "Pelajaran 5",
    "primaryLessonNumber": 5,
    "meaning": "Perempuan / Wanita",
    "onyomi": [
      "ジョ",
      "ニョ"
    ],
    "kunyomi": [
      "おんな",
      "め"
    ],
    "examples": [
      {
        "word": "彼女",
        "kana": "かのじょ",
        "meaning": "dia (perempuan), pacar"
      },
      {
        "word": "女の人",
        "kana": "おんなのひと",
        "meaning": "orang perempuan, wanita"
      },
      {
        "word": "女の子",
        "kana": "おんなのこ",
        "meaning": "anak perempuan"
      }
    ],
    "prompts": [
      {
        "id": "女_彼女_1",
        "word": "彼女",
        "fullKana": "かのじょ",
        "prefixKana": "かの",
        "targetKana": "じょ",
        "suffixKana": "",
        "meaning": "dia (perempuan), pacar",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "女_女の人_2",
        "word": "女の人",
        "fullKana": "おんなのひと",
        "prefixKana": "",
        "targetKana": "おんな",
        "suffixKana": "のひと",
        "meaning": "orang perempuan, wanita",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      },
      {
        "id": "女_女の子_3",
        "word": "女の子",
        "fullKana": "おんなのこ",
        "prefixKana": "",
        "targetKana": "おんな",
        "suffixKana": "のこ",
        "meaning": "anak perempuan",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      }
    ]
  },
  {
    "kanji": "校",
    "primaryLesson": "Pelajaran 5",
    "primaryLessonNumber": 5,
    "meaning": "Sekolah",
    "onyomi": [
      "コウ"
    ],
    "kunyomi": [],
    "examples": [
      {
        "word": "学校",
        "kana": "がっこう",
        "meaning": "sekolah"
      },
      {
        "word": "高校",
        "kana": "こうこう",
        "meaning": "SMA (Sekolah Menengah Atas)"
      }
    ],
    "prompts": [
      {
        "id": "校_学校_1",
        "word": "学校",
        "fullKana": "がっこう",
        "prefixKana": "がっ",
        "targetKana": "こう",
        "suffixKana": "",
        "meaning": "sekolah",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      },
      {
        "id": "校_高校_2",
        "word": "高校",
        "fullKana": "こうこう",
        "prefixKana": "",
        "targetKana": "こう",
        "suffixKana": "こう",
        "meaning": "SMA (Sekolah Menengah Atas)",
        "lesson": "Pelajaran 15",
        "lessonNumber": 15
      }
    ]
  },
  {
    "kanji": "駅",
    "primaryLesson": "Pelajaran 5",
    "primaryLessonNumber": 5,
    "meaning": "Stasiun",
    "onyomi": [
      "エキ"
    ],
    "kunyomi": [],
    "examples": [
      {
        "word": "駅",
        "kana": "えき",
        "meaning": "stasiun"
      }
    ],
    "prompts": [
      {
        "id": "駅_駅_1",
        "word": "駅",
        "fullKana": "えき",
        "prefixKana": "",
        "targetKana": "えき",
        "suffixKana": "",
        "meaning": "stasiun",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      }
    ]
  },
  {
    "kanji": "友",
    "primaryLesson": "Pelajaran 5",
    "primaryLessonNumber": 5,
    "meaning": "Teman",
    "onyomi": [
      "ユウ"
    ],
    "kunyomi": [
      "とも"
    ],
    "examples": [
      {
        "word": "友達",
        "kana": "ともだち",
        "meaning": "teman"
      }
    ],
    "prompts": [
      {
        "id": "友_友達_1",
        "word": "友達",
        "fullKana": "ともだち",
        "prefixKana": "",
        "targetKana": "とも",
        "suffixKana": "だち",
        "meaning": "teman",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      }
    ]
  },
  {
    "kanji": "家",
    "primaryLesson": "Pelajaran 5",
    "primaryLessonNumber": 5,
    "meaning": "Rumah / Keluarga",
    "onyomi": [
      "カ",
      "ケ"
    ],
    "kunyomi": [
      "いえ",
      "や"
    ],
    "examples": [
      {
        "word": "家族",
        "kana": "かぞく",
        "meaning": "keluarga"
      }
    ],
    "prompts": [
      {
        "id": "家_家族_1",
        "word": "家族",
        "fullKana": "かぞく",
        "prefixKana": "",
        "targetKana": "か",
        "suffixKana": "ぞく",
        "meaning": "keluarga",
        "lesson": "Pelajaran 5",
        "lessonNumber": 5
      }
    ]
  },
  {
    "kanji": "魚",
    "primaryLesson": "Pelajaran 6",
    "primaryLessonNumber": 6,
    "meaning": "Ikan",
    "onyomi": [
      "ギョ"
    ],
    "kunyomi": [
      "さかな",
      "うお"
    ],
    "examples": [
      {
        "word": "魚",
        "kana": "さかな",
        "meaning": "ikan"
      }
    ],
    "prompts": [
      {
        "id": "魚_魚_1",
        "word": "魚",
        "fullKana": "さかな",
        "prefixKana": "",
        "targetKana": "さかな",
        "suffixKana": "",
        "meaning": "ikan",
        "lesson": "Pelajaran 6",
        "lessonNumber": 6
      }
    ]
  },
  {
    "kanji": "店",
    "primaryLesson": "Pelajaran 6",
    "primaryLessonNumber": 6,
    "meaning": "Toko",
    "onyomi": [
      "テン"
    ],
    "kunyomi": [
      "みせ"
    ],
    "examples": [
      {
        "word": "店",
        "kana": "みせ",
        "meaning": "toko"
      },
      {
        "word": "喫茶店",
        "kana": "きっさてん",
        "meaning": "kedai kopi, cafe"
      }
    ],
    "prompts": [
      {
        "id": "店_店_1",
        "word": "店",
        "fullKana": "みせ",
        "prefixKana": "",
        "targetKana": "みせ",
        "suffixKana": "",
        "meaning": "toko",
        "lesson": "Pelajaran 6",
        "lessonNumber": 6
      },
      {
        "id": "店_喫茶店_2",
        "word": "喫茶店",
        "fullKana": "きっさてん",
        "prefixKana": "きっさ",
        "targetKana": "てん",
        "suffixKana": "",
        "meaning": "kedai kopi, cafe",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      }
    ]
  },
  {
    "kanji": "父",
    "primaryLesson": "Pelajaran 7",
    "primaryLessonNumber": 7,
    "meaning": "Ayah",
    "onyomi": [
      "フ"
    ],
    "kunyomi": [
      "ちち",
      "とう"
    ],
    "examples": [
      {
        "word": "父",
        "kana": "ちち",
        "meaning": "bapak, ayah (sendiri)"
      }
    ],
    "prompts": [
      {
        "id": "父_父_1",
        "word": "父",
        "fullKana": "ちち",
        "prefixKana": "",
        "targetKana": "ちち",
        "suffixKana": "",
        "meaning": "bapak, ayah (sendiri)",
        "lesson": "Pelajaran 7",
        "lessonNumber": 7
      }
    ]
  },
  {
    "kanji": "母",
    "primaryLesson": "Pelajaran 7",
    "primaryLessonNumber": 7,
    "meaning": "Ibu",
    "onyomi": [
      "ボ"
    ],
    "kunyomi": [
      "はは",
      "かあ"
    ],
    "examples": [
      {
        "word": "母",
        "kana": "はは",
        "meaning": "ibu (sendiri)"
      },
      {
        "word": "母の日",
        "kana": "ははのひ",
        "meaning": "Hari Ibu"
      }
    ],
    "prompts": [
      {
        "id": "母_母_1",
        "word": "母",
        "fullKana": "はは",
        "prefixKana": "",
        "targetKana": "はは",
        "suffixKana": "",
        "meaning": "ibu (sendiri)",
        "lesson": "Pelajaran 7",
        "lessonNumber": 7
      },
      {
        "id": "母_母の日_2",
        "word": "母の日",
        "fullKana": "ははのひ",
        "prefixKana": "",
        "targetKana": "はは",
        "suffixKana": "のひ",
        "meaning": "Hari Ibu",
        "lesson": "Pelajaran 24",
        "lessonNumber": 24
      }
    ]
  },
  {
    "kanji": "花",
    "primaryLesson": "Pelajaran 7",
    "primaryLessonNumber": 7,
    "meaning": "Bunga",
    "onyomi": [
      "カ"
    ],
    "kunyomi": [
      "はな"
    ],
    "examples": [
      {
        "word": "花",
        "kana": "はな",
        "meaning": "bunga"
      }
    ],
    "prompts": [
      {
        "id": "花_花_1",
        "word": "花",
        "fullKana": "はな",
        "prefixKana": "",
        "targetKana": "はな",
        "suffixKana": "",
        "meaning": "bunga",
        "lesson": "Pelajaran 7",
        "lessonNumber": 7
      }
    ]
  },
  {
    "kanji": "山",
    "primaryLesson": "Pelajaran 8",
    "primaryLessonNumber": 8,
    "meaning": "Gunung",
    "onyomi": [
      "サン",
      "ザン"
    ],
    "kunyomi": [
      "やま"
    ],
    "examples": [
      {
        "word": "山",
        "kana": "やま",
        "meaning": "gunung"
      }
    ],
    "prompts": [
      {
        "id": "山_山_1",
        "word": "山",
        "fullKana": "やま",
        "prefixKana": "",
        "targetKana": "やま",
        "suffixKana": "",
        "meaning": "gunung",
        "lesson": "Pelajaran 8",
        "lessonNumber": 8
      }
    ]
  },
  {
    "kanji": "気",
    "primaryLesson": "Pelajaran 8",
    "primaryLessonNumber": 8,
    "meaning": "Jiwa / Energi / Suasana",
    "onyomi": [
      "キ",
      "ケ"
    ],
    "kunyomi": [],
    "examples": [
      {
        "word": "元気な",
        "kana": "げんき",
        "meaning": "sehat walafiat, bersemangat"
      },
      {
        "word": "天気",
        "kana": "てんき",
        "meaning": "cuaca"
      },
      {
        "word": "電気",
        "kana": "でんき",
        "meaning": "listrik, lampu"
      },
      {
        "word": "病気",
        "kana": "びょうき",
        "meaning": "sakit, penyakit"
      }
    ],
    "prompts": [
      {
        "id": "気_元気な_1",
        "word": "元気な",
        "fullKana": "げんき",
        "prefixKana": "げん",
        "targetKana": "き",
        "suffixKana": "",
        "meaning": "sehat walafiat, bersemangat",
        "lesson": "Pelajaran 8",
        "lessonNumber": 8
      },
      {
        "id": "気_天気_2",
        "word": "天気",
        "fullKana": "てんき",
        "prefixKana": "てん",
        "targetKana": "き",
        "suffixKana": "",
        "meaning": "cuaca",
        "lesson": "Pelajaran 12",
        "lessonNumber": 12
      },
      {
        "id": "気_電気_3",
        "word": "電気",
        "fullKana": "でんき",
        "prefixKana": "でん",
        "targetKana": "き",
        "suffixKana": "",
        "meaning": "listrik, lampu",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      },
      {
        "id": "気_病気_4",
        "word": "病気",
        "fullKana": "びょうき",
        "prefixKana": "びょう",
        "targetKana": "き",
        "suffixKana": "",
        "meaning": "sakit, penyakit",
        "lesson": "Pelajaran 17",
        "lessonNumber": 17
      },
      {
        "id": "気_気をつけます_5",
        "word": "気をつけます",
        "fullKana": "きをつけます",
        "prefixKana": "",
        "targetKana": "き",
        "suffixKana": "をつけます",
        "meaning": "berwaspada, berhati-hati",
        "lesson": "Pelajaran 21",
        "lessonNumber": 21
      },
      {
        "id": "気_どうぞお元気で_6",
        "word": "どうぞお元気で",
        "fullKana": "どうぞおげんきで",
        "prefixKana": "どうぞおげん",
        "targetKana": "き",
        "suffixKana": "で",
        "meaning": "Semoga sehat selalu (salam perpisahan)",
        "lesson": "Pelajaran 25",
        "lessonNumber": 25
      }
    ]
  },
  {
    "kanji": "小",
    "primaryLesson": "Pelajaran 8",
    "primaryLessonNumber": 8,
    "meaning": "Kecil",
    "onyomi": [
      "ショウ"
    ],
    "kunyomi": [
      "ちいさい",
      "こ",
      "お"
    ],
    "examples": [
      {
        "word": "小さい",
        "kana": "ちいさい",
        "meaning": "kecil"
      }
    ],
    "prompts": [
      {
        "id": "小_小さい_1",
        "word": "小さい",
        "fullKana": "ちいさい",
        "prefixKana": "",
        "targetKana": "ちい",
        "suffixKana": "さい",
        "meaning": "kecil",
        "lesson": "Pelajaran 8",
        "lessonNumber": 8
      }
    ]
  },
  {
    "kanji": "高",
    "primaryLesson": "Pelajaran 8",
    "primaryLessonNumber": 8,
    "meaning": "Tinggi / Mahal",
    "onyomi": [
      "コウ"
    ],
    "kunyomi": [
      "たかい"
    ],
    "examples": [
      {
        "word": "高い",
        "kana": "たかい",
        "meaning": "mahal, tinggi"
      },
      {
        "word": "高校",
        "kana": "こうこう",
        "meaning": "SMA (Sekolah Menengah Atas)"
      }
    ],
    "prompts": [
      {
        "id": "高_高い_1",
        "word": "高い",
        "fullKana": "たかい",
        "prefixKana": "",
        "targetKana": "たか",
        "suffixKana": "い",
        "meaning": "mahal, tinggi",
        "lesson": "Pelajaran 8",
        "lessonNumber": 8
      },
      {
        "id": "高_高校_2",
        "word": "高校",
        "fullKana": "こうこう",
        "prefixKana": "",
        "targetKana": "こう",
        "suffixKana": "こう",
        "meaning": "SMA (Sekolah Menengah Atas)",
        "lesson": "Pelajaran 15",
        "lessonNumber": 15
      }
    ]
  },
  {
    "kanji": "安",
    "primaryLesson": "Pelajaran 8",
    "primaryLessonNumber": 8,
    "meaning": "Murah / Tenang",
    "onyomi": [
      "アン"
    ],
    "kunyomi": [
      "やすい"
    ],
    "examples": [
      {
        "word": "安い",
        "kana": "やすい",
        "meaning": "murah"
      }
    ],
    "prompts": [
      {
        "id": "安_安い_1",
        "word": "安い",
        "fullKana": "やすい",
        "prefixKana": "",
        "targetKana": "やす",
        "suffixKana": "い",
        "meaning": "murah",
        "lesson": "Pelajaran 8",
        "lessonNumber": 8
      }
    ]
  },
  {
    "kanji": "古",
    "primaryLesson": "Pelajaran 8",
    "primaryLessonNumber": 8,
    "meaning": "Lama / Tua",
    "onyomi": [
      "コ"
    ],
    "kunyomi": [
      "ふるい"
    ],
    "examples": [
      {
        "word": "古い",
        "kana": "ふるい",
        "meaning": "lama, tua, kuno"
      }
    ],
    "prompts": [
      {
        "id": "古_古い_1",
        "word": "古い",
        "fullKana": "ふるい",
        "prefixKana": "",
        "targetKana": "ふる",
        "suffixKana": "い",
        "meaning": "lama, tua, kuno",
        "lesson": "Pelajaran 8",
        "lessonNumber": 8
      }
    ]
  },
  {
    "kanji": "白",
    "primaryLesson": "Pelajaran 8",
    "primaryLessonNumber": 8,
    "meaning": "Putih",
    "onyomi": [
      "ハク",
      "ビャク"
    ],
    "kunyomi": [
      "しろ",
      "しろい"
    ],
    "examples": [
      {
        "word": "白い",
        "kana": "しろい",
        "meaning": "putih (kata sifat)"
      },
      {
        "word": "白",
        "kana": "しろ",
        "meaning": "warna putih (kata benda)"
      }
    ],
    "prompts": [
      {
        "id": "白_白い_1",
        "word": "白い",
        "fullKana": "しろい",
        "prefixKana": "",
        "targetKana": "しろ",
        "suffixKana": "い",
        "meaning": "putih (kata sifat)",
        "lesson": "Pelajaran 8",
        "lessonNumber": 8
      },
      {
        "id": "白_白_2",
        "word": "白",
        "fullKana": "しろ",
        "prefixKana": "",
        "targetKana": "しろ",
        "suffixKana": "",
        "meaning": "warna putih (kata benda)",
        "lesson": "Pelajaran 8",
        "lessonNumber": 8
      }
    ]
  },
  {
    "kanji": "間",
    "primaryLesson": "Pelajaran 9",
    "primaryLessonNumber": 9,
    "meaning": "Antara / Jeda Waktu",
    "onyomi": [
      "カン",
      "ケン"
    ],
    "kunyomi": [
      "あいだ",
      "ま"
    ],
    "examples": [
      {
        "word": "時間",
        "kana": "じかん",
        "meaning": "jam, waktu"
      },
      {
        "word": "間",
        "kana": "あいだ",
        "meaning": "antara"
      },
      {
        "word": "～時間",
        "kana": "～じかん",
        "meaning": "durasi jam"
      },
      {
        "word": "～週間",
        "kana": "～しゅうかん",
        "meaning": "durasi minggu"
      }
    ],
    "prompts": [
      {
        "id": "間_時間_1",
        "word": "時間",
        "fullKana": "じかん",
        "prefixKana": "じ",
        "targetKana": "かん",
        "suffixKana": "",
        "meaning": "jam, waktu",
        "lesson": "Pelajaran 9",
        "lessonNumber": 9
      },
      {
        "id": "間_間_2",
        "word": "間",
        "fullKana": "あいだ",
        "prefixKana": "",
        "targetKana": "あいだ",
        "suffixKana": "",
        "meaning": "antara",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      },
      {
        "id": "間_～時間_3",
        "word": "～時間",
        "fullKana": "～じかん",
        "prefixKana": "～じ",
        "targetKana": "かん",
        "suffixKana": "",
        "meaning": "durasi jam",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      },
      {
        "id": "間_～週間_4",
        "word": "～週間",
        "fullKana": "～しゅうかん",
        "prefixKana": "～しゅう",
        "targetKana": "かん",
        "suffixKana": "",
        "meaning": "durasi minggu",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      }
    ]
  },
  {
    "kanji": "子",
    "primaryLesson": "Pelajaran 9",
    "primaryLessonNumber": 9,
    "meaning": "Anak",
    "onyomi": [
      "シ",
      "ス"
    ],
    "kunyomi": [
      "こ"
    ],
    "examples": [
      {
        "word": "子供",
        "kana": "こども",
        "meaning": "anak"
      },
      {
        "word": "男の子",
        "kana": "おとこのこ",
        "meaning": "anak laki-laki"
      },
      {
        "word": "女の子",
        "kana": "おんなのこ",
        "meaning": "anak perempuan"
      },
      {
        "word": "調子",
        "kana": "ちょうし",
        "meaning": "kondisi, keadaan fisik"
      }
    ],
    "prompts": [
      {
        "id": "子_子供_1",
        "word": "子供",
        "fullKana": "こども",
        "prefixKana": "",
        "targetKana": "こ",
        "suffixKana": "ども",
        "meaning": "anak",
        "lesson": "Pelajaran 9",
        "lessonNumber": 9
      },
      {
        "id": "子_男の子_2",
        "word": "男の子",
        "fullKana": "おとこのこ",
        "prefixKana": "おと",
        "targetKana": "こ",
        "suffixKana": "のこ",
        "meaning": "anak laki-laki",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      },
      {
        "id": "子_女の子_3",
        "word": "女の子",
        "fullKana": "おんなのこ",
        "prefixKana": "おんなの",
        "targetKana": "こ",
        "suffixKana": "",
        "meaning": "anak perempuan",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      },
      {
        "id": "子_調子_4",
        "word": "調子",
        "fullKana": "ちょうし",
        "prefixKana": "ちょう",
        "targetKana": "し",
        "suffixKana": "",
        "meaning": "kondisi, keadaan fisik",
        "lesson": "Pelajaran 19",
        "lessonNumber": 19
      },
      {
        "id": "子_帽子_5",
        "word": "帽子",
        "fullKana": "ぼうし",
        "prefixKana": "ぼう",
        "targetKana": "し",
        "suffixKana": "",
        "meaning": "topi",
        "lesson": "Pelajaran 22",
        "lessonNumber": 22
      },
      {
        "id": "子_お菓子_6",
        "word": "お菓子",
        "fullKana": "おかし",
        "prefixKana": "おか",
        "targetKana": "し",
        "suffixKana": "",
        "meaning": "kue, makanan ringan, camilan",
        "lesson": "Pelajaran 24",
        "lessonNumber": 24
      }
    ]
  },
  {
    "kanji": "上",
    "primaryLesson": "Pelajaran 9",
    "primaryLessonNumber": 9,
    "meaning": "Atas",
    "onyomi": [
      "ジョウ",
      "ショウ"
    ],
    "kunyomi": [
      "うえ",
      "あがる"
    ],
    "examples": [
      {
        "word": "上手な",
        "kana": "じょうず",
        "meaning": "pandai, pintar, mahir"
      },
      {
        "word": "上",
        "kana": "うえ",
        "meaning": "atas"
      }
    ],
    "prompts": [
      {
        "id": "上_上手な_1",
        "word": "上手な",
        "fullKana": "じょうず",
        "prefixKana": "",
        "targetKana": "じょう",
        "suffixKana": "ず",
        "meaning": "pandai, pintar, mahir",
        "lesson": "Pelajaran 9",
        "lessonNumber": 9
      },
      {
        "id": "上_上_2",
        "word": "上",
        "fullKana": "うえ",
        "prefixKana": "",
        "targetKana": "うえ",
        "suffixKana": "",
        "meaning": "atas",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      }
    ]
  },
  {
    "kanji": "少",
    "primaryLesson": "Pelajaran 9",
    "primaryLessonNumber": 9,
    "meaning": "Sedikit",
    "onyomi": [
      "ショウ"
    ],
    "kunyomi": [
      "すくない",
      "すこし"
    ],
    "examples": [
      {
        "word": "少し",
        "kana": "すこし",
        "meaning": "sedikit"
      },
      {
        "word": "少ない",
        "kana": "すくない",
        "meaning": "sedikit (orang/barang)"
      }
    ],
    "prompts": [
      {
        "id": "少_少し_1",
        "word": "少し",
        "fullKana": "すこし",
        "prefixKana": "",
        "targetKana": "すこ",
        "suffixKana": "し",
        "meaning": "sedikit",
        "lesson": "Pelajaran 9",
        "lessonNumber": 9
      },
      {
        "id": "少_少ない_2",
        "word": "少ない",
        "fullKana": "すくない",
        "prefixKana": "",
        "targetKana": "すく",
        "suffixKana": "ない",
        "meaning": "sedikit (orang/barang)",
        "lesson": "Pelajaran 12",
        "lessonNumber": 12
      }
    ]
  },
  {
    "kanji": "飲",
    "primaryLesson": "Pelajaran 9",
    "primaryLessonNumber": 9,
    "meaning": "Minum",
    "onyomi": [
      "イン"
    ],
    "kunyomi": [
      "のむ"
    ],
    "examples": [
      {
        "word": "飲み物",
        "kana": "のみもの",
        "meaning": "minuman"
      },
      {
        "word": "飲みます",
        "kana": "のみます",
        "meaning": "minum, meminum [obat/minuman]"
      }
    ],
    "prompts": [
      {
        "id": "飲_飲み物_1",
        "word": "飲み物",
        "fullKana": "のみもの",
        "prefixKana": "",
        "targetKana": "の",
        "suffixKana": "みもの",
        "meaning": "minuman",
        "lesson": "Pelajaran 9",
        "lessonNumber": 9
      },
      {
        "id": "飲_飲みます_2",
        "word": "飲みます",
        "fullKana": "のみます",
        "prefixKana": "",
        "targetKana": "の",
        "suffixKana": "みます",
        "meaning": "minum, meminum [obat/minuman]",
        "lesson": "Pelajaran 16",
        "lessonNumber": 16
      }
    ]
  },
  {
    "kanji": "男",
    "primaryLesson": "Pelajaran 10",
    "primaryLessonNumber": 10,
    "meaning": "Laki-laki / Pria",
    "onyomi": [
      "ダン",
      "ナン"
    ],
    "kunyomi": [
      "おとこ"
    ],
    "examples": [
      {
        "word": "男の人",
        "kana": "おとこのひと",
        "meaning": "orang laki-laki, pria"
      },
      {
        "word": "男の子",
        "kana": "おとこのこ",
        "meaning": "anak laki-laki"
      }
    ],
    "prompts": [
      {
        "id": "男_男の人_1",
        "word": "男の人",
        "fullKana": "おとこのひと",
        "prefixKana": "",
        "targetKana": "おとこ",
        "suffixKana": "のひと",
        "meaning": "orang laki-laki, pria",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      },
      {
        "id": "男_男の子_2",
        "word": "男の子",
        "fullKana": "おとこのこ",
        "prefixKana": "",
        "targetKana": "おとこ",
        "suffixKana": "のこ",
        "meaning": "anak laki-laki",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      }
    ]
  },
  {
    "kanji": "犬",
    "primaryLesson": "Pelajaran 10",
    "primaryLessonNumber": 10,
    "meaning": "Anjing",
    "onyomi": [
      "ケン"
    ],
    "kunyomi": [
      "いぬ"
    ],
    "examples": [
      {
        "word": "犬",
        "kana": "いぬ",
        "meaning": "anjing"
      }
    ],
    "prompts": [
      {
        "id": "犬_犬_1",
        "word": "犬",
        "fullKana": "いぬ",
        "prefixKana": "",
        "targetKana": "いぬ",
        "suffixKana": "",
        "meaning": "anjing",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      }
    ]
  },
  {
    "kanji": "外",
    "primaryLesson": "Pelajaran 10",
    "primaryLessonNumber": 10,
    "meaning": "Luar",
    "onyomi": [
      "ガイ",
      "ゲ"
    ],
    "kunyomi": [
      "そと",
      "はずす"
    ],
    "examples": [
      {
        "word": "外",
        "kana": "そと",
        "meaning": "luar"
      },
      {
        "word": "外国",
        "kana": "がいこく",
        "meaning": "luar negeri"
      }
    ],
    "prompts": [
      {
        "id": "外_外_1",
        "word": "外",
        "fullKana": "そと",
        "prefixKana": "",
        "targetKana": "そと",
        "suffixKana": "",
        "meaning": "luar",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      },
      {
        "id": "外_外国_2",
        "word": "外国",
        "fullKana": "がいこく",
        "prefixKana": "",
        "targetKana": "がい",
        "suffixKana": "こく",
        "meaning": "luar negeri",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      }
    ]
  },
  {
    "kanji": "右",
    "primaryLesson": "Pelajaran 10",
    "primaryLessonNumber": 10,
    "meaning": "Kanan",
    "onyomi": [
      "ウ",
      "ユウ"
    ],
    "kunyomi": [
      "みぎ"
    ],
    "examples": [
      {
        "word": "右",
        "kana": "みぎ",
        "meaning": "kanan"
      }
    ],
    "prompts": [
      {
        "id": "右_右_1",
        "word": "右",
        "fullKana": "みぎ",
        "prefixKana": "",
        "targetKana": "みぎ",
        "suffixKana": "",
        "meaning": "kanan",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      }
    ]
  },
  {
    "kanji": "左",
    "primaryLesson": "Pelajaran 10",
    "primaryLessonNumber": 10,
    "meaning": "Kiri",
    "onyomi": [
      "サ"
    ],
    "kunyomi": [
      "ひだり"
    ],
    "examples": [
      {
        "word": "左",
        "kana": "ひだり",
        "meaning": "kiri"
      }
    ],
    "prompts": [
      {
        "id": "左_左_1",
        "word": "左",
        "fullKana": "ひだり",
        "prefixKana": "",
        "targetKana": "ひだり",
        "suffixKana": "",
        "meaning": "kiri",
        "lesson": "Pelajaran 10",
        "lessonNumber": 10
      }
    ]
  },
  {
    "kanji": "二",
    "primaryLesson": "Pelajaran 11",
    "primaryLessonNumber": 11,
    "meaning": "Dua",
    "onyomi": [
      "ニ"
    ],
    "kunyomi": [
      "ふた",
      "ふたつ"
    ],
    "examples": [
      {
        "word": "二つ",
        "kana": "ふたつ",
        "meaning": "dua buah"
      },
      {
        "word": "二人",
        "kana": "ふたり",
        "meaning": "dua orang"
      }
    ],
    "prompts": [
      {
        "id": "二_二つ_1",
        "word": "二つ",
        "fullKana": "ふたつ",
        "prefixKana": "",
        "targetKana": "ふた",
        "suffixKana": "つ",
        "meaning": "dua buah",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      },
      {
        "id": "二_二人_2",
        "word": "二人",
        "fullKana": "ふたり",
        "prefixKana": "",
        "targetKana": "ふた",
        "suffixKana": "り",
        "meaning": "dua orang",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      }
    ]
  },
  {
    "kanji": "三",
    "primaryLesson": "Pelajaran 11",
    "primaryLessonNumber": 11,
    "meaning": "Tiga",
    "onyomi": [
      "サン"
    ],
    "kunyomi": [
      "み",
      "みっつ"
    ],
    "examples": [
      {
        "word": "三つ",
        "kana": "みっつ",
        "meaning": "tiga buah"
      }
    ],
    "prompts": [
      {
        "id": "三_三つ_1",
        "word": "三つ",
        "fullKana": "みっつ",
        "prefixKana": "",
        "targetKana": "みっ",
        "suffixKana": "つ",
        "meaning": "tiga buah",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      }
    ]
  },
  {
    "kanji": "四",
    "primaryLesson": "Pelajaran 11",
    "primaryLessonNumber": 11,
    "meaning": "Empat",
    "onyomi": [
      "シ"
    ],
    "kunyomi": [
      "よ",
      "よっつ",
      "よん"
    ],
    "examples": [
      {
        "word": "四つ",
        "kana": "よっつ",
        "meaning": "empat buah"
      }
    ],
    "prompts": [
      {
        "id": "四_四つ_1",
        "word": "四つ",
        "fullKana": "よっつ",
        "prefixKana": "",
        "targetKana": "よっ",
        "suffixKana": "つ",
        "meaning": "empat buah",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      }
    ]
  },
  {
    "kanji": "五",
    "primaryLesson": "Pelajaran 11",
    "primaryLessonNumber": 11,
    "meaning": "Lima",
    "onyomi": [
      "ゴ"
    ],
    "kunyomi": [
      "いつ",
      "いつつ"
    ],
    "examples": [
      {
        "word": "五つ",
        "kana": "いつつ",
        "meaning": "lima buah"
      }
    ],
    "prompts": [
      {
        "id": "五_五つ_1",
        "word": "五つ",
        "fullKana": "いつつ",
        "prefixKana": "",
        "targetKana": "いつ",
        "suffixKana": "つ",
        "meaning": "lima buah",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      }
    ]
  },
  {
    "kanji": "六",
    "primaryLesson": "Pelajaran 11",
    "primaryLessonNumber": 11,
    "meaning": "Enam",
    "onyomi": [
      "ロク"
    ],
    "kunyomi": [
      "む",
      "むっつ"
    ],
    "examples": [
      {
        "word": "六つ",
        "kana": "むっつ",
        "meaning": "enam buah"
      }
    ],
    "prompts": [
      {
        "id": "六_六つ_1",
        "word": "六つ",
        "fullKana": "むっつ",
        "prefixKana": "",
        "targetKana": "むっ",
        "suffixKana": "つ",
        "meaning": "enam buah",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      }
    ]
  },
  {
    "kanji": "七",
    "primaryLesson": "Pelajaran 11",
    "primaryLessonNumber": 11,
    "meaning": "Tujuh",
    "onyomi": [
      "シチ"
    ],
    "kunyomi": [
      "なな",
      "ななつ"
    ],
    "examples": [
      {
        "word": "七つ",
        "kana": "ななつ",
        "meaning": "tujuh buah"
      }
    ],
    "prompts": [
      {
        "id": "七_七つ_1",
        "word": "七つ",
        "fullKana": "ななつ",
        "prefixKana": "",
        "targetKana": "なな",
        "suffixKana": "つ",
        "meaning": "tujuh buah",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      }
    ]
  },
  {
    "kanji": "八",
    "primaryLesson": "Pelajaran 11",
    "primaryLessonNumber": 11,
    "meaning": "Delapan",
    "onyomi": [
      "ハチ"
    ],
    "kunyomi": [
      "や",
      "やっつ"
    ],
    "examples": [
      {
        "word": "八つ",
        "kana": "やっつ",
        "meaning": "delapan buah"
      }
    ],
    "prompts": [
      {
        "id": "八_八つ_1",
        "word": "八つ",
        "fullKana": "やっつ",
        "prefixKana": "",
        "targetKana": "やっ",
        "suffixKana": "つ",
        "meaning": "delapan buah",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      }
    ]
  },
  {
    "kanji": "九",
    "primaryLesson": "Pelajaran 11",
    "primaryLessonNumber": 11,
    "meaning": "Sembilan",
    "onyomi": [
      "キュウ",
      "ク"
    ],
    "kunyomi": [
      "ここの",
      "ここのつ"
    ],
    "examples": [
      {
        "word": "九つ",
        "kana": "ここのつ",
        "meaning": "sembilan buah"
      }
    ],
    "prompts": [
      {
        "id": "九_九つ_1",
        "word": "九つ",
        "fullKana": "ここのつ",
        "prefixKana": "",
        "targetKana": "ここの",
        "suffixKana": "つ",
        "meaning": "sembilan buah",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      }
    ]
  },
  {
    "kanji": "十",
    "primaryLesson": "Pelajaran 11",
    "primaryLessonNumber": 11,
    "meaning": "Sepuluh",
    "onyomi": [
      "ジュウ",
      "ジッ"
    ],
    "kunyomi": [
      "とお"
    ],
    "examples": [
      {
        "word": "十",
        "kana": "とお",
        "meaning": "sepuluh buah"
      }
    ],
    "prompts": [
      {
        "id": "十_十_1",
        "word": "十",
        "fullKana": "とお",
        "prefixKana": "",
        "targetKana": "とお",
        "suffixKana": "",
        "meaning": "sepuluh buah",
        "lesson": "Pelajaran 11",
        "lessonNumber": 11
      }
    ]
  },
  {
    "kanji": "雨",
    "primaryLesson": "Pelajaran 12",
    "primaryLessonNumber": 12,
    "meaning": "Hujan",
    "onyomi": [
      "ウ"
    ],
    "kunyomi": [
      "あめ",
      "あま"
    ],
    "examples": [
      {
        "word": "雨",
        "kana": "あめ",
        "meaning": "hujan"
      }
    ],
    "prompts": [
      {
        "id": "雨_雨_1",
        "word": "雨",
        "fullKana": "あめ",
        "prefixKana": "",
        "targetKana": "あめ",
        "suffixKana": "",
        "meaning": "hujan",
        "lesson": "Pelajaran 12",
        "lessonNumber": 12
      }
    ]
  },
  {
    "kanji": "空",
    "primaryLesson": "Pelajaran 12",
    "primaryLessonNumber": 12,
    "meaning": "Langit",
    "onyomi": [
      "クウ"
    ],
    "kunyomi": [
      "そら",
      "あく"
    ],
    "examples": [
      {
        "word": "空港",
        "kana": "くうこう",
        "meaning": "bandara"
      }
    ],
    "prompts": [
      {
        "id": "空_空港_1",
        "word": "空港",
        "fullKana": "くうこう",
        "prefixKana": "",
        "targetKana": "くう",
        "suffixKana": "こう",
        "meaning": "bandara",
        "lesson": "Pelajaran 12",
        "lessonNumber": 12
      }
    ]
  },
  {
    "kanji": "天",
    "primaryLesson": "Pelajaran 12",
    "primaryLessonNumber": 12,
    "meaning": "Surga / Langit",
    "onyomi": [
      "テン"
    ],
    "kunyomi": [
      "あまつ"
    ],
    "examples": [
      {
        "word": "天気",
        "kana": "てんき",
        "meaning": "cuaca"
      }
    ],
    "prompts": [
      {
        "id": "天_天気_1",
        "word": "天気",
        "fullKana": "てんき",
        "prefixKana": "",
        "targetKana": "てん",
        "suffixKana": "き",
        "meaning": "cuaca",
        "lesson": "Pelajaran 12",
        "lessonNumber": 12
      }
    ]
  },
  {
    "kanji": "北",
    "primaryLesson": "Pelajaran 12",
    "primaryLessonNumber": 12,
    "meaning": "Utara",
    "onyomi": [
      "ホク"
    ],
    "kunyomi": [
      "きた"
    ],
    "examples": [
      {
        "word": "北海道",
        "kana": "ほっかいどう",
        "meaning": "Hokkaido"
      },
      {
        "word": "北口",
        "kana": "きたぐち",
        "meaning": "pintu utara (stasiun)"
      }
    ],
    "prompts": [
      {
        "id": "北_北海道_1",
        "word": "北海道",
        "fullKana": "ほっかいどう",
        "prefixKana": "",
        "targetKana": "ほっ",
        "suffixKana": "かいどう",
        "meaning": "Hokkaido",
        "lesson": "Pelajaran 12",
        "lessonNumber": 12
      },
      {
        "id": "北_北口_2",
        "word": "北口",
        "fullKana": "きたぐち",
        "prefixKana": "",
        "targetKana": "きた",
        "suffixKana": "ぐち",
        "meaning": "pintu utara (stasiun)",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      }
    ]
  },
  {
    "kanji": "多",
    "primaryLesson": "Pelajaran 12",
    "primaryLessonNumber": 12,
    "meaning": "Banyak",
    "onyomi": [
      "タ"
    ],
    "kunyomi": [
      "おおい"
    ],
    "examples": [
      {
        "word": "多い",
        "kana": "おおい",
        "meaning": "banyak (orang/barang)"
      }
    ],
    "prompts": [
      {
        "id": "多_多い_1",
        "word": "多い",
        "fullKana": "おおい",
        "prefixKana": "",
        "targetKana": "おお",
        "suffixKana": "い",
        "meaning": "banyak (orang/barang)",
        "lesson": "Pelajaran 12",
        "lessonNumber": 12
      }
    ]
  },
  {
    "kanji": "道",
    "primaryLesson": "Pelajaran 12",
    "primaryLessonNumber": 12,
    "meaning": "Jalan",
    "onyomi": [
      "ドウ",
      "トウ"
    ],
    "kunyomi": [
      "みち"
    ],
    "examples": [
      {
        "word": "北海道",
        "kana": "ほっかいどう",
        "meaning": "Hokkaido"
      },
      {
        "word": "道",
        "kana": "みち",
        "meaning": "jalan"
      }
    ],
    "prompts": [
      {
        "id": "道_北海道_1",
        "word": "北海道",
        "fullKana": "ほっかいどう",
        "prefixKana": "ほっかい",
        "targetKana": "どう",
        "suffixKana": "",
        "meaning": "Hokkaido",
        "lesson": "Pelajaran 12",
        "lessonNumber": 12
      },
      {
        "id": "道_道_2",
        "word": "道",
        "fullKana": "みち",
        "prefixKana": "",
        "targetKana": "みち",
        "suffixKana": "",
        "meaning": "jalan",
        "lesson": "Pelajaran 23",
        "lessonNumber": 23
      }
    ]
  },
  {
    "kanji": "川",
    "primaryLesson": "Pelajaran 13",
    "primaryLessonNumber": 13,
    "meaning": "Sungai",
    "onyomi": [
      "セン"
    ],
    "kunyomi": [
      "かわ"
    ],
    "examples": [
      {
        "word": "川",
        "kana": "かわ",
        "meaning": "sungai"
      }
    ],
    "prompts": [
      {
        "id": "川_川_1",
        "word": "川",
        "fullKana": "かわ",
        "prefixKana": "",
        "targetKana": "かわ",
        "suffixKana": "",
        "meaning": "sungai",
        "lesson": "Pelajaran 13",
        "lessonNumber": 13
      }
    ]
  },
  {
    "kanji": "買",
    "primaryLesson": "Pelajaran 13",
    "primaryLessonNumber": 13,
    "meaning": "Membeli",
    "onyomi": [
      "バイ"
    ],
    "kunyomi": [
      "かう"
    ],
    "examples": [
      {
        "word": "買い物します",
        "kana": "かいものします",
        "meaning": "berbelanja"
      }
    ],
    "prompts": [
      {
        "id": "買_買い物します_1",
        "word": "買い物します",
        "fullKana": "かいものします",
        "prefixKana": "",
        "targetKana": "か",
        "suffixKana": "いものします",
        "meaning": "berbelanja",
        "lesson": "Pelajaran 13",
        "lessonNumber": 13
      }
    ]
  },
  {
    "kanji": "口",
    "primaryLesson": "Pelajaran 14",
    "primaryLessonNumber": 14,
    "meaning": "Mulut / Pintu Masuk",
    "onyomi": [
      "コウ",
      "ク"
    ],
    "kunyomi": [
      "くち",
      "ぐち"
    ],
    "examples": [
      {
        "word": "入口",
        "kana": "いりぐち",
        "meaning": "pintu masuk"
      },
      {
        "word": "出口",
        "kana": "でぐち",
        "meaning": "pintu keluar"
      },
      {
        "word": "東口",
        "kana": "ひがしぐち",
        "meaning": "pintu timur (stasiun)"
      },
      {
        "word": "西口",
        "kana": "にしぐち",
        "meaning": "pintu barat (stasiun)"
      }
    ],
    "prompts": [
      {
        "id": "口_入口_1",
        "word": "入口",
        "fullKana": "いりぐち",
        "prefixKana": "いり",
        "targetKana": "ぐち",
        "suffixKana": "",
        "meaning": "pintu masuk",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      },
      {
        "id": "口_出口_2",
        "word": "出口",
        "fullKana": "でぐち",
        "prefixKana": "で",
        "targetKana": "ぐち",
        "suffixKana": "",
        "meaning": "pintu keluar",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      },
      {
        "id": "口_東口_3",
        "word": "東口",
        "fullKana": "ひがしぐち",
        "prefixKana": "ひがし",
        "targetKana": "ぐち",
        "suffixKana": "",
        "meaning": "pintu timur (stasiun)",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      },
      {
        "id": "口_西口_4",
        "word": "西口",
        "fullKana": "にしぐち",
        "prefixKana": "にし",
        "targetKana": "ぐち",
        "suffixKana": "",
        "meaning": "pintu barat (stasiun)",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      },
      {
        "id": "口_南口_5",
        "word": "南口",
        "fullKana": "みなみぐち",
        "prefixKana": "みなみ",
        "targetKana": "ぐち",
        "suffixKana": "",
        "meaning": "pintu selatan (stasiun)",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      },
      {
        "id": "口_北口_6",
        "word": "北口",
        "fullKana": "きたぐち",
        "prefixKana": "きた",
        "targetKana": "ぐち",
        "suffixKana": "",
        "meaning": "pintu utara (stasiun)",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      },
      {
        "id": "口_口_7",
        "word": "口",
        "fullKana": "くち",
        "prefixKana": "",
        "targetKana": "くち",
        "suffixKana": "",
        "meaning": "mulut",
        "lesson": "Pelajaran 16",
        "lessonNumber": 16
      }
    ]
  },
  {
    "kanji": "西",
    "primaryLesson": "Pelajaran 14",
    "primaryLessonNumber": 14,
    "meaning": "Barat",
    "onyomi": [
      "セイ",
      "サイ"
    ],
    "kunyomi": [
      "にし"
    ],
    "examples": [
      {
        "word": "西口",
        "kana": "にしぐち",
        "meaning": "pintu barat (stasiun)"
      }
    ],
    "prompts": [
      {
        "id": "西_西口_1",
        "word": "西口",
        "fullKana": "にしぐち",
        "prefixKana": "",
        "targetKana": "にし",
        "suffixKana": "ぐち",
        "meaning": "pintu barat (stasiun)",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      }
    ]
  },
  {
    "kanji": "南",
    "primaryLesson": "Pelajaran 14",
    "primaryLessonNumber": 14,
    "meaning": "Selatan",
    "onyomi": [
      "ナン"
    ],
    "kunyomi": [
      "みなみ"
    ],
    "examples": [
      {
        "word": "南口",
        "kana": "みなみぐち",
        "meaning": "pintu selatan (stasiun)"
      }
    ],
    "prompts": [
      {
        "id": "南_南口_1",
        "word": "南口",
        "fullKana": "みなみぐち",
        "prefixKana": "",
        "targetKana": "みなみ",
        "suffixKana": "ぐち",
        "meaning": "pintu selatan (stasiun)",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      }
    ]
  },
  {
    "kanji": "見",
    "primaryLesson": "Pelajaran 14",
    "primaryLessonNumber": 14,
    "meaning": "Melihat",
    "onyomi": [
      "ケン"
    ],
    "kunyomi": [
      "みる",
      "みせる"
    ],
    "examples": [
      {
        "word": "見せます",
        "kana": "みせます",
        "meaning": "memperlihatkan, menunjukkan"
      },
      {
        "word": "見学します",
        "kana": "けんがくします",
        "meaning": "mengunjungi, studi banding"
      }
    ],
    "prompts": [
      {
        "id": "見_見せます_1",
        "word": "見せます",
        "fullKana": "みせます",
        "prefixKana": "",
        "targetKana": "み",
        "suffixKana": "せます",
        "meaning": "memperlihatkan, menunjukkan",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      },
      {
        "id": "見_見学します_2",
        "word": "見学します",
        "fullKana": "けんがくします",
        "prefixKana": "",
        "targetKana": "けん",
        "suffixKana": "がくします",
        "meaning": "mengunjungi, studi banding",
        "lesson": "Pelajaran 16",
        "lessonNumber": 16
      }
    ]
  },
  {
    "kanji": "読",
    "primaryLesson": "Pelajaran 14",
    "primaryLessonNumber": 14,
    "meaning": "Membaca",
    "onyomi": [
      "ドク"
    ],
    "kunyomi": [
      "よむ"
    ],
    "examples": [
      {
        "word": "読み方",
        "kana": "よみかた",
        "meaning": "cara membaca"
      }
    ],
    "prompts": [
      {
        "id": "読_読み方_1",
        "word": "読み方",
        "fullKana": "よみかた",
        "prefixKana": "",
        "targetKana": "よ",
        "suffixKana": "みかた",
        "meaning": "cara membaca",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      }
    ]
  },
  {
    "kanji": "入",
    "primaryLesson": "Pelajaran 14",
    "primaryLessonNumber": 14,
    "meaning": "Masuk / Memasukkan",
    "onyomi": [
      "ニュウ"
    ],
    "kunyomi": [
      "はいる",
      "いれる"
    ],
    "examples": [
      {
        "word": "入ります",
        "kana": "はいります",
        "meaning": "masuk [ruangan/universitas]"
      },
      {
        "word": "入口",
        "kana": "いりぐち",
        "meaning": "pintu masuk"
      },
      {
        "word": "入れます",
        "kana": "いれます",
        "meaning": "memasukkan"
      }
    ],
    "prompts": [
      {
        "id": "入_入ります_1",
        "word": "入ります",
        "fullKana": "はいります",
        "prefixKana": "",
        "targetKana": "はい",
        "suffixKana": "ります",
        "meaning": "masuk [ruangan/universitas]",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      },
      {
        "id": "入_入口_2",
        "word": "入口",
        "fullKana": "いりぐち",
        "prefixKana": "",
        "targetKana": "い",
        "suffixKana": "りぐち",
        "meaning": "pintu masuk",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      },
      {
        "id": "入_入れます_3",
        "word": "入れます",
        "fullKana": "いれます",
        "prefixKana": "",
        "targetKana": "い",
        "suffixKana": "れます",
        "meaning": "memasukkan",
        "lesson": "Pelajaran 16",
        "lessonNumber": 16
      }
    ]
  },
  {
    "kanji": "出",
    "primaryLesson": "Pelajaran 14",
    "primaryLessonNumber": 14,
    "meaning": "Keluar / Mengeluarkan",
    "onyomi": [
      "シュツ",
      "スイ"
    ],
    "kunyomi": [
      "でる",
      "だす"
    ],
    "examples": [
      {
        "word": "出ます",
        "kana": "でます",
        "meaning": "keluar [ruangan/lulus/kembalian]"
      },
      {
        "word": "出口",
        "kana": "でぐち",
        "meaning": "pintu keluar"
      },
      {
        "word": "出します",
        "kana": "だします",
        "meaning": "mengeluarkan, menyerahkan"
      },
      {
        "word": "出かけます",
        "kana": "でかけます",
        "meaning": "bepergian, keluar rumah"
      }
    ],
    "prompts": [
      {
        "id": "出_出ます_1",
        "word": "出ます",
        "fullKana": "でます",
        "prefixKana": "",
        "targetKana": "で",
        "suffixKana": "ます",
        "meaning": "keluar [ruangan/lulus/kembalian]",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      },
      {
        "id": "出_出口_2",
        "word": "出口",
        "fullKana": "でぐち",
        "prefixKana": "",
        "targetKana": "で",
        "suffixKana": "ぐち",
        "meaning": "pintu keluar",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      },
      {
        "id": "出_出します_3",
        "word": "出します",
        "fullKana": "だします",
        "prefixKana": "",
        "targetKana": "だ",
        "suffixKana": "します",
        "meaning": "mengeluarkan, menyerahkan",
        "lesson": "Pelajaran 16",
        "lessonNumber": 16
      },
      {
        "id": "出_出かけます_4",
        "word": "出かけます",
        "fullKana": "でかけます",
        "prefixKana": "",
        "targetKana": "で",
        "suffixKana": "かけます",
        "meaning": "bepergian, keluar rumah",
        "lesson": "Pelajaran 17",
        "lessonNumber": 17
      }
    ]
  },
  {
    "kanji": "立",
    "primaryLesson": "Pelajaran 14",
    "primaryLessonNumber": 14,
    "meaning": "Berdiri",
    "onyomi": [
      "リツ",
      "リュウ"
    ],
    "kunyomi": [
      "たつ",
      "たてる"
    ],
    "examples": [
      {
        "word": "立ちます",
        "kana": "たちます",
        "meaning": "berdiri"
      },
      {
        "word": "役に立ちます",
        "kana": "やくにたちます",
        "meaning": "berguna, bermanfaat"
      }
    ],
    "prompts": [
      {
        "id": "立_立ちます_1",
        "word": "立ちます",
        "fullKana": "たちます",
        "prefixKana": "",
        "targetKana": "た",
        "suffixKana": "ちます",
        "meaning": "berdiri",
        "lesson": "Pelajaran 14",
        "lessonNumber": 14
      },
      {
        "id": "立_役に立ちます_2",
        "word": "役に立ちます",
        "fullKana": "やくにたちます",
        "prefixKana": "やくに",
        "targetKana": "た",
        "suffixKana": "ちます",
        "meaning": "berguna, bermanfaat",
        "lesson": "Pelajaran 21",
        "lessonNumber": 21
      }
    ]
  },
  {
    "kanji": "目",
    "primaryLesson": "Pelajaran 16",
    "primaryLessonNumber": 16,
    "meaning": "Mata",
    "onyomi": [
      "モク",
      "ボク"
    ],
    "kunyomi": [
      "め",
      "ま"
    ],
    "examples": [
      {
        "word": "目",
        "kana": "め",
        "meaning": "mata"
      },
      {
        "word": "～目",
        "kana": "～め",
        "meaning": "urutan yang ke- (akhiran)"
      }
    ],
    "prompts": [
      {
        "id": "目_目_1",
        "word": "目",
        "fullKana": "め",
        "prefixKana": "",
        "targetKana": "め",
        "suffixKana": "",
        "meaning": "mata",
        "lesson": "Pelajaran 16",
        "lessonNumber": 16
      },
      {
        "id": "目_～目_2",
        "word": "～目",
        "fullKana": "～め",
        "prefixKana": "～",
        "targetKana": "め",
        "suffixKana": "",
        "meaning": "urutan yang ke- (akhiran)",
        "lesson": "Pelajaran 23",
        "lessonNumber": 23
      }
    ]
  },
  {
    "kanji": "耳",
    "primaryLesson": "Pelajaran 16",
    "primaryLessonNumber": 16,
    "meaning": "Telinga",
    "onyomi": [
      "ジ"
    ],
    "kunyomi": [
      "みみ"
    ],
    "examples": [
      {
        "word": "耳",
        "kana": "みみ",
        "meaning": "telinga"
      }
    ],
    "prompts": [
      {
        "id": "耳_耳_1",
        "word": "耳",
        "fullKana": "みみ",
        "prefixKana": "",
        "targetKana": "みみ",
        "suffixKana": "",
        "meaning": "telinga",
        "lesson": "Pelajaran 16",
        "lessonNumber": 16
      }
    ]
  },
  {
    "kanji": "長",
    "primaryLesson": "Pelajaran 16",
    "primaryLessonNumber": 16,
    "meaning": "Panjang / Ketua",
    "onyomi": [
      "チョウ"
    ],
    "kunyomi": [
      "ながい"
    ],
    "examples": [
      {
        "word": "長い",
        "kana": "ながい",
        "meaning": "panjang"
      },
      {
        "word": "課長",
        "kana": "かちょう",
        "meaning": "kepala seksi (manager)"
      },
      {
        "word": "部長",
        "kana": "ぶちょう",
        "meaning": "kepala bagian (general manager)"
      },
      {
        "word": "社長",
        "kana": "しゃちょう",
        "meaning": "direktur utama, presiden direktur"
      }
    ],
    "prompts": [
      {
        "id": "長_長い_1",
        "word": "長い",
        "fullKana": "ながい",
        "prefixKana": "",
        "targetKana": "なが",
        "suffixKana": "い",
        "meaning": "panjang",
        "lesson": "Pelajaran 16",
        "lessonNumber": 16
      },
      {
        "id": "長_課長_2",
        "word": "課長",
        "fullKana": "かちょう",
        "prefixKana": "か",
        "targetKana": "ちょう",
        "suffixKana": "",
        "meaning": "kepala seksi (manager)",
        "lesson": "Pelajaran 18",
        "lessonNumber": 18
      },
      {
        "id": "長_部長_3",
        "word": "部長",
        "fullKana": "ぶちょう",
        "prefixKana": "ぶ",
        "targetKana": "ちょう",
        "suffixKana": "",
        "meaning": "kepala bagian (general manager)",
        "lesson": "Pelajaran 18",
        "lessonNumber": 18
      },
      {
        "id": "長_社長_4",
        "word": "社長",
        "fullKana": "しゃちょう",
        "prefixKana": "しゃ",
        "targetKana": "ちょう",
        "suffixKana": "",
        "meaning": "direktur utama, presiden direktur",
        "lesson": "Pelajaran 18",
        "lessonNumber": 18
      }
    ]
  },
  {
    "kanji": "言",
    "primaryLesson": "Pelajaran 21",
    "primaryLessonNumber": 21,
    "meaning": "Berkata / Bahasa",
    "onyomi": [
      "ゲン",
      "ゴン"
    ],
    "kunyomi": [
      "いう",
      "こと"
    ],
    "examples": [
      {
        "word": "言います",
        "kana": "いいます",
        "meaning": "mengatakan, berkata"
      }
    ],
    "prompts": [
      {
        "id": "言_言います_1",
        "word": "言います",
        "fullKana": "いいます",
        "prefixKana": "",
        "targetKana": "い",
        "suffixKana": "います",
        "meaning": "mengatakan, berkata",
        "lesson": "Pelajaran 21",
        "lessonNumber": 21
      }
    ]
  },
  {
    "kanji": "足",
    "primaryLesson": "Pelajaran 25",
    "primaryLessonNumber": 25,
    "meaning": "Kaki / Cukup",
    "onyomi": [
      "ソク"
    ],
    "kunyomi": [
      "あし",
      "たりる"
    ],
    "examples": [
      {
        "word": "足ります",
        "kana": "たります",
        "meaning": "cukup"
      }
    ],
    "prompts": [
      {
        "id": "足_足ります_1",
        "word": "足ります",
        "fullKana": "たります",
        "prefixKana": "",
        "targetKana": "た",
        "suffixKana": "ります",
        "meaning": "cukup",
        "lesson": "Pelajaran 25",
        "lessonNumber": 25
      }
    ]
  }
];

export const kanjiWritingEntriesMap: Record<string, KanjiWritingEntry> = Object.fromEntries(
  kanjiWritingEntries.map(e => [e.kanji, e])
);

/**
 * Get all available lessons containing Kanji in JLPT N5
 */
export const kanjiLessonList: Array<{ lesson: string; lessonNumber: number; count: number }> = (() => {
  const map = new Map<number, { lesson: string; count: number }>();
  for (const e of kanjiWritingEntries) {
    const cur = map.get(e.primaryLessonNumber) || { lesson: e.primaryLesson, count: 0 };
    cur.count++;
    map.set(e.primaryLessonNumber, cur);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([num, data]) => ({
      lesson: data.lesson,
      lessonNumber: num,
      count: data.count
    }));
})();
