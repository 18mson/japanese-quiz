import { Lesson, GrammarPoint, Kaiwa, RenshuuAItem, RenshuuBCharacter, RenshuuBQuestion, RenshuuCItem } from '../types/lesson';

export const lesson1Data: {
  lesson: Lesson;
  bunkei: GrammarPoint[];
  kaiwa: Kaiwa;
  renshuu_a: RenshuuAItem[];
  renshuu_b_characters: RenshuuBCharacter[];
  renshuu_b_questions: RenshuuBQuestion[];
  renshuu_c: RenshuuCItem[];
} = {
  lesson: {
    id: "0e2ac557-7a6e-4617-b3fb-69b65877f5c5",
    lesson_number: 1,
    title: "初めまして"
  },
  bunkei: [
    {
      id: "312b1720-e039-4eb5-9469-b6ba5d28aa2a",
      point_number: 1,
      order_index: 1,
      pattern: "Kata Benda₁ は Kata Benda₂ です",
      sub_points: [
        {
          title: "1) Partikel は",
          explanation: "Partikel は menunjukkan bahwa kata sebelumnya adalah topik kalimat (Topik dan Subjek). Si pembicara memakai は untuk hal yang mau dibicarakannya, kemudian selanjutnya membuat kalimat dengan menambahkan berbagai deskripsi.",
          example: { japanese: "わたしは マイク・ミラーです。", meaning: "Saya Mike Miller." },
          note: "[Perhatian] Partikel は dibaca わ."
        },
        {
          title: "2) です",
          explanation: "Kata Benda yang diikuti oleh です menjadi Predikat. です menyatakan maksud penilaian dan kepastian, juga menunjukkan sikap sopan terhadap lawan bicara. です dalam kalimat negatif atau waktu lampau, bentuknya berubah.",
          example: { japanese: "わたしは 会社員です。", meaning: "Saya pegawai perusahaan." }
        }
      ],
      examples: [
        { japanese: "わたしは マイク・ミラーです。", meaning: "Saya Mike Miller." },
        { japanese: "わたしは 会社員です。", meaning: "Saya pegawai perusahaan." }
      ],
      japanese: "わたしは マイク・ミラーです。",
      romaji: "Watashi wa Maiku Mira desu.",
      meaning: "Saya Mike Miller."
    },
    {
      id: "e0a7212f-d581-4dbd-9bbb-50652dc6393a",
      point_number: 2,
      order_index: 2,
      pattern: "Kata Benda₁ は Kata Benda₂ じゃ（では）ありません",
      explanation: "じゃ（では）ありません adalah bentuk negatif untuk です。Dalam percakapan sehari-hari sering digunakan じゃ ありません。Dalam pidato yang resmi atau bahasa tertulis digunakan では ありません。",
      examples: [
        { japanese: "サントスさんは 学生じゃ ありません。（では）", meaning: "Sdr. Santos bukan mahasiswa." }
      ],
      note: "[Perhatian] は dari では diucapkan わ.",
      japanese: "サントスさんは 学生じゃ ありません。(では)",
      romaji: "Santosu-san wa gakusei ja arimasen. (dewa)",
      meaning: "Santos-san bukan mahasiswa."
    },
    {
      id: "4dc51f7c-a97e-41d3-9ebc-235c6f5c73b4",
      point_number: 3,
      order_index: 3,
      pattern: "Kata Benda₁ は Kata Benda₂ ですか（kalimat tanya）",
      sub_points: [
        {
          title: "1) Partikel か",
          explanation: "Partikel か menyatakan perasaan ketidakpastian atau heran si pembicara. Dengan memakai か pada akhir kalimat maka dapat membuat kalimat tanya. Kalimat tanya biasanya menyertai intonasi naik pada akhir kalimat."
        },
        {
          title: "2) Kalimat tanya untuk menanyakan \"Ya\" atau \"Tidak\" tentang isi kalimat",
          explanation: "Tanpa mengubah susunan kata-kata, membuat kalimat dengan membubuhi か pada akhir kalimat. Kalimat tanya ini menanyakan apakah benar atau tidak isi kalimat, dan jika benar menjawab dengan memakai はい, jika salah menjawab dengan いいえ。",
          examples: [
            { japanese: "ミラーさんは アメリカ人ですか。……はい、アメリカ人です。", meaning: "Apakah Sdr. Miller orang Amerika? ……Ya, orang Amerika." },
            { japanese: "ミラーさんは 先生ですか。……いいえ、先生じゃ ありません。", meaning: "Apakah Sdr. Miller guru? ……Bukan, dia bukan guru." }
          ]
        },
        {
          title: "3) Kalimat tanya dengan kata tanya",
          explanation: "Bagian isi yang ingin ditanyakan diganti dengan kata tanya, dan dibubuhkan か pada akhir kalimat.",
          example: { japanese: "あの方は どなたですか。……［あの方は］ミラーさんです。", meaning: "Siapakah orang itu? ……[Beliau] Sdr. Miller." }
        }
      ],
      examples: [
        { japanese: "ミラーさんは アメリカ人ですか。……はい、アメリカ人です。", meaning: "Apakah Sdr. Miller orang Amerika? ……Ya, orang Amerika." },
        { japanese: "ミラーさんは 先生ですか。……いいえ、先生じゃ ありません。", meaning: "Apakah Sdr. Miller guru? ……Bukan, dia bukan guru." },
        { japanese: "あの方は どなたですか。……［あの方は］ミラーさんです。", meaning: "Siapakah orang itu? ……[Beliau] Sdr. Miller." }
      ],
      japanese: "ミラーさんは 会社員ですか。",
      romaji: "Mira-san wa kaishain desu ka.",
      meaning: "Apakah Miller-san karyawan perusahaan?"
    },
    {
      id: "0ea3d94d-771e-4474-9cc4-3783c46dae65",
      point_number: 4,
      order_index: 4,
      pattern: "Kata Benda も",
      explanation: "も digunakan apabila menyatakan predikatnya dianggap sama dengan predikat sebelumnya.",
      examples: [
        { japanese: "ミラーさんは 会社員です。グプタさんも 会社員です。", meaning: "Sdr. Miller pegawai perusahaan. Sdr. Gupta juga pegawai perusahaan." }
      ],
      japanese: "サントスさんも 会社員です。",
      romaji: "Santosu-san mo kaishain desu.",
      meaning: "Santos-san juga karyawan perusahaan."
    },
    {
      id: "68bf0638-6052-462a-b3a1-4416102d5232",
      point_number: 5,
      order_index: 5,
      pattern: "Kata Benda₁ の Kata Benda₂",
      explanation: "Jika Kata Benda₁ di depan menerangkan Kata Benda₂ di belakangnya, maka kedua Kata Benda disambung dengan の。Pada Pelajaran 1, Kata Benda₁ menunjukkan satu kesatuan Kata Benda₂.",
      examples: [
        { japanese: "ミラーさんは IMCの 社員です。", meaning: "Sdr. Miller pegawai perusahaan IMC." }
      ],
      japanese: "ミラーさんは IMCの 社員です。",
      romaji: "Mira-san wa IMC no shain desu.",
      meaning: "Sdr. Miller pegawai perusahaan IMC."
    },
    {
      id: "3b690682-328b-40d6-846e-fd86aef44992",
      point_number: 6,
      order_index: 6,
      pattern: "～さん",
      explanation: "Dalam bahasa Jepang memakai さん di belakang marga atau nama lawan bicara atau orang pihak ketiga. Karena さん menunjukkan kesopanan, tidak dipakai untuk marga atau nama si pembicara sendiri. Sebagai gantinya, さん untuk anak kecil dengan rasa akrab dipakai ちゃん。",
      examples: [
        { japanese: "あの方は ミラーさんです。", meaning: "Beliau Sdr. Miller." },
        { japanese: "鈴木：ミラーさんは 学生ですか。 ミラー：いいえ、会社員です。", meaning: "Suzuki: Apakah Sdr. Miller mahasiswa? Miller: Bukan, saya pegawai perusahaan." }
      ],
      note: "Ketika memanggil lawan bicara, jika telah mengenal namanya maka あなた tidak dipakai lagi, tetapi memanggil marga atau namanya yang dibubuhi dengan さん。[Perhatian] あなた digunakan terhadap orang yang berhubungan sangat dekat (suami istri, pacar dll). Perlu hati-hati bahwa jika menggunakannya kepada lawan bicara yang hubungan tidak dekat maka akan memberi kesan yang kurang sopan.",
      japanese: "あの方は ミラーさんです。",
      romaji: "Ano kata wa Mira-san desu.",
      meaning: "Beliau Sdr. Miller."
    }
  ],
  kaiwa: {
    id: "kaiwa-lesson-1",
    lesson_id: "0e2ac557-7a6e-4617-b3fb-69b65877f5c5",
    title: "初めまして",
    title_romaji: "Hajimemashite",
    title_meaning: "Perkenalkan / Salam kenal",
    context_note: "Perkenalan Mike Miller kepada rekan kerja di kantor, dibawakan oleh Yamada",
    lines: [
      { order_index: 1, speaker: "佐藤", japanese: "おはよう ございます。", romaji: "Ohayou gozaimasu.", meaning: "Selamat pagi." },
      { order_index: 2, speaker: "山田", japanese: "おはよう ございます。", romaji: "Ohayou gozaimasu.", meaning: "Selamat pagi." },
      { order_index: 3, speaker: "山田", japanese: "佐藤さん、こちらは マイク・ミラーさんです。", romaji: "Satou-san, kochira wa Maiku Mira-san desu.", meaning: "Sato-san, ini Mike Miller-san." },
      { order_index: 4, speaker: "ミラー", japanese: "初めまして。", romaji: "Hajimemashite.", meaning: "Perkenalkan." },
      { order_index: 5, speaker: "ミラー", japanese: "マイク・ミラーです。", romaji: "Maiku Mira desu.", meaning: "Saya Mike Miller." },
      { order_index: 6, speaker: "ミラー", japanese: "アメリカから 来ました。", romaji: "Amerika kara kimashita.", meaning: "Saya datang dari Amerika." },
      { order_index: 7, speaker: "ミラー", japanese: "どうぞ よろしく。", romaji: "Douzo yoroshiku.", meaning: "Senang berkenalan dengan Anda." },
      { order_index: 8, speaker: "佐藤", japanese: "佐藤けい子です。", romaji: "Satou Keiko desu.", meaning: "Saya Sato Keiko." },
      { order_index: 9, speaker: "佐藤", japanese: "どうぞ よろしく。", romaji: "Douzo yoroshiku.", meaning: "Senang berkenalan dengan Anda." }
    ]
  },
  renshuu_a: [
    {
      question_order: 1,
      type: "substitution_single",
      base_template: "わたしは ___ です。",
      base_filled_example: "わたしは マイク・ミラーです。",
      substitutions: ["かいしゃいん"],
      results: ["わたしは かいしゃいんです。"],
      meaning: "Saya karyawan perusahaan."
    },
    {
      question_order: 2,
      type: "substitution_single_negative",
      base_template: "わたしは ___ じゃ ありません。",
      base_filled_example: "わたしは カール・シュミットじゃ ありません。",
      substitutions: ["エンジニア"],
      results: ["わたしは エンジニアじゃ ありません。"],
      meaning: "Saya bukan insinyur."
    },
    {
      question_order: 3,
      type: "substitution_cascading_question",
      base_template: "あの方は ___ ですか。",
      base_filled_example: "あの方は きむらさんですか。",
      substitutions: ["マリアさん", "だれ（どなた）"],
      results: [
        "あの方は マリアさんですか。",
        "あの方は だれ（どなた）ですか。"
      ],
      meaning: "Apakah orang itu Maria-san? / Siapakah orang itu?"
    },
    {
      question_order: 4,
      type: "substitution_cascading_also",
      base_template: "サントスさんは ブラジル人です。___ も ブラジル人です。",
      base_filled_example: "サントスさんは ブラジル人です。マリアさんも ブラジル人です。",
      substitutions: ["あの ひと"],
      results: ["サントスさんは ブラジル人です。あのひとも ブラジル人です。"],
      meaning: "Santos-san orang Brazil. Orang itu juga orang Brazil."
    },
    {
      question_order: 5,
      type: "substitution_cascading_of",
      base_template: "ミラーさんは ___ の ___ です。",
      base_filled_example: "ミラーさんは IMCの しゃいんです。",
      substitutions: [["カリナさん", "ふじだいがく", "がくせい"]],
      results: ["カリナさんは ふじだいがくの がくせいです。"],
      meaning: "Karina-san murid Universitas Fuji."
    },
    {
      question_order: 6,
      type: "substitution_cascading_question_age",
      base_template: "___ は ___ さいです。",
      base_filled_example: "テレサちゃんは 9さいです。",
      substitutions: [["たろうくん", "8さい"], ["なんさい（おいくつ）", "……か。"]],
      results: [
        "たろうくんは 8さいです。",
        "なんさい（おいくつ）ですか。"
      ],
      meaning: "Taro-kun 8 tahun. / Berapa umurnya?"
    }
  ],
  renshuu_b_characters: [
    {
      table_id: "table_1",
      key: "example",
      name: "ミラー",
      romaji_name: "Mira",
      country: "アメリカ",
      profession: "会社員",
      image_url: "https://xvjwcyubeljzjjkialjj.supabase.co/storage/v1/object/public/renshuu-characters/lesson_1/char_miller_example.jpg"
    },
    {
      table_id: "table_1",
      key: "1",
      name: "山田",
      romaji_name: "Yamada",
      country: "日本",
      profession: "銀行員",
      image_url: "https://xvjwcyubeljzjjkialjj.supabase.co/storage/v1/object/public/renshuu-characters/lesson_1/char_yamada_1.jpg"
    },
    {
      table_id: "table_1",
      key: "2",
      name: "ワット",
      romaji_name: "Watto",
      country: "イギリス",
      profession: "先生",
      image_url: "https://xvjwcyubeljzjjkialjj.supabase.co/storage/v1/object/public/renshuu-characters/lesson_1/char_watt_2.jpg"
    },
    {
      table_id: "table_1",
      key: "3",
      name: "タワポン",
      romaji_name: "Tawapon",
      country: "タイ",
      profession: "学生",
      image_url: "https://xvjwcyubeljzjjkialjj.supabase.co/storage/v1/object/public/renshuu-characters/lesson_1/char_tawaphon_3.jpg"
    },
    {
      table_id: "table_1",
      key: "4",
      name: "シュミット",
      romaji_name: "Shumitto",
      country: "ドイツ",
      profession: "エンジニア",
      image_url: "https://xvjwcyubeljzjjkialjj.supabase.co/storage/v1/object/public/renshuu-characters/lesson_1/char_schmidt_4.jpg"
    },
    {
      table_id: "table_2",
      key: "example",
      name: "グプタ",
      romaji_name: "Guputa",
      age: 42,
      country: "インド",
      company: "IMC",
      profession: "社員",
      image_url: "https://xvjwcyubeljzjjkialjj.supabase.co/storage/v1/object/public/renshuu-characters/lesson_1/char_gupta_example.jpg"
    },
    {
      table_id: "table_2",
      key: "1",
      name: "イー",
      romaji_name: "I",
      age: 35,
      country: "韓国",
      company: "AKC",
      profession: "研究者",
      image_url: "https://xvjwcyubeljzjjkialjj.supabase.co/storage/v1/object/public/renshuu-characters/lesson_1/char_lee_1.jpg"
    },
    {
      table_id: "table_2",
      key: "2",
      name: "ワン",
      romaji_name: "Wan",
      age: 29,
      country: "中国",
      company: "神戸病院",
      profession: "医者",
      image_url: "https://xvjwcyubeljzjjkialjj.supabase.co/storage/v1/object/public/renshuu-characters/lesson_1/char_wang_2.jpg"
    },
    {
      table_id: "table_2",
      key: "3",
      name: "カリナ",
      romaji_name: "Karina",
      age: 24,
      country: "インドネシア",
      company: "富士大学",
      profession: "学生",
      image_url: "https://xvjwcyubeljzjjkialjj.supabase.co/storage/v1/object/public/renshuu-characters/lesson_1/char_karina_3.jpg"
    },
    {
      table_id: "table_2",
      key: "4",
      name: "サントス",
      romaji_name: "Santosu",
      age: 39,
      country: "ブラジル",
      company: "ブラジルエアー",
      profession: "社員",
      image_url: "https://xvjwcyubeljzjjkialjj.supabase.co/storage/v1/object/public/renshuu-characters/lesson_1/char_santos_4.jpg"
    }
  ],
  renshuu_b_questions: [
    {
      table_ref: "table_1",
      question_order: 1,
      pattern: "country_statement",
      question_data: {
        example_result: "ミラーさんは アメリカ人です。",
        example_meaning: "Miller-san orang Amerika.",
        target_keys: ["1", "2", "3", "4"]
      }
    },
    {
      table_ref: "table_1",
      question_order: 2,
      pattern: "profession_statement",
      question_data: {
        example_result: "ミラーさんは 会社員です。",
        example_meaning: "Miller-san karyawan perusahaan.",
        target_keys: ["1", "2", "3", "4"]
      }
    },
    {
      table_ref: "table_1",
      question_order: 3,
      pattern: "profession_negative",
      question_data: {
        example_input: "ミラーさん・銀行員",
        example_result: "ミラーさんは 銀行員じゃ ありません。",
        example_meaning: "Miller-san bukan pegawai bank.",
        targets: [
          { key: "1", input: "山田さん・エンジニア" },
          { key: "2", input: "ワットさん・ドイツ人" },
          { key: "3", input: "タワポンさん・先生" },
          { key: "4", input: "シュミットさん・アメリカ人" }
        ]
      }
    },
    {
      table_ref: "table_1",
      question_order: 4,
      pattern: "yes_no_question",
      question_data: {
        examples: [
          { input: "ミラーさん・アメリカ人", question: "ミラーさんは アメリカ人ですか。", answer: "はい、アメリカ人です。" },
          { input: "ミラーさん・医者", question: "ミラーさんは 医者ですか。", answer: "いいえ、医者じゃ ありません。" }
        ],
        targets: [
          { key: "1", input: "山田さん・銀行員" },
          { key: "2", input: "ワットさん・フランス人" },
          { key: "3", input: "タワポンさん・会社員" },
          { key: "4", input: "シュミットさん・エンジニア" }
        ]
      }
    },
    {
      table_ref: "table_2",
      question_order: 5,
      pattern: "also_question_answer",
      question_data: {
        examples: [
          { prompt: "ミラーさんは 会社員です。グプタさんも 会社員ですか。", answer: "はい、グプタさんも 会社員です。" },
          { prompt: "ミラーさんは アメリカ人です。グプタさんも アメリカ人ですか。", answer: "いいえ、グプタさんは アメリカ人じゃ ありません。" }
        ],
        targets: [
          { key: "1", prompt: "山田さんは 銀行員です。イーさんも 銀行員ですか。" },
          { key: "2", prompt: "ワットさんは 先生です。ワンさんも 先生ですか。" },
          { key: "3", prompt: "タワポンさんは 学生です。カリナさんも 学生ですか。" },
          { key: "4", prompt: "シュミットさんは ドイツ人です。サントスさんも ドイツ人ですか。" }
        ]
      }
    },
    {
      table_ref: "table_2",
      question_order: 6,
      pattern: "who_is_that_person",
      question_data: {
        example_question: "あの方は どなたですか。",
        example_answer: "グプタさんです。IMCの 社員です。",
        target_keys: ["1", "2", "3", "4"]
      }
    },
    {
      table_ref: "table_2",
      question_order: 7,
      pattern: "age_statement",
      question_data: {
        example_result: "グプタさんは 42歳です。",
        target_keys: ["1", "2", "3", "4"]
      }
    }
  ],
  renshuu_c: [
    {
      id: "rc-1",
      lesson_id: "0e2ac557-7a6e-4617-b3fb-69b65877f5c5",
      question_order: 1,
      type: "role_play_name_confirmation",
      dialogue_template: [
        { speaker: "A", japanese: "失礼ですが、お名前は？", romaji: "Shitsurei desu ga, onamae wa?", meaning: "Maaf, siapa nama Anda?" },
        { speaker: "B", japanese: "①[名前]です。", slot: 1, meaning: "Saya ①[nama]." },
        { speaker: "A", japanese: "②[聞き返し]さんですか。", slot: 2, meaning: "Apakah Anda ②[nama]-san?" },
        { speaker: "B", japanese: "いいえ、①[名前]です。", slot: 1, meaning: "Bukan, saya ①[nama]." }
      ],
      options: [
        { option_key: "1", slot_values: { slot_1: "サントス", slot_2: "サンタス" } },
        { option_key: "2", slot_values: { slot_1: "ワット", slot_2: "アット" } },
        { option_key: "3", slot_values: { slot_1: "タワポン", slot_2: "タナポン" } }
      ]
    },
    {
      id: "rc-2",
      lesson_id: "0e2ac557-7a6e-4617-b3fb-69b65877f5c5",
      question_order: 2,
      type: "role_play_self_introduction",
      dialogue_template: [
        { speaker: "A", japanese: "初めまして。①[名前]です。②[国]から 来ました。どうぞ よろしく。", slots: [1, 2], meaning: "Perkenalkan. Saya ①[nama]. Saya datang dari ②[negara]. Senang berkenalan." },
        { speaker: "B", japanese: "佐藤です。どうぞ よろしく。", meaning: "Saya Sato. Senang berkenalan." }
      ],
      options: [
        { option_key: "1", slot_values: { slot_1: "ホセ・サントス", slot_2: "ブラジル" } },
        { option_key: "2", slot_values: { slot_1: "カリナ", slot_2: "インドネシア" } },
        { option_key: "3", slot_values: { slot_1: "ワン", slot_2: "中国" } }
      ]
    },
    {
      id: "rc-3",
      lesson_id: "0e2ac557-7a6e-4617-b3fb-69b65877f5c5",
      question_order: 3,
      type: "role_play_group_introduction",
      dialogue_template: [
        { speaker: "A", japanese: "皆さん、こちらは①[名前]さんです。", slot: 1, meaning: "Semuanya, ini ①[nama]-san." },
        { speaker: "B", japanese: "おはよう ございます。①[名前]です。②[所属]です。どうぞ よろしく お願いします。", slots: [1, 2], meaning: "Selamat pagi. Saya ①[nama]. Saya ②[profesi/perusahaan]. Mohon bantuannya." }
      ],
      options: [
        { option_key: "1", slot_values: { slot_1: "ホセ・サントス", slot_2: "ブラジルエアーの 社員" } },
        { option_key: "2", slot_values: { slot_1: "ジョン・ワット", slot_2: "さくら大学の 教師" } },
        { option_key: "3", slot_values: { slot_1: "カール・シュミット", slot_2: "パワー電気の エンジニア" } }
      ]
    }
  ]
};
