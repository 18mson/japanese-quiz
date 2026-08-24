import fs from 'fs';
import { rawDataset } from '/Users/a2238/.gemini/antigravity-ide/brain/594c6a75-9ed6-4474-9b6f-3129b104b097/scratch/dataset.mjs';

// Base common expressions & words that should also be preserved
const baseAdditionalWords = [
  { kanji: 'こんにちは', kana: 'こんにちは', romaji: ['konnichiwa'], meaning: 'Halo / Selamat siang', category: 'Ungkapan', lesson: 'Pelajaran 1' },
  { kanji: 'ありがとう', kana: 'ありがとう', romaji: ['arigatou', 'arigato'], meaning: 'Terima kasih', category: 'Ungkapan', lesson: 'Pelajaran 1' },
  { kanji: 'すみません', kana: 'すみません', romaji: ['sumimasen'], meaning: 'Permisi / Maaf', category: 'Ungkapan', lesson: 'Pelajaran 1' },
  { kanji: 'はい', kana: 'はい', romaji: ['hai'], meaning: 'Ya', category: 'Kata Seru', lesson: 'Pelajaran 1' },
  { kanji: 'いいえ', kana: 'いいえ', romaji: ['iie'], meaning: 'Tidak', category: 'Kata Seru', lesson: 'Pelajaran 1' },
  { kanji: 'さようなら', kana: 'さようなら', romaji: ['sayounara', 'sayonara'], meaning: 'Selamat tinggal', category: 'Ungkapan', lesson: 'Pelajaran 1' },
  { kanji: 'わたし', kana: 'わたし', romaji: ['watashi'], meaning: 'saya', category: 'Kata Ganti', lesson: 'Pelajaran 1' },
  { kanji: 'あなた', kana: 'あなた', romaji: ['anata'], meaning: 'Anda / kamu', category: 'Kata Ganti', lesson: 'Pelajaran 1' },
  { kanji: 'あの人', kana: 'あのひと', romaji: ['anohito', 'ano hito'], meaning: 'orang itu', category: 'Kata Ganti', lesson: 'Pelajaran 1' },
  { kanji: 'あの方', kana: 'あのかた', romaji: ['anokata', 'ano kata'], meaning: 'beliau (sopan)', category: 'Kata Ganti', lesson: 'Pelajaran 1' },
  { kanji: '～さん', kana: '～さん', romaji: ['san', '~san'], meaning: 'Sdr. ~, Bapak ~, Ibu ~', category: 'Akhiran', lesson: 'Pelajaran 1' },
  { kanji: '～ちゃん', kana: '～ちゃん', romaji: ['chan', '~chan'], meaning: 'akhiran panggilan anak', category: 'Akhiran', lesson: 'Pelajaran 1' },
  { kanji: '～人', kana: '～じん', romaji: ['jin', '~jin'], meaning: 'orang ~ (warga negara)', category: 'Akhiran', lesson: 'Pelajaran 1' },
  { kanji: 'だれ', kana: 'だれ', romaji: ['dare'], meaning: 'siapa', category: 'Kata Tanya', lesson: 'Pelajaran 1' },
  { kanji: 'どなた', kana: 'どなた', romaji: ['donata'], meaning: 'siapa (sopan)', category: 'Kata Tanya', lesson: 'Pelajaran 1' },
  { kanji: 'おいくつ', kana: 'おいくつ', romaji: ['oikutsu'], meaning: 'umur berapa (sopan)', category: 'Kata Tanya', lesson: 'Pelajaran 1' },
  { kanji: 'はじめまして', kana: 'はじめまして', romaji: ['hajimemashite'], meaning: 'Perkenalkan (salam kenal)', category: 'Ungkapan', lesson: 'Pelajaran 1' },
  { kanji: '～から来ました', kana: '～からきました', romaji: ['kara kimashita', 'kara kimasita'], meaning: 'datang dari ~, berasal dari ~', category: 'Ungkapan', lesson: 'Pelajaran 1' },
  { kanji: 'どうぞよろしく', kana: 'どうぞよろしく', romaji: ['douzo yoroshiku', 'dozo yoroshiku'], meaning: 'Salam kenal / Mohon bantuannya', category: 'Ungkapan', lesson: 'Pelajaran 1' },
  { kanji: '失礼ですが', kana: 'しつれいですが', romaji: ['shitsurei desu ga', 'sitsurei desu ga'], meaning: 'permisi, maaf...', category: 'Ungkapan', lesson: 'Pelajaran 1' },
  { kanji: 'お名前は？', kana: 'おなまえは？', romaji: ['onamae wa', 'onamae wa?'], meaning: 'Siapa namanya?', category: 'Ungkapan', lesson: 'Pelajaran 1' },
  { kanji: 'アメリカ', kana: 'アメリカ', romaji: ['amerika'], meaning: 'Amerika Serikat', category: 'Kata Benda', lesson: 'Pelajaran 1' },
  { kanji: 'イギリス', kana: 'イギリス', romaji: ['igirisu'], meaning: 'Inggris', category: 'Kata Benda', lesson: 'Pelajaran 1' },
  { kanji: 'インド', kana: 'インド', romaji: ['indo'], meaning: 'India', category: 'Kata Benda', lesson: 'Pelajaran 1' },
  { kanji: 'インドネシア', kana: 'インドネシア', romaji: ['indoneshia', 'indonesia'], meaning: 'Indonesia', category: 'Kata Benda', lesson: 'Pelajaran 1' },
  { kanji: 'タイ', kana: 'タイ', romaji: ['tai'], meaning: 'Thailand', category: 'Kata Benda', lesson: 'Pelajaran 1' },
  { kanji: 'ドイツ', kana: 'ドイツ', romaji: ['doitsu'], meaning: 'Jerman', category: 'Kata Benda', lesson: 'Pelajaran 1' },
  { kanji: 'ブラジル', kana: 'ブラジル', romaji: ['burajiru'], meaning: 'Brasil', category: 'Kata Benda', lesson: 'Pelajaran 1' },
  { kanji: 'これ', kana: 'これ', romaji: ['kore'], meaning: 'ini (dekat pembicara)', category: 'Kata Ganti', lesson: 'Pelajaran 2' },
  { kanji: 'それ', kana: 'それ', romaji: ['sore'], meaning: 'itu (dekat lawan bicara)', category: 'Kata Ganti', lesson: 'Pelajaran 2' },
  { kanji: 'あれ', kana: 'あれ', romaji: ['are'], meaning: 'itu (jauh dari keduanya)', category: 'Kata Ganti', lesson: 'Pelajaran 2' },
  { kanji: 'この', kana: 'この', romaji: ['kono'], meaning: '~ ini', category: 'Kata Ganti', lesson: 'Pelajaran 2' },
  { kanji: 'その', kana: 'その', romaji: ['sono'], meaning: '~ itu', category: 'Kata Ganti', lesson: 'Pelajaran 2' },
  { kanji: 'あの', kana: 'あの', romaji: ['ano'], meaning: '~ itu (jauh)', category: 'Kata Ganti', lesson: 'Pelajaran 2' },
  { kanji: 'ノート', kana: 'ノート', romaji: ['nooto', 'noto'], meaning: 'buku tulis, catatan', category: 'Kata Benda', lesson: 'Pelajaran 2' },
  { kanji: 'カード', kana: 'カード', romaji: ['kaado', 'kado'], meaning: 'kartu', category: 'Kata Benda', lesson: 'Pelajaran 2' },
  { kanji: 'ボールペン', kana: 'ボールペン', romaji: ['boorupen', 'borupen'], meaning: 'bolpoin', category: 'Kata Benda', lesson: 'Pelajaran 2' },
  { kanji: 'シャープペンシル', kana: 'シャープペンシル', romaji: ['shaapupenshiru', 'shapupenshiru'], meaning: 'pensil mekanik', category: 'Kata Benda', lesson: 'Pelajaran 2' },
  { kanji: 'かぎ', kana: 'かぎ', romaji: ['kagi'], meaning: 'kunci', category: 'Kata Benda', lesson: 'Pelajaran 2' },
  { kanji: 'かばん', kana: 'かばん', romaji: ['kaban'], meaning: 'tas', category: 'Kata Benda', lesson: 'Pelajaran 2' },
  { kanji: 'テレビ', kana: 'テレビ', romaji: ['terebi'], meaning: 'televisi', category: 'Kata Benda', lesson: 'Pelajaran 2' },
  { kanji: 'ラジオ', kana: 'ラジオ', romaji: ['rajio'], meaning: 'radio', category: 'Kata Benda', lesson: 'Pelajaran 2' },
  { kanji: 'カメラ', kana: 'カメラ', romaji: ['kamera'], meaning: 'kamera', category: 'Kata Benda', lesson: 'Pelajaran 2' },
  { kanji: 'コンピューター', kana: 'コンピューター', romaji: ['konpyuutaa', 'konpyuta'], meaning: 'komputer, PC', category: 'Kata Benda', lesson: 'Pelajaran 2' },
  { kanji: 'いす', kana: 'いす', romaji: ['isu'], meaning: 'kursi', category: 'Kata Benda', lesson: 'Pelajaran 2' },
  { kanji: 'コーヒー', kana: 'コーヒー', romaji: ['koohii', 'kohi'], meaning: 'kopi', category: 'Kata Benda', lesson: 'Pelajaran 2' },
  { kanji: 'お土産', kana: 'おみやげ', romaji: ['omiyage'], meaning: 'oleh-oleh', category: 'Kata Benda', lesson: 'Pelajaran 2' },
  { kanji: '～語', kana: '～ご', romaji: ['go', '~go'], meaning: 'bahasa ~', category: 'Akhiran', lesson: 'Pelajaran 2' },
  { kanji: 'そう', kana: 'そう', romaji: ['sou', 'so'], meaning: 'begitu', category: 'Kata Keterangan', lesson: 'Pelajaran 2' },
  { kanji: '違います', kana: 'ちがいます', romaji: ['chigaimasu', 'tigaimasu'], meaning: 'Bukan / Salah', category: 'Kata Kerja', lesson: 'Pelajaran 2' },
  { kanji: 'そうですか', kana: 'そうですか', romaji: ['sou desu ka', 'soudesuka'], meaning: 'O, begitu / Begitu ya', category: 'Ungkapan', lesson: 'Pelajaran 2' }
];

