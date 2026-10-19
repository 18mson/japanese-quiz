// src/data/lessonGrammarBook.ts
// Buku Materi Pelajaran Komprehensif Minna no Nihongo Shokyu I (Bab 1 - 25)
// Berisi pola kalimat (bunkei), rumus visual, panduan partikel, catatan tata bahasa, budaya, dan tabel lampiran.

export interface BunkeiExample {
  japanese: string;
  romaji: string;
  meaning: string;
  note?: string;
}

export interface BunkeiItem {
  id: string;
  pointNumber: number;
  title?: string;
  pattern: string;
  formula: string;
  meaning: string;
  explanation: string;
  variations?: {
    label: string;
    japanese: string;
    romaji: string;
    meaning: string;
  }[];
  examples: BunkeiExample[];
  note?: string;
}

export interface ParticleGuideItem {
  particle: string;
  role: string;
  explanation: string;
  examples: {
    japanese: string;
    romaji: string;
    meaning: string;
  }[];
  caution?: string;
}

export interface GrammarNoteItem {
  title: string;
  content: string;
  examples?: {
    japanese: string;
    romaji: string;
    meaning: string;
  }[];
}

export interface ReferenceTableItem {
  title: string;
  description?: string;
  columns: { key: string; label: string }[];
  rows: Record<string, string>[];
}

export interface LessonGrammarChapter {
  lessonNumber: number;
  title: string;
  subTitle: string;
  summary: string;
  bunkei: BunkeiItem[];
  particles: ParticleGuideItem[];
  grammarNotes: GrammarNoteItem[];
  culturalNotes?: string[];
  tables?: ReferenceTableItem[];
}

