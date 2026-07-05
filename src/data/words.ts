export interface JapaneseWord {
  character: string;
  romaji: string | string[];
  kana: string;
  meaning: string;
  type: 'word';
  lesson?: string;
}

export const wordsData: JapaneseWord[] = [
  // Greetings & Core Expressions
  { character: 'こんにちは', kana: 'こんにちは', romaji: 'konnichiwa', meaning: 'Hello / Good afternoon', type: 'word' },
  { character: 'ありがとう', kana: 'ありがとう', romaji: ['arigatou', 'arigato'], meaning: 'Thank you', type: 'word' },
  { character: 'すみません', kana: 'すみません', romaji: 'sumimasen', meaning: 'Excuse me / Sorry', type: 'word' },
  { character: 'はい', kana: 'はい', romaji: 'hai', meaning: 'Yes', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'いいえ', kana: 'いいえ', romaji: 'iie', meaning: 'No', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'さようなら', kana: 'さようなら', romaji: ['sayounara', 'sayonara'], meaning: 'Goodbye', type: 'word' },

  // Common Nouns
  { character: '日本語', kana: 'にほんご', romaji: 'nihongo', meaning: 'Japanese language', type: 'word' },
  { character: '友達', kana: 'ともだち', romaji: 'tomodachi', meaning: 'Friend', type: 'word' },
  { character: '先生', kana: 'せんせい', romaji: 'sensei', meaning: 'Teacher', type: 'word', lesson: 'Pelajaran 1' },
  { character: '学生', kana: 'がくせい', romaji: 'gakusei', meaning: 'Student', type: 'word', lesson: 'Pelajaran 1' },
  { character: '学校', kana: 'がっこう', romaji: 'gakkou', meaning: 'School', type: 'word' },
  { character: '駅', kana: 'えき', romaji: 'eki', meaning: 'Station', type: 'word' },
  { character: '家', kana: 'いえ', romaji: 'ie', meaning: 'House / Home', type: 'word' },
  { character: '部屋', kana: 'へや', romaji: 'heya', meaning: 'Room', type: 'word' },
  { character: '車', kana: 'くるま', romaji: 'kuruma', meaning: 'Car', type: 'word' },
  { character: '本', kana: 'ほん', romaji: 'hon', meaning: 'Book', type: 'word' },
  { character: '携帯', kana: 'けいたい', romaji: 'keitai', meaning: 'Mobile phone', type: 'word' },
  { character: '電話', kana: 'でんわ', romaji: 'denwa', meaning: 'Telephone', type: 'word' },
  { character: 'お金', kana: 'おかね', romaji: 'okane', meaning: 'Money', type: 'word' },
  { character: '時間', kana: 'じかん', romaji: 'jikan', meaning: 'Time', type: 'word' },
  { character: '家族', kana: 'かぞく', romaji: 'kazoku', meaning: 'Family', type: 'word' },
  { character: '傘', kana: 'かさ', romaji: 'kasa', meaning: 'Umbrella', type: 'word' },
  { character: '服', kana: 'ふく', romaji: 'fuku', meaning: 'Clothes', type: 'word' },
 
  // Food & Drink
  { character: '水', kana: 'みず', romaji: 'mizu', meaning: 'Water', type: 'word' },
  { character: 'お茶', kana: 'おちゃ', romaji: 'ocha', meaning: 'Green tea', type: 'word' },
  { character: '寿司', kana: 'すし', romaji: 'sushi', meaning: 'Sushi', type: 'word' },
  { character: 'ラーメン', kana: 'らーめん', romaji: ['raamen', 'ramen'], meaning: 'Ramen', type: 'word' },
  { character: 'コーヒー', kana: 'こーひー', romaji: ['koohii', 'kohi'], meaning: 'Coffee', type: 'word' },
  { character: 'パン', kana: 'ぱん', romaji: 'pan', meaning: 'Bread', type: 'word' },
 
  // Nature & Environment
  { character: '猫', kana: 'ねこ', romaji: 'neko', meaning: 'Cat', type: 'word' },
  { character: '犬', kana: 'いぬ', romaji: 'inu', meaning: 'Dog', type: 'word' },
  { character: '桜', kana: 'さくら', romaji: 'sakura', meaning: 'Cherry blossom', type: 'word' },
  { character: '空', kana: 'そら', romaji: 'sora', meaning: 'Sky', type: 'word' },
  { character: '海', kana: 'うみ', romaji: 'umi', meaning: 'Sea / Ocean', type: 'word' },
  { character: '山', kana: 'やま', romaji: 'yama', meaning: 'Mountain', type: 'word' },
  { character: '川', kana: 'かわ', romaji: 'kawa', meaning: 'River', type: 'word' },
  { character: '花', kana: 'はな', romaji: 'hana', meaning: 'Flower', type: 'word' },
  { character: '雨', kana: 'あめ', romaji: 'ame', meaning: 'Rain', type: 'word' },

  // Time Words
  { character: '今日', kana: 'きょう', romaji: ['kyou', 'kyo'], meaning: 'Today', type: 'word' },
  { character: '明日', kana: 'あした', romaji: 'ashita', meaning: 'Tomorrow', type: 'word' },
  { character: '昨日', kana: 'きのう', romaji: ['kinou', 'kino'], meaning: 'Yesterday', type: 'word' },
  { character: '今', kana: 'いま', romaji: 'ima', meaning: 'Now', type: 'word' },
 
  // Katakana Loanwords & Countries
  { character: 'アニメ', kana: 'あにめ', romaji: 'anime', meaning: 'Anime', type: 'word' },
  { character: 'コンビニ', kana: 'こんびに', romaji: 'konbini', meaning: 'Convenience store', type: 'word' },
  { character: 'パソコン', kana: 'ぱそこん', romaji: 'pasokon', meaning: 'Personal computer', type: 'word' },
  { character: 'テレビ', kana: 'てれび', romaji: 'terebi', meaning: 'TV', type: 'word' },
  { character: 'カメラ', kana: 'かめら', romaji: 'kamera', meaning: 'Camera', type: 'word' },
  { character: 'ホテル', kana: 'ほてる', romaji: 'hoteru', meaning: 'Hotel', type: 'word' },
  { character: 'アメリカ', kana: 'アメリカ', romaji: 'amerika', meaning: 'Amerika Serikat', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'イギリス', kana: 'イギリス', romaji: 'igirisu', meaning: 'Inggris', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'インド', kana: 'インド', romaji: 'indo', meaning: 'India', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'インドネシア', kana: 'インドネシア', romaji: ['indoneshia', 'indonesia'], meaning: 'Indonesia', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'タイ', kana: 'タイ', romaji: 'tai', meaning: 'Thailan (Thailand)', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'ドイツ', kana: 'ドイツ', romaji: 'doitsu', meaning: 'Jerman', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'ブラジル', kana: 'ブラジル', romaji: 'burajiru', meaning: 'Brasil', type: 'word', lesson: 'Pelajaran 1' },
 
  // Common Adjectives & Verbs
  { character: '美味しい', kana: 'おいしい', romaji: 'oishii', meaning: 'Delicious', type: 'word' },
  { character: '食べる', kana: 'たべる', romaji: 'taberu', meaning: 'To eat', type: 'word' },
  { character: '飲む', kana: 'のむ', romaji: 'nomu', meaning: 'To drink', type: 'word' },
  { character: '可愛い', kana: 'かわいい', romaji: 'kawaii', meaning: 'Cute', type: 'word' },

  // --- NEW MINNA NO NIHONGO LESSON 1 WORDS ---
  { character: 'わたし', kana: 'わたし', romaji: 'watashi', meaning: 'saya', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'あなた', kana: 'あなた', romaji: 'anata', meaning: 'Anda', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'あの人', kana: 'あのひと', romaji: ['anohito', 'ano hito'], meaning: 'orang itu', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'あの人 (あの人)', kana: 'あのひと', romaji: ['anohito', 'ano hito'], meaning: 'orang itu', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'あのの方', kana: 'あのかた', romaji: ['anokata', 'ano kata'], meaning: 'beliau (bentuk sopan あの人)', type: 'word', lesson: 'Pelajaran 1' },
  { character: '～さん', kana: '～さん', romaji: ['san', '~san'], meaning: 'Sdr. ~, Bapak ~, Ibu ~', type: 'word', lesson: 'Pelajaran 1' },
  { character: '～ちゃん', kana: '～ちゃん', romaji: ['chan', '~chan'], meaning: 'akhiran pengganti ~san untuk anak-anak', type: 'word', lesson: 'Pelajaran 1' },
  { character: '～じん', kana: '～じん', romaji: ['jin', '~jin'], meaning: 'orang ~ (menyatakan warga negara)', type: 'word', lesson: 'Pelajaran 1' },
  { character: '教師', kana: 'きょうし', romaji: ['kyoushi', 'kyoshi'], meaning: 'guru, dosen (profesi)', type: 'word', lesson: 'Pelajaran 1' },
  { character: '会社員', kana: 'かいしゃいん', romaji: 'kaishain', meaning: 'karyawan perusahaan', type: 'word', lesson: 'Pelajaran 1' },
  { character: '社員', kana: 'しゃいん', romaji: 'shain', meaning: 'karyawan perusahaan (dipakai bersama nama perusahaannya)', type: 'word', lesson: 'Pelajaran 1' },
  { character: '銀行員', kana: 'ぎんこういん', romaji: ['ginkouin', 'ginkoin'], meaning: 'pegawai bank', type: 'word', lesson: 'Pelajaran 1' },
  { character: '医者', kana: 'いしゃ', romaji: 'isha', meaning: 'dokter', type: 'word', lesson: 'Pelajaran 1' },
  { character: '研究者', kana: 'けんきゅうしゃ', romaji: ['kenkyuusha', 'kenkyusha'], meaning: 'peneliti', type: 'word', lesson: 'Pelajaran 1' },
  { character: '大学', kana: 'だいがく', romaji: 'daigaku', meaning: 'universitas', type: 'word', lesson: 'Pelajaran 1' },
  { character: '病院', kana: 'びょういん', romaji: ['byouin', 'byoin'], meaning: 'rumah sakit', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'だれ', kana: 'だれ', romaji: 'dare', meaning: 'siapa', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'どなた', kana: 'どなた', romaji: 'donata', meaning: 'siapa (sopan)', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'ーさい', kana: 'ーさい', romaji: ['sai', '-sai'], meaning: '— tahun (umur)', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'なんさい', kana: 'なんさい', romaji: 'nansai', meaning: 'umur berapa', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'おいくつ', kana: 'おいくつ', romaji: 'oikutsu', meaning: 'umur berapa (sopan)', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'はじめまして。', kana: 'はじめまして', romaji: 'hajimemashite', meaning: 'Perkenalkan (salam pertama kali berkenalan)', type: 'word', lesson: 'Pelajaran 1' },
  { character: '～から来ました。', kana: '～からきました', romaji: ['kara kimashita', 'kara kimasita'], meaning: 'datang dari ~, berasal dari ~', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'どうぞよろしくおねがいします。', kana: 'どうぞよろしくおねがいします', romaji: ['douzo yoroshiku onegaishimasu', 'douzo yoroshiku onegaisimasu', 'yoroshiku'], meaning: 'Salam kenal', type: 'word', lesson: 'Pelajaran 1' },
  { character: '失礼ですが', kana: 'しつれいですが', romaji: ['shitsurei desu ga', 'siturei desu ga'], meaning: 'permisi, maaf... (bertanya hal pribadi seperti nama)', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'お名前は？', kana: 'おなまえは？', romaji: ['onamae wa', 'onamae wa?'], meaning: 'Siapa namanya?', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'こちらは ～さんです。', kana: 'こちらは ～さんです', romaji: ['kochira wa ~san desu', 'kotira wa ~san desu'], meaning: 'Ini Bapak ~ / Ini Sdr. ~', type: 'word', lesson: 'Pelajaran 1' },
  { character: '韓国', kana: 'かんこく', romaji: 'kankoku', meaning: 'Korea Selatan', type: 'word', lesson: 'Pelajaran 1' },
  { character: '中国', kana: 'ちゅうごく', romaji: ['chuugoku', 'chugoku'], meaning: 'Cina', type: 'word', lesson: 'Pelajaran 1' },
  { character: '日本', kana: 'にほん', romaji: ['nihon', 'nippon'], meaning: 'Jepang', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'IMC', kana: 'アイエムシー', romaji: 'imc', meaning: 'nama perusahaan fiksi', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'パワー電気', kana: 'パワーでんき', romaji: ['pawaa denki', 'pawa denki'], meaning: 'nama perusahaan fiksi', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'ブラジルエアー', kana: 'ブラジルエアー', romaji: ['burajiru eaa', 'burajiru ea'], meaning: 'nama maskapai fiksi', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'AKC', kana: 'エーケーシー', romaji: 'akc', meaning: 'nama organisasi fiksi', type: 'word', lesson: 'Pelajaran 1' },
  { character: '神戸病院', kana: 'こうべびょういん', romaji: ['koube byouin', 'kobe byoin'], meaning: 'nama rumah sakit fiksi', type: 'word', lesson: 'Pelajaran 1' },
  { character: 'さくら大学', kana: 'さくらだいがく', romaji: 'sakura daigaku', meaning: 'nama universitas fiksi', type: 'word', lesson: 'Pelajaran 1' },
  { character: '富士大学', kana: 'ふじだいがく', romaji: 'fuji daigaku', meaning: 'nama universitas fiksi', type: 'word', lesson: 'Pelajaran 1' }
];