async function main() {
  const mergedMap = new Map();

  for (const item of [...baseAdditionalWords, ...rawDataset]) {
    const key = `${item.kanji}_${item.kana}_${item.lesson}`;
    mergedMap.set(key, item);
  }

  const allItems = Array.from(mergedMap.values());
  console.log(`Total unique items: ${allItems.length}`);

  // 1. Generate src/data/words.ts
  const tsContent = `// src/data/words.ts
// Japanese Vocabulary Dataset (Minna no Nihongo Pelajaran 1 - 25)

export interface JapaneseWord {
  character: string;
  romaji: string | string[];
  kana: string;
  meaning: string;
  type: 'word';
  lesson?: string;
  category_word?: string;
}

export const wordsData: JapaneseWord[] = [
${allItems.map(item => {
  const romajiStr = Array.isArray(item.romaji)
    ? `[${item.romaji.map(r => `'${r}'`).join(', ')}]`
    : `'${item.romaji}'`;
  return `  { character: '${item.kanji}', kana: '${item.kana}', romaji: ${romajiStr}, meaning: '${item.meaning.replace(/'/g, "\\'")}', type: 'word', lesson: '${item.lesson}', category_word: '${item.category}' },`;
}).join('\n')}
];
`;

  fs.writeFileSync('src/data/words.ts', tsContent, 'utf-8');
  console.log('Saved src/data/words.ts successfully!');

  // 2. Generate SQL file
  let sql = `-- Clear existing words in quiz_items
