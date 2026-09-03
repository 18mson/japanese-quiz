// src/data/referenceData.ts
// Bundled local reference data (Furoku / 付録) for fast loading & offline PWA support

export interface NumberUnit {
  value: number;
  japanese: string;
}

export interface ExampleValue {
  value: string;
  japanese: string;
}

export interface KataBilanganData {
  title: string;
  units: NumberUnit[];
  decimal_examples: ExampleValue[];
  fraction_examples: ExampleValue[];
  note_irregular: string;
}

export interface CalendarEntry {
  japanese: string;
  meaning: string;
}

export interface DurationEntry {
  value: number | string;
  japanese: string;
}

export interface UngkapanWaktuData {
  kalender: {
    title: string;
    hari: CalendarEntry[];
    pagi: CalendarEntry[];
    malam: CalendarEntry[];
    minggu: CalendarEntry[];
    bulan: CalendarEntry[];
    tahun: CalendarEntry[];
  };
  durasi: {
    title: string;
    jam_menit: {
      jam: DurationEntry[];
      menit: DurationEntry[];
    };
    jangka_waktu: {
      hari: DurationEntry[];
      minggu: DurationEntry[];
      bulan: DurationEntry[];
      tahun: DurationEntry[];
    };
    note_irregular: string;
  };
}

export interface CounterValueItem {
  value: number | string;
  japanese: string;
}

export interface CounterCategoryItem {
  category: string;
  counter: string;
  counter_reading: string;
  usage_example: string;
  values: CounterValueItem[];
}

export interface KataBantuBilanganData {
  title: string;
  categories: CounterCategoryItem[];
  note: string;
}

export interface VerbItem {
  masu: string;
  masu_reading: string;
  te: string;
  kamus: string;
  nai: string;
  ta: string;
  meaning: string;
  pelajaran: number;
}

export interface VerbGroupData {
  title: string;
  description: string;
  verbs: VerbItem[];
}

export interface KonjugasiKataKerjaData {
  title: string;
  note_umum: string;
  kelompok_1: VerbGroupData;
  kelompok_2: VerbGroupData;
  kelompok_3: VerbGroupData;
}

export const kataBilanganData: KataBilanganData = {
  "title": "I. Kata Bilangan",
  "units": [
    {
      "value": 0,
      "japanese": "ゼロ、れい"
    },
    {
      "value": 1,
      "japanese": "いち"
    },
    {
      "value": 2,
      "japanese": "に"
    },
    {
      "value": 3,
      "japanese": "さん"
    },
    {
      "value": 4,
      "japanese": "よん、し"
    },
    {
      "value": 5,
      "japanese": "ご"
    },
    {
      "value": 6,
      "japanese": "ろく"
    },
    {
      "value": 7,
      "japanese": "なな、しち"
    },
    {
      "value": 8,
      "japanese": "はち"
    },
    {
      "value": 9,
      "japanese": "きゅう、く"
    },
    {
      "value": 10,
      "japanese": "じゅう"
    },
    {
      "value": 11,
      "japanese": "じゅういち"
    },
    {
      "value": 12,
      "japanese": "じゅうに"
    },
    {
      "value": 13,
      "japanese": "じゅうさん"
    },
    {
      "value": 14,
      "japanese": "じゅうよん、じゅうし"
    },
    {
      "value": 15,
      "japanese": "じゅうご"
    },
    {
      "value": 16,
      "japanese": "じゅうろく"
    },
    {
      "value": 17,
      "japanese": "じゅうなな、じゅうしち"
    },
    {
      "value": 18,
      "japanese": "じゅうはち"
    },
    {
      "value": 19,
      "japanese": "じゅうきゅう、じゅうく"
    },
    {
      "value": 20,
      "japanese": "にじゅう"
    },
    {
      "value": 30,
      "japanese": "さんじゅう"
    },
    {
      "value": 40,
      "japanese": "よんじゅう"
    },
    {
      "value": 50,
      "japanese": "ごじゅう"
    },
    {
      "value": 60,
      "japanese": "ろくじゅう"
    },
    {
      "value": 70,
      "japanese": "ななじゅう、しちじゅう"
    },
    {
      "value": 80,
      "japanese": "はちじゅう"
    },
    {
      "value": 90,
      "japanese": "きゅうじゅう"
    },
    {
      "value": 100,
      "japanese": "ひゃく"
    },
    {
      "value": 200,
      "japanese": "にひゃく"
    },
    {
      "value": 300,
      "japanese": "さんびゃく"
    },
    {
      "value": 400,
      "japanese": "よんひゃく"
    },
    {
      "value": 500,
      "japanese": "ごひゃく"
    },
    {
      "value": 600,
      "japanese": "ろっぴゃく"
    },
    {
      "value": 700,
      "japanese": "ななひゃく"
    },
    {
      "value": 800,
      "japanese": "はっぴゃく"
    },
    {
      "value": 900,
      "japanese": "きゅうひゃく"
    },
    {
      "value": 1000,
      "japanese": "せん"
    },
    {
      "value": 2000,
      "japanese": "にせん"
    },
    {
      "value": 3000,
      "japanese": "さんぜん"
    },
    {
      "value": 4000,
      "japanese": "よんせん"
    },
    {
      "value": 5000,
      "japanese": "ごせん"
    },
    {
      "value": 6000,
      "japanese": "ろくせん"
    },
    {
      "value": 7000,
      "japanese": "ななせん"
    },
    {
      "value": 8000,
      "japanese": "はっせん"
    },
    {
      "value": 9000,
      "japanese": "きゅうせん"
    },
    {
      "value": 10000,
      "japanese": "いちまん"
    },
    {
      "value": 100000,
      "japanese": "じゅうまん"
    },
    {
      "value": 1000000,
      "japanese": "ひゃくまん"
    },
    {
      "value": 10000000,
      "japanese": "せんまん"
    },
    {
      "value": 100000000,
      "japanese": "いちおく"
    }
  ],
  "decimal_examples": [
    {
      "value": "17.5",
      "japanese": "じゅうななてんご"
    },
    {
      "value": "0.83",
      "japanese": "れいてんはちさん"
    }
  ],
  "fraction_examples": [
    {
      "value": "1/2",
      "japanese": "にぶんの いち"
    },
    {
      "value": "3/4",
      "japanese": "よんぶんの さん"
    }
  ],
  "note_irregular": "Perhatikan pola tidak beraturan: 300=さんびゃく (bukan さんひゃく), 600=ろっぴゃく, 800=はっぴゃく, 3000=さんぜん (bukan さんせん), 8000=はっせん. Ini penting untuk validasi jawaban di quiz, jangan expect pola linear murni."
};