export const lessonGrammarBookData: LessonGrammarChapter[] = [
  {
    "lessonNumber": 1,
    "title": "Bab 1: Perkenalan Diri (自己紹介)",
    "subTitle": "Pola Dasar ～は～です dan Partikel は, も, の",
    "summary": "Mempelajari cara memperkenalkan diri, menyebutkan nama, kewarganegaraan, profesi, umur, serta membuat kalimat positif, negatif, tanya, dan kepemilikan sederhana.",
    "bunkei": [
      {
        "id": "b1-1",
        "pointNumber": 1,
        "pattern": "KB₁ + は + KB₂ + です",
        "formula": "[Subjek / Topik] + は + [Predikat Kata Benda] + です",
        "meaning": "KB₁ adalah KB₂",
        "explanation": "Partikel は (dibaca 'wa') menandai topik pembicaraan. です diletakkan di akhir predikat kata benda untuk menyatakan kepastian dengan nada sopan.",
        "variations": [
          {
            "label": "Positif (+)",
            "japanese": "わたしは マイク・ミラーです。",
            "romaji": "Watashi wa Maiku Miraa desu.",
            "meaning": "Saya adalah Mike Miller."
          },
          {
            "label": "Profesi",
            "japanese": "わたしは 会社員です。",
            "romaji": "Watashi wa kaishain desu.",
            "meaning": "Saya adalah karyawan perusahaan."
          }
        ],
        "examples": [
          {
            "japanese": "わたしは マイク・ミラーです。",
            "romaji": "Watashi wa Maiku Miraa desu.",
            "meaning": "Saya adalah Mike Miller."
          },
          {
            "japanese": "サントスさんは ブラジル人です。",
            "romaji": "Santosu-san wa Burajiru-jin desu.",
            "meaning": "Sdr. Santos adalah orang Brazil."
          }
        ],
        "note": "Partikel は ditulis dengan huruf hiragana 'ha' (は), namun WAJIB diucapkan 'wa'."
      },
      {
        "id": "b1-2",
        "pointNumber": 2,
        "pattern": "KB₁ + は + KB₂ + じゃ（では）ありません",
        "formula": "[Subjek / Topik] + は + [Kata Benda] + じゃ ありません",
        "meaning": "KB₁ bukan (merupakan) KB₂",
        "explanation": "Bentuk penyangkalan (negatif) sopan dari です. Dalam percakapan santai sehari-hari digunakan じゃ ありません, sedangkan dalam forum formal/pidato tertulis digunakan では ありません.",
        "variations": [
          {
            "label": "Negatif Percakapan",
            "japanese": "サントスさんは 学生じゃ ありません。",
            "romaji": "Santosu-san wa gakusei ja arimasen.",
            "meaning": "Sdr. Santos bukan mahasiswa."
          },
          {
            "label": "Negatif Formal",
            "japanese": "サントスさんは 学生では ありません。",
            "romaji": "Santosu-san wa gakusei dewa arimasen.",
            "meaning": "Sdr. Santos bukan mahasiswa (ragam resmi)."
          }
        ],
        "examples": [
          {
            "japanese": "サントスさんは 学生じゃ ありません。",
            "romaji": "Santosu-san wa gakusei ja arimasen.",
            "meaning": "Sdr. Santos bukan seorang mahasiswa."
          },
          {
            "japanese": "ミラーさんは 先生じゃ ありません。",
            "romaji": "Miraa-san wa sensei ja arimasen.",
            "meaning": "Sdr. Miller bukan seorang guru."
          }
        ],
        "note": "Kata では pada では ありません huruf は-nya juga diucapkan 'wa'."
      },
      {
        "id": "b1-3",
        "pointNumber": 3,
        "pattern": "KB₁ + は + KB₂ + ですか（Kalimat Tanya）",
        "formula": "[Subjek] + は + [Predikat] + ですか",
        "meaning": "Apakah KB₁ adalah KB₂?",
        "explanation": "Partikel か di akhir kalimat berfungsi sebagai tanda tanya (?) dengan intonasi naik. Dijawab dengan はい (Ya) atau いいえ (Tidak).",
        "variations": [
          {
            "label": "Tanya Ya/Tidak",
            "japanese": "ミラーさんは アメリカ人ですか。",
            "romaji": "Miraa-san wa Amerika-jin desu ka.",
            "meaning": "Apakah Sdr. Miller orang Amerika?"
          },
          {
            "label": "Jawaban Ya",
            "japanese": "はい、アメリカ人です。",
            "romaji": "Hai, Amerika-jin desu.",
            "meaning": "Ya, orang Amerika."
          },
          {
            "label": "Jawaban Tidak",
            "japanese": "いいえ、アメリカ人じゃ ありません。",
            "romaji": "Iie, Amerika-jin ja arimasen.",
            "meaning": "Bukan, bukan orang Amerika."
          }
        ],
        "examples": [
          {
            "japanese": "あの 方は どなたですか。……ミラーさんです。",
            "romaji": "Ano kata wa donata desu ka? ... Miraa-san desu.",
            "meaning": "Siapakah beliau itu? ... Sdr. Miller."
          }
        ]
      },
      {
        "id": "b1-4",
        "pointNumber": 4,
        "pattern": "KB₁ + も + KB₂ + です（Partikel 'Juga'）",
        "formula": "[Subjek Baru] + も + [Predikat yang sama] + です",
        "meaning": "KB juga ...",
        "explanation": "Partikel も menggantikan partikel は ketika subjek baru memiliki predikat atau kondisi yang sama dengan pernyataan sebelumnya.",
        "examples": [
          {
            "japanese": "ミラーさんは 会社員です。サントスさんも 会社員です。",
            "romaji": "Miraa-san wa kaishain desu. Santosu-san mo kaishain desu.",
            "meaning": "Sdr. Miller karyawan. Sdr. Santos juga karyawan."
          }
        ]
      },
      {
        "id": "b1-5",
        "pointNumber": 5,
        "pattern": "KB₁ + の + KB₂（Hubungan & Kepemilikan）",
        "formula": "[Pemilik / Organisasi] + の + [Benda / Posisi]",
        "meaning": "KB₂ milik KB₁ / KB₂ dari bagian KB₁",
        "explanation": "Partikel の menghubungkan dua kata benda. KB₁ menjelaskan atau memiliki KB₂.",
        "examples": [
          {
            "japanese": "ミラーさんは IMCの 社員です。",
            "romaji": "Miraa-san wa IMC no shain desu.",
            "meaning": "Sdr. Miller adalah karyawan perusahaan IMC."
          },
          {
            "japanese": "わたしは さくら大学の 学生です。",
            "romaji": "Watashi wa Sakura Daigaku no gakusei desu.",
            "meaning": "Saya adalah mahasiswa Universitas Sakura."
          }
        ]
      }
    ],
    "particles": [
      {
        "particle": "は (wa)",
        "role": "Penanda Topik / Subjek Pokok Kalimat",
        "explanation": "Menunjukkan hal yang menjadi topik utama yang akan dibicarakan si penutur.",
        "examples": [
          {
            "japanese": "わたしは インドネシア人です。",
            "romaji": "Watashi wa Indoneshia-jin desu.",
            "meaning": "Saya adalah orang Indonesia."
          }
        ],
        "caution": "Ditulis dengan hiragana は (ha), tetapi WAJIB dibaca 'wa'."
      },
      {
        "particle": "か (ka)",
        "role": "Penanda Kalimat Tanya (?)",
        "explanation": "Diletakkan persis di ujung akhir kalimat untuk mengubah pernyataan menjadi pertanyaan intonasi naik.",
        "examples": [
          {
            "japanese": "学生ですか。",
            "romaji": "Gakusei desu ka.",
            "meaning": "Apakah Anda seorang mahasiswa?"
          }
        ]
      },
      {
        "particle": "も (mo)",
        "role": "Menyatakan 'Juga' / 'Pula'",
        "explanation": "Menggantikan peran partikel は ketika predikat yang dibicarakan identik.",
        "examples": [
          {
            "japanese": "わたしも 会社員です。",
            "romaji": "Watashi mo kaishain desu.",
            "meaning": "Saya juga seorang karyawan."
          }
        ]
      },
      {
        "particle": "の (no)",
        "role": "Penghubung Kata Benda (Kepemilikan / Afiliasi)",
        "explanation": "Menyatakan bahwa kata benda di depannya menerangkan kata benda di belakangnya (asal instansi, kepemilikan).",
        "examples": [
          {
            "japanese": "IMCの 社員",
            "romaji": "IMC no shain",
            "meaning": "Karyawan (milik/dari) IMC"
          }
        ]
      }
    ],
    "grammarNotes": [
      {
        "title": "Penggunaan Akhiran Panggilan ～さん / ～ちゃん / ～君",
        "content": "～さん adalah panggilan sopan untuk orang lain (Bapak/Ibu/Sdr.). JANGAN PERNAH menambahkan ～さん pada nama diri sendiri. ～ちゃん digunakan untuk anak kecil/akrab, dan ～君 (kun) untuk anak laki-laki atau teman sebaya."
      },
      {
        "title": "Perbedaan 先生 (Sensei) dan 教師 (Kyoushi)",
        "content": "先生 digunakan untuk memanggil atau menyebut guru/dosen lain dengan rasa hormat. Saat menyebut pekerjaan diri sendiri kepada orang lain, gunakan kata 教師 (kyoushi)."
      },
      {
        "title": "Menanyakan Umur Secara Sopan",
        "content": "Menanyakan umur dapat menggunakan 何歳 (nan-sai), namun untuk lebih sopan gunakan おいくつ (oikutsu)."
      }
    ],
    "culturalNotes": [
      "Saat pertama kali berkenalan, ucapkan 初めまして (Hajimemashite) sambil membungkuk sopan (ojigi), lalu sebutkan nama, dan akhiri dengan どうぞ よろしく お願いします (Douzo yoroshiku onegaishimasu)."
    ],
    "tables": [
      {
        "title": "Tabel Negara, Warga Negara & Bahasa",
        "description": "Pola: [Nama Negara] + 人 (jin) = Warga Negara; [Nama Negara] + 語 (go) = Bahasa",
        "columns": [
          {
            "key": "negara",
            "label": "Negara (国)"
          },
          {
            "key": "orang",
            "label": "Warga Negara (人)"
          },
          {
            "key": "bahasa",
            "label": "Bahasa (語)"
          }
        ],
        "rows": [
          {
            "negara": "日本 (Jepang)",
            "orang": "日本人 (Nihon-jin)",
            "bahasa": "日本語 (Nihon-go)"
          },
          {
            "negara": "インドネシア (Indonesia)",
            "orang": "インドネシア人",
            "bahasa": "インドネシア語"
          },
          {
            "negara": "アメリカ (Amerika Serikat)",
            "orang": "アメリカ人",
            "bahasa": "英語 (Eigo)"
          },
          {
            "negara": "イギリス (Inggris)",
            "orang": "イギリス人",
            "bahasa": "英語 (Eigo)"
          },
          {
            "negara": "韓国 (Korea Selatan)",
            "orang": "韓国人 (Kankoku-jin)",
            "bahasa": "韓国語 (Kankoku-go)"
          },
          {
            "negara": "中国 (Cina)",
            "orang": "中国人 (Chuugoku-jin)",
            "bahasa": "中国語 (Chuugoku-go)"
          },
          {
            "negara": "フランス (Perancis)",
            "orang": "フランス人",
            "bahasa": "フランス語"
          },
          {
            "negara": "ドイツ (Jerman)",
            "orang": "ドイツ人",
            "bahasa": "ドイツ語"
          }
        ]
      }
    ]
  },
  {
    "lessonNumber": 2,
    "title": "Bab 2: Benda & Kepemilikan (物と所有)",
    "subTitle": "Kata Tunjuk これ/それ/あれ, この/その/あの, dan Partikel の",
    "summary": "Mempelajari kata tunjuk benda berdasarkan jarak dari pembicara dan lawan bicara (Ko-So-A-Do), menanyakan benda (何), dan menyatakan milik.",
    "bunkei": [
      {
        "id": "b2-1",
        "pointNumber": 1,
        "pattern": "これ / それ / あれ + は + KB + です",
        "formula": "[Kata Tunjuk: これ / それ / あれ] + は + [Nama Benda] + です",
        "meaning": "Ini / Itu / Itu (jauh) adalah KB",
        "explanation": "これ digunakan untuk benda di dekat pembicara. それ dekat lawan bicara. あれ jauh dari kedua belah pihak.",
        "examples": [
          {
            "japanese": "これは 辞書です。",
            "romaji": "Kore wa jisho desu.",
            "meaning": "Ini adalah kamus."
          },
          {
            "japanese": "それは わたしの 傘です。",
            "romaji": "Sore wa watashi no kasa desu.",
            "meaning": "Itu adalah payung saya."
          },
          {
            "japanese": "あれは 車です。",
            "romaji": "Are wa kuruma desu.",
            "meaning": "Itu (di sana) adalah mobil."
          }
        ]
      },
      {
        "id": "b2-2",
        "pointNumber": 2,
        "pattern": "この / その / あの + KB + は + ... + です",
        "formula": "[Kata Tunjuk: この / その / あの] + [Kata Benda] + は + [Predikat] + です",
        "meaning": "KB ini / KB itu / KB itu (jauh) adalah ...",
        "explanation": "この, その, あの WAJIB langsung diikuti oleh kata benda, tidak bisa berdiri sendiri sebagai subjek mandiri.",
        "examples": [
          {
            "japanese": "この 本は わたしのです。",
            "romaji": "Kono hon wa watashi no desu.",
            "meaning": "Buku ini adalah milik saya."
          },
          {
            "japanese": "その 鍵は だれのですか。",
            "romaji": "Sono kagi wa dare no desu ka.",
            "meaning": "Kunci itu milik siapa?"
          }
        ]
      },
      {
        "id": "b2-3",
        "pointNumber": 3,
        "pattern": "そうです / そうじゃ ありません",
        "formula": "はい + そうです / いいえ + 違います（そうじゃありません）",
        "meaning": "Benar demikian / Bukan demikian",
        "explanation": "Digunakan untuk mengonfirmasi pertanyaan yang predikatnya berupa kata benda tanpa perlu mengulang seluruh kalimat.",
        "examples": [
          {
            "japanese": "それは テレホンカードですか。……はい、そうです。",
            "romaji": "Sore wa terehonkaado desu ka? ... Hai, sou desu.",
            "meaning": "Apakah itu kartu telepon? ... Ya, benar."
          },
          {
            "japanese": "それは ノートですか。……いいえ、手帳です（違います）。",
            "romaji": "Sore wa nooto desu ka? ... Iie, techou desu.",
            "meaning": "Apakah itu buku catatan? ... Bukan, ini buku saku agenda."
          }
        ]
      },
      {
        "id": "b2-4",
        "pointNumber": 4,
        "pattern": "KB₁ + の + KB₂（Isi & Kepemilikan）",
        "formula": "[Topik / Isi / Pemilik] + の + [Benda]",
        "meaning": "Buku tentang KB₁ / KB₂ milik KB₁",
        "explanation": "Partikel の juga menyatakan isi buku/majalah (contoh: コンピューターの本 = buku tentang komputer) dan kepemilikan.",
        "examples": [
          {
            "japanese": "これは 自動車の本です。",
            "romaji": "Kore wa jidousha no hon desu.",
            "meaning": "Ini adalah buku tentang mobil."
          },
          {
            "japanese": "あれは 先生の 鞄です。",
            "romaji": "Are wa sensei no kaban desu.",
            "meaning": "Itu (di sana) adalah tas milik guru."
          }
        ]
      }
    ],
    "particles": [
      {
        "particle": "の (no)",
        "role": "Menyatakan Konten Materi & Kepemilikan Benda",
        "explanation": "Bisa berfungsi menyatakan isi (bahasa/topik) atau kepemilikan. Kata benda kedua dapat dihilangkan jika konteksnya sudah jelas (contoh: わたしのです = milik saya).",
        "examples": [
          {
            "japanese": "日本語の 本",
            "romaji": "Nihon-go no hon",
            "meaning": "Buku bahasa Jepang"
          },
          {
            "japanese": "この 傘は わたしのです。",
            "romaji": "Kono kasa wa watashi no desu.",
            "meaning": "Payung ini kepunyaan saya."
          }
        ]
      }
    ],
    "grammarNotes": [
      {
        "title": "Perbedaan これ/それ/あれ vs この/その/あの",
        "content": "これ/それ/あれ adalah kata ganti penunjuk mandiri yang langsung diikuti partikel (これ は ...). Sedangkan この/その/あの adalah penunjuk pewatas yang WAJIB menempel ke kata benda (この本 は ...)."
      },
      {
        "title": "Ungkapan そうですか (Sou desu ka)",
        "content": "Diucapkan dengan intonasi turun saat si pembicara menerima informasi baru yang baru saja diketahuinya (artinya: 'Oh, begitu ya'). Berbeda dengan intonasi naik yang berarti bertanya."
      }
    ],
    "culturalNotes": [
      "Saat memberikan oleh-oleh (お土産 / omiyage) atau hadiah, orang Jepang lazim mengucapkan どうぞ (Douzo = Silakan) dengan ramah."
    ],
    "tables": [
      {
        "title": "Sistem Kata Tunjuk Ko-So-A-Do (Benda)",
        "columns": [
          {
            "key": "jenis",
            "label": "Posisi Jarak"
          },
          {
            "key": "mandiri",
            "label": "Mandiri (Kore / Sore / Are)"
          },
          {
            "key": "pewatas",
            "label": "Pewatas Nomina (Kono / Sono / Ano)"
          }
        ],
        "rows": [
          {
            "jenis": "Dekat Pembicara (Ko)",
            "mandiri": "これ (Ini)",
            "pewatas": "この + KB (KB ini)"
          },
          {
            "jenis": "Dekat Lawan Bicara (So)",
            "mandiri": "それ (Itu)",
            "pewatas": "その + KB (KB itu)"
          },
          {
            "jenis": "Jauh dari Keduanya (A)",
            "mandiri": "あれ (Itu jauh)",
            "pewatas": "あの + KB (KB itu jauh)"
          },
          {
            "jenis": "Kata Tanya (Do)",
            "mandiri": "どれ (Yang mana)",
            "pewatas": "どの + KB (KB yang mana)"
          }
        ]
      }
    ]
  },
  {
    "lessonNumber": 3,
    "title": "Bab 3: Tempat & Arah (場所と方向)",
    "subTitle": "Kata Tunjuk Tempat ここ/そこ/あそこ dan Arah こちら/そちら/あちら",
    "summary": "Mempelajari cara menanyakan dan menunjukkan lokasi tempat (kamar, kantor, fasilitas), arah ruangan, asal negara/perusahaan pembuat barang, serta harga barang (いくら).",
    "bunkei": [
      {
        "id": "b3-1",
        "pointNumber": 1,
        "pattern": "ここ / そこ / あそこ + は + [Tempat] + です",
        "formula": "[Tunjuk Lokasi: ここ / そこ / あそこ] + は + [Nama Tempat] + です",
        "meaning": "Di sini / Di situ / Di sana adalah [Tempat]",
        "explanation": "ここ menunjukkan tempat di mana pembicara berada. そこ tempat lawan bicara. あそこ tempat yang jauh dari keduanya.",
        "examples": [
          {
            "japanese": "ここは 教室です。",
            "romaji": "Koko wa kyoushitsu desu.",
            "meaning": "Di sini adalah ruang kelas."
          },
          {
            "japanese": "あそこは 事務室です。",
            "romaji": "Asoko wa jimushitsu desu.",
            "meaning": "Di sana adalah ruang kantor."
          }
        ]
      },
      {
        "id": "b3-2",
        "pointNumber": 2,
        "pattern": "[Benda / Orang] + は + [Tempat] + です",
        "formula": "[Subjek: Benda / Orang] + は + [Lokasi] + です",
        "meaning": "KB berada di [Tempat]",
        "explanation": "Pola untuk menyatakan letak/lokasi keberadaan suatu objek, ruangan, fasilitas, atau orang.",
        "examples": [
          {
            "japanese": "お手洗いは あそこです。",
            "romaji": "Otearai wa asoko desu.",
            "meaning": "Toilet berada di sebelah sana."
          },
          {
            "japanese": "ミラーさんは 事務所です。",
            "romaji": "Miraa-san wa jimusho desu.",
            "meaning": "Sdr. Miller berada di kantor."
          }
        ]
      },
      {
        "id": "b3-3",
        "pointNumber": 3,
        "pattern": "[Benda / Tempat] + は + どこ / どちら + ですか",
        "formula": "[Benda / Tempat] + は + [どこ / どちら] + ですか",
        "meaning": "Di mana / Ke arah mana KB?",
        "explanation": "どこ menanyakan tempat. どちら menanyakan arah atau versi sopan dari どこ untuk menanyakan tempat/instansi.",
        "examples": [
          {
            "japanese": "エレベーターは どこですか。……あそこです。",
            "romaji": "Erebeetaa wa doko desu ka? ... Asoko desu.",
            "meaning": "Lift di mana? ... Di sebelah sana."
          },
          {
            "japanese": "会社は どちらですか。……IMCです。",
            "romaji": "Kaisha wa dochira desu ka? ... IMC desu.",
            "meaning": "Perusahaan Anda apa/di mana? ... Perusahaan IMC."
          }
        ]
      },
      {
        "id": "b3-4",
        "pointNumber": 4,
        "pattern": "この + [Benda] + は + いくらですか",
        "formula": "[Benda] + は + [いくら] + ですか",
        "meaning": "Berapa harga [Benda] ini?",
        "explanation": "いくら digunakan untuk menanyakan harga barang dalam mata uang (misal: 円 / En / Yen).",
        "examples": [
          {
            "japanese": "この ネクタイは いくらですか。……1,500円です。",
            "romaji": "Kono nekutai wa ikura desu ka? ... Sen gohyaku en desu.",
            "meaning": "Dasi ini harganya berapa? ... 1.500 Yen."
          }
        ]
      }
    ],
    "particles": [
      {
        "particle": "の (no)",
        "role": "Menyatakan Asal Negara Pembuat atau Produsen Barang",
        "explanation": "Menghubungkan nama negara atau perusahaan pembuat dengan jenis barang (contoh: 日本の車 = mobil buatan Jepang).",
        "examples": [
          {
            "japanese": "これは 日本の カメラです。",
            "romaji": "Kore wa Nihon no kamera desu.",
            "meaning": "Ini adalah kamera buatan Jepang."
          }
        ]
      }
    ],
    "grammarNotes": [
      {
        "title": "Bentuk Sopan Arah (Kochira, Sochira, Achira, Dochira)",
        "content": "Selain bermakna 'ke arah sini/situ/sana', kata tunjuk arah こちら/そちら/あちら/どちら juga berfungsi sebagai bahasa sopan (keigo) untuk menggantikan ここ/そこ/あそこ/どこ dan menanyakan nama perusahaan/negara asal seseorang."
      }
    ],
    "culturalNotes": [
      "Awalan お (O-) seperti pada お手洗い (otearai) atau お国 (okuni) adalah bentuk penghalus (bikago) untuk membuat tuturan terdengar santun dan terhormat."
    ],
    "tables": [
      {
        "title": "Tabel Sistem Ko-So-A-Do Lengkap",
        "columns": [
          {
            "key": "kat",
            "label": "Kategori"
          },
          {
            "key": "ko",
            "label": "Ko (Dekat)"
          },
          {
            "key": "so",
            "label": "So (Menengah)"
          },
          {
            "key": "a",
            "label": "A (Jauh)"
          },
          {
            "key": "do",
            "label": "Do (Tanya)"
          }
        ],
        "rows": [
          {
            "kat": "Benda Mandiri",
            "ko": "これ (ini)",
            "so": "それ (itu)",
            "a": "あれ (itu jauh)",
            "do": "どれ (yang mana)"
          },
          {
            "kat": "Pewatas Benda",
            "ko": "この (ini)",
            "so": "その (itu)",
            "a": "あの (itu)",
            "do": "どの (yang mana)"
          },
          {
            "kat": "Tempat",
            "ko": "ここ (sini)",
            "so": "そこ (situ)",
            "a": "あそこ (sana)",
            "do": "どこ (mana)"
          },
          {
            "kat": "Arah / Sopan",
            "ko": "こちら",
            "so": "そちら",
            "a": "あちら",
            "do": "どちら"
          }
        ]
      }
    ]
  },
  {
    "lessonNumber": 4,
    "title": "Bab 4: Waktu & Kegiatan (時間と動詞)",
    "subTitle": "Jam, Menit, Kata Kerja Bentuk ～ます dan Partikel に, から, まで",
    "summary": "Mempelajari cara menyatakan waktu (jam dan menit), hari, konjugasi dasar kata kerja (ます, ません, ました, ませんでした), serta rentang waktu kegiatan dengan partikel から dan まで.",
    "bunkei": [
      {
        "id": "b4-1",
        "pointNumber": 1,
        "pattern": "今 + [Jam]時 + [Menit]分 + です",
        "formula": "今 + [Jam] 時 + [Menit] 分 + です",
        "meaning": "Sekarang jam [Waktu]",
        "explanation": "Jam dinyatakan dengan angka + 時 (ji), menit dengan angka + 分 (fun / pun). Kata tanya waktu: 何時 (nan-ji) dan 何分 (nan-pun).",
        "examples": [
          {
            "japanese": "今 4時5分です。",
            "romaji": "Ima yo-ji go-fun desu.",
            "meaning": "Sekarang jam 4 lewat 5 menit."
          },
          {
            "japanese": "ニューヨークは 今 何時ですか。",
            "romaji": "Nyuu Yooku wa ima nan-ji desu ka.",
            "meaning": "New York sekarang jam berapa?"
          }
        ],
        "note": "Perhatikan jam 4 dibaca よじ (yo-ji), jam 7 dibaca しちじ (shichi-ji), jam 9 dibaca くじ (ku-ji)."
      },
      {
        "id": "b4-2",
        "pointNumber": 2,
        "pattern": "KK + [ます / ません / ました / ませんでした]",
        "formula": "[Akar Kata Kerja] + [ます / ません / ました / ませんでした]",
        "meaning": "Melakukan / Tidak / Sudah / Belum pernah",
        "explanation": "Bentuk sopan kata kerja. ます = non-lampau positif; ません = non-lampau negatif; ました = lampau positif; ませんでした = lampau negatif.",
        "variations": [
          {
            "label": "Rutin / Masa Depan (+)",
            "japanese": "わたしは 毎朝 6時に 起きます。",
            "romaji": "Watashi wa maiasa roku-ji ni okimasu.",
            "meaning": "Saya bangun jam 6 setiap pagi."
          },
          {
            "label": "Negatif Sekarang (-)",
            "japanese": "あした 働きません。",
            "romaji": "Ashita hatarakimasen.",
            "meaning": "Besok saya tidak bekerja."
          },
          {
            "label": "Lampau Positif (+)",
            "japanese": "きのう 勉強しました。",
            "romaji": "Kinou benkyou shimashita.",
            "meaning": "Kemarin saya telah belajar."
          },
          {
            "label": "Lampau Negatif (-)",
            "japanese": "きのう 勉強しませんでした。",
            "romaji": "Kinou benkyou shimasen deshita.",
            "meaning": "Kemarin saya tidak belajar."
          }
        ],
        "examples": [
          {
            "japanese": "毎朝 何時に 起きますか。……6時に 起きます。",
            "romaji": "Maiasa nan-ji ni okimasu ka? ... Roku-ji ni okimasu.",
            "meaning": "Setiap pagi bangun jam berapa? ... Bangun jam 6."
          }
        ]
      },
      {
        "id": "b4-3",
        "pointNumber": 3,
        "pattern": "[Waktu Pasti] + に + KK",
        "formula": "[Titik Waktu Bertarget Angka] + に + [Kata Kerja]",
        "meaning": "Melakukan kegiatan pada [Waktu]",
        "explanation": "Partikel に dilekatkan pada waktu yang memiliki angka/tanggal pasti (contoh: 6時に, 日曜日に). Waktu relatif seperti 今日 (hari ini), あした (besok), 毎朝 (setiap pagi) TIDAK memakai partikel に.",
        "examples": [
          {
            "japanese": "わたしは 朝6時半に 起きます。",
            "romaji": "Watashi wa asa roku-ji han ni okimasu.",
            "meaning": "Saya bangun pada pukul 6.30 pagi."
          }
        ]
      },
      {
        "id": "b4-4",
        "pointNumber": 4,
        "pattern": "[Waktu/Tempat] + から + [Waktu/Tempat] + まで",
        "formula": "[Waktu / Tempat Awal] + から + [Waktu / Tempat Akhir] + まで",
        "meaning": "Dari ... sampai ...",
        "explanation": "から menandai titik awal waktu/tempat, sedangkan まで menandai titik akhir.",
        "examples": [
          {
            "japanese": "わたしは 9時から 5時まで 働きます。",
            "romaji": "Watashi wa ku-ji kara go-ji made hatarakimasu.",
            "meaning": "Saya bekerja dari jam 9 sampai jam 5."
          },
          {
            "japanese": "昼休みは 12時からです。",
            "romaji": "Hiruyasumi wa juu-ni-ji kara desu.",
            "meaning": "Istirahat siang dimulai dari jam 12."
          }
        ]
      }
    ],
    "particles": [
      {
        "particle": "に (ni)",
        "role": "Penanda Waktu Terjadinya Kegiatan",
        "explanation": "Menunjukkan waktu spesifik terjadinya suatu aksi (ada patokan angka/jam/tanggal/hari).",
        "examples": [
          {
            "japanese": "7時に 起きます。",
            "romaji": "Shichi-ji ni okimasu.",
            "meaning": "Bangun pada jam 7."
          }
        ],
        "caution": "Kata waktu relatif (きのう, きょう, あした, 毎朝, 今) TIDAK boleh menggunakan partikel に."
      },
      {
        "particle": "から (kara) / まで (made)",
        "role": "Titik Awal (Dari) & Titik Akhir (Sampai)",
        "explanation": "Dapat digunakan untuk waktu (jam/hari) maupun lokasi geografis.",
        "examples": [
          {
            "japanese": "9時から 5時まで",
            "romaji": "Ku-ji kara go-ji made",
            "meaning": "Dari jam 9 hingga jam 5"
          }
        ]
      },
      {
        "particle": "と (to)",
        "role": "Penghubung 'Dan' Antara Dua Kata Benda",
        "explanation": "Menghubungkan dua kata benda secara setara.",
        "examples": [
          {
            "japanese": "土曜日と 日曜日は 休みです。",
            "romaji": "Doyoubi to nichiyoubi wa yasumi desu.",
            "meaning": "Hari Sabtu dan Minggu libur."
          }
        ]
      }
    ],
    "grammarNotes": [
      {
        "title": "Partikel ね (Ne) di Akhir Kalimat",
        "content": "Diletakkan di akhir tuturan untuk meminta simpati, persetujuan, atau konfirmasi dari lawan bicara (mirip kata 'ya?' atau 'kan?' dalam bahasa Indonesia)."
      }
    ],
    "culturalNotes": [
      "Di Jepang, ketepatan waktu (waktu kereta api, janji temu kerja) sangat dijunjung tinggi. Datang 5-10 menit sebelum waktu yang ditentukan dianggap sopan."
    ]
  },
  {
    "lessonNumber": 5,
    "title": "Bab 5: Perpindahan & Arah (移動と交通)",
    "subTitle": "Kata Kerja Arah (行きます/来ます/帰ります), Partikel へ, で, と",
    "summary": "Mempelajari cara menyatakan pergi, datang, atau pulang ke suatu tempat, alat transportasi yang digunakan, bersama siapa pergi, serta tanggal dan hari kalender.",
    "bunkei": [
      {
        "id": "b5-1",
        "pointNumber": 1,
        "pattern": "[Tempat] + へ + 行きます / 来ます / 帰ります",
        "formula": "[Tempat Tujuan] + へ + [Kata Kerja Perpindahan]",
        "meaning": "Pergi / Datang / Pulang ke [Tempat]",
        "explanation": "Partikel へ (dibaca 'e') menunjukkan arah tujuan perpindahan gerak si subjek.",
        "examples": [
          {
            "japanese": "わたしは 京都へ 行きます。",
            "romaji": "Watashi wa Kyouto e ikimasu.",
            "meaning": "Saya pergi ke Kyoto."
          },
          {
            "japanese": "わたしは うちへ 帰ります。",
            "romaji": "Watashi wa uchi e kaerimasu.",
            "meaning": "Saya pulang ke rumah."
          }
        ],
        "note": "Huruf hiragana へ pada partikel ini dibaca 'e', bukan 'he'."
      },
      {
        "id": "b5-2",
        "pointNumber": 2,
        "pattern": "どこ［へ］も + 行きません / 行きませんでした",
        "formula": "どこ［へ］も + [Kata Kerja Bentuk Negatif]",
        "meaning": "Tidak pergi ke mana pun",
        "explanation": "Kata tanya yang digabung partikel も dan diikuti kata kerja negatif berarti penolakan menyeluruh.",
        "examples": [
          {
            "japanese": "日曜日 どこへ 行きましたか。……どこ［へ］も 行きませんでした。",
            "romaji": "Nichiyoubi doko e ikimashita ka? ... Doko [e] mo ikimasen deshita.",
            "meaning": "Hari Minggu pergi ke mana? ... Tidak pergi ke mana pun."
          }
        ]
      },
      {
        "id": "b5-3",
        "pointNumber": 3,
        "pattern": "[Kendaraan] + で + 行きます",
        "formula": "[Alat Transportasi] + で + [Kata Kerja Perpindahan]",
        "meaning": "Pergi dengan (naik) [Kendaraan]",
        "explanation": "Partikel で menunjukkan sarana atau alat transportasi yang dinaiki. Jika jalan kaki, gunakan 歩いて (aruite) TANPA partikel で.",
        "examples": [
          {
            "japanese": "わたしは タクシーで うちへ 帰ります。",
            "romaji": "Watashi wa takushii de uchi e kaerimasu.",
            "meaning": "Saya pulang ke rumah dengan taksi."
          },
          {
            "japanese": "駅から 歩いて 帰りました。",
            "romaji": "Eki kara aruite kaerimashita.",
            "meaning": "Saya pulang jalan kaki dari stasiun."
          }
        ]
      },
      {
        "id": "b5-4",
        "pointNumber": 4,
        "pattern": "[Orang / Teman] + と + 行きます",
        "formula": "[Orang yang Menyertai] + と + [Kata Kerja Perpindahan]",
        "meaning": "Pergi bersama dengan [Orang]",
        "explanation": "Partikel と menandai rekan atau pihak yang bersama-sama melakukan tindakan. Jika sendirian, gunakan 一人で (hitori de).",
        "examples": [
          {
            "japanese": "わたしは 家族と 日本へ 来ました。",
            "romaji": "Watashi wa kazoku to Nihon e kimashita.",
            "meaning": "Saya datang ke Jepang bersama keluarga."
          },
          {
            "japanese": "一人で 東京へ 行きます。",
            "romaji": "Hitori de Toukyou e ikimasu.",
            "meaning": "Saya pergi ke Tokyo sendirian."
          }
        ]
      }
    ],
    "particles": [
      {
        "particle": "へ (e)",
        "role": "Penunjuk Arah Tujuan Perpindahan",
        "explanation": "Diletakkan setelah nama tempat tujuan sebelum kata kerja perpindahan (行きます, 来ます, 帰ります).",
        "examples": [
          {
            "japanese": "東京へ 行きます。",
            "romaji": "Toukyou e ikimasu.",
            "meaning": "Pergi ke Tokyo."
          }
        ],
        "caution": "Ditulis dengan hiragana へ (he) tetapi dilafalkan 'e'."
      },
      {
        "particle": "で (de)",
        "role": "Penanda Sarana / Alat Transportasi",
        "explanation": "Menunjukkan moda transportasi yang digunakan.",
        "examples": [
          {
            "japanese": "電車で 行きます。",
            "romaji": "Densha de ikimasu.",
            "meaning": "Pergi dengan kereta listrik."
          }
        ]
      },
      {
        "particle": "と (to)",
        "role": "Menunjukkan Rekan 'Bersama'",
        "explanation": "Menunjukkan orang atau hewan yang menyertai aktivitas.",
        "examples": [
          {
            "japanese": "友達と 行きます。",
            "romaji": "Tomodachi to ikimasu.",
            "meaning": "Pergi bersama teman."
          }
        ]
      }
    ],
    "grammarNotes": [
      {
        "title": "Kata Tanya いつ (Itsu = Kapan)",
        "content": "Untuk menanyakan waktu secara umum tanpa patokan jam, gunakan いつ. Kata いつ tidak membutuhkan partikel に (contoh: いつ 日本へ 来ましたか)."
      }
    ],
    "culturalNotes": [
      "Jepang memiliki jaringan kereta super cepat Shinkansen (新幹線). Tiket Shinkansen dapat dibeli untuk gerbong reserved (指定席) maupun non-reserved (自由席)."
    ]
  },
  {
    "lessonNumber": 6,
    "title": "Bab 6: Objek & Ajakan (目的語と勧誘)",
    "subTitle": "Partikel を, Tempat Kegiatan で, Ajakan ～ませんか & ～ましょう",
    "summary": "Mempelajari kalimat transitif dengan objek penderita partikel を, tempat berlangsungnya kegiatan dengan partikel で, serta ungkapan mengajak secara sopan.",
    "bunkei": [
      {
        "id": "b6-1",
        "pointNumber": 1,
        "pattern": "[Kata Benda] + を + KK ます",
        "formula": "[Objek Penderita] + を + [Kata Kerja Transitif]",
        "meaning": "Melakukan aksi terhadap [Kata Benda]",
        "explanation": "Partikel を (dibaca 'o') menandai objek langsung penderita tindakan kata kerja transitif (misal: minum jus, makan roti, membaca koran).",
        "examples": [
          {
            "japanese": "わたしは ジュースを 飲みます。",
            "romaji": "Watashi wa juusu o nomimasu.",
            "meaning": "Saya minum jus."
          },
          {
            "japanese": "朝ごはんを 食べました。",
            "romaji": "Asagohan o tabemashita.",
            "meaning": "Saya sudah makan sarapan pagi."
          }
        ],
        "note": "Partikel ini ditulis dengan hiragana を (wo) tetapi dilafalkan 'o'."
      },
      {
        "id": "b6-2",
        "pointNumber": 2,
        "pattern": "[Tempat] + で + KK ます",
        "formula": "[Tempat Berlangsungnya Aksi] + で + [Kata Kerja]",
        "meaning": "Melakukan kegiatan di [Tempat]",
        "explanation": "Partikel で menandai tempat terjadinya aksi atau kegiatan (berbeda dengan に yang menyatakan keberadaan statis).",
        "examples": [
          {
            "japanese": "わたしは 駅で 新聞を 買います。",
            "romaji": "Watashi wa eki de shinbun o kaimasu.",
            "meaning": "Saya membeli koran di stasiun."
          },
          {
            "japanese": "図書館で 勉強します。",
            "romaji": "Toshokan de benkyou shimasu.",
            "meaning": "Belajar di perpustakaan."
          }
        ]
      },
      {
        "id": "b6-3",
        "pointNumber": 3,
        "pattern": "いっしょに + KK (ます-stem) + ませんか",
        "formula": "KK (ます-stem) + ませんか",
        "meaning": "Maukah Anda ... bersama-sama?",
        "explanation": "Bentuk ajakan sopan yang memberi ruang pilihan ke lawan bicara untuk menyetujui atau menolak.",
        "examples": [
          {
            "japanese": "いっしょに 神戸へ 行きませんか。……ええ、行きましょう。",
            "romaji": "Issho ni Koube e ikimasen ka? ... Ee, ikimashou.",
            "meaning": "Maukah pergi ke Kobe bersama? ... Ya, mari kita pergi!"
          }
        ]
      },
      {
        "id": "b6-4",
        "pointNumber": 4,
        "pattern": "KK (ます-stem) + ましょう",
        "formula": "KK (ます-stem) + ましょう",
        "meaning": "Ayo / Mari kita ...",
        "explanation": "Menyatakan ajakan aktif atau tanggapan positif menerima ajakan orang lain.",
        "examples": [
          {
            "japanese": "ちょっと 休みましょう。",
            "romaji": "Chotto yasumimashou.",
            "meaning": "Mari kita istirahat sebentar."
          }
        ]
      }
    ],
    "particles": [
      {
        "particle": "を (o)",
        "role": "Penanda Objek Langsung",
        "explanation": "Diletakkan tepat di belakang kata benda yang menerima perlakuan kata kerja transitif.",
        "examples": [
          {
            "japanese": "パンを 食べます。",
            "romaji": "Pan o tabemasu.",
            "meaning": "Makan roti."
          }
        ],
        "caution": "Ditulis dengan huruf を (wo) tapi diucapkan 'o'."
      },
      {
        "particle": "で (de)",
        "role": "Penanda Tempat Terjadinya Kegiatan Aktif",
        "explanation": "Menunjukkan lokasi di mana perbuatan itu dikerjakan.",
        "examples": [
          {
            "japanese": "教室で 本を 読みます。",
            "romaji": "Kyoushitsu de hon o yomimasu.",
            "meaning": "Membaca buku di ruang kelas."
          }
        ]
      }
    ],
    "grammarNotes": [
      {
        "title": "Kata Tanya 何 (Nan vs Nani)",
        "content": "Dibaca なん (nan) bila diikuti huruf deret d, t, n atau kata bantu bilangan (なんですか, なんじ). Dibaca なに (nani) bila diikuti partikel を (なにを しますか) atau berdiri sendiri."
      }
    ],
    "culturalNotes": [
      "Saat menerima ajakan dengan senang hati, gunakan kata ええ、いいですね (Ee, ii desu ne = Ya, ide bagus!). Jika menolak secara halus, gunakan すみません、ちょっと…… (Sumimasen, chotto...)."
    ]
  },
  {
    "lessonNumber": 7,
    "title": "Bab 7: Sarana & Memberi/Menerima (手段と授受)",
    "subTitle": "Alat/Bahasa で, Memberi (あげます), Menerima (もらいます), dan もう～ました",
    "summary": "Mempelajari cara menyatakan alat/bahasa yang dipakai untuk melakukan sesuatu, transaksi memberi dan menerima hadiah/barang, serta menyatakan hal yang sudah diselesaikan.",
    "bunkei": [
      {
        "id": "b7-1",
        "pointNumber": 1,
        "pattern": "[Alat / Bahasa] + で + KK ます",
        "formula": "[Alat / Perkakas / Bahasa] + で + [Kata Kerja]",
        "meaning": "Melakukan aksi dengan menggunakan [Alat / Bahasa]",
        "explanation": "Partikel で menunjukkan instrumen, peralatan, atau bahasa yang digunakan untuk menyelesaikan tindakan.",
        "examples": [
          {
            "japanese": "わたしは ワープロで 手紙を 書きます。",
            "romaji": "Watashi wa waapuro de tegami o kakimasu.",
            "meaning": "Saya menulis surat dengan pengolah kata (PC)."
          },
          {
            "japanese": "日本語で レポートを 書きます。",
            "romaji": "Nihon-go de repooto o kakimasu.",
            "meaning": "Menulis laporan dalam bahasa Jepang."
          },
          {
            "japanese": "はしで ご飯を 食べます。",
            "romaji": "Hashi de gohan o tabemasu.",
            "meaning": "Makan nasi dengan sumpit."
          }
        ]
      },
      {
        "id": "b7-2",
        "pointNumber": 2,
        "pattern": "［Penerima］+ に + [Barang] + を + あげます",
        "formula": "[Pemberi] + は + [Penerima] + に + [Benda] + を + あげます",
        "meaning": "Memberikan [Barang] kepada [Penerima]",
        "explanation": "Pola transaksi memberi kepada orang lain. Penerima ditandai dengan partikel に.",
        "examples": [
          {
            "japanese": "わたしは 木村さんに 花を あげます。",
            "romaji": "Watashi wa Kimura-san ni hana o agemasu.",
            "meaning": "Saya memberikan bunga kepada Nn. Kimura."
          }
        ]
      },
      {
        "id": "b7-3",
        "pointNumber": 3,
        "pattern": "［Pemberi］+ に + [Barang] + を + もらいます",
        "formula": "[Penerima] + は + [Pemberi] + に（から） + [Benda] + を + もらいます",
        "meaning": "Menerima [Barang] dari [Pemberi]",
        "explanation": "Pola transaksi menerima dari pihak lain. Sumber/pemberi ditandai dengan partikel に atau から.",
        "examples": [
          {
            "japanese": "わたしは カリナさんに チョコレートを もらいました。",
            "romaji": "Watashi wa Karina-san ni chokoreeto o moraimashita.",
            "meaning": "Saya menerima cokelat dari Karina."
          }
        ]
      },
      {
        "id": "b7-4",
        "pointNumber": 4,
        "pattern": "もう + KK ました / まだです",
        "formula": "もう + [Kata Kerja] + ましたか",
        "meaning": "Sudahkah melakukan ...? Sudah / Belum",
        "explanation": "もう menyatakan bahwa sesuatu telah selesai dikerjakan. Jika belum selesai, jawab dengan いいえ、まだです (Belum). JANGAN gunakan bentuk negatif lampau ませんでした.",
        "examples": [
          {
            "japanese": "もう 荷物を 送りましたか。……はい、もう 送りました。",
            "romaji": "Mou nimotsu o okurimashita ka? ... Hai, mou okurimashita.",
            "meaning": "Sudahkah mengirim paket? ... Ya, sudah mengirimnya."
          },
          {
            "japanese": "もう 昼ごはんを 食べましたか。……いいえ、まだです。",
            "romaji": "Mou hirugohan o tabemashita ka? ... Iie, mada desu.",
            "meaning": "Sudah makan siang? ... Belum."
          }
        ]
      }
    ],
    "particles": [
      {
        "particle": "で (de)",
        "role": "Penanda Sarana Alat / Bahasa Komunikasi",
        "explanation": "Menunjukkan media atau perkakas yang dipakai.",
        "examples": [
          {
            "japanese": "ハサミで 紙を 切ります。",
            "romaji": "Hasami de kami o kirimasu.",
            "meaning": "Memotong kertas dengan gunting."
          }
        ]
      },
      {
        "particle": "に (ni)",
        "role": "Penanda Pihak Penerima / Pemberi Aksi",
        "explanation": "Diletakkan setelah nama orang yang menjadi sasaran tindakan pemberian atau penerimaan.",
        "examples": [
          {
            "japanese": "山田さんに 電話を かけます。",
            "romaji": "Yamada-san ni denwa o kakemasu.",
            "meaning": "Menelepon kepada Sdr. Yamada."
          }
        ]
      }
    ],
    "grammarNotes": [
      {
        "title": "Aturan Menjawab Pertanyaan 'もう～ましたか'",
        "content": "Jika belum selesai, jawab dengan いいえ、まだです (Belum). Menjawab dengan ～ませんでした keliru karena berarti 'tadi tidak melakukannya' bukan 'belum'."
      }
    ],
    "culturalNotes": [
      "Budaya memberi hadiah di Jepang sangat erat dengan tradisi membungkus (tsutsumi) rapi dan membalas pemberian (okaeshi)."
    ]
  },
  {
    "lessonNumber": 8,
    "title": "Bab 8: Kata Sifat (形容詞)",
    "subTitle": "Kata Sifat-i & Kata Sifat-na, Bentuk Negatif, dan Modifikasi Nomina",
    "summary": "Mempelajari dua golongan kata sifat dalam bahasa Jepang (kata sifat berakhiran -i dan kata sifat -na), perubahannya dalam kalimat positif dan negatif, serta cara menerangkan kata benda.",
    "bunkei": [
      {
        "id": "b8-1",
        "pointNumber": 1,
        "pattern": "KB + は + KS-na［な］ + です / じゃ ありません",
        "formula": "[Topik] + は + [KS-na tanpa な] + です / じゃ ありません",
        "meaning": "KB adalah [Sifat]",
        "explanation": "Kata sifat-na (contoh: 親切 / shinsetsu, きれい / kirei, 有名 / yuumei) di depan です tidak menggunakan akhiran な. Negatifnya: じゃ ありません.",
        "variations": [
          {
            "label": "Positif (+)",
            "japanese": "桜は きれいです。",
            "romaji": "Sakura wa kirei desu.",
            "meaning": "Bunga sakura indah."
          },
          {
            "label": "Negatif (-)",
            "japanese": "この町は にぎやかじゃ ありません。",
            "romaji": "Kono machi wa nigiyaka ja arimasen.",
            "meaning": "Kota ini tidak ramai."
          }
        ],
        "examples": [
          {
            "japanese": "ワット先生は 親切です。",
            "romaji": "Watto-sensei wa shinsetsu desu.",
            "meaning": "Pak Watt ramah."
          }
        ]
      },
      {
        "id": "b8-2",
        "pointNumber": 2,
        "pattern": "KB + は + KS-i + です / ～くないです",
        "formula": "[Topik] + は + [KS-i utuh] + です / [KS-i buang い] + くないです",
        "meaning": "KB adalah [Sifat] / tidak [Sifat]",
        "explanation": "Kata sifat-i (contoh: 高い / takai, 暑い / atsui). Bentuk negatifnya dibentuk dengan mengganti akhiran い menjadi くないです (contoh: 高くないです = tidak mahal/tinggi).",
        "variations": [
          {
            "label": "Positif (+)",
            "japanese": "富士山は 高いです。",
            "romaji": "Fujisan wa takai desu.",
            "meaning": "Gunung Fuji tinggi."
          },
          {
            "label": "Negatif (-)",
            "japanese": "富士山は 高くないです。",
            "romaji": "Fujisan wa takakunai desu.",
            "meaning": "Gunung Fuji tidak tinggi."
          }
        ],
        "examples": [
          {
            "japanese": "日本の 食べ物は おいしいです。",
            "romaji": "Nihon no tabemono wa oishii desu.",
            "meaning": "Makanan Jepang enak."
          }
        ],
        "note": "Pengecualian khusus: Kata いい (bagus) bentuk negatifnya adalah よくないです (yokunai desu)."
      },
      {
        "id": "b8-3",
        "pointNumber": 3,
        "pattern": "KS-na + な + KB / KS-i + KB",
        "formula": "[KS-na] + な + [Kata Benda] / [KS-i utuh] + [Kata Benda]",
        "meaning": "KB yang [Sifat]",
        "explanation": "Saat langsung menerangkan kata benda di belakangnya, kata sifat-na WAJIB menambahkan partikel な. Kata sifat-i langsung menempel kata benda.",
        "examples": [
          {
            "japanese": "桜は きれいな 花です。",
            "romaji": "Sakura wa kireina hana desu.",
            "meaning": "Sakura adalah bunga yang indah."
          },
          {
            "japanese": "富士山は 高い 山です。",
            "romaji": "Fujisan wa takai yama desu.",
            "meaning": "Gunung Fuji adalah gunung yang tinggi."
          }
        ]
      },
      {
        "id": "b8-4",
        "pointNumber": 4,
        "pattern": "とても / あまり + Kata Sifat",
        "formula": "とても + [KS Positif] / あまり + [KS Negatif]",
        "meaning": "Sangat ... / Tidak begitu ...",
        "explanation": "とても adalah kata keterangan penguat (sangat). あまり adalah pelemah yang WAJIB berpasangan dengan bentuk kalimat negatif (tidak begitu/kurang).",
        "examples": [
          {
            "japanese": "日本は とても 暑いです。",
            "romaji": "Nihon wa totemo atsui desu.",
            "meaning": "Jepang sangat panas."
          },
          {
            "japanese": "シャンハイは あまり 寒くないです。",
            "romaji": "Shanhai wa amari samukunai desu.",
            "meaning": "Shanghai tidak begitu dingin."
          }
        ]
      }
    ],
    "particles": [],
    "grammarNotes": [
      {
        "title": "Kata Sifat Jebakan: きれい (Kirei) & 嫌い (Kirai)",
        "content": "Meskipun berakhiran huruf suara 'i', きれい (cantik/bersih) dan きらい (benci) tergolong KATA SIFAT-NA. Bentuk negatifnya adalah きれいじゃありません (bukan kireikunai), dan bila menerangkan benda menjadi きれいな花."
      },
      {
        "title": "Pertanyaan どんな KB (Donna KB)",
        "content": "Digunakan untuk menanyakan sifat atau karakter suatu benda/tempat/orang. Contoh: 奈良は どんな 町ですか (Nara itu kota yang bagaimana?)."
      }
    ],
    "culturalNotes": [
      "Di Jepang, musim memiliki ciri khas kuat: musim semi (sakura), musim panas (matsuri & kembang api), musim gugur (daun momiji merah), dan musim dingin (salju)."
    ]
  },
  {
    "lessonNumber": 9,
    "title": "Bab 9: Kesukaan & Alasan (好悪・能力・理由)",
    "subTitle": "Partikel が untuk Keahlian/Keinginan, Partikel から untuk Alasan",
    "summary": "Mempelajari cara menyatakan hal yang disukai/dibenci, keterampilan, pemahaman bahasa, kepemilikan benda abstrak, serta merangkai kalimat sebab-akibat dengan から.",
    "bunkei": [
      {
        "id": "b9-1",
        "pointNumber": 1,
        "pattern": "KB + が + 好きです / 嫌いです / 上手です / 下手です",
        "formula": "[Subjek] + は + [Objek Minat] + が + [Sifat: 好き / 嫌い / 上手 / 下手] + です",
        "meaning": "Suka / Benci / Pintar / Payah dalam hal KB",
        "explanation": "Objek rasa suka, benci, kepandaian, atau kelemahan ditandai dengan partikel が (bukan を).",
        "examples": [
          {
            "japanese": "わたしは イタリア料理が 好きです。",
            "romaji": "Watashi wa Itaria ryouri ga suki desu.",
            "meaning": "Saya suka masakan Italia."
          },
          {
            "japanese": "ミラーさんは 日本語が 上手です。",
            "romaji": "Miraa-san wa Nihon-go ga jouzu desu.",
            "meaning": "Sdr. Miller pandai bahasa Jepang."
          }
        ]
      },
      {
        "id": "b9-2",
        "pointNumber": 2,
        "pattern": "KB + が + わかります / あります",
        "formula": "[Subjek] + は + [Objek Pengetahuan / Benda] + が + [わかります / あります]",
        "meaning": "Mengerti / Memiliki KB",
        "explanation": "Kata kerja potensi pemahaman (わかります) dan kepemilikan (あります) objeknya ditandai dengan partikel が.",
        "examples": [
          {
            "japanese": "わたしは 日本語が 少し わかります。",
            "romaji": "Watashi wa Nihon-go ga sukoshi wakarimasu.",
            "meaning": "Saya mengerti bahasa Jepang sedikit."
          },
          {
            "japanese": "わたしは 車が あります。",
            "romaji": "Watashi wa kuruma ga arimasu.",
            "meaning": "Saya memiliki mobil."
          }
        ]
      },
      {
        "id": "b9-3",
        "pointNumber": 3,
        "pattern": "Kalimat₁ + から、+ Kalimat₂（Penyebab & Alasan）",
        "formula": "[Alasan / Penyebab] + から、+ [Akibat / Tindakan]",
        "meaning": "Karena ..., maka ...",
        "explanation": "Partikel から di akhir kalimat pertama menyatakan alasan penyebab terjadinya kalimat kedua.",
        "examples": [
          {
            "japanese": "きょうは 時間が ありませんから、早く 帰ります。",
            "romaji": "Kyou wa jikan ga arimasen kara, hayaku kaerimasu.",
            "meaning": "Karena hari ini tidak ada waktu, saya pulang lebih awal."
          },
          {
            "japanese": "どうして きのう 休みましたか。……熱が ありましたから。",
            "romaji": "Doushite kinou yasumimashita ka? ... Netsu ga arimashita kara.",
            "meaning": "Mengapa kemarin libur? ... Karena saya demam."
          }
        ]
      }
    ],
    "particles": [
      {
        "particle": "が (ga)",
        "role": "Penanda Objek Emosional, Kemampuan & Keberadaan",
        "explanation": "Menandai sasaran kata 好き, 嫌い, 上手, 下手, わかる, できる, ある.",
        "examples": [
          {
            "japanese": "スポーツが 好きです。",
            "romaji": "Supootsu ga suki desu.",
            "meaning": "Suka olahraga."
          }
        ]
      }
    ],
    "grammarNotes": [
      {
        "title": "Kata Keterangan Kuantitas & Tingkatan",
        "content": "Positif: よく (dengan baik/sering), だいたい (sebagian besar), 少し (sedikit). Negatif: あまり (tidak begitu), 全然 (sama sekali tidak)."
      },
      {
        "title": "Kata Tanya どうして (Doushite = Mengapa)",
        "content": "Digunakan untuk menanyakan alasan. Jawabannya selalu diakhiri dengan partikel から (kara)."
      }
    ],
    "culturalNotes": [
      "Ketika orang Jepang memuji kemampuan bahasa Anda dengan 日本語が上手ですね, responlah dengan rendah hati: いいえ、まだまだです (Iie, mada mada desu = Belum, masih belum mahir)."
    ]
  },
  {
    "lessonNumber": 10,
    "title": "Bab 10: Keberadaan & Posisi (存在と位置)",
    "subTitle": "あります (Benda Mati) vs います (Makhluk Hidup), dan Kata Posisi",
    "summary": "Mempelajari perbedaan menyatakan keberadaan benda mati (あります) dengan makhluk bernyawa (います), menentukan lokasi keberadaan, kata posisi ruang (atas, bawah, dalam, dll.), dan partikel や.",
    "bunkei": [
      {
        "id": "b10-1",
        "pointNumber": 1,
        "pattern": "[Tempat] + に + KB + が + あります / います",
        "formula": "[Lokasi] + に + [Subjek Benda / Makhluk] + が + [あります / います]",
        "meaning": "Di [Tempat] ada [KB]",
        "explanation": "あります digunakan untuk benda mati, tanaman, dan hal tak bernyawa. います digunakan untuk manusia dan hewan yang bergerak aktif.",
        "examples": [
          {
            "japanese": "机の 上に 写真が あります。",
            "romaji": "Tsukue no ue ni shashin ga arimasu.",
            "meaning": "Di atas meja ada foto."
          },
          {
            "japanese": "あそこに 佐藤さんが います。",
            "romaji": "Asoko ni Satou-san ga imasu.",
            "meaning": "Di sebelah sana ada Sdr. Sato."
          },
          {
            "japanese": "公園に 犬が います。",
            "romaji": "Kouen ni inu ga imasu.",
            "meaning": "Di taman ada anjing."
          }
        ]
      },
      {
        "id": "b10-2",
        "pointNumber": 2,
        "pattern": "KB + は + [Tempat] + に + あります / います",
        "formula": "[Subjek Topik] + は + [Lokasi] + に + [あります / います]",
        "meaning": "KB berada di [Tempat]",
        "explanation": "Pola ini digunakan saat pembicara ingin menjelaskan letak dari subjek yang sudah diketahui.",
        "examples": [
          {
            "japanese": "東京ディズニーランドは 千葉県に あります。",
            "romaji": "Toukyou Dizuniirando wa Chiba-ken ni arimasu.",
            "meaning": "Tokyo Disneyland berada di Prefektur Chiba."
          },
          {
            "japanese": "家族は ニューヨークに います。",
            "romaji": "Kazoku wa Nyuu Yooku ni imasu.",
            "meaning": "Keluarga saya berada di New York."
          }
        ]
      },
      {
        "id": "b10-3",
        "pointNumber": 3,
        "pattern": "KB₁ + の + [Kata Posisi] + に + KB₂ + が + あります",
        "formula": "[Patokan] + の + [Kata Posisi: 上/下/前/後ろ/中/隣] + に + [Benda/Makhluk] + が あります/います",
        "meaning": "Di [atas/bawah/depan/belakang/dalam/sebelah] KB₁ ada KB₂",
        "explanation": "Menjelaskan posisi ruang secara spesifik dengan kata posisi spasial.",
        "examples": [
          {
            "japanese": "箱の 中に 時計が あります。",
            "romaji": "Hako no naka ni tokei ga arimasu.",
            "meaning": "Di dalam kotak ada jam."
          },
          {
            "japanese": "駅の 前に 交番が あります。",
            "romaji": "Eki no mae ni kouban ga arimasu.",
            "meaning": "Di depan stasiun ada pos polisi."
          }
        ]
      },
      {
        "id": "b10-4",
        "pointNumber": 4,
        "pattern": "KB₁ + や + KB₂ + ［など］",
        "formula": "KB₁ + や + KB₂ + ［など］",
        "meaning": "KB₁, KB₂, dan lain-lain",
        "explanation": "Partikel や menghubungkan beberapa contoh benda secara tidak lengkap (masih ada benda lain yang tidak disebutkan), berbeda dengan と yang menyebutkan seluruhnya.",
        "examples": [
          {
            "japanese": "箱の 中に 手紙や 写真が あります。",
            "romaji": "Hako no naka ni tegami ya shashin ga arimasu.",
            "meaning": "Di dalam kotak ada surat, foto, dan sebagainya."
          }
        ]
      }
    ],
    "particles": [
      {
        "particle": "に (ni)",
        "role": "Penanda Lokasi Keberadaan (Titik Statis)",
        "explanation": "Menunjukkan tempat di mana suatu benda atau orang berada secara statis bersama kata kerja あります atau います.",
        "examples": [
          {
            "japanese": "部屋に だれも いません。",
            "romaji": "Heya ni dare mo imasen.",
            "meaning": "Di kamar tidak ada siapa pun."
          }
        ]
      },
      {
        "particle": "や (ya)",
        "role": "Penyambung Kata Benda Non-Eksklusif (Dan Lain-lain)",
        "explanation": "Menyebutkan contoh representatif.",
        "examples": [
          {
            "japanese": "本や ノート",
            "romaji": "Hon ya nooto",
            "meaning": "Buku, buku catatan, dan lain-lain"
          }
        ]
      }
    ],
    "grammarNotes": [
      {
        "title": "Kosakata Posisi Spasial Penting",
        "content": "上 (ue = atas), 下 (shita = bawah), 前 (mae = depan), 後ろ (ushiro = belakang), 右 (migi = kanan), 左 (hidari = kiri), 中 (naka = dalam), 外 (soto = luar), 隣 (tonari = sebelah berdampingan), 近く (chikaku = dekat), 間 (aida = di antara)."
      }
    ],
    "culturalNotes": [
      "Kouban (交番) adalah pos polisi lingkungan kecil khas Jepang yang siap membantu warga saat tersesat jalan atau kehilangan barang."
    ]
  },
  {
    "lessonNumber": 11,
    "title": "Bab 11: Bilangan & Durasi (数量と期間)",
    "subTitle": "Kata Bantu Bilangan (Counters), Jangka Waktu, dan Partikel だけ",
    "summary": "Mempelajari penghitungan jumlah benda menggunakan kata bantu bilangan (counters), menyatakan durasi jangka waktu dan frekuensi kegiatan, serta pembatasan dengan だけ.",
    "bunkei": [
      {
        "id": "b11-1",
        "pointNumber": 1,
        "pattern": "KB + を + [Angka + Counter] + KK ます",
        "formula": "[Objek] + を + [Jumlah / Bilangan] + [Kata Kerja]",
        "meaning": "Melakukan aksi sebanyak [Jumlah] buah/orang/lembar",
        "explanation": "Dalam bahasa Jepang, kata bilangan umumnya diletakkan TEPAT SEBELUM KATA KERJA (setelah partikel を).",
        "examples": [
          {
            "japanese": "りんごを 4つ 買いました。",
            "romaji": "Ringo o yottsu kaimashita.",
            "meaning": "Saya membeli 4 buah apel."
          },
          {
            "japanese": "会議室に テーブルが 7つ あります。",
            "romaji": "Kaigishitsu ni teeburu ga nanatsu arimasu.",
            "meaning": "Di ruang rapat ada 7 buah meja."
          }
        ]
      },
      {
        "id": "b11-2",
        "pointNumber": 2,
        "pattern": "［Periode Waktu］+ に + [Frekuensi] + 回 + KK ます",
        "formula": "[Jangka Waktu] + に + [Jumlah] + 回 + [Kata Kerja]",
        "meaning": "Melakukan kegiatan sebanyak ... kali dalam [Periode]",
        "explanation": "Partikel に di sini menunjukkan tolok ukur frekuensi dalam satuan waktu tertentu.",
        "examples": [
          {
            "japanese": "1か月に 2回 映画を 見ます。",
            "romaji": "Ikkagetsu ni ni-kai eiga o mimasu.",
            "meaning": "Menonton film 2 kali dalam sebulan."
          },
          {
            "japanese": "1週間に 1回 テニスを します。",
            "romaji": "Isshuukan ni ikkai tenisu o shimasu.",
            "meaning": "Bermain tenis 1 kali dalam seminggu."
          }
        ]
      },
      {
        "id": "b11-3",
        "pointNumber": 3,
        "pattern": "［Durasi Waktu］+ KK ます",
        "formula": "[Jangka Waktu] + [Kata Kerja]",
        "meaning": "Melakukan kegiatan selama [Durasi]",
        "explanation": "Durasi waktu langsung diletakkan tanpa partikel に (contoh: 1年 います = tinggal selama 1 tahun).",
        "examples": [
          {
            "japanese": "わたしは 日本に 1年 います。",
            "romaji": "Watashi wa Nihon ni ichi-nen imasu.",
            "meaning": "Saya berada di Jepang selama 1 tahun."
          },
          {
            "japanese": "毎日 8時間 働きます。",
            "romaji": "Mainichi hachi-jikan hatarakimasu.",
            "meaning": "Setiap hari bekerja selama 8 jam."
          }
        ]
      },
      {
        "id": "b11-4",
        "pointNumber": 4,
        "pattern": "KB + だけ（Pembatasan 'Hanya'）",
        "formula": "[Kata Benda / Jumlah] + だけ",
        "meaning": "Hanya / Cuma [KB / Jumlah]",
        "explanation": "だけ menyatakan pembatasan eksklusif bahwa tidak ada hal lain selain yang disebutkan.",
        "examples": [
          {
            "japanese": "休みは 日曜日だけです。",
            "romaji": "Yasumi wa nichiyoubi dake desu.",
            "meaning": "Hari libur hanya hari Minggu saja."
          },
          {
            "japanese": "1人だけ 来ました。",
            "romaji": "Hitori dake kimashita.",
            "meaning": "Hanya satu orang saja yang datang."
          }
        ]
      }
    ],
    "particles": [],
    "grammarNotes": [
      {
        "title": "Penghitung Benda Umum (Hitotsu, Futatsu...)",
        "content": "1つ (hitotsu), 2つ (futatsu), 3つ (mittsu), 4つ (yottsu), 5つ (itsutsu), 6つ (muttsu), 7つ (nanatsu), 8つ (yattsu), 9つ (kokonotsu), 10 (too). Untuk menanyakan jumlah: いくつ (ikutsu)."
      },
      {
        "title": "Kata Bantu Bilangan Sesuai Bentuk Benda",
        "content": "Orang: ～人 (hitori, futari, san-nin...); Benda tipis/kertas/baju: ～枚 (mai); Mesin/kendaraan: ～台 (dai); Urutan kali: ～回 (kai); Buku: ～冊 (satsu); Minuman gelas: ～杯 (hai/pai)."
      }
    ],
    "culturalNotes": [
      "Sistem pos Jepang (郵便局 / yuubinkyoku) melayani pengiriman domestik dan internasional (EMS, kurir udara, kapal laut) dengan sangat teratur."
    ]
  },
  {
    "lessonNumber": 12,
    "title": "Bab 12: Bentuk Lampau & Perbandingan (過去と比較)",
    "subTitle": "Lampau Kata Sifat & Benda, Perbandingan より dan Paling いちばん",
    "summary": "Mempelajari bentuk lampau kalimat nominal dan kata sifat, membandingkan dua hal (A lebih ... dari B), memilih di antara dua opsi (どちら), dan menentukan yang terbaik/terbanyak dalam kelompok (いちばん).",
    "bunkei": [
      {
        "id": "b12-1",
        "pointNumber": 1,
        "pattern": "KB / KS-na + でした / じゃ ありませんでした",
        "formula": "[Topik] + は + [KB / KS-na] + でした / じゃ ありませんでした",
        "meaning": "Dahulu adalah ... / Dahulu bukan ...",
        "explanation": "Bentuk lampau dari です untuk kata benda dan kata sifat-na adalah でした. Negatif lampau: じゃ ありませんでした.",
        "variations": [
          {
            "label": "Positif Lampau",
            "japanese": "きのうは 雨でした。",
            "romaji": "Kinou wa ame deshita.",
            "meaning": "Kemarin cuacanya hujan."
          },
          {
            "label": "Negatif Lampau",
            "japanese": "きのうは 暇じゃ ありませんでした。",
            "romaji": "Kinou wa hima ja arimasen deshita.",
            "meaning": "Kemarin saya tidak senggang."
          }
        ],
        "examples": [
          {
            "japanese": "きのうの 試験は 簡単でした。",
            "romaji": "Kinou no shiken wa kantan deshita.",
            "meaning": "Ujian kemarin mudah."
          }
        ]
      },
      {
        "id": "b12-2",
        "pointNumber": 2,
        "pattern": "KS-i (buang い) + かったです / くなかったです",
        "formula": "[Topik] + は + [KS-i buang い] + かったです / くなかったです",
        "meaning": "Dahulu terasa [Sifat]",
        "explanation": "Kata sifat-i lampau: akhiran い diganti かったです. Negatif lampau: akhiran い diganti くなかったです.",
        "variations": [
          {
            "label": "Positif Lampau",
            "japanese": "きのうは 寒かったです。",
            "romaji": "Kinou wa samukatta desu.",
            "meaning": "Kemarin dingin."
          },
          {
            "label": "Negatif Lampau",
            "japanese": "きのうは 寒くなかったです。",
            "romaji": "Kinou wa samukunakatta desu.",
            "meaning": "Kemarin tidak dingin."
          }
        ],
        "examples": [
          {
            "japanese": "旅行は とても 楽しかったです。",
            "romaji": "Ryokou wa totemo tanoshikatta desu.",
            "meaning": "Perjalanannya sangat menyenangkan."
          }
        ],
        "note": "Pengecualian: Kata いい (bagus) lampaunya adalah よかったです (yokatta desu), negatif lampau: よくなかったです."
      },
      {
        "id": "b12-3",
        "pointNumber": 3,
        "pattern": "A + は + B + より + KS + です",
        "formula": "[Hal A] + は + [Hal B] + より + [Kata Sifat] + です",
        "meaning": "A lebih [Sifat] daripada B",
        "explanation": "より menandai hal pembanding yang menjadi tolok ukur inferior.",
        "examples": [
          {
            "japanese": "北海道は 九州より 大きいです。",
            "romaji": "Hokkaidou wa Kyuushuu yori ookii desu.",
            "meaning": "Hokkaido lebih besar daripada Kyushu."
          },
          {
            "japanese": "新幹線は バスより 速いです。",
            "romaji": "Shinkansen wa basu yori hayai desu.",
            "meaning": "Shinkansen lebih cepat daripada bus."
          }
        ]
      },
      {
        "id": "b12-4",
        "pointNumber": 4,
        "pattern": "A + と + B + と + どちらが + KS + ですか",
        "formula": "[A] + と + [B] + と + どちらが + [Kata Sifat] + ですか。……A の ほうが [KS] です",
        "meaning": "Antara A dan B, mana yang lebih [Sifat]?",
        "explanation": "どちら digunakan khusus untuk memilih di antara DUA opsi. Dijawab dengan ～の ほうが (pihak ... yang lebih ...).",
        "examples": [
          {
            "japanese": "海と 山と どちらが 好きですか。……海の ほうが 好きです。",
            "romaji": "Umi to yama to dochira ga suki desu ka? ... Umi no hou ga suki desu.",
            "meaning": "Antara laut dan gunung, mana yang Anda sukai? ... Saya lebih suka laut."
          }
        ]
      },
      {
        "id": "b12-5",
        "pointNumber": 5,
        "pattern": "［Lingkup Kelompok］+ で + [Kata Tanya] + が + いちばん + KS + ですか",
        "formula": "[Kategori Kelompok] + で + [Kata Tanya] + が + いちばん + [Kata Sifat] + ですか",
        "meaning": "Di dalam [Kelompok], apa/siapa/di mana/kapan yang paling [Sifat]?",
        "explanation": "いちばん (ichiban) menyatakan superlatif (paling / nomor satu) di dalam suatu lingkup.",
        "examples": [
          {
            "japanese": "わたしは 1年で 夏が いちばん 好きです。",
            "romaji": "Watashi wa ichi-nen de natsu ga ichiban suki desu.",
            "meaning": "Dalam satu tahun, saya paling suka musim panas."
          },
          {
            "japanese": "日本料理で 何が いちばん おいしいですか。……天ぷらが いちばん おいしいです。",
            "romaji": "Nihon ryouri de nani ga ichiban oishii desu ka? ... Tenpura ga ichiban oishii desu.",
            "meaning": "Di antara masakan Jepang, apa yang paling lezat? ... Tempura yang paling lezat."
          }
        ]
      }
    ],
    "particles": [],
    "grammarNotes": [
      {
        "title": "Perbedaan どちら (Dochira) vs どれ (Dore)",
        "content": "Jika memilih di antara DUA hal, WAJIB menggunakan どちら (dochira). Jika memilih di antara TIGA hal atau lebih, gunakan どれ (dore) atau kata tanya spesifik (だれ, なに, どこ, いつ)."
      }
    ],
    "culturalNotes": [
      "Empat pulau utama Jepang: Honshu (terbesar), Hokkaido (utara), Kyushu (selatan), dan Shikoku."
    ]
  },
  {
    "lessonNumber": 13,
    "title": "Bab 13: Keinginan & Tujuan (願望と目的)",
    "subTitle": "Keinginan Benda (欲しい), Ingin Melakukan (～たい), dan Tujuan Pergi (～に行く)",
    "summary": "Mempelajari cara mengekspresikan keinginan memiliki benda fisik (欲しい), keinginan melakukan kegiatan (kata kerja bentuk ～たい), serta tujuan pergi ke suatu tempat.",
    "bunkei": [
      {
        "id": "b13-1",
        "pointNumber": 1,
        "pattern": "[Benda] + が + 欲しいです",
        "formula": "[Subjek / わたし] + は + [Benda] + が + 欲しいです",
        "meaning": "Saya menginginkan [Benda]",
        "explanation": "欲しい (hoshii) adalah kata sifat-i yang menyatakan keinginan memiliki benda konkret. Objek yang diinginkan ditandai partikel が.",
        "examples": [
          {
            "japanese": "わたしは パソコンが 欲しいです。",
            "romaji": "Watashi wa pasokon ga hoshii desu.",
            "meaning": "Saya ingin punya komputer laptop."
          },
          {
            "japanese": "今 何が いちばん 欲しいですか。……友達が 欲しいです。",
            "romaji": "Ima nani ga ichiban hoshii desu ka? ... Tomodachi ga hoshii desu.",
            "meaning": "Sekarang apa yang paling Anda inginkan? ... Saya ingin punya teman."
          }
        ],
        "note": "欲しい HANYA digunakan untuk keinginan pembicara sendiri (orang pertama). Tidak boleh langsung digunakan untuk menebak keinginan orang ketiga."
      },
      {
        "id": "b13-2",
        "pointNumber": 2,
        "pattern": "KK (ます-stem) + たいです / たくないです",
        "formula": "[Subjek / わたし] + は + [Objek] + を/が + KK (ます-stem) + たいです",
        "meaning": "Saya ingin [Melakukan Sesuatu]",
        "explanation": "Bentuk ～たい (tai) menyatakan keinginan mengerjakan tindakan. Dibuat dengan membuang akhiran ます lalu menambah たい. Mengikuti konjugasi kata sifat-i (negatif: たくないです; lampau: たかったです).",
        "variations": [
          {
            "label": "Positif Ingin",
            "japanese": "わたしは てんぷらを 食べたいです。",
            "romaji": "Watashi wa tenpura o tabetai desu.",
            "meaning": "Saya ingin makan tempura."
          },
          {
            "label": "Negatif Tidak Ingin",
            "japanese": "きょうは どこへも 行きたくないです。",
            "romaji": "Kyou wa doko e mo ikitakunai desu.",
            "meaning": "Hari ini saya tidak ingin pergi ke mana pun."
          }
        ],
        "examples": [
          {
            "japanese": "日本へ 行きたいです。",
            "romaji": "Nihon e ikitai desu.",
            "meaning": "Saya ingin pergi ke Jepang."
          }
        ]
      },
      {
        "id": "b13-3",
        "pointNumber": 3,
        "pattern": "[Tempat] + へ + KK-stem / KB + に + 行きます / 来ます / 帰ります",
        "formula": "[Tempat Tujuan] + へ + [Aktivitas: KK-stem / KB] + に + [Kata Kerja Perpindahan]",
        "meaning": "Pergi / Datang ke [Tempat] untuk [Tujuan]",
        "explanation": "Partikel に di sini menyatakan maksud/tujuan dari perpindahan gerak ke suatu lokasi.",
        "examples": [
          {
            "japanese": "わたしは フランスへ 料理を 習いに 行きます。",
            "romaji": "Watashi wa Furansu e ryouri o narai ni ikimasu.",
            "meaning": "Saya pergi ke Perancis untuk belajar memasak."
          },
          {
            "japanese": "デパートへ 買い物に 行きました。",
            "romaji": "Depaato e kaimono ni ikimashita.",
            "meaning": "Saya pergi ke departemen store untuk berbelanja."
          }
        ]
      }
    ],
    "particles": [
      {
        "particle": "に (ni)",
        "role": "Penanda Maksud / Tujuan Kedatangan/Kepergian",
        "explanation": "Diletakkan setelah akar kata kerja atau kata benda kegiatan sebelum 行きます/来ます/帰ります.",
        "examples": [
          {
            "japanese": "友達に 会いに 行きます。",
            "romaji": "Tomodachi ni ai ni ikimasu.",
            "meaning": "Pergi untuk bertemu teman."
          }
        ]
      }
    ],
    "grammarNotes": [
      {
        "title": "Partikel Objek pada Bentuk ～たい",
        "content": "Pada kalimat ～たい, objek penderita umumnya dapat memakai partikel を maupun が (contoh: 水を飲みたい / 水が飲みたい). Keduanya berterima secara alami."
      }
    ],
    "culturalNotes": [
      "Ketika menawarkan sesuatu ke orang lain, JANGAN gunakan 欲しいですか karena terkesan mendikte keinginan lawan bicara. Sebaiknya gunakan ～はいかがですか atau ～ませんか."
    ]
  },
  {
    "lessonNumber": 14,
    "title": "Bab 14: Bentuk て & Permintaan (て形・依頼)",
    "subTitle": "Grup Kata Kerja I/II/III, Konjugasi Bentuk て, dan ～てください",
    "summary": "Memasuki pilar utama tata bahasa Jepang: penggolongan kata kerja (Grup 1, 2, 3), aturan perubahan bentuk て (Te-form), permohonan sopan (～てください), serta kegiatan yang sedang berlangsung (～ています).",
    "bunkei": [
      {
        "id": "b14-1",
        "pointNumber": 1,
        "pattern": "KK (Bentuk て) + ください",
        "formula": "KK (Bentuk て) + ください",
        "meaning": "Tolong ... / Silakan ...",
        "explanation": "Digunakan untuk meminta bantuan, mempersilakan, atau memohon secara sopan kepada lawan bicara.",
        "examples": [
          {
            "japanese": "ちょっと 待ってください。",
            "romaji": "Chotto matte kudasai.",
            "meaning": "Tolong tunggu sebentar."
          },
          {
            "japanese": "ここに 名前を 書いてください。",
            "romaji": "Koko ni namae o kaite kudasai.",
            "meaning": "Tolong tulis nama di sini."
          },
          {
            "japanese": "辞書を 貸してください。",
            "romaji": "Jisho o kashite kudasai.",
            "meaning": "Tolong pinjamkan kamus."
          }
        ]
      },
      {
        "id": "b14-2",
        "pointNumber": 2,
        "pattern": "KK (Bentuk て) + います",
        "formula": "KK (Bentuk て) + います",
        "meaning": "Sedang melakukan [Kegiatan]",
        "explanation": "Menyatakan tindakan yang sedang aktif berlangsung pada saat pembicaraan terjadi (present continuous).",
        "examples": [
          {
            "japanese": "ミラーさんは 今 電話を かけています。",
            "romaji": "Miraa-san wa ima denwa o kakete imasu.",
            "meaning": "Sdr. Miller sekarang sedang menelepon."
          },
          {
            "japanese": "雨が 降っています。",
            "romaji": "Ame ga futte imasu.",
            "meaning": "Sekarang sedang turun hujan."
          }
        ]
      },
      {
        "id": "b14-3",
        "pointNumber": 3,
        "pattern": "KK (ます-stem) + ましょうか",
        "formula": "KK (ます-stem) + ましょうか",
        "meaning": "Bagaimana kalau saya bantu ...?",
        "explanation": "Digunakan ketika pembicara dengan sukarela menawarkan bantuan kepada lawan bicara yang terlihat kesulitan.",
        "examples": [
          {
            "japanese": "荷物を 持ちましょうか。……ありがとうございます。",
            "romaji": "Nimotsu o mochimashou ka? ... Arigatou gozaimasu.",
            "meaning": "Bagaimana kalau saya bantu bawakan barangnya? ... Terima kasih banyak."
          },
          {
            "japanese": "傘を 貸しましょうか。……すみません、お願いします。",
            "romaji": "Kasa o kashimashou ka? ... Sumimasen, onegaishimasu.",
            "meaning": "Mau saya pinjamkan payung? ... Maaf merepotkan, tolong ya."
          }
        ]
      }
    ],
    "particles": [],
    "grammarNotes": [
      {
        "title": "Tiga Golongan Kata Kerja Bahasa Jepang (I, II, III)",
        "content": "Grup I (Godan): Berakhiran suku kata i-dan sebelum ます (ik-imasu, nom-imasu). Grup II (Ichidan): Berakhiran e-dan sebelum ます (tabe-masu) atau kata khusus i-dan (mi-masu, oki-masu). Grup III (Irregular): します (suru) dan 来ます (kimasu / kuru)."
      },
      {
        "title": "Aturan Lengkap Perubahan Bentuk て (Grup I)",
        "content": "い/ち/り + ます -> って (matte, katte); み/び/に + ます -> んで (nonde, yonde); き + ます -> いて (kaite); ぎ + ます -> いで (isoide); し + ます -> して (hanashite). Pengecualian: 行きます -> 行って (itte)."
      }
    ],
    "culturalNotes": [
      "Kata ください sebaiknya dihindari saat meminta atasan/senior langsung melakukan sesuatu. Gunakan bentuk yang lebih hormat seperti ～ていただけませんか."
    ],
    "tables": [
      {
        "title": "Rangkuman Konjugasi Bentuk て (Te-form)",
        "columns": [
          {
            "key": "grup",
            "label": "Golongan Kata Kerja"
          },
          {
            "key": "akhiran",
            "label": "Akhiran Sebelum ます"
          },
          {
            "key": "perubahan",
            "label": "Perubahan Bentuk て"
          },
          {
            "key": "contoh",
            "label": "Contoh"
          }
        ],
        "rows": [
          {
            "grup": "Grup I",
            "akhiran": "い (i), ち (chi), り (ri)",
            "perubahan": "～って",
            "contoh": "買います -> 買って, 待ちます -> 待って"
          },
          {
            "grup": "Grup I",
            "akhiran": "み (mi), び (bi), に (ni)",
            "perubahan": "～んで",
            "contoh": "飲みます -> 飲んで, 呼びます -> 呼んで"
          },
          {
            "grup": "Grup I",
            "akhiran": "き (ki)",
            "perubahan": "～いて",
            "contoh": "書きます -> 書いて (Pengecualian: 行きます -> 行って)"
          },
          {
            "grup": "Grup I",
            "akhiran": "ぎ (gi)",
            "perubahan": "～いで",
            "contoh": "急ぎます -> 急いで"
          },
          {
            "grup": "Grup I",
            "akhiran": "し (shi)",
            "perubahan": "～して",
            "contoh": "話します -> 話して"
          },
          {
            "grup": "Grup II",
            "akhiran": "e-dan / vokal tunggal",
            "perubahan": "ます diganti て",
            "contoh": "食べます -> 食べて, 見ます -> 見て"
          },
          {
            "grup": "Grup III",
            "akhiran": "します / きます",
            "perubahan": "して / きて",
            "contoh": "します -> して, 来ます -> 来て (kite)"
          }
        ]
      }
    ]
  },
  {
    "lessonNumber": 15,
    "title": "Bab 15: Izin & Larangan (許可と禁止)",
    "subTitle": "Meminta Izin (～てもいいです), Larangan (～てはいけません), dan Keadaan Status",
    "summary": "Mempelajari cara meminta dan memberi izin melakukan tindakan (～てもいいですか), menyatakan larangan keras (～てはいけません), serta menyatakan keadaan berlanjut (status pekerjaan, pernikahan, kepemilikan).",
    "bunkei": [
      {
        "id": "b15-1",
        "pointNumber": 1,
        "pattern": "KK (Bentuk て) + も いいです",
        "formula": "KK (Bentuk て) + も いいです",
        "meaning": "Boleh melakukan ...",
        "explanation": "Digunakan untuk memberikan izin. Untuk meminta izin, tambahkan か (～てもいいですか = Bolehkah saya ...?).",
        "examples": [
          {
            "japanese": "写真を 撮っても いいです。",
            "romaji": "Shashin o totte mo ii desu.",
            "meaning": "Boleh mengambil foto."
          },
          {
            "japanese": "ここで たばこを 吸っても いいですか。……いいえ、いけません。",
            "romaji": "Koko de tabako o sutte mo ii desu ka? ... Iie, ikemasen.",
            "meaning": "Bolehkah merokok di sini? ... Tidak, tidak boleh."
          }
        ]
      },
      {
        "id": "b15-2",
        "pointNumber": 2,
        "pattern": "KK (Bentuk て) + は いけません",
        "formula": "KK (Bentuk て) + は いけません",
        "meaning": "Tidak boleh / Dilarang melakukan ...",
        "explanation": "Menyatakan larangan berdasarkan peraturan, norma, atau instruksi guru/orang tua.",
        "examples": [
          {
            "japanese": "ここで 車を 止めては いけません。",
            "romaji": "Koko de kuruma o tomete wa ikemasen.",
            "meaning": "Dilarang memarkir mobil di sini."
          },
          {
            "japanese": "お酒を 飲んで 運転しては いけません。",
            "romaji": "Osake o nonde unten shite wa ikemasen.",
            "meaning": "Tidak boleh mengemudi dalam keadaan mabuk."
          }
        ]
      },
      {
        "id": "b15-3",
        "pointNumber": 3,
        "pattern": "KK (Bentuk て) + います（Keadaan Berkelanjutan）",
        "formula": "[Subjek] + は + [Objek] + を/に + KK (Bentuk て) + います",
        "meaning": "Dalam kondisi ... (status menetap)",
        "explanation": "Selain bermakna sedang berlangsung (Bab 14), bentuk ています juga menyatakan kondisi akibat tindakan di masa lalu yang hasilnya masih bertahan hingga sekarang (contoh: menikah, tinggal, bekerja, mengetahui, memiliki).",
        "examples": [
          {
            "japanese": "サントスさんは パソコンを 持っています。",
            "romaji": "Santosu-san wa pasokon o motte imasu.",
            "meaning": "Sdr. Santos memiliki laptop."
          },
          {
            "japanese": "わたしは 大阪に 住んでいます。",
            "romaji": "Watashi wa Oosaka ni sunde imasu.",
            "meaning": "Saya tinggal di Osaka."
          },
          {
            "japanese": "田中さんは 結婚しています。",
            "romaji": "Tanaka-san wa kekkon shite imasu.",
            "meaning": "Sdr. Tanaka sudah menikah."
          },
          {
            "japanese": "市役所の 電話番号を 知っていますか。……いいえ、知りません。",
            "romaji": "Shiyakusho no denwa bangou o shitte imasu ka? ... Iie, shirimasen.",
            "meaning": "Apakah Anda tahu nomor telepon balai kota? ... Tidak, saya tidak tahu."
          }
        ]
      }
    ],
    "particles": [],
    "grammarNotes": [
      {
        "title": "Perhatian Khusus Kata 知っています (Shitte imasu)",
        "content": "Jika tahu/kenal jawab dengan はい、知っています. Tetapi jika TIDAK tahu/kenal, bentuk negatifnya WAJIB いいえ、知りません (bukan shitte imasen)."
      }
    ],
    "culturalNotes": [
      "Di Jepang, dilarang merokok di sembarang tempat umum (jalan raya). Merokok hanya diperbolehkan di bilik khusus merokok (喫煙所 / kitsuyenjo)."
    ]
  },
  {
    "lessonNumber": 16,
    "title": "Bab 16: Urutan Tindakan & Penyambung Sifat (動作の順序と接続)",
    "subTitle": "Urutan Kegiatan (～て、～て), Setelah (～てから), dan Penyambung Kata Sifat",
    "summary": "Mempelajari cara merangkai beberapa aktivitas berurutan dalam satu kalimat, menyatakan tindakan setelah tindakan lain selesai (～てから), menggabungkan dua kata sifat, serta pola deskripsi ciri khas fisik.",
    "bunkei": [
      {
        "id": "b16-1",
        "pointNumber": 1,
        "pattern": "KK₁ (Bentuk て) + KK₂ (Bentuk て) + KK₃",
        "formula": "KK₁ (Bentuk て) + KK₂ (Bentuk て) + KK₃ (Bentuk Akhir)",
        "meaning": "Melakukan aksi 1, lalu aksi 2, kemudian aksi 3",
        "explanation": "Menyambungkan rentetan kegiatan secara kronologis. Kala waktu (lampau atau sekarang) ditentukan oleh bentuk kata kerja paling terakhir.",
        "examples": [
          {
            "japanese": "朝 ジョギングをして、シャワーを 浴びて、会社へ 行きます。",
            "romaji": "Asa jogingu o shite, shawaa o abite, kaisha e ikimasu.",
            "meaning": "Pagi hari joging, mandi shower, lalu pergi ke kantor."
          },
          {
            "japanese": "きのう 銀座へ 行って、映画を 見て、買い物を しました。",
            "romaji": "Kinou Ginza e itte, eiga o mite, kaimono o shimashita.",
            "meaning": "Kemarin saya pergi ke Ginza, menonton film, lalu berbelanja."
          }
        ]
      },
      {
        "id": "b16-2",
        "pointNumber": 2,
        "pattern": "KK₁ (Bentuk て) + から、+ KK₂",
        "formula": "KK₁ (Bentuk て) + から、+ KK₂",
        "meaning": "Setelah KK₁ selesai, baru kemudian KK₂",
        "explanation": "Menegaskan bahwa aksi KK₂ baru dapat atau akan dimulai setelah aksi KK₁ tuntas terlaksana.",
        "examples": [
          {
            "japanese": "コンサートが 終わってから、レストランで 食事を しました。",
            "romaji": "Konsaato ga owatte kara, resutoran de shokuji o shimashita.",
            "meaning": "Setelah konser selesai, kami makan di restoran."
          },
          {
            "japanese": "国へ 帰ってから、父の 会社で 働きます。",
            "romaji": "Kuni e kaette kara, chichi no kaisha de hatarakimasu.",
            "meaning": "Setelah pulang ke negara asal, saya akan bekerja di perusahaan ayah."
          }
        ]
      },
      {
        "id": "b16-3",
        "pointNumber": 3,
        "pattern": "[KS-i buang い] + くて / [KS-na tanpa な] + で",
        "formula": "[KS-i buang い] + くて / [KS-na tanpa な] + で",
        "meaning": "... dan juga ...",
        "explanation": "Untuk menggabungkan dua kualitas sifat yang sejajar (positif dan positif, atau negatif dan negatif).",
        "examples": [
          {
            "japanese": "この パソコンは 軽くて、便利です。",
            "romaji": "Kono pasokon wa karukute, benri desu.",
            "meaning": "Laptop ini ringan dan praktis."
          },
          {
            "japanese": "奈良は 静かで、きれいな 町です。",
            "romaji": "Nara wa shizuka de, kireina machi desu.",
            "meaning": "Nara adalah kota yang tenang dan indah."
          }
        ]
      },
      {
        "id": "b16-4",
        "pointNumber": 4,
        "pattern": "KB₁ + は + KB₂ + が + [Kata Sifat] + です",
        "formula": "[Subjek Pokok] + は + [Bagian Tubuh / Atribut] + が + [Kata Sifat] + です",
        "meaning": "KB₁ memiliki KB₂ yang [Sifat]",
        "explanation": "Pola untuk mendeskripsikan ciri khas tubuh orang atau karakteristik suatu tempat.",
        "examples": [
          {
            "japanese": "大阪は 食べ物が おいしいです。",
            "romaji": "Oosaka wa tabemono ga oishii desu.",
            "meaning": "Osaka makanannya enak."
          },
          {
            "japanese": "マリアさんは 髪が 長いです。",
            "romaji": "Maria-san wa kami ga nagai desu.",
            "meaning": "Maria berambut panjang."
          }
        ]
      }
    ],
    "particles": [],
    "grammarNotes": [
      {
        "title": "Perbedaan ～て dan ～てから",
        "content": "Bentuk ～て hanya menyebutkan urutan waktu biasa (A lalu B). Bentuk ～てから memberi penekanan syarat: B baru dimulai setelah A benar-benar rampung."
      }
    ],
    "culturalNotes": [
      "Di stasiun Jepang, pengambilan uang di ATM dan pembelian tiket kereta menggunakan mesin otomatis (券売機 / kenbaiki) yang mengharuskan memasukkan uang terlebih dahulu sebelum menekan tombol tujuan."
    ]
  },
  {
    "lessonNumber": 17,
    "title": "Bab 17: Bentuk ない & Keharusan (ない形・義務)",
    "subTitle": "Bentuk Negatif Biasa (Nai-form), Larangan Halus (～ないで), dan Keharusan (～なければなりません)",
    "summary": "Mempelajari pembentukan kata kerja bentuk negatif santai (Nai-form), permohonan agar tidak melakukan sesuatu (～ないでください), kewajiban/keharusan mutlak (～なければなりません), dan keringanan/tidak harus (～なくてもいいです).",
    "bunkei": [
      {
        "id": "b17-1",
        "pointNumber": 1,
        "pattern": "KK (Bentuk ない) + で ください",
        "formula": "KK (Bentuk ない) + で ください",
        "meaning": "Tolong jangan ...",
        "explanation": "Digunakan untuk meminta lawan bicara dengan sopan agar tidak melakukan suatu hal.",
        "examples": [
          {
            "japanese": "ここで 写真を 撮らないでください。",
            "romaji": "Koko de shashin o toranaide kudasai.",
            "meaning": "Tolong jangan mengambil foto di sini."
          },
          {
            "japanese": "無理を しないでください。",
            "romaji": "Muri o shinaide kudasai.",
            "meaning": "Jangan terlalu memaksakan diri."
          }
        ]
      },
      {
        "id": "b17-2",
        "pointNumber": 2,
        "pattern": "KK (Bentuk ない buang い) + ければ なりません",
        "formula": "KK (Bentuk ない buang い) + ければ なりません",
        "meaning": "Harus / Wajib melakukan ...",
        "explanation": "Menyatakan kewajiban mutlak yang harus dipenuhi, terlepas dari keinginan pribadi si pelaku.",
        "examples": [
          {
            "japanese": "パスポートを 見せなければなりません。",
            "romaji": "Pasupooto o misenakereba narimasen.",
            "meaning": "Anda harus menunjukkan paspor."
          },
          {
            "japanese": "薬を 飲まなければなりません。",
            "romaji": "Kusuri o nomanakereba narimasen.",
            "meaning": "Saya harus minum obat."
          }
        ]
      },
      {
        "id": "b17-3",
        "pointNumber": 3,
        "pattern": "KK (Bentuk ない buang い) + くても いいです",
        "formula": "KK (Bentuk ない buang い) + くても いいです",
        "meaning": "Tidak perlu / Boleh tidak melakukan ...",
        "explanation": "Menyatakan bahwa suatu tindakan tidak wajib dilakukan (ada kelonggaran).",
        "examples": [
          {
            "japanese": "明日は 来なくても いいです。",
            "romaji": "Ashita wa konakute mo ii desu.",
            "meaning": "Besok Anda tidak perlu datang."
          },
          {
            "japanese": "レポートは 出さなくても いいです。",
            "romaji": "Repooto wa dasanakute mo ii desu.",
            "meaning": "Laporannya boleh tidak dikumpulkan."
          }
        ]
      }
    ],
    "particles": [],
    "grammarNotes": [
      {
        "title": "Aturan Konjugasi Bentuk ない (Nai-form)",
        "content": "Grup I: vokal 'i' sebelum ます diganti vokal 'a' lalu tambah ない (kik-imasu -> kik-anai). Pengecualian: huruf vokal い (i) menjadi わ (wa), misal: 買います -> 買わない. Grup II: buang ます tambah ない (tabe-nai, mi-nai). Grup III: します -> しない; 来ます (kimasu) -> こない (konai). Kata あります -> ない."
      }
    ],
    "culturalNotes": [
      "Ketika berkunjung ke klinik/rumah sakit Jepang, wajib menunjukkan kartu asuransi kesehatan (保険証 / hokenshou) di meja resepsionis."
    ],
    "tables": [
      {
        "title": "Rangkuman Konjugasi Bentuk ない (Nai-form)",
        "columns": [
          {
            "key": "grup",
            "label": "Grup"
          },
          {
            "key": "perubahan",
            "label": "Rumus Perubahan"
          },
          {
            "key": "contoh",
            "label": "Contoh Konjugasi"
          }
        ],
        "rows": [
          {
            "grup": "Grup I",
            "perubahan": "Suku kata i-dan menjadi a-dan + ない",
            "contoh": "書きます -> 書かない, 読みます -> 読まない"
          },
          {
            "grup": "Grup I (Vokal i)",
            "perubahan": "い menjadi わない",
            "contoh": "吸います -> 吸わない, 会います -> 会わない"
          },
          {
            "grup": "Grup II",
            "perubahan": "ます dibuang, ganti ない",
            "contoh": "食べます -> 食べない, 忘れます -> 忘れない"
          },
          {
            "grup": "Grup III",
            "perubahan": "Irregular khusus",
            "contoh": "します -> しない, 来ます -> こない (konai)"
          },
          {
            "grup": "Khusus",
            "perubahan": "あります menjadi ない",
            "contoh": "あります -> ない"
          }
        ]
      }
    ]
  },
  {
    "lessonNumber": 18,
    "title": "Bab 18: Bentuk Kamus & Kemampuan (辞書形・可能)",
    "subTitle": "Bentuk Kamus (Jishokei), Kemampuan (～ことができる), dan Sebelum (～まえに)",
    "summary": "Mempelajari bentuk dasar kamus (Jishokei), menyatakan kesanggupan atau kebisaan melakukan sesuatu, mengungkapkan kegemaran/hobi, dan urutan waktu sebelum melakukan tindakan (～まえに).",
    "bunkei": [
      {
        "id": "b18-1",
        "pointNumber": 1,
        "pattern": "KK (Bentuk Kamus) + ことが できます",
        "formula": "KK (Bentuk Kamus) + ことが できます",
        "meaning": "Bisa / Mampu melakukan [Kegiatan]",
        "explanation": "Kata kerja diubah menjadi kata benda dengan penambahan こと, lalu dilekatkan が できます untuk menyatakan keterampilan atau kemungkinan izin situasi.",
        "examples": [
          {
            "japanese": "ミラーさんは 漢字を 読むことが できます。",
            "romaji": "Miraa-san wa kanji o yomu koto ga dekimasu.",
            "meaning": "Sdr. Miller dapat membaca huruf kanji."
          },
          {
            "japanese": "ここで カードで 払うことが できますか。",
            "romaji": "Koko de kaado de harau koto ga dekimasu ka.",
            "meaning": "Bolehkah/bisakah membayar dengan kartu kredit di sini?"
          }
        ]
      },
      {
        "id": "b18-2",
        "pointNumber": 2,
        "pattern": "わたしの 趣味は + KK (Bentuk Kamus) + ことです",
        "formula": "[Subjek] + の + 趣味は + KK (Bentuk Kamus) + ことです",
        "meaning": "Hobi saya adalah [Melakukan Kegiatan]",
        "explanation": "Karena predikat です harus berupa nomina, maka kata kerja diubah menjadi kata benda dengan こと.",
        "examples": [
          {
            "japanese": "わたしの 趣味は 映画を 見ることです。",
            "romaji": "Watashi no shumi wa eiga o miru koto desu.",
            "meaning": "Hobi saya adalah menonton film bioskop."
          },
          {
            "japanese": "趣味は 写真を 撮ることです。",
            "romaji": "Shumi wa shashin o toru koto desu.",
            "meaning": "Hobi saya adalah memotret foto."
          }
        ]
      },
      {
        "id": "b18-3",
        "pointNumber": 3,
        "pattern": "KK (Bentuk Kamus) + まえに / KB + の + まえに",
        "formula": "KK (Bentuk Kamus) + まえに / [KB] + の + まえに、+ [Tindakan Lain]",
        "meaning": "Sebelum melakukan ..., saya ...",
        "explanation": "Menyatakan tindakan yang dilakukan lebih dahulu sebelum aktivitas target terjadi. Kata kerja di depan まえに SELALU berbentuk kamus waktu sekarang.",
        "examples": [
          {
            "japanese": "寝るまえに、日記を 書きます。",
            "romaji": "Neru mae ni, nikki o kakimasu.",
            "meaning": "Sebelum tidur, saya menulis buku harian."
          },
          {
            "japanese": "食事の まえに、手を 洗います。",
            "romaji": "Shokuji no mae ni, te o araimasu.",
            "meaning": "Sebelum makan, mencuci tangan."
          }
        ]
      }
    ],
    "particles": [],
    "grammarNotes": [
      {
        "title": "Aturan Pembentukan Bentuk Kamus (Jishokei)",
        "content": "Grup I: Suku kata deret i-dan diubah ke deret u-dan (kak-imasu -> kak-u, nom-imasu -> nom-u). Grup II: buang ます lalu tambah る (tabe-ru, mi-ru). Grup III: します -> する; 来ます -> くる (kuru)."
      }
    ],
    "culturalNotes": [
      "Di Jepang, tradisi menyapa 'Itadakimasu' (いただきます) sebelum makan adalah wujud syukur kepada alam dan juru masak yang telah menyiapkan hidangan."
    ]
  },
  {
    "lessonNumber": 19,
    "title": "Bab 19: Bentuk Ta & Pengalaman (た形・経験)",
    "subTitle": "Bentuk Lampau Santai (Ta-form), Pengalaman (～たことがある), dan Variasi (～たり～たり)",
    "summary": "Mempelajari pembentukan kata kerja bentuk Ta (Takei), menyatakan riwayat pengalaman pernah melakukan sesuatu, merangkai beberapa aktivitas tanpa urutan ketat (～たり～たりします), dan perubahan menjadi kondisi baru (～くなります/～になります).",
    "bunkei": [
      {
        "id": "b19-1",
        "pointNumber": 1,
        "pattern": "KK (Bentuk た) + ことが あります",
        "formula": "KK (Bentuk た) + ことが あります",
        "meaning": "Pernah melakukan ...",
        "explanation": "Menyatakan riwayat peristiwa yang pernah dialami di masa lalu. Negatif: た ことが ありません (belum pernah).",
        "examples": [
          {
            "japanese": "相撲を 見たことが あります。",
            "romaji": "Sumou o mita koto ga arimasu.",
            "meaning": "Saya pernah menonton pertandingan gulat sumo."
          },
          {
            "japanese": "富士山に 登ったことが ありますか。……いいえ、一度も ありません。",
            "romaji": "Fujisan ni nobotta koto ga arimasu ka? ... Iie, ichido mo arimasen.",
            "meaning": "Pernahkah mendaki Gunung Fuji? ... Belum, belum pernah sekali pun."
          }
        ]
      },
      {
        "id": "b19-2",
        "pointNumber": 2,
        "pattern": "KK₁ (Bentuk た) + り、+ KK₂ (Bentuk た) + り + します",
        "formula": "KK₁ (Bentuk た) + り、+ KK₂ (Bentuk た) + り + します",
        "meaning": "Melakukan kegiatan seperti A, B, dan sebagainya",
        "explanation": "Menyebutkan beberapa perwakilan tindakan dari banyak kegiatan yang dikerjakan tanpa harus berurutan secara kaku.",
        "examples": [
          {
            "japanese": "休みの 日は テニスを したり、散歩に 行ったり します。",
            "romaji": "Yasumi no hi wa tenisu o shitari, sanpo ni ittari shimasu.",
            "meaning": "Pada hari libur saya bermain tenis, jalan-jalan santai, dan sebagainya."
          }
        ]
      },
      {
        "id": "b19-3",
        "pointNumber": 3,
        "pattern": "KS-i + く + なります / KS-na・KB + に + なります",
        "formula": "[KS-i buang い] + く + なります / [KS-na / KB] + に + なります",
        "meaning": "Menjadi [Kondisi Baru]",
        "explanation": "Menyatakan proses perubahan keadaan atau sifat dari waktu ke waktu.",
        "examples": [
          {
            "japanese": "これから だんだん 暑くなります。",
            "romaji": "Korekara dandan atsuku narimasu.",
            "meaning": "Mulai sekarang akan berangsur-angsur menjadi panas."
          },
          {
            "japanese": "テレサちゃんは 背が 高く なりました。",
            "romaji": "Teresa-chan wa se ga takaku narimashita.",
            "meaning": "Teresa telah bertambah tinggi."
          },
          {
            "japanese": "来年 20歳に なります。",
            "romaji": "Rainen hatachi ni narimasu.",
            "meaning": "Tahun depan saya akan menjadi berusia 20 tahun."
          }
        ]
      }
    ],
    "particles": [],
    "grammarNotes": [
      {
        "title": "Aturan Konjugasi Bentuk た (Takei)",
        "content": "Konjugasi bentuk た identik 100% dengan bentuk て (Bab 14). Cukup ganti akhiran て menjadi た, dan で menjadi だ (contoh: 食べて -> 食べた; 飲んで -> 飲んだ; 行って -> 行った)."
      }
    ],
    "culturalNotes": [
      "Olahraga Sumo (相撲) adalah olahraga tradisional bernilai ritual kuno di Jepang yang dihelat dalam 6 turnamen besar (basho) per tahun."
    ]
  },
  {
    "lessonNumber": 20,
    "title": "Bab 20: Ragam Percakapan Biasa (普通体・会話)",
    "subTitle": "Bahasa Biasa (Futsuukei) vs Bahasa Sopan (Teineigo) dalam Percakapan Akrab",
    "summary": "Mempelajari bentuk santai biasa (Futsuukei / Plain Style) yang digunakan antarteman akrab, anggota keluarga, atau rekan sebaya, mencakup kata kerja, kata sifat, dan kalimat nominal.",
    "bunkei": [
      {
        "id": "b20-1",
        "pointNumber": 1,
        "pattern": "KK + [Bentuk Kamus / ない / た / なかった]",
        "formula": "Kata Kerja + [Bentuk Kamus / ない / た / なかった]",
        "meaning": "Melakukan / Tidak / Sudah / Belum (Gaya Santai)",
        "explanation": "ます -> Kamus; ません -> ない; ました -> た; ませんでした -> なかった.",
        "examples": [
          {
            "japanese": "あした 東京へ 行く？……うん、行く。",
            "romaji": "Ashita Toukyou e iku? ... Un, iku.",
            "meaning": "Besok pergi ke Tokyo? ... Ya, pergi."
          },
          {
            "japanese": "サントスさんは パーティーに 来なかった。",
            "romaji": "Santosu-san wa paatii ni konakatta.",
            "meaning": "Santos tidak datang ke pesta."
          }
        ]
      },
      {
        "id": "b20-2",
        "pointNumber": 2,
        "pattern": "KS / KB + [Bentuk Biasa: だ / だった / ない]",
        "formula": "[KS-i Utuh] / [KS-na / KB] + だ / だった / ではない",
        "meaning": "Keadaan santai",
        "explanation": "Kata sifat-i membuang です. Kata benda dan sifat-na mengganti です menjadi だ, でした menjadi だった, dan じゃありません menjadi じゃない.",
        "examples": [
          {
            "japanese": "日本は 物価が 高い。",
            "romaji": "Nihon wa bukka ga takai.",
            "meaning": "Jepang biaya hidupnya mahal."
          },
          {
            "japanese": "沖縄の 海は きれいだった。",
            "romaji": "Okinawa no umi wa kirei datta.",
            "meaning": "Laut di Okinawa dulu indah."
          },
          {
            "japanese": "きょうは 僕の 誕生日だ。",
            "romaji": "Kyou wa boku no tanjoubi da.",
            "meaning": "Hari ini adalah hari ulang tahunku."
          }
        ]
      }
    ],
    "particles": [],
    "grammarNotes": [
      {
        "title": "Perubahan Tanya dan Tanggapan dalam Ragam Santai",
        "content": "Partikel か dihilangkan dan diganti dengan intonasi naik di akhir kalimat. Partikel topik は dan objek を sering dilesapkan saat percakapan santai. はい menjadi うん (un), dan いいえ menjadi ううん (uun)."
      }
    ],
    "culturalNotes": [
      "Jangan pernah menggunakan ragam biasa (Futsuukei) kepada atasan, guru, orang yang baru dikenal, atau orang yang lebih tua karena dianggap sangat tidak sopan."
    ]
  },
  {
    "lessonNumber": 21,
    "title": "Bab 21: Pendapat & Kutipan (意見と引用)",
    "subTitle": "Menyatakan Pendapat (～と思います) dan Mengutip Ucapan (～と言いました)",
    "summary": "Mempelajari cara menyampaikan pemikiran atau opini pribadi (～と思います), melaporkan ucapan orang lain secara langsung maupun tidak langsung (～と言いました), serta meminta konfirmasi (～でしょう).",
    "bunkei": [
      {
        "id": "b21-1",
        "pointNumber": 1,
        "pattern": "［Ragam Biasa］+ と + 思います",
        "formula": "[Klausa Bentuk Biasa] + と + 思います",
        "meaning": "Saya rasa / Saya kira / Menurut pendapat saya ...",
        "explanation": "Digunakan untuk menyampaikan spekulasi, dugaan, atau pendapat pribadi pembicara terhadap suatu hal.",
        "examples": [
          {
            "japanese": "あした 雨が 降ると 思います。",
            "romaji": "Ashita ame ga furu to omoimasu.",
            "meaning": "Saya kira besok akan turun hujan."
          },
          {
            "japanese": "日本は 交通が 便利だと 思います。",
            "romaji": "Nihon wa koutsuu ga benri da to omoimasu.",
            "meaning": "Menurut saya transportasi di Jepang praktis."
          }
        ]
      },
      {
        "id": "b21-2",
        "pointNumber": 2,
        "pattern": "［Kalimat Ucapan］+ と + 言いました",
        "formula": "[Kalimat Kutipan] + と + 言いました",
        "meaning": "Mengatakan bahwa ...",
        "explanation": "Digunakan untuk melaporkan apa yang telah dikatakan oleh seseorang (kutipan langsung dengan tanda kurung 「...」 atau kutipan tidak langsung dengan ragam biasa).",
        "examples": [
          {
            "japanese": "首相は 来月 アメリカへ 行くと 言いました。",
            "romaji": "Shushou wa raigetsu Amerika e iku to iimashita.",
            "meaning": "Perdana menteri berkata bahwa bulan depan beliau akan pergi ke Amerika Serikat."
          },
          {
            "japanese": "ミラーさんは「お疲れさまでした」と 言いました。",
            "romaji": "Miraa-san wa 'Otsukaresama deshita' to iimashita.",
            "meaning": "Sdr. Miller mengatakan 'Terima kasih atas kerja kerasnya'."
          }
        ]
      },
      {
        "id": "b21-3",
        "pointNumber": 3,
        "pattern": "［Ragam Biasa］+ でしょう",
        "formula": "[Klausa Biasa tanpa だ] + でしょう",
        "meaning": "... kan? / Bukan begitu?",
        "explanation": "Diucapkan dengan intonasi naik untuk meminta persetujuan lawan bicara saat yakin mereka sepaham.",
        "examples": [
          {
            "japanese": "あしたの パーティーに 行くでしょう。……ええ、行きます。",
            "romaji": "Ashita no paatii ni iku deshou? ... Ee, ikimasu.",
            "meaning": "Besok kamu datang ke pesta, kan? ... Ya, datang."
          }
        ]
      }
    ],
    "particles": [
      {
        "particle": "と (to)",
        "role": "Partikel Penanda Isi Kutipan Pikiran & Tuturan",
        "explanation": "Membungkus klausa isi yang dipikirkan (思います) atau diucapkan (言います).",
        "examples": [
          {
            "japanese": "おいしいと 思います。",
            "romaji": "Oishii to omoimasu.",
            "meaning": "Saya kira lezat."
          }
        ]
      }
    ],
    "grammarNotes": [
      {
        "title": "Perbedaan と思います vs と言いました",
        "content": "Keduanya wajib didahului oleh klausa ragam biasa (Futsuukei). Ingat bahwa pada kata benda dan kata sifat-na, bentuk positif non-lampau memakai だ (contoh: 便利'だ'と思います)."
      }
    ],
    "culturalNotes": [
      "Masyarakat Jepang terbiasa menyampaikan pendapat secara halus dan tidak terlalu frontal, sering menyisipkan ～と思います agar terdengar bijak dan tidak mendikte."
    ]
  },
  {
    "lessonNumber": 22,
    "title": "Bab 22: Klausa Pewatas Nomina (連体修飾節)",
    "subTitle": "Membuat Anak Kalimat yang Menerangkan Kata Benda",
    "summary": "Mempelajari cara membuat kalimat majemuk di mana seluruh anak kalimat kata kerja berfungsi sebagai keterangan yang menerangkan kata benda di belakangnya (klausa relatif).",
    "bunkei": [
      {
        "id": "b22-1",
        "pointNumber": 1,
        "pattern": "［KK Ragam Biasa］+ Kata Benda",
        "formula": "[Klausa Bentuk Biasa] + [Kata Benda Inti]",
        "meaning": "KB yang di-... / KB yang melakukan ...",
        "explanation": "Dalam bahasa Jepang, klausa penerang SELALU diletakkan DI DEPAN kata benda yang diterangkan. Kata kerja dalam klausa penerang selalu berbentu ragam biasa (kamus, ta, nai, nakatta).",
        "examples": [
          {
            "japanese": "これは ミラーさんが 作った ケーキです。",
            "romaji": "Kore wa Miraa-san ga tsukutta keeki desu.",
            "meaning": "Ini adalah kue yang dibuat oleh Sdr. Miller."
          },
          {
            "japanese": "あそこに いる 人は ミラーさんです。",
            "romaji": "Asoko ni iru hito wa Miraa-san desu.",
            "meaning": "Orang yang berada di sebelah sana adalah Sdr. Miller."
          },
          {
            "japanese": "きのう 習った ことばを 忘れました。",
            "romaji": "Kinou naratta kotoba o wasuremashita.",
            "meaning": "Saya lupa kata-kata yang dipelajari kemarin."
          }
        ]
      },
      {
        "id": "b22-2",
        "pointNumber": 2,
        "pattern": "［KK Kamus］+ [時間 / 約束 / 用事] + が + あります",
        "formula": "[KK Bentuk Kamus] + [時間 / 約束 / 用事] + が + あります",
        "meaning": "Ada waktu / janji / urusan untuk ...",
        "explanation": "Menerangkan nomina abstrak seperti jikan (waktu), yakusoku (janji), atau youji (urusan).",
        "examples": [
          {
            "japanese": "わたしは 買い物に 行く 時間が ありません。",
            "romaji": "Watashi wa kaimono ni iku jikan ga arimasen.",
            "meaning": "Saya tidak memiliki waktu untuk pergi berbelanja."
          },
          {
            "japanese": "きょうは 友達と 会う 約束が あります。",
            "romaji": "Kyou wa tomodachi to au yakusoku ga arimasu.",
            "meaning": "Hari ini ada janji untuk bertemu dengan teman."
          }
        ]
      }
    ],
    "particles": [
      {
        "particle": "が (ga)",
        "role": "Penanda Subjek di Dalam Anak Kalimat (Klausa Relatif)",
        "explanation": "Subjek pelaku di dalam anak kalimat penerang TIDAK menggunakan は, melainkan partikel が.",
        "examples": [
          {
            "japanese": "母が 作った 料理",
            "romaji": "Haha ga tsukutta ryouri",
            "meaning": "Masakan yang dibuat oleh ibu"
          }
        ]
      }
    ],
    "grammarNotes": [
      {
        "title": "Peran Subjek di Dalam Anak Kalimat",
        "content": "Ingat aturan emas: Partikel は adalah penanda topik kalimat utama. Di dalam anak kalimat (anak klausa penerang), subjek pelaku WAJIB memakai partikel が (atau の)."
      }
    ],
    "culturalNotes": [
      "Di Jepang, menepati janji temu (約束 / yakusoku) sangat dihargai. Jika berhalangan atau terlambat bahkan 5 menit, segera kabari pihak terkait."
    ]
  },
  {
    "lessonNumber": 23,
    "title": "Bab 23: Waktu Kondisi & Sebab Alami (時と条件)",
    "subTitle": "Pada Waktu (～とき) dan Kondisi Pasti/Otomatis (～と)",
    "summary": "Mempelajari cara menyatakan waktu terjadinya suatu kondisi menggunakan とき, serta hubungan sebab-akibat yang pasti dan otomatis terjadi (contoh: mekanisme mesin, petunjuk jalan) dengan partikel と.",
    "bunkei": [
      {
        "id": "b23-1",
        "pointNumber": 1,
        "pattern": "KK (Kamus / た) + とき、...",
        "formula": "[Kondisi: KK Kamus / KK た / KS / KB の] + とき、+ [Aksi]",
        "meaning": "Pada waktu / Ketika / Saat ...",
        "explanation": "KK Kamus + とき = sebelum/saat tindakan berlangsung. KK Ta + とき = setelah tindakan selesai tuntas dilaksanakan.",
        "examples": [
          {
            "japanese": "図書館で 本を 借りるとき、カードが 要ります。",
            "romaji": "Toshokan de hon o kariru toki, kaado ga irimasu.",
            "meaning": "Ketika meminjam buku di perpustakaan, kartu perpustakaan diperlukan."
          },
          {
            "japanese": "朝 起きたとき、家族に あいさつします。",
            "romaji": "Asa okita toki, kazoku ni aisatsu shimasu.",
            "meaning": "Saat bangun di pagi hari, saya menyapa keluarga."
          }
        ]
      },
      {
        "id": "b23-2",
        "pointNumber": 2,
        "pattern": "KK (Bentuk Kamus) + と、...",
        "formula": "KK (Bentuk Kamus) + と、+ [Hasil Pasti]",
        "meaning": "Kalau / Jika ..., maka pasti ...",
        "explanation": "Menyatakan bahwa jika tindakan pertama dilakukan, maka akibat kedua pasti dan otomatis terjadi secara alami atau mekanis.",
        "examples": [
          {
            "japanese": "この ボタンを 押すと、お釣りが出ます。",
            "romaji": "Kono botan o osu to, otsuri ga demasu.",
            "meaning": "Jika menekan tombol ini, uang kembalian akan keluar secara otomatis."
          },
          {
            "japanese": "右へ 曲がると、郵便局が あります。",
            "romaji": "Migi e magaru to, yuubinkyoku ga arimasu.",
            "meaning": "Kalau belok ke kanan, Anda akan menemukan kantor pos."
          }
        ]
      }
    ],
    "particles": [
      {
        "particle": "を (o)",
        "role": "Penanda Tempat yang Dilalui Saat Bergerak",
        "explanation": "Digunakan bersama kata kerja gerak seperti 渡ります (menyeberang), 曲がります (berbelok), 歩きます (berjalan).",
        "examples": [
          {
            "japanese": "橋を 渡ります。",
            "romaji": "Hashi o watarimasu.",
            "meaning": "Menyeberangi jembatan."
          }
        ]
      }
    ],
    "grammarNotes": [
      {
        "title": "Batasan Partikel と Kondisional",
        "content": "Kalimat di belakang partikel と TIDAK BOLEH berupa kalimat perintah, ajakan, permohonan, atau kehendak pribadi (misal: tidak boleh ～てください atau ～ましょう)."
      }
    ],
    "culturalNotes": [
      "Mesin penjual otomatis (自動販売機 / jihanki) di Jepang tersebar di setiap sudut jalan dan memiliki teknologi sensor otomatis yang sangat canggih."
    ]
  },
  {
    "lessonNumber": 24,
    "title": "Bab 24: Transaksi Kebaikan & Bantuan (授受表現)",
    "subTitle": "Memberi (くれます), dan Membantu (～てあげます, ～てもらいます, ～てくれます)",
    "summary": "Mempelajari etika transaksi pertolongan dalam bahasa Jepang: memberi kepada penutur (くれます), melakukan bantuan untuk orang lain (～てあげます), menerima bantuan (～てもらいます), dan kebaikan orang lain kepada kita (～てくれます).",
    "bunkei": [
      {
        "id": "b24-1",
        "pointNumber": 1,
        "pattern": "［Orang Lain］+ が + わたしに + [Benda] + を + くれます",
        "formula": "[Pemberi] + が + わたしに + [Benda] + を + くれます",
        "meaning": "Seseorang memberi [Benda] kepada saya",
        "explanation": "くれます khusus digunakan ketika arah pemberian ditujukan kepada pembicara (saya) atau anggota keluarga saya.",
        "examples": [
          {
            "japanese": "佐藤さんは わたしに クリスマスカードを くれました。",
            "romaji": "Satou-san wa watashi ni Kurisumasu kaado o kuremashita.",
            "meaning": "Sdr. Sato memberi saya kartu Natal."
          }
        ]
      },
      {
        "id": "b24-2",
        "pointNumber": 2,
        "pattern": "KK (Bentuk て) + あげます",
        "formula": "[Subjek / わたし] + は + [Penerima] + に + KK (Bentuk て) + あげます",
        "meaning": "Saya melakukan kebaikan/bantuan untuk [Penerima]",
        "explanation": "Melakukan suatu tindakan yang mendatangkan manfaat bagi orang lain.",
        "examples": [
          {
            "japanese": "わたしは 木村さんに 本を 貸してあげました。",
            "romaji": "Watashi wa Kimura-san ni hon o kashite agemashita.",
            "meaning": "Saya meminjamkan buku untuk Nn. Kimura."
          }
        ],
        "note": "Hati-hati: jangan gunakan ke atasan/orang yang lebih tua karena dapat terkesan merendahkan atau pamer jasa."
      },
      {
        "id": "b24-3",
        "pointNumber": 3,
        "pattern": "KK (Bentuk て) + もらいます",
        "formula": "[Subjek / わたし] + は + [Penolong] + に / から + KK (Bentuk て) + もらいます",
        "meaning": "Saya menerima kebaikan/bantuan dari [Penolong]",
        "explanation": "Menyatakan rasa syukur karena telah dibantu oleh orang lain atas permohonan atau inisiatif kita.",
        "examples": [
          {
            "japanese": "わたしは 山田さんに 病院の 電話番号を 教えてもらいました。",
            "romaji": "Watashi wa Yamada-san ni byouin no denwa bangou o oshiete moraimashita.",
            "meaning": "Saya diberitahu nomor telepon rumah sakit oleh Sdr. Yamada."
          }
        ]
      },
      {
        "id": "b24-4",
        "pointNumber": 4,
        "pattern": "KK (Bentuk て) + くれます",
        "formula": "[Penolong] + が + わたしに + KK (Bentuk て) + くれます",
        "meaning": "[Penolong] berbuat kebaikan/menolong saya",
        "explanation": "Menekankan inisiatif kebaikan orang lain yang secara sukarela melakukan tindakan pertolongan bagi pembicara.",
        "examples": [
          {
            "japanese": "母は わたしに セーターを 送ってくれました。",
            "romaji": "Haha wa watashi ni seetaa o okutte kuremashita.",
            "meaning": "Ibu mengirimkan baju hangat rajut untuk saya."
          }
        ]
      }
    ],
    "particles": [],
    "grammarNotes": [
      {
        "title": "Perbedaan Perspektif ～てもらいました vs ～てくれました",
        "content": "～てもらいました menempatkan 'saya' sebagai subjek utama yang berterima kasih atas bantuan. Sedangkan ～てくれました menempatkan 'si penolong' sebagai subjek yang berinisiatif baik membantu saya."
      }
    ],
    "culturalNotes": [
      "Budaya saling tolong-menolong dan menjaga harmoni sosial (wa / 和) merupakan inti dari ekspresi授受 (juju hyougen) dalam tata bahasa Jepang."
    ]
  },
  {
    "lessonNumber": 25,
    "title": "Bab 25: Pengandaian & Konsesif (仮定と譲歩)",
    "subTitle": "Pengandaian Jika (～たら), Walaupun (～ても), dan Seandainya (もし)",
    "summary": "Bab puncak Minna no Nihongo Shokyu I: Menguasai kalimat pengandaian jika/apabila kondisi terpenuhi (～たら), serta kalimat perlawanan meskipun/walaupun (～ても).",
    "bunkei": [
      {
        "id": "b25-1",
        "pointNumber": 1,
        "pattern": "［KK Bentuk た］+ ら、...",
        "formula": "[Klausa Syarat Bentuk た] + ら、+ [Hasil]",
        "meaning": "Kalau / Jika ..., maka ...",
        "explanation": "Konstruksi pengandaian paling fleksibel dalam percakapan. Dibuat dengan menambahkan ら pada bentuk lampau た (KK, KS-i, KS-na, KB).",
        "examples": [
          {
            "japanese": "雨が 降ったら、出かけません。",
            "romaji": "Ame ga futtara, dekakemasen.",
            "meaning": "Kalau hujan turun, saya tidak akan bepergian keluar."
          },
          {
            "japanese": "時間が あったら、映画を 見たいです。",
            "romaji": "Jikan ga attara, eiga o mitai desu.",
            "meaning": "Kalau ada waktu senggang, saya ingin menonton film."
          },
          {
            "japanese": "安かったら、パソコンを 買います。",
            "romaji": "Yasukattara, pasokon o kaimasu.",
            "meaning": "Kalau harganya murah, saya akan beli laptop."
          }
        ]
      },
      {
        "id": "b25-2",
        "pointNumber": 2,
        "pattern": "［KK Bentuk て］+ も、...",
        "formula": "[Klausa Syarat Bentuk て] + も、+ [Hasil Tak Terduga]",
        "meaning": "Meskipun / Walaupun ..., tetap ...",
        "explanation": "Menyatakan bahwa meskipun kondisi di depan terjadi, hasil di belakang tetap tidak berubah atau bertolak belakang dengan harapan umum.",
        "examples": [
          {
            "japanese": "雨が 降っても、出かけます。",
            "romaji": "Ame ga futtemo, dekakemasu.",
            "meaning": "Meskipun turun hujan, saya tetap akan pergi keluar."
          },
          {
            "japanese": "高くても、この 車を 買いたいです。",
            "romaji": "Takakutemo, kono kuruma o kaitai desu.",
            "meaning": "Walaupun mahal, saya tetap ingin membeli mobil ini."
          },
          {
            "japanese": "日曜日でも、働きます。",
            "romaji": "Nichiyoubi demo, hatarakimasu.",
            "meaning": "Walaupun hari Minggu, saya tetap bekerja."
          }
        ]
      },
      {
        "id": "b25-3",
        "pointNumber": 3,
        "pattern": "もし + [～たら / ～ても]",
        "formula": "もし + [Kalimat Pengandaian ～たら / ～ても]",
        "meaning": "Seandainya / Jikalau ...",
        "explanation": "Kata keterangan もし diletakkan di awal kalimat untuk memberi sinyal awal bahwa kalimat tersebut merupakan pengandaian hipotesis.",
        "examples": [
          {
            "japanese": "もし 1億円 あったら、世界旅行を します。",
            "romaji": "Moshi ichi-oku-en attara, sekai ryokou o shimasu.",
            "meaning": "Seandainya punya uang 100 juta Yen, saya akan keliling dunia."
          }
        ]
      }
    ],
    "particles": [],
    "grammarNotes": [
      {
        "title": "Perbedaan ～たら (Tara) vs ～ても (Temo)",
        "content": "～たら menyatakan syarat positif (jika A terjadi, lakukan B). ～ても menyatakan konsesif perlawanan (meskipun A terjadi, B tetap berlaku)."
      }
    ],
    "culturalNotes": [
      "Selamat! Menyelesaikan Bab 25 menandai tuntasnya kurikulum Minna no Nihongo Shokyu I (Dasar N5). Anda telah menguasai fondasi utama bahasa Jepang untuk percakapan sehari-hari!"
    ]
  }
];

export function getLessonChapterData(lessonNumber: number): LessonGrammarChapter | undefined {
  return lessonGrammarBookData.find(c => c.lessonNumber === lessonNumber);
}