DELETE FROM public.quiz_items WHERE category = 'words';

-- Insert all words
INSERT INTO public.quiz_items (category, "character", romaji, kana, meaning, type, has_kanji, lesson) VALUES
`;

  const valuesArr = allItems.map(item => {
    const hasKanji = /[\u4e00-\u9faf]/.test(item.kanji);
    const romajisArray = Array.isArray(item.romaji) ? item.romaji : [item.romaji];
    const romajiSql = `ARRAY[${romajisArray.map(r => `'${r.replace(/'/g, "''")}'`).join(', ')}]`;
    const charSql = `'${item.kanji.replace(/'/g, "''")}'`;
    const kanaSql = `'${item.kana.replace(/'/g, "''")}'`;
    const meaningSql = `'${item.meaning.replace(/'/g, "''")}'`;
    const lessonSql = `'${item.lesson.replace(/'/g, "''")}'`;
    return `('words', ${charSql}, ${romajiSql}, ${kanaSql}, ${meaningSql}, 'word', ${hasKanji}, ${lessonSql})`;
  });

  sql += valuesArr.join(',\n') + ';\n';

  fs.writeFileSync('scripts/insert_words.sql', sql, 'utf-8');
  console.log(`Saved scripts/insert_words.sql with ${allItems.length} records!`);
}

main().catch(console.error);