export const ungkapanWaktuData: UngkapanWaktuData = {
  kalender: {
  "title": "II. Ungkapan Waktu (Kalender)",
  "hari": [
    {
      "japanese": "おととい",
      "meaning": "kemarin lusa"
    },
    {
      "japanese": "きのう",
      "meaning": "kemarin"
    },
    {
      "japanese": "きょう",
      "meaning": "hari ini"
    },
    {
      "japanese": "あした",
      "meaning": "besok"
    },
    {
      "japanese": "あさって",
      "meaning": "lusa"
    },
    {
      "japanese": "まいにち",
      "meaning": "setiap hari"
    }
  ],
  "pagi": [
    {
      "japanese": "おとといの あさ",
      "meaning": "kemarin lusa pagi"
    },
    {
      "japanese": "きのうの あさ",
      "meaning": "kemarin pagi"
    },
    {
      "japanese": "けさ",
      "meaning": "tadi pagi"
    },
    {
      "japanese": "あしたの あさ",
      "meaning": "besok pagi"
    },
    {
      "japanese": "あさっての あさ",
      "meaning": "lusa pagi"
    },
    {
      "japanese": "まいあさ",
      "meaning": "setiap pagi"
    }
  ],
  "malam": [
    {
      "japanese": "おとといの ばん（よる）",
      "meaning": "kemarin lusa malam"
    },
    {
      "japanese": "きのうの ばん（よる）",
      "meaning": "kemarin malam"
    },
    {
      "japanese": "こんばん（きょうの よる）",
      "meaning": "malam ini"
    },
    {
      "japanese": "あしたの ばん（よる）",
      "meaning": "besok malam"
    },
    {
      "japanese": "あさっての ばん（よる）",
      "meaning": "lusa malam"
    },
    {
      "japanese": "まいばん",
      "meaning": "setiap malam"
    }
  ],
  "minggu": [
    {
      "japanese": "せんせんしゅう（にしゅうかんまえ）",
      "meaning": "dua minggu yang lalu"
    },
    {
      "japanese": "せんしゅう",
      "meaning": "minggu lalu"
    },
    {
      "japanese": "こんしゅう",
      "meaning": "minggu ini"
    },
    {
      "japanese": "らいしゅう",
      "meaning": "minggu depan"
    },
    {
      "japanese": "さらいしゅう",
      "meaning": "dua minggu lagi"
    },
    {
      "japanese": "まいしゅう",
      "meaning": "setiap minggu"
    }
  ],
  "bulan": [
    {
      "japanese": "せんせんげつ（にかげつまえ）",
      "meaning": "dua bulan yang lalu"
    },
    {
      "japanese": "せんげつ",
      "meaning": "bulan lalu"
    },
    {
      "japanese": "こんげつ",
      "meaning": "bulan ini"
    },
    {
      "japanese": "らいげつ",
      "meaning": "bulan depan"
    },
    {
      "japanese": "さらいげつ",
      "meaning": "dua bulan lagi"
    },
    {
      "japanese": "まいつき",
      "meaning": "setiap bulan"
    }
  ],
  "tahun": [
    {
      "japanese": "おととし",
      "meaning": "dua tahun yang lalu"
    },
    {
      "japanese": "きょねん",
      "meaning": "tahun lalu"
    },
    {
      "japanese": "ことし",
      "meaning": "tahun ini"
    },
    {
      "japanese": "らいねん",
      "meaning": "tahun depan"
    },
    {
      "japanese": "さらいねん",
      "meaning": "dua tahun lagi"
    },
    {
      "japanese": "まいとし、まいねん",
      "meaning": "setiap tahun"
    }
  ]
},
  durasi: {
  "title": "III. Ungkapan Waktu (Durasi)",
  "jam_menit": {
    "jam": [
      {
        "value": 1,
        "japanese": "いちじかん"
      },
      {
        "value": 2,
        "japanese": "にじかん"
      },
      {
        "value": 3,
        "japanese": "さんじかん"
      },
      {
        "value": 4,
        "japanese": "よじかん"
      },
      {
        "value": 5,
        "japanese": "ごじかん"
      },
      {
        "value": 6,
        "japanese": "ろくじかん"
      },
      {
        "value": 7,
        "japanese": "ななじかん、しちじかん"
      },
      {
        "value": 8,
        "japanese": "はちじかん"
      },
      {
        "value": 9,
        "japanese": "くじかん"
      },
      {
        "value": 10,
        "japanese": "じゅうじかん"
      },
      {
        "value": "?",
        "japanese": "なんじかん"
      }
    ],
    "menit": [
      {
        "value": 1,
        "japanese": "いっぷん"
      },
      {
        "value": 2,
        "japanese": "にふん"
      },
      {
        "value": 3,
        "japanese": "さんぷん"
      },
      {
        "value": 4,
        "japanese": "よんぷん"
      },
      {
        "value": 5,
        "japanese": "ごふん"
      },
      {
        "value": 6,
        "japanese": "ろっぷん"
      },
      {
        "value": 7,
        "japanese": "ななふん"
      },
      {
        "value": 8,
        "japanese": "はっぷん"
      },
      {
        "value": 9,
        "japanese": "きゅうふん"
      },
      {
        "value": 10,
        "japanese": "じゅっぷん、じっぷん"
      },
      {
        "value": "?",
        "japanese": "なんぷん"
      }
    ]
  },
  "jangka_waktu": {
    "hari": [
      {
        "value": 1,
        "japanese": "いちにち"
      },
      {
        "value": 2,
        "japanese": "ふつか"
      },
      {
        "value": 3,
        "japanese": "みっか"
      },
      {
        "value": 4,
        "japanese": "よっか"
      },
      {
        "value": 5,
        "japanese": "いつか"
      },
      {
        "value": 6,
        "japanese": "むいか"
      },
      {
        "value": 7,
        "japanese": "なのか"
      },
      {
        "value": 8,
        "japanese": "ようか"
      },
      {
        "value": 9,
        "japanese": "ここのか"
      },
      {
        "value": 10,
        "japanese": "とおか"
      },
      {
        "value": "?",
        "japanese": "なんにち"
      }
    ],
    "minggu": [
      {
        "value": 1,
        "japanese": "いっしゅうかん"
      },
      {
        "value": 2,
        "japanese": "にしゅうかん"
      },
      {
        "value": 3,
        "japanese": "さんしゅうかん"
      },
      {
        "value": 4,
        "japanese": "よんしゅうかん"
      },
      {
        "value": 5,
        "japanese": "ごしゅうかん"
      },
      {
        "value": 6,
        "japanese": "ろくしゅうかん"
      },
      {
        "value": 7,
        "japanese": "ななしゅうかん"
      },
      {
        "value": 8,
        "japanese": "はっしゅうかん"
      },
      {
        "value": 9,
        "japanese": "きゅうしゅうかん"
      },
      {
        "value": 10,
        "japanese": "じゅっしゅうかん、じっしゅうかん"
      },
      {
        "value": "?",
        "japanese": "なんしゅうかん"
      }
    ],
    "bulan": [
      {
        "value": 1,
        "japanese": "いっかげつ"
      },
      {
        "value": 2,
        "japanese": "にかげつ"
      },
      {
        "value": 3,
        "japanese": "さんかげつ"
      },
      {
        "value": 4,
        "japanese": "よんかげつ"
      },
      {
        "value": 5,
        "japanese": "ごかげつ"
      },
      {
        "value": 6,
        "japanese": "ろっかげつ、はんとし"
      },
      {
        "value": 7,
        "japanese": "ななかげつ"
      },
      {
        "value": 8,
        "japanese": "はちかげつ、はっかげつ"
      },
      {
        "value": 9,
        "japanese": "きゅうかげつ"
      },
      {
        "value": 10,
        "japanese": "じゅっかげつ、じっかげつ"
      },
      {
        "value": "?",
        "japanese": "なんかげつ"
      }
    ],
    "tahun": [
      {
        "value": 1,
        "japanese": "いちねん"
      },
      {
        "value": 2,
        "japanese": "にねん"
      },
      {
        "value": 3,
        "japanese": "さんねん"
      },
      {
        "value": 4,
        "japanese": "よねん"
      },
      {
        "value": 5,
        "japanese": "ごねん"
      },
      {
        "value": 6,
        "japanese": "ろくねん"
      },
      {
        "value": 7,
        "japanese": "ななねん、しちねん"
      },
      {
        "value": 8,
        "japanese": "はちねん"
      },
      {
        "value": 9,
        "japanese": "きゅうねん"
      },
      {
        "value": 10,
        "japanese": "じゅうねん"
      },
      {
        "value": "?",
        "japanese": "なんねん"
      }
    ]
  },
  "note_irregular": "Pola tidak beraturan penting: 4 jam=よじかん (bukan よんじかん), 1 hari=いちにち tapi 2 hari=ふつか (bukan にじつ — pola khusus 1-10 hari beda dari pola angka biasa), 6 bulan=ろっかげつ atau はんとし (setengah tahun), 4 tahun=よねん (bukan よんねん)."
}
};

