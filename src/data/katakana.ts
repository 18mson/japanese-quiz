export interface KatakanaCharacter {
  character: string;
  romaji: string;
  type: 'basic' | 'dakuten' | 'combination';
}

export const katakanaData: KatakanaCharacter[] = [
  // Basic Katakana
  { character: 'ア', romaji: 'a', type: 'basic' },
  { character: 'イ', romaji: 'i', type: 'basic' },
  { character: 'ウ', romaji: 'u', type: 'basic' },
  { character: 'エ', romaji: 'e', type: 'basic' },
  { character: 'オ', romaji: 'o', type: 'basic' },
  
  { character: 'カ', romaji: 'ka', type: 'basic' },
  { character: 'キ', romaji: 'ki', type: 'basic' },
  { character: 'ク', romaji: 'ku', type: 'basic' },
  { character: 'ケ', romaji: 'ke', type: 'basic' },
  { character: 'コ', romaji: 'ko', type: 'basic' },
  
  { character: 'サ', romaji: 'sa', type: 'basic' },
  { character: 'シ', romaji: 'shi', type: 'basic' },
  { character: 'ス', romaji: 'su', type: 'basic' },
  { character: 'セ', romaji: 'se', type: 'basic' },
  { character: 'ソ', romaji: 'so', type: 'basic' },
  
  { character: 'タ', romaji: 'ta', type: 'basic' },
  { character: 'チ', romaji: 'chi', type: 'basic' },
  { character: 'ツ', romaji: 'tsu', type: 'basic' },
  { character: 'テ', romaji: 'te', type: 'basic' },
  { character: 'ト', romaji: 'to', type: 'basic' },
  
  { character: 'ナ', romaji: 'na', type: 'basic' },
  { character: 'ニ', romaji: 'ni', type: 'basic' },
  { character: 'ヌ', romaji: 'nu', type: 'basic' },
  { character: 'ネ', romaji: 'ne', type: 'basic' },
  { character: 'ノ', romaji: 'no', type: 'basic' },
  
  { character: 'ハ', romaji: 'ha', type: 'basic' },
  { character: 'ヒ', romaji: 'hi', type: 'basic' },
  { character: 'フ', romaji: 'fu', type: 'basic' },
  { character: 'ヘ', romaji: 'he', type: 'basic' },
  { character: 'ホ', romaji: 'ho', type: 'basic' },
  
  { character: 'マ', romaji: 'ma', type: 'basic' },
  { character: 'ミ', romaji: 'mi', type: 'basic' },
  { character: 'ム', romaji: 'mu', type: 'basic' },
  { character: 'メ', romaji: 'me', type: 'basic' },
  { character: 'モ', romaji: 'mo', type: 'basic' },
  
  { character: 'ヤ', romaji: 'ya', type: 'basic' },
  { character: 'ユ', romaji: 'yu', type: 'basic' },
  { character: 'ヨ', romaji: 'yo', type: 'basic' },
  
  { character: 'ラ', romaji: 'ra', type: 'basic' },
  { character: 'リ', romaji: 'ri', type: 'basic' },
  { character: 'ル', romaji: 'ru', type: 'basic' },
  { character: 'レ', romaji: 're', type: 'basic' },
  { character: 'ロ', romaji: 'ro', type: 'basic' },
  
  { character: 'ワ', romaji: 'wa', type: 'basic' },
  { character: 'ヲ', romaji: 'wo', type: 'basic' },
  { character: 'ン', romaji: 'n', type: 'basic' },
  
  // Dakuten and Handakuten
  { character: 'ガ', romaji: 'ga', type: 'dakuten' },
  { character: 'ギ', romaji: 'gi', type: 'dakuten' },
  { character: 'グ', romaji: 'gu', type: 'dakuten' },
  { character: 'ゲ', romaji: 'ge', type: 'dakuten' },
  { character: 'ゴ', romaji: 'go', type: 'dakuten' },
  
  { character: 'ザ', romaji: 'za', type: 'dakuten' },
  { character: 'ジ', romaji: 'ji', type: 'dakuten' },
  { character: 'ズ', romaji: 'zu', type: 'dakuten' },
  { character: 'ゼ', romaji: 'ze', type: 'dakuten' },
  { character: 'ゾ', romaji: 'zo', type: 'dakuten' },
  
  { character: 'ダ', romaji: 'da', type: 'dakuten' },
  { character: 'ヂ', romaji: 'ji', type: 'dakuten' },
  { character: 'ヅ', romaji: 'zu', type: 'dakuten' },
  { character: 'デ', romaji: 'de', type: 'dakuten' },
  { character: 'ド', romaji: 'do', type: 'dakuten' },
  
  { character: 'バ', romaji: 'ba', type: 'dakuten' },
  { character: 'ビ', romaji: 'bi', type: 'dakuten' },
  { character: 'ブ', romaji: 'bu', type: 'dakuten' },
  { character: 'ベ', romaji: 'be', type: 'dakuten' },
  { character: 'ボ', romaji: 'bo', type: 'dakuten' },
  
  { character: 'パ', romaji: 'pa', type: 'dakuten' },
  { character: 'ピ', romaji: 'pi', type: 'dakuten' },
  { character: 'プ', romaji: 'pu', type: 'dakuten' },
  { character: 'ペ', romaji: 'pe', type: 'dakuten' },
  { character: 'ポ', romaji: 'po', type: 'dakuten' },

  // Combination Katakana
  { character: 'キャ', romaji: 'kya', type: 'combination' },
  { character: 'キュ', romaji: 'kyu', type: 'combination' },
  { character: 'キョ', romaji: 'kyo', type: 'combination' },
  
  { character: 'シャ', romaji: 'sha', type: 'combination' },
  { character: 'シュ', romaji: 'shu', type: 'combination' },
  { character: 'ショ', romaji: 'sho', type: 'combination' },
  
  { character: 'チャ', romaji: 'cha', type: 'combination' },
  { character: 'チュ', romaji: 'chu', type: 'combination' },
  { character: 'チョ', romaji: 'cho', type: 'combination' },
  
  { character: 'ニャ', romaji: 'nya', type: 'combination' },
  { character: 'ニュ', romaji: 'nyu', type: 'combination' },
  { character: 'ニョ', romaji: 'nyo', type: 'combination' },
  
  { character: 'ヒャ', romaji: 'hya', type: 'combination' },
  { character: 'ヒュ', romaji: 'hyu', type: 'combination' },
  { character: 'ヒョ', romaji: 'hyo', type: 'combination' },
  
  { character: 'ミャ', romaji: 'mya', type: 'combination' },
  { character: 'ミュ', romaji: 'myu', type: 'combination' },
  { character: 'ミョ', romaji: 'myo', type: 'combination' },
  
  { character: 'リャ', romaji: 'rya', type: 'combination' },
  { character: 'リュ', romaji: 'ryu', type: 'combination' },
  { character: 'リョ', romaji: 'ryo', type: 'combination' },
  
  { character: 'ギャ', romaji: 'gya', type: 'combination' },
  { character: 'ギュ', romaji: 'gyu', type: 'combination' },
  { character: 'ギョ', romaji: 'gyo', type: 'combination' },
  
  { character: 'ジャ', romaji: 'ja', type: 'combination' },
  { character: 'ジュ', romaji: 'ju', type: 'combination' },
  { character: 'ジョ', romaji: 'jo', type: 'combination' },
  
  { character: 'ビャ', romaji: 'bya', type: 'combination' },
  { character: 'ビュ', romaji: 'byu', type: 'combination' },
  { character: 'ビョ', romaji: 'byo', type: 'combination' },
  
  { character: 'ピャ', romaji: 'pya', type: 'combination' },
  { character: 'ピュ', romaji: 'pyu', type: 'combination' },
  { character: 'ピョ', romaji: 'pyo', type: 'combination' }
];