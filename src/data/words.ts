export interface JapaneseWord {
  character: string;
  romaji: string | string[];
  kana: string;
  meaning: string;
  type: 'word';
}

export const wordsData: JapaneseWord[] = [
  // Greetings & Core Expressions
  { character: 'こんにちは', kana: 'こんにちは', romaji: 'konnichiwa', meaning: 'Hello / Good afternoon', type: 'word' },
  { character: 'ありがとう', kana: 'ありがとう', romaji: ['arigatou', 'arigato'], meaning: 'Thank you', type: 'word' },
  { character: 'すみません', kana: 'すみません', romaji: 'sumimasen', meaning: 'Excuse me / Sorry', type: 'word' },
  { character: 'はい', kana: 'はい', romaji: 'hai', meaning: 'Yes', type: 'word' },
  { character: 'いいえ', kana: 'いいえ', romaji: 'iie', meaning: 'No', type: 'word' },
  { character: 'さようなら', kana: 'さようなら', romaji: ['sayounara', 'sayonara'], meaning: 'Goodbye', type: 'word' },

  // Common Nouns
  { character: '日本語', kana: 'にほんご', romaji: 'nihongo', meaning: 'Japanese language', type: 'word' },
  { character: '友達', kana: 'ともだち', romaji: 'tomodachi', meaning: 'Friend', type: 'word' },
  { character: '先生', kana: 'せんせい', romaji: 'sensei', meaning: 'Teacher', type: 'word' },
  { character: '学生', kana: 'がくせい', romaji: 'gakusei', meaning: 'Student', type: 'word' },
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

  // Katakana Loanwords
  { character: 'アニメ', kana: 'あにめ', romaji: 'anime', meaning: 'Anime', type: 'word' },
  { character: 'コンビニ', kana: 'こんびに', romaji: 'konbini', meaning: 'Convenience store', type: 'word' },
  { character: 'パソコン', kana: 'ぱそこん', romaji: 'pasokon', meaning: 'Personal computer', type: 'word' },
  { character: 'テレビ', kana: 'てれび', romaji: 'terebi', meaning: 'TV', type: 'word' },
  { character: 'カメラ', kana: 'かめら', romaji: 'kamera', meaning: 'Camera', type: 'word' },
  { character: 'ホテル', kana: 'ほてる', romaji: 'hoteru', meaning: 'Hotel', type: 'word' },

  // Common Adjectives & Verbs
  { character: '美味しい', kana: 'おいしい', romaji: 'oishii', meaning: 'Delicious', type: 'word' },
  { character: '食べる', kana: 'たべる', romaji: 'taberu', meaning: 'To eat', type: 'word' },
  { character: '飲む', kana: 'のむ', romaji: 'nomu', meaning: 'To drink', type: 'word' },
  { character: '可愛い', kana: 'かわいい', romaji: 'kawaii', meaning: 'Cute', type: 'word' }
];