export const kataBantuBilanganData: KataBantuBilanganData = {
  "title": "IV. Kata Bantu Bilangan (Counter Words)",
  "categories": [
    {
      "category": "frekuensi",
      "counter": "回",
      "counter_reading": "かい",
      "usage_example": "berapa kali",
      "values": [
        {
          "value": 1,
          "japanese": "いっかい"
        },
        {
          "value": 2,
          "japanese": "にかい"
        },
        {
          "value": 3,
          "japanese": "さんかい"
        },
        {
          "value": 4,
          "japanese": "よんかい"
        },
        {
          "value": 5,
          "japanese": "ごかい"
        },
        {
          "value": 6,
          "japanese": "ろっかい"
        },
        {
          "value": 7,
          "japanese": "ななかい"
        },
        {
          "value": 8,
          "japanese": "はっかい"
        },
        {
          "value": 9,
          "japanese": "きゅうかい"
        },
        {
          "value": 10,
          "japanese": "じゅっかい、じっかい"
        },
        {
          "value": "?",
          "japanese": "なんかい"
        }
      ]
    },
    {
      "category": "benda kecil",
      "counter": "個",
      "counter_reading": "こ",
      "usage_example": "buah/biji benda kecil",
      "values": [
        {
          "value": 1,
          "japanese": "いっこ"
        },
        {
          "value": 2,
          "japanese": "にこ"
        },
        {
          "value": 3,
          "japanese": "さんこ"
        },
        {
          "value": 4,
          "japanese": "よんこ"
        },
        {
          "value": 5,
          "japanese": "ごこ"
        },
        {
          "value": 6,
          "japanese": "ろっこ"
        },
        {
          "value": 7,
          "japanese": "ななこ"
        },
        {
          "value": 8,
          "japanese": "はっこ"
        },
        {
          "value": 9,
          "japanese": "きゅうこ"
        },
        {
          "value": 10,
          "japanese": "じゅっこ、じっこ"
        },
        {
          "value": "?",
          "japanese": "なんこ"
        }
      ]
    },
    {
      "category": "sepatu dan kaos kaki",
      "counter": "足",
      "counter_reading": "そく",
      "usage_example": "pasang alas kaki",
      "values": [
        {
          "value": 1,
          "japanese": "いっそく"
        },
        {
          "value": 2,
          "japanese": "にそく"
        },
        {
          "value": 3,
          "japanese": "さんぞく"
        },
        {
          "value": 4,
          "japanese": "よんそく"
        },
        {
          "value": 5,
          "japanese": "ごそく"
        },
        {
          "value": 6,
          "japanese": "ろくそく"
        },
        {
          "value": 7,
          "japanese": "ななそく"
        },
        {
          "value": 8,
          "japanese": "はっそく"
        },
        {
          "value": 9,
          "japanese": "きゅうそく"
        },
        {
          "value": 10,
          "japanese": "じゅっそく、じっそく"
        },
        {
          "value": "?",
          "japanese": "なんぞく"
        }
      ]
    },
    {
      "category": "rumah",
      "counter": "軒",
      "counter_reading": "けん",
      "usage_example": "unit rumah/bangunan",
      "values": [
        {
          "value": 1,
          "japanese": "いっけん"
        },
        {
          "value": 2,
          "japanese": "にけん"
        },
        {
          "value": 3,
          "japanese": "さんげん"
        },
        {
          "value": 4,
          "japanese": "よんけん"
        },
        {
          "value": 5,
          "japanese": "ごけん"
        },
        {
          "value": 6,
          "japanese": "ろっけん"
        },
        {
          "value": 7,
          "japanese": "ななけん"
        },
        {
          "value": 8,
          "japanese": "はっけん"
        },
        {
          "value": 9,
          "japanese": "きゅうけん"
        },
        {
          "value": 10,
          "japanese": "じゅっけん、じっけん"
        },
        {
          "value": "?",
          "japanese": "なんげん"
        }
      ]
    },
    {
      "category": "lantai dari sebuah bangunan",
      "counter": "階",
      "counter_reading": "かい",
      "usage_example": "lantai ke-berapa",
      "values": [
        {
          "value": 1,
          "japanese": "いっかい"
        },
        {
          "value": 2,
          "japanese": "にかい"
        },
        {
          "value": 3,
          "japanese": "さんがい"
        },
        {
          "value": 4,
          "japanese": "よんかい"
        },
        {
          "value": 5,
          "japanese": "ごかい"
        },
        {
          "value": 6,
          "japanese": "ろっかい"
        },
        {
          "value": 7,
          "japanese": "ななかい"
        },
        {
          "value": 8,
          "japanese": "はっかい"
        },
        {
          "value": 9,
          "japanese": "きゅうかい"
        },
        {
          "value": 10,
          "japanese": "じゅっかい、じっかい"
        },
        {
          "value": "?",
          "japanese": "なんがい"
        }
      ]
    },
    {
      "category": "benda yang kurus dan panjang",
      "counter": "本",
      "counter_reading": "ほん",
      "usage_example": "batang/botol (pensil, pisang, botol, dll)",
      "values": [
        {
          "value": 1,
          "japanese": "いっぽん"
        },
        {
          "value": 2,
          "japanese": "にほん"
        },
        {
          "value": 3,
          "japanese": "さんぼん"
        },
        {
          "value": 4,
          "japanese": "よんほん"
        },
        {
          "value": 5,
          "japanese": "ごほん"
        },
        {
          "value": 6,
          "japanese": "ろっぽん"
        },
        {
          "value": 7,
          "japanese": "ななほん"
        },
        {
          "value": 8,
          "japanese": "はっぽん"
        },
        {
          "value": 9,
          "japanese": "きゅうほん"
        },
        {
          "value": 10,
          "japanese": "じゅっぽん、じっぽん"
        },
        {
          "value": "?",
          "japanese": "なんぼん"
        }
      ]
    },
    {
      "category": "minuman dalam cangkir/gelas",
      "counter": "杯",
      "counter_reading": "はい",
      "usage_example": "gelas/cangkir minuman",
      "values": [
        {
          "value": 1,
          "japanese": "いっぱい"
        },
        {
          "value": 2,
          "japanese": "にはい"
        },
        {
          "value": 3,
          "japanese": "さんばい"
        },
        {
          "value": 4,
          "japanese": "よんはい"
        },
        {
          "value": 5,
          "japanese": "ごはい"
        },
        {
          "value": 6,
          "japanese": "ろっぱい"
        },
        {
          "value": 7,
          "japanese": "ななはい"
        },
        {
          "value": 8,
          "japanese": "はっぱい"
        },
        {
          "value": 9,
          "japanese": "きゅうはい"
        },
        {
          "value": 10,
          "japanese": "じゅっぱい、じっぱい"
        },
        {
          "value": "?",
          "japanese": "なんばい"
        }
      ]
    },
    {
      "category": "binatang kecil, ikan, dan serangga",
      "counter": "匹",
      "counter_reading": "ひき",
      "usage_example": "ekor binatang kecil",
      "values": [
        {
          "value": 1,
          "japanese": "いっぴき"
        },
        {
          "value": 2,
          "japanese": "にひき"
        },
        {
          "value": 3,
          "japanese": "さんびき"
        },
        {
          "value": 4,
          "japanese": "よんひき"
        },
        {
          "value": 5,
          "japanese": "ごひき"
        },
        {
          "value": 6,
          "japanese": "ろっぴき"
        },
        {
          "value": 7,
          "japanese": "ななひき"
        },
        {
          "value": 8,
          "japanese": "はっぴき"
        },
        {
          "value": 9,
          "japanese": "きゅうひき"
        },
        {
          "value": 10,
          "japanese": "じゅっぴき、じっぴき"
        },
        {
          "value": "?",
          "japanese": "なんびき"
        }
      ]
    },
    {
      "category": "usia dan umur",
      "counter": "歳 (才)",
      "counter_reading": "さい",
      "usage_example": "usia / umur seseorang",
      "values": [
        {
          "value": 1,
          "japanese": "いっさい"
        },
        {
          "value": 2,
          "japanese": "にさい"
        },
        {
          "value": 3,
          "japanese": "さんさい"
        },
        {
          "value": 4,
          "japanese": "よんさい"
        },
        {
          "value": 5,
          "japanese": "ごさい"
        },
        {
          "value": 6,
          "japanese": "ろくさい"
        },
        {
          "value": 7,
          "japanese": "ななさい"
        },
        {
          "value": 8,
          "japanese": "はっさい"
        },
        {
          "value": 9,
          "japanese": "きゅうさい"
        },
        {
          "value": 10,
          "japanese": "じゅっさい、じっさい"
        },
        {
          "value": 20,
          "japanese": "はたち (二十歳)"
        },
        {
          "value": 21,
          "japanese": "にじゅういっさい"
        },
        {
          "value": 30,
          "japanese": "さんじゅっさい"
        },
        {
          "value": 40,
          "japanese": "よんじゅっさい"
        },
        {
          "value": 50,
          "japanese": "ごじゅっさい"
        },
        {
          "value": 60,
          "japanese": "ろくじゅっさい"
        },
        {
          "value": 70,
          "japanese": "ななじゅっさい"
        },
        {
          "value": 80,
          "japanese": "はちじゅっさい"
        },
        {
          "value": 90,
          "japanese": "きゅうじゅっさい"
        },
        {
          "value": 100,
          "japanese": "ひゃくさい (百歳)"
        },
        {
          "value": "?",
          "japanese": "なんさい、おいくつ"
        }
      ]
    }
  ],
  "note": "Counter untuk umur (〜さい/歳): 1–10 tahun adalah pola dasar. Umur gabungan (21–99) dibentuk dengan [Puluhan] + [Satuan 1–9], di mana akhiran 1 selalu -issai (contoh: 21 = にじゅういっさい) dan akhiran 8 selalu -hassai (contoh: 28 = にじゅうはっさい). Umur kelipatan 10 berakhiran -jussai (contoh: 30 = さんじゅっさい, 40 = よんじゅっさい). Dua pengecualian utama: 20 tahun adalah はたち (hatachi), dan 100 tahun adalah ひゃくさい (hyakusai)."
};

export const konjugasiKataKerjaData: KonjugasiKataKerjaData = {
  title: "V. Konjugasi Kata Kerja",
  note_umum: "Angka di kolom 'pelajaran' menunjukkan pelajaran di mana kata kerja tersebut pertama kali muncul di buku.",
  kelompok_1: {
  "title": "Kelompok I",
  "description": "Godan-doushi. Bentuk kamus berakhiran u/ku/gu/su/tsu/nu/bu/mu/ru dengan pola konjugasi konsonan.",
  "verbs": [
    {
      "masu": "会います",
      "masu_reading": "あい ます",
      "te": "あって",
      "kamus": "あう",
      "nai": "あわ ない",
      "ta": "あった",
      "meaning": "bertemu [dengan teman]",
      "pelajaran": 6
    },
    {
      "masu": "遊びます",
      "masu_reading": "あそび ます",
      "te": "あそんで",
      "kamus": "あそぶ",
      "nai": "あそば ない",
      "ta": "あそんだ",
      "meaning": "bermain",
      "pelajaran": 13
    },
    {
      "masu": "洗います",
      "masu_reading": "あらい ます",
      "te": "あらって",
      "kamus": "あらう",
      "nai": "あらわ ない",
      "ta": "あらった",
      "meaning": "mencuci",
      "pelajaran": 18
    },
    {
      "masu": "あります",
      "masu_reading": "あり ます",
      "te": "あって",
      "kamus": "ある",
      "nai": "－ない",
      "ta": "あった",
      "meaning": "ada, mempunyai (benda mati)",
      "pelajaran": 9
    },
    {
      "masu": "あります[おまつりが～]",
      "masu_reading": "あり ます",
      "te": "あって",
      "kamus": "ある",
      "nai": "－ない",
      "ta": "あった",
      "meaning": "ada, diadakan [pesta perayaan]",
      "pelajaran": 21
    },
    {
      "masu": "歩きます",
      "masu_reading": "あるき ます",
      "te": "あるいて",
      "kamus": "あるく",
      "nai": "あるか ない",
      "ta": "あるいた",
      "meaning": "berjalan kaki",
      "pelajaran": 23
    },
    {
      "masu": "言います",
      "masu_reading": "いい ます",
      "te": "いって",
      "kamus": "いう",
      "nai": "いわ ない",
      "ta": "いった",
      "meaning": "mengatakan, berkata",
      "pelajaran": 21
    },
    {
      "masu": "行きます",
      "masu_reading": "いき ます",
      "te": "いって",
      "kamus": "いく",
      "nai": "いか ない",
      "ta": "いった",
      "meaning": "pergi",
      "pelajaran": 5
    },
    {
      "masu": "急ぎます",
      "masu_reading": "いそぎ ます",
      "te": "いそいで",
      "kamus": "いそぐ",
      "nai": "いそが ない",
      "ta": "いそいだ",
      "meaning": "buru-buru",
      "pelajaran": 14
    },
    {
      "masu": "要ります[ビザが～]",
      "masu_reading": "いり ます",
      "te": "いって",
      "kamus": "いる",
      "nai": "いら ない",
      "ta": "いった",
      "meaning": "memerlukan [visa]",
      "pelajaran": 20
    },
    {
      "masu": "動きます",
      "masu_reading": "うごき ます",
      "te": "うごいて",
      "kamus": "うごく",
      "nai": "うごか ない",
      "ta": "うごいた",
      "meaning": "pindah, bergerak",
      "pelajaran": 21
    },
    {
      "masu": "歌います",
      "masu_reading": "うたい ます",
      "te": "うたって",
      "kamus": "うたう",
      "nai": "うたわ ない",
      "ta": "うたった",
      "meaning": "bernyanyi, menyanyi",
      "pelajaran": 18
    },
    {
      "masu": "売ります",
      "masu_reading": "うり ます",
      "te": "うって",
      "kamus": "うる",
      "nai": "うら ない",
      "ta": "うった",
      "meaning": "menjual",
      "pelajaran": 15
    },
    {
      "masu": "置きます",
      "masu_reading": "おき ます",
      "te": "おいて",
      "kamus": "おく",
      "nai": "おか ない",
      "ta": "おいた",
      "meaning": "meletakkan, menaruh",
      "pelajaran": 15
    },
    {
      "masu": "送ります",
      "masu_reading": "おくり ます",
      "te": "おくって",
      "kamus": "おくる",
      "nai": "おくら ない",
      "ta": "おくった",
      "meaning": "mengirim",
      "pelajaran": 7
    },
    {
      "masu": "送ります[ひとを～]",
      "masu_reading": "おくり ます",
      "te": "おくって",
      "kamus": "おくる",
      "nai": "おくら ない",
      "ta": "おくった",
      "meaning": "mengantar [orang]",
      "pelajaran": 24
    },
    {
      "masu": "押します",
      "masu_reading": "おし ます",
      "te": "おして",
      "kamus": "おす",
      "nai": "おさ ない",
      "ta": "おした",
      "meaning": "menekan",
      "pelajaran": 16
    },
    {
      "masu": "思い出します",
      "masu_reading": "おもいだし ます",
      "te": "おもいだして",
      "kamus": "おもいだす",
      "nai": "おもいださ ない",
      "ta": "おもいだした",
      "meaning": "teringat",
      "pelajaran": 15
    },
    {
      "masu": "思います",
      "masu_reading": "おもい ます",
      "te": "おもって",
      "kamus": "おもう",
      "nai": "おもわ ない",
      "ta": "おもった",
      "meaning": "mengira, berpikir",
      "pelajaran": 21
    },
    {
      "masu": "泳ぎます",
      "masu_reading": "およぎ ます",
      "te": "およいで",
      "kamus": "およぐ",
      "nai": "およが ない",
      "ta": "およいだ",
      "meaning": "berenang",
      "pelajaran": 13
    },
    {
      "masu": "下ろします[おかねを～]",
      "masu_reading": "おろし ます",
      "te": "おろして",
      "kamus": "おろす",
      "nai": "おろさ ない",
      "ta": "おろした",
      "meaning": "mengeluarkan/mengambil [uang]",
      "pelajaran": 16
    },
    {
      "masu": "終わります",
      "masu_reading": "おわり ます",
      "te": "おわって",
      "kamus": "おわる",
      "nai": "おわら ない",
      "ta": "おわった",
      "meaning": "selesai",
      "pelajaran": 4
    },
    {
      "masu": "買います",
      "masu_reading": "かい ます",
      "te": "かって",
      "kamus": "かう",
      "nai": "かわ ない",
      "ta": "かった",
      "meaning": "membeli",
      "pelajaran": 6
    },
    {
      "masu": "返します",
      "masu_reading": "かえし ます",
      "te": "かえして",
      "kamus": "かえす",
      "nai": "かえさ ない",
      "ta": "かえした",
      "meaning": "mengembalikan",
      "pelajaran": 17
    },
    {
      "masu": "帰ります",
      "masu_reading": "かえり ます",
      "te": "かえって",
      "kamus": "かえる",
      "nai": "かえら ない",
      "ta": "かえった",
      "meaning": "pulang",
      "pelajaran": 5
    },
    {
      "masu": "かかります",
      "masu_reading": "かかり ます",
      "te": "かかって",
      "kamus": "かかる",
      "nai": "かから ない",
      "ta": "かかった",
      "meaning": "memakan, perlu",
      "pelajaran": 11
    },
    {
      "masu": "書きます（かきます）",
      "masu_reading": "かき ます",
      "te": "かいて",
      "kamus": "かく",
      "nai": "かか ない",
      "ta": "かいた",
      "meaning": "menulis, menggambar",
      "pelajaran": 6
    },
    {
      "masu": "貸します",
      "masu_reading": "かし ます",
      "te": "かして",
      "kamus": "かす",
      "nai": "かさ ない",
      "ta": "かした",
      "meaning": "meminjamkan, menyewakan",
      "pelajaran": 7
    },
    {
      "masu": "勝ちます",
      "masu_reading": "かち ます",
      "te": "かって",
      "kamus": "かつ",
      "nai": "かた ない",
      "ta": "かった",
      "meaning": "menang",
      "pelajaran": 21
    },
    {
      "masu": "かぶります",
      "masu_reading": "かぶり ます",
      "te": "かぶって",
      "kamus": "かぶる",
      "nai": "かぶら ない",
      "ta": "かぶった",
      "meaning": "memakai (topi)",
      "pelajaran": 22
    },
    {
      "masu": "頑張ります",
      "masu_reading": "がんばり ます",
      "te": "がんばって",
      "kamus": "がんばる",
      "nai": "がんばら ない",
      "ta": "がんばった",
      "meaning": "berusaha, bekerja keras",
      "pelajaran": 25
    },
    {
      "masu": "聞きます",
      "masu_reading": "きき ます",
      "te": "きいて",
      "kamus": "きく",
      "nai": "きか ない",
      "ta": "きいた",
      "meaning": "mendengar",
      "pelajaran": 6
    },
    {
      "masu": "聞きます[せんせいに～]",
      "masu_reading": "きき ます",
      "te": "きいて",
      "kamus": "きく",
      "nai": "きか ない",
      "ta": "きいた",
      "meaning": "bertanya [kepada guru]",
      "pelajaran": 23
    },
    {
      "masu": "切ります",
      "masu_reading": "きり ます",
      "te": "きって",
      "kamus": "きる",
      "nai": "きら ない",
      "ta": "きった",
      "meaning": "memotong",
      "pelajaran": 7
    },
    {
      "masu": "消します",
      "masu_reading": "けし ます",
      "te": "けして",
      "kamus": "けす",
      "nai": "けさ ない",
      "ta": "けした",
      "meaning": "mematikan, memadamkan",
      "pelajaran": 14
    },
    {
      "masu": "触ります[ドアに～]",
      "masu_reading": "さわり ます",
      "te": "さわって",
      "kamus": "さわる",
      "nai": "さわら ない",
      "ta": "さわった",
      "meaning": "menyentuh [pintu]",
      "pelajaran": 23
    },
    {
      "masu": "知ります",
      "masu_reading": "しり ます",
      "te": "しって",
      "kamus": "しる",
      "nai": "しら ない",
      "ta": "しった",
      "meaning": "mengetahui, mengenal",
      "pelajaran": 15
    },
    {
      "masu": "吸います[たばこを～]",
      "masu_reading": "すい ます",
      "te": "すって",
      "kamus": "すう",
      "nai": "すわ ない",
      "ta": "すった",
      "meaning": "mengisap [rokok], merokok",
      "pelajaran": 6
    },
    {
      "masu": "住みます",
      "masu_reading": "すみ ます",
      "te": "すんで",
      "kamus": "すむ",
      "nai": "すま ない",
      "ta": "すんだ",
      "meaning": "tinggal",
      "pelajaran": 15
    },
    {
      "masu": "座ります",
      "masu_reading": "すわり ます",
      "te": "すわって",
      "kamus": "すわる",
      "nai": "すわら ない",
      "ta": "すわった",
      "meaning": "duduk",
      "pelajaran": 14
    },
    {
      "masu": "出します",
      "masu_reading": "だし ます",
      "te": "だして",
      "kamus": "だす",
      "nai": "ださ ない",
      "ta": "だした",
      "meaning": "mengeluarkan, menyerahkan, mengirim",
      "pelajaran": 16
    },
    {
      "masu": "立ちます",
      "masu_reading": "たち ます",
      "te": "たって",
      "kamus": "たつ",
      "nai": "たた ない",
      "ta": "たった",
      "meaning": "berdiri",
      "pelajaran": 14
    },
    {
      "masu": "使います",
      "masu_reading": "つかい ます",
      "te": "つかって",
      "kamus": "つかう",
      "nai": "つかわ ない",
      "ta": "つかった",
      "meaning": "memakai",
      "pelajaran": 14
    },
    {
      "masu": "着きます",
      "masu_reading": "つき ます",
      "te": "ついて",
      "kamus": "つく",
      "nai": "つか ない",
      "ta": "ついた",
      "meaning": "tiba, sampai",
      "pelajaran": 25
    },
    {
      "masu": "作ります、造ります",
      "masu_reading": "つくり ます",
      "te": "つくって",
      "kamus": "つくる",
      "nai": "つくら ない",
      "ta": "つくった",
      "meaning": "membuat, membangun, memproduksi",
      "pelajaran": 15
    },
    {
      "masu": "連れて行きます",
      "masu_reading": "つれていき ます",
      "te": "つれていって",
      "kamus": "つれていく",
      "nai": "つれていか ない",
      "ta": "つれていった",
      "meaning": "membawa, mengajak pergi",
      "pelajaran": 24
    },
    {
      "masu": "手伝います",
      "masu_reading": "てつだい ます",
      "te": "てつだって",
      "kamus": "てつだう",
      "nai": "てつだわ ない",
      "ta": "てつだった",
      "meaning": "membantu",
      "pelajaran": 14
    },
    {
      "masu": "泊まります[ホテルに～]",
      "masu_reading": "とまり ます",
      "te": "とまって",
      "kamus": "とまる",
      "nai": "とまら ない",
      "ta": "とまった",
      "meaning": "menginap [di hotel]",
      "pelajaran": 19
    },
    {
      "masu": "取ります",
      "masu_reading": "とり ます",
      "te": "とって",
      "kamus": "とる",
      "nai": "とら ない",
      "ta": "とった",
      "meaning": "mengambil",
      "pelajaran": 14
    },
    {
      "masu": "撮ります[しゃしんを～]",
      "masu_reading": "とり ます",
      "te": "とって",
      "kamus": "とる",
      "nai": "とら ない",
      "ta": "tottta",
      "meaning": "mengambil [foto]",
      "pelajaran": 14
    },
    {
      "masu": "取ります[としを～]",
      "masu_reading": "とり ます",
      "te": "とって",
      "kamus": "とる",
      "nai": "とら ない",
      "ta": "とった",
      "meaning": "berumur, lanjut usia",
      "pelajaran": 25
    },
    {
      "masu": "直します",
      "masu_reading": "なおし ます",
      "te": "なおして",
      "kamus": "なおす",
      "nai": "なおさ ない",
      "ta": "なおした",
      "meaning": "mengoreksi",
      "pelajaran": 24
    },
    {
      "masu": "なくします",
      "masu_reading": "なくし ます",
      "te": "なくして",
      "kamus": "なくす",
      "nai": "なくさ ない",
      "ta": "なくした",
      "meaning": "kehilangan",
      "pelajaran": 19
    },
    {
      "masu": "習います",
      "masu_reading": "ならい ます",
      "te": "ならって",
      "kamus": "ならう",
      "nai": "ならわ ない",
      "ta": "ならった",
      "meaning": "belajar",
      "pelajaran": 7
    },
    {
      "masu": "なります",
      "masu_reading": "なり ます",
      "te": "なって",
      "kamus": "なる",
      "nai": "なら ない",
      "ta": "なった",
      "meaning": "menjadi",
      "pelajaran": 19
    },
    {
      "masu": "脱ぎます",
      "masu_reading": "ぬぎ ます",
      "te": "ぬいで",
      "kamus": "ぬぐ",
      "nai": "ぬが ない",
      "ta": "ぬいだ",
      "meaning": "buka (baju, sepatu dan lain-lain)",
      "pelajaran": 19
    },
    {
      "masu": "登ります、上ります",
      "masu_reading": "のぼり ます",
      "te": "のぼって",
      "kamus": "のぼる",
      "nai": "のぼら ない",
      "ta": "のぼった",
      "meaning": "naik",
      "pelajaran": 6
    },
    {
      "masu": "飲みます",
      "masu_reading": "のみ ます",
      "te": "のんで",
      "kamus": "のむ",
      "nai": "のま ない",
      "ta": "のんだ",
      "meaning": "minum",
      "pelajaran": 6
    },
    {
      "masu": "飲みます[くすりを～]",
      "masu_reading": "のみ ます",
      "te": "のんで",
      "kamus": "のむ",
      "nai": "のま ない",
      "ta": "のんだ",
      "meaning": "minum (minuman keras)",
      "pelajaran": 16
    },
    {
      "masu": "乗ります[でんしゃに～]",
      "masu_reading": "のり ます",
      "te": "のって",
      "kamus": "のる",
      "nai": "のら ない",
      "ta": "のった",
      "meaning": "naik [kereta rel listrik]",
      "pelajaran": 16
    },
    {
      "masu": "入ります[きっさてんに～]",
      "masu_reading": "はいり ます",
      "te": "はいって",
      "kamus": "はいる",
      "nai": "はいら ない",
      "ta": "はいった",
      "meaning": "masuk [ke coffee shop]",
      "pelajaran": 16
    },
    {
      "masu": "入ります[だいがくに～]",
      "masu_reading": "はいり ます",
      "te": "はいって",
      "kamus": "はいる",
      "nai": "はいら ない",
      "ta": "はいった",
      "meaning": "masuk [universitas]",
      "pelajaran": 16
    },
    {
      "masu": "入ります[おふろに～]",
      "masu_reading": "はいり ます",
      "te": "はいって",
      "kamus": "はいる",
      "nai": "はいら ない",
      "ta": "はいった",
      "meaning": "mandi [ofuro]",
      "pelajaran": 17
    },
    {
      "masu": "はきます",
      "masu_reading": "はき ます",
      "te": "はいて",
      "kamus": "はく",
      "nai": "はか ない",
      "ta": "はいた",
      "meaning": "memakai (sepatu, celana)",
      "pelajaran": 22
    },
    {
      "masu": "働きます",
      "masu_reading": "はたらき ます",
      "te": "はたらいて",
      "kamus": "はたらく",
      "nai": "はたらか ない",
      "ta": "はたらいた",
      "meaning": "bekerja",
      "pelajaran": 4
    },
    {
      "masu": "話します",
      "masu_reading": "はなし ます",
      "te": "はなして",
      "kamus": "はなす",
      "nai": "はなさ ない",
      "ta": "はなした",
      "meaning": "berbicara",
      "pelajaran": 14
    },
    {
      "masu": "払います",
      "masu_reading": "はらい ます",
      "te": "はらって",
      "kamus": "はらう",
      "nai": "はらわ ない",
      "ta": "はらった",
      "meaning": "membayar",
      "pelajaran": 17
    },
    {
      "masu": "弾きます",
      "masu_reading": "ひき ます",
      "te": "ひいて",
      "kamus": "ひく",
      "nai": "ひか ない",
      "ta": "ひいた",
      "meaning": "bermain (bermaksud untuk bermain alat musik senar dan piano)",
      "pelajaran": 18
    },
    {
      "masu": "引きます",
      "masu_reading": "ひき ます",
      "te": "ひいて",
      "kamus": "ひく",
      "nai": "ひか ない",
      "ta": "ひいた",
      "meaning": "tarik",
      "pelajaran": 23
    },
    {
      "masu": "降ります[あめが～]",
      "masu_reading": "ふり ます",
      "te": "ふって",
      "kamus": "ふる",
      "nai": "ふら ない",
      "ta": "ふった",
      "meaning": "turun [hujan]",
      "pelajaran": 14
    },
    {
      "masu": "曲がります[みぎへ～]",
      "masu_reading": "まがり ます",
      "te": "まがって",
      "kamus": "まがる",
      "nai": "まがら ない",
      "ta": "まがった",
      "meaning": "belok [ke kanan]",
      "pelajaran": 23
    },
    {
      "masu": "待ちます",
      "masu_reading": "まち ます",
      "te": "まって",
      "kamus": "まつ",
      "nai": "また ない",
      "ta": "まった",
      "meaning": "menunggu",
      "pelajaran": 14
    },
    {
      "masu": "回します",
      "masu_reading": "まわし ます",
      "te": "まわして",
      "kamus": "まわす",
      "nai": "まわさ ない",
      "ta": "まわした",
      "meaning": "memutar",
      "pelajaran": 23
    },
    {
      "masu": "持ちます",
      "masu_reading": "もち ます",
      "te": "もって",
      "kamus": "もつ",
      "nai": "もた ない",
      "ta": "もった",
      "meaning": "membawa",
      "pelajaran": 14
    },
    {
      "masu": "持って行きます",
      "masu_reading": "もっていき ます",
      "te": "もっていって",
      "kamus": "もっていく",
      "nai": "もっていか ない",
      "ta": "もっていった",
      "meaning": "membawa pergi",
      "pelajaran": 17
    },
    {
      "masu": "もらいます",
      "masu_reading": "もらい ます",
      "te": "もらって",
      "kamus": "もらう",
      "nai": "もらわ ない",
      "ta": "もらった",
      "meaning": "mendapatkan, menerima",
      "pelajaran": 7
    },
    {
      "masu": "役に立ちます",
      "masu_reading": "やくにたち ます",
      "te": "やくにたって",
      "kamus": "やくにたつ",
      "nai": "やくにたた ない",
      "ta": "やくにたった",
      "meaning": "berguna, bermanfaat",
      "pelajaran": 21
    },
    {
      "masu": "休みます",
      "masu_reading": "やすみ ます",
      "te": "やすんで",
      "kamus": "やすむ",
      "nai": "やすま ない",
      "ta": "やすんだ",
      "meaning": "beristirahat, libur",
      "pelajaran": 4
    },
    {
      "masu": "休みます[かいしゃを～]",
      "masu_reading": "やすみ ます",
      "te": "やすんで",
      "kamus": "やすむ",
      "nai": "やすま ない",
      "ta": "やすんだ",
      "meaning": "tidak masuk [kerja]",
      "pelajaran": 21
    },
    {
      "masu": "呼びます",
      "masu_reading": "よび ます",
      "te": "よんで",
      "kamus": "よぶ",
      "nai": "よば ない",
      "ta": "よんだ",
      "meaning": "memanggil",
      "pelajaran": 14
    },
    {
      "masu": "読みます",
      "masu_reading": "よみ ます",
      "te": "よんで",
      "kamus": "よむ",
      "nai": "よま ない",
      "ta": "よんだ",
      "meaning": "membaca",
      "pelajaran": 6
    },
    {
      "masu": "わかります",
      "masu_reading": "わかり ます",
      "te": "わかって",
      "kamus": "わかる",
      "nai": "わから ない",
      "ta": "わかった",
      "meaning": "mengerti",
      "pelajaran": 9
    },
    {
      "masu": "渡ります[はしを～]",
      "masu_reading": "わたり ます",
      "te": "わたって",
      "kamus": "わたる",
      "nai": "わたら ない",
      "ta": "わたった",
      "meaning": "menyeberang [jembatan]",
      "pelajaran": 23
    }
  ]
},
  kelompok_2: {
  "title": "Kelompok II",
  "description": "Ichidan-doushi. Bentuk kamus berakhiran -eru/-iru, konjugasi lebih sederhana (hilangkan る, tambah akhiran).",
  "verbs": [
    {
      "masu": "開けます",
      "masu_reading": "あけ ます",
      "te": "あけて",
      "kamus": "あける",
      "nai": "あけ ない",
      "ta": "あけた",
      "meaning": "membuka",
      "pelajaran": 14
    },
    {
      "masu": "あげます",
      "masu_reading": "あげ ます",
      "te": "あげて",
      "kamus": "あげる",
      "nai": "あげ ない",
      "ta": "あげた",
      "meaning": "memberikan",
      "pelajaran": 7
    },
    {
      "masu": "集めます",
      "masu_reading": "あつめ ます",
      "te": "あつめて",
      "kamus": "あつめる",
      "nai": "あつめ ない",
      "ta": "あつめた",
      "meaning": "mengumpulkan",
      "pelajaran": 18
    },
    {
      "masu": "浴びます[シャワーを～]",
      "masu_reading": "あび ます",
      "te": "あびて",
      "kamus": "あびる",
      "nai": "あび ない",
      "ta": "あびた",
      "meaning": "mandi",
      "pelajaran": 16
    },
    {
      "masu": "います",
      "masu_reading": "い ます",
      "te": "いて",
      "kamus": "いる",
      "nai": "い ない",
      "ta": "いた",
      "meaning": "ada (digunakan untuk makhluk hidup)",
      "pelajaran": 10
    },
    {
      "masu": "います[こどもが～]",
      "masu_reading": "い ます",
      "te": "いて",
      "kamus": "いる",
      "nai": "い ない",
      "ta": "いた",
      "meaning": "ada, mempunyai (anak)",
      "pelajaran": 11
    },
    {
      "masu": "います[にほんに～]",
      "masu_reading": "い ます",
      "te": "いて",
      "kamus": "いる",
      "nai": "い ない",
      "ta": "いた",
      "meaning": "ada [di Jepang]",
      "pelajaran": 11
    },
    {
      "masu": "入れます",
      "masu_reading": "いれ ます",
      "te": "いれて",
      "kamus": "いれる",
      "nai": "いれ ない",
      "ta": "いれた",
      "meaning": "memasukkan",
      "pelajaran": 16
    },
    {
      "masu": "生まれます",
      "masu_reading": "うまれ ます",
      "te": "うまれて",
      "kamus": "うまれる",
      "nai": "うまれ ない",
      "ta": "うまれた",
      "meaning": "lahir",
      "pelajaran": 22
    },
    {
      "masu": "起きます",
      "masu_reading": "おき ます",
      "te": "おきて",
      "kamus": "おきる",
      "nai": "おき ない",
      "ta": "おきた",
      "meaning": "bangun",
      "pelajaran": 4
    },
    {
      "masu": "教えます",
      "masu_reading": "おしえ ます",
      "te": "おしえて",
      "kamus": "おしえる",
      "nai": "おしえ ない",
      "ta": "おしえた",
      "meaning": "mengajar",
      "pelajaran": 7
    },
    {
      "masu": "教えます[じゅうしょを～]",
      "masu_reading": "おしえ ます",
      "te": "おしえて",
      "kamus": "おしえる",
      "nai": "おしえ ない",
      "ta": "おしえた",
      "meaning": "memberitahukan [alamat]",
      "pelajaran": 14
    },
    {
      "masu": "覚えます",
      "masu_reading": "おぼえ ます",
      "te": "おぼえて",
      "kamus": "おぼえる",
      "nai": "おぼえ ない",
      "ta": "おぼえた",
      "meaning": "mengingat, menghafal",
      "pelajaran": 17
    },
    {
      "masu": "降ります[でんしゃを～]",
      "masu_reading": "おり ます",
      "te": "おりて",
      "kamus": "おりる",
      "nai": "おり ない",
      "ta": "おりた",
      "meaning": "turun [kereta rel listrik]",
      "pelajaran": 16
    },
    {
      "masu": "換えます",
      "masu_reading": "かえ ます",
      "te": "かえて",
      "kamus": "かえる",
      "nai": "かえ ない",
      "ta": "かえた",
      "meaning": "mengganti, menukar",
      "pelajaran": 18
    },
    {
      "masu": "変えます",
      "masu_reading": "かえ ます",
      "te": "かえて",
      "kamus": "かえる",
      "nai": "かえ ない",
      "ta": "かえた",
      "meaning": "mengubah",
      "pelajaran": 23
    },
    {
      "masu": "かけます[でんわを～]",
      "masu_reading": "かけ ます",
      "te": "かけて",
      "kamus": "かける",
      "nai": "かけ ない",
      "ta": "かけた",
      "meaning": "menelepon",
      "pelajaran": 14
    },
    {
      "masu": "かけます[めがねを～]",
      "masu_reading": "かけ ます",
      "te": "かけて",
      "kamus": "かける",
      "nai": "かけ ない",
      "ta": "かけた",
      "meaning": "memakai [kaca mata]",
      "pelajaran": 22
    },
    {
      "masu": "借ります",
      "masu_reading": "かり ます",
      "te": "かりて",
      "kamus": "かりる",
      "nai": "かり ない",
      "ta": "かりた",
      "meaning": "meminjam, menyewa",
      "pelajaran": 7
    },
    {
      "masu": "考えます",
      "masu_reading": "かんがえ ます",
      "te": "かんがえて",
      "kamus": "かんがえる",
      "nai": "かんがえ ない",
      "ta": "かんがえた",
      "meaning": "berpikir, memikirkan",
      "pelajaran": 25
    },
    {
      "masu": "着ます",
      "masu_reading": "き ます",
      "te": "きて",
      "kamus": "きる",
      "nai": "き ない",
      "ta": "きた",
      "meaning": "memakai (kemeja)",
      "pelajaran": 22
    },
    {
      "masu": "気を つけます",
      "masu_reading": "きを つけ ます",
      "te": "きを つけて",
      "kamus": "きを つける",
      "nai": "きを つけ ない",
      "ta": "きを つけた",
      "meaning": "berwaspada, berhati-hati",
      "pelajaran": 21
    },
    {
      "masu": "くれます",
      "masu_reading": "くれ ます",
      "te": "くれて",
      "kamus": "くれる",
      "nai": "くれ ない",
      "ta": "くれた",
      "meaning": "diberikan",
      "pelajaran": 24
    },
    {
      "masu": "閉めます",
      "masu_reading": "しめ ます",
      "te": "しめて",
      "kamus": "しめる",
      "nai": "しめ ない",
      "ta": "しめた",
      "meaning": "menutup",
      "pelajaran": 14
    },
    {
      "masu": "調べます",
      "masu_reading": "しらべ ます",
      "te": "しらべて",
      "kamus": "しらべる",
      "nai": "しらべ ない",
      "ta": "しらべた",
      "meaning": "memeriksa, meneliti, mengecek",
      "pelajaran": 20
    },
    {
      "masu": "捨てます",
      "masu_reading": "すて ます",
      "te": "すてて",
      "kamus": "すてる",
      "nai": "すて ない",
      "ta": "すてた",
      "meaning": "membuang",
      "pelajaran": 18
    },
    {
      "masu": "食べます",
      "masu_reading": "たべ ます",
      "te": "たべて",
      "kamus": "たべる",
      "nai": "たべ ない",
      "ta": "たべた",
      "meaning": "makan",
      "pelajaran": 6
    },
    {
      "masu": "足ります",
      "masu_reading": "たり ます",
      "te": "たりて",
      "kamus": "たりる",
      "nai": "たり ない",
      "ta": "たりた",
      "meaning": "cukup",
      "pelajaran": 25
    },
    {
      "masu": "疲れます",
      "masu_reading": "つかれ ます",
      "te": "つかれて",
      "kamus": "つかれる",
      "nai": "つかれ ない",
      "ta": "つかれた",
      "meaning": "lelah",
      "pelajaran": 13
    },
    {
      "masu": "つけます",
      "masu_reading": "つけ ます",
      "te": "つけて",
      "kamus": "つける",
      "nai": "つけ ない",
      "ta": "つけた",
      "meaning": "menyalakan, memasang, menghidupkan",
      "pelajaran": 14
    },
    {
      "masu": "出かけます",
      "masu_reading": "でかけ ます",
      "te": "でかけて",
      "kamus": "でかける",
      "nai": "でかけ ない",
      "ta": "でかけた",
      "meaning": "pergi, keluar, berangkat",
      "pelajaran": 17
    },
    {
      "masu": "できます",
      "masu_reading": "でき ます",
      "te": "できて",
      "kamus": "できる",
      "nai": "でき ない",
      "ta": "できた",
      "meaning": "dapat, bisa, mampu",
      "pelajaran": 18
    },
    {
      "masu": "出ます[おつりが～]",
      "masu_reading": "で ます",
      "te": "でて",
      "kamus": "でる",
      "nai": "で ない",
      "ta": "でた",
      "meaning": "keluar [uang kembalian]",
      "pelajaran": 23
    },
    {
      "masu": "出ます[きっさてんを～]",
      "masu_reading": "で ます",
      "te": "でて",
      "kamus": "でる",
      "nai": "で ない",
      "ta": "でた",
      "meaning": "keluar [dari coffee shop]",
      "pelajaran": 14
    },
    {
      "masu": "出ます[だいがくを～]",
      "masu_reading": "で ます",
      "te": "でて",
      "kamus": "でる",
      "nai": "で ない",
      "ta": "でた",
      "meaning": "tamat [dari universitas]",
      "pelajaran": 16
    },
    {
      "masu": "止めます",
      "masu_reading": "とめ ます",
      "te": "とめて",
      "kamus": "とめる",
      "nai": "とめ ない",
      "ta": "とめた",
      "meaning": "menghentikan, memarkir",
      "pelajaran": 14
    },
    {
      "masu": "寝ます",
      "masu_reading": "ね ます",
      "te": "ねて",
      "kamus": "ねる",
      "nai": "ね ない",
      "ta": "ねた",
      "meaning": "tidur",
      "pelajaran": 4
    },
    {
      "masu": "乗り換えます",
      "masu_reading": "のりかえ ます",
      "te": "のりかえて",
      "kamus": "のりかえる",
      "nai": "のりかえ ない",
      "ta": "のりかえた",
      "meaning": "ganti, pindah (kereta rel)",
      "pelajaran": 16
    },
    {
      "masu": "始めます",
      "masu_reading": "はじめ ます",
      "te": "はじめて",
      "kamus": "はじめる",
      "nai": "はじめ ない",
      "ta": "はじめた",
      "meaning": "mulai",
      "pelajaran": 16
    },
    {
      "masu": "負けます",
      "masu_reading": "まけ ます",
      "te": "まけて",
      "kamus": "まける",
      "nai": "まけ ない",
      "ta": "まけた",
      "meaning": "kalah",
      "pelajaran": 21
    },
    {
      "masu": "見せます",
      "masu_reading": "みせ ます",
      "te": "みせて",
      "kamus": "みせる",
      "nai": "みせ ない",
      "ta": "みせた",
      "meaning": "memperlihatkan",
      "pelajaran": 14
    },
    {
      "masu": "見ます",
      "masu_reading": "み ます",
      "te": "みて",
      "kamus": "みる",
      "nai": "み ない",
      "ta": "みた",
      "meaning": "melihat, menonton",
      "pelajaran": 6
    },
    {
      "masu": "迎えます",
      "masu_reading": "むかえ ます",
      "te": "むかえて",
      "kamus": "むかえる",
      "nai": "むかえ ない",
      "ta": "むかえた",
      "meaning": "menjemput",
      "pelajaran": 13
    },
    {
      "masu": "やめます[かいしゃを～]",
      "masu_reading": "やめ ます",
      "te": "やめて",
      "kamus": "やめる",
      "nai": "やめ ない",
      "ta": "やめた",
      "meaning": "berhenti [kerja]",
      "pelajaran": 21
    },
    {
      "masu": "忘れます",
      "masu_reading": "わすれ ます",
      "te": "わすれて",
      "kamus": "わすれる",
      "nai": "わすれ ない",
      "ta": "わすれた",
      "meaning": "lupa",
      "pelajaran": 17
    }
  ]
},
  kelompok_3: {
  "title": "Kelompok III",
  "description": "Fukisoku-doushi (verba tidak beraturan). Terdiri dari 2 pola dasar: します (melakukan) dan 来ます/きます (datang), termasuk kata majemuk berakhiran します.",
  "verbs": [
    {
      "masu": "案内します",
      "masu_reading": "あんないし ます",
      "te": "あんないして",
      "kamus": "あんないする",
      "nai": "あんないし ない",
      "ta": "あんないした",
      "meaning": "mengantarkan",
      "pelajaran": 24
    },
    {
      "masu": "運転します",
      "masu_reading": "うんてんし ます",
      "te": "うんてんして",
      "kamus": "うんてんする",
      "nai": "うんてんし ない",
      "ta": "うんてんした",
      "meaning": "menyetir, mengendarai",
      "pelajaran": 18
    },
    {
      "masu": "買い物します",
      "masu_reading": "かいものし ます",
      "te": "かいものして",
      "kamus": "かいものする",
      "nai": "かいものし ない",
      "ta": "かいものした",
      "meaning": "berbelanja",
      "pelajaran": 13
    },
    {
      "masu": "来ます",
      "masu_reading": "き ます",
      "te": "きて",
      "kamus": "くる",
      "nai": "こ ない",
      "ta": "きた",
      "meaning": "datang",
      "pelajaran": 5
    },
    {
      "masu": "結婚します",
      "masu_reading": "けっこんし ます",
      "te": "けっこんして",
      "kamus": "けっこんする",
      "nai": "けっこんし ない",
      "ta": "けっこんした",
      "meaning": "menikah",
      "pelajaran": 13
    },
    {
      "masu": "見学します",
      "masu_reading": "けんがくし ます",
      "te": "けんがくして",
      "kamus": "けんがくする",
      "nai": "けんがくし ない",
      "ta": "けんがくした",
      "meaning": "mengunjungi",
      "pelajaran": 18
    },
    {
      "masu": "研究します",
      "masu_reading": "けんきゅうし ます",
      "te": "けんきゅうして",
      "kamus": "けんきゅうする",
      "nai": "けんきゅうし ない",
      "ta": "けんきゅうした",
      "meaning": "meneliti",
      "pelajaran": 16
    },
    {
      "masu": "コピーします",
      "masu_reading": "コピーし ます",
      "te": "コピーして",
      "kamus": "コピーする",
      "nai": "コピーし ない",
      "ta": "コピーした",
      "meaning": "memfotokopi",
      "pelajaran": 15
    },
    {
      "masu": "散歩します[こうえんを～]",
      "masu_reading": "さんぽし ます",
      "te": "さんぽして",
      "kamus": "さんぽする",
      "nai": "さんぽし ない",
      "ta": "さんぽした",
      "meaning": "berjalan-jalan [di taman]",
      "pelajaran": 13
    },
    {
      "masu": "残業します",
      "masu_reading": "ざんぎょうし ます",
      "te": "ざんぎょうして",
      "kamus": "ざんぎょうする",
      "nai": "ざんぎょうし ない",
      "ta": "ざんぎょうした",
      "meaning": "melembur",
      "pelajaran": 17
    },
    {
      "masu": "します",
      "masu_reading": "し ます",
      "te": "して",
      "kamus": "する",
      "nai": "し ない",
      "ta": "した",
      "meaning": "mengerjakan, melakukan, berbuat",
      "pelajaran": 6
    },
    {
      "masu": "します[ネクタイを～]",
      "masu_reading": "し ます",
      "te": "して",
      "kamus": "する",
      "nai": "し ない",
      "ta": "した",
      "meaning": "memakai [dasi]",
      "pelajaran": 22
    },
    {
      "masu": "修理します",
      "masu_reading": "しゅうりし ます",
      "te": "しゅうりして",
      "kamus": "しゅうりする",
      "nai": "しゅうりし ない",
      "ta": "しゅうりした",
      "meaning": "memperbaiki",
      "pelajaran": 20
    },
    {
      "masu": "出張します",
      "masu_reading": "しゅっちょうし ます",
      "te": "しゅっちょうして",
      "kamus": "しゅっちょうする",
      "nai": "しゅっちょうし ない",
      "ta": "しゅっちょうした",
      "meaning": "dinas",
      "pelajaran": 17
    },
    {
      "masu": "紹介します",
      "masu_reading": "しょうかいし ます",
      "te": "しょうかいして",
      "kamus": "しょうかいする",
      "nai": "しょうかいし ない",
      "ta": "しょうかいした",
      "meaning": "memperkenalkan",
      "pelajaran": 24
    },
    {
      "masu": "食事します",
      "masu_reading": "しょくじし ます",
      "te": "しょくじして",
      "kamus": "しょくじする",
      "nai": "しょくじし ない",
      "ta": "しょくじした",
      "meaning": "makan",
      "pelajaran": 13
    },
    {
      "masu": "心配します",
      "masu_reading": "しんぱいし ます",
      "te": "しんぱいして",
      "kamus": "しんぱいする",
      "nai": "しんぱいし ない",
      "ta": "しんぱいした",
      "meaning": "mengkhawatirkan",
      "pelajaran": 17
    },
    {
      "masu": "説明します",
      "masu_reading": "せつめいし ます",
      "te": "せつめいして",
      "kamus": "せつめいする",
      "nai": "せつめいし ない",
      "ta": "せつめいした",
      "meaning": "menjelaskan, menerangkan",
      "pelajaran": 24
    },
    {
      "masu": "洗濯します",
      "masu_reading": "せんたくし ます",
      "te": "せんたくして",
      "kamus": "せんたくする",
      "nai": "せんたくし ない",
      "ta": "せんたくした",
      "meaning": "mencuci pakaian",
      "pelajaran": 19
    },
    {
      "masu": "掃除します",
      "masu_reading": "そうじし ます",
      "te": "そうじして",
      "kamus": "そうじする",
      "nai": "そうじし ない",
      "ta": "そうじした",
      "meaning": "membersihkan",
      "pelajaran": 19
    },
    {
      "masu": "連れて来ます",
      "masu_reading": "つれてき ます",
      "te": "つれてきて",
      "kamus": "つれてくる",
      "nai": "つれてこ ない",
      "ta": "つれてきた",
      "meaning": "membawa datang, mengajak datang",
      "pelajaran": 24
    },
    {
      "masu": "電話します",
      "masu_reading": "でんわし ます",
      "te": "でんわして",
      "kamus": "でんわする",
      "nai": "でんわし ない",
      "ta": "でんわした",
      "meaning": "menelepon",
      "pelajaran": 16
    },
    {
      "masu": "勉強します",
      "masu_reading": "べんきょうし ます",
      "te": "べんきょうして",
      "kamus": "べんきょうする",
      "nai": "べんきょうし ない",
      "ta": "べんきょうした",
      "meaning": "belajar",
      "pelajaran": 4
    },
    {
      "masu": "持って来ます",
      "masu_reading": "もってき ます",
      "te": "もってきて",
      "kamus": "もってくる",
      "nai": "もってこ ない",
      "ta": "もってきた",
      "meaning": "membawa datang",
      "pelajaran": 17
    },
    {
      "masu": "予約します",
      "masu_reading": "よやくし ます",
      "te": "よやくして",
      "kamus": "よやくする",
      "nai": "よやくし ない",
      "ta": "よやくした",
      "meaning": "memesan",
      "pelajaran": 18
    },
    {
      "masu": "留学します",
      "masu_reading": "りゅうがくし ます",
      "te": "りゅうがくして",
      "kamus": "りゅうがくする",
      "nai": "りゅうがくし ない",
      "ta": "りゅうがくした",
      "meaning": "studi di luar negeri",
      "pelajaran": 21
    }
  ]
}
};
