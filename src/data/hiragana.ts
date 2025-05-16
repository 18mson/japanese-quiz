export interface HiraganaCharacter {
  character: string;
  romaji: string;
  type: 'basic' | 'dakuten' | 'combination';
}

export const hiraganaData: HiraganaCharacter[] = [
  // Basic Hiragana
  { character: 'あ', romaji: 'a', type: 'basic' },
  { character: 'い', romaji: 'i', type: 'basic' },
  { character: 'う', romaji: 'u', type: 'basic' },
  { character: 'え', romaji: 'e', type: 'basic' },
  { character: 'お', romaji: 'o', type: 'basic' },
  
  { character: 'か', romaji: 'ka', type: 'basic' },
  { character: 'き', romaji: 'ki', type: 'basic' },
  { character: 'く', romaji: 'ku', type: 'basic' },
  { character: 'け', romaji: 'ke', type: 'basic' },
  { character: 'こ', romaji: 'ko', type: 'basic' },
  
  { character: 'さ', romaji: 'sa', type: 'basic' },
  { character: 'し', romaji: 'shi', type: 'basic' },
  { character: 'す', romaji: 'su', type: 'basic' },
  { character: 'せ', romaji: 'se', type: 'basic' },
  { character: 'そ', romaji: 'so', type: 'basic' },
  
  { character: 'た', romaji: 'ta', type: 'basic' },
  { character: 'ち', romaji: 'chi', type: 'basic' },
  { character: 'つ', romaji: 'tsu', type: 'basic' },
  { character: 'て', romaji: 'te', type: 'basic' },
  { character: 'と', romaji: 'to', type: 'basic' },
  
  { character: 'な', romaji: 'na', type: 'basic' },
  { character: 'に', romaji: 'ni', type: 'basic' },
  { character: 'ぬ', romaji: 'nu', type: 'basic' },
  { character: 'ね', romaji: 'ne', type: 'basic' },
  { character: 'の', romaji: 'no', type: 'basic' },
  
  { character: 'は', romaji: 'ha', type: 'basic' },
  { character: 'ひ', romaji: 'hi', type: 'basic' },
  { character: 'ふ', romaji: 'fu', type: 'basic' },
  { character: 'へ', romaji: 'he', type: 'basic' },
  { character: 'ほ', romaji: 'ho', type: 'basic' },
  
  { character: 'ま', romaji: 'ma', type: 'basic' },
  { character: 'み', romaji: 'mi', type: 'basic' },
  { character: 'む', romaji: 'mu', type: 'basic' },
  { character: 'め', romaji: 'me', type: 'basic' },
  { character: 'も', romaji: 'mo', type: 'basic' },
  
  { character: 'や', romaji: 'ya', type: 'basic' },
  { character: 'ゆ', romaji: 'yu', type: 'basic' },
  { character: 'よ', romaji: 'yo', type: 'basic' },
  
  { character: 'ら', romaji: 'ra', type: 'basic' },
  { character: 'り', romaji: 'ri', type: 'basic' },
  { character: 'る', romaji: 'ru', type: 'basic' },
  { character: 'れ', romaji: 're', type: 'basic' },
  { character: 'ろ', romaji: 'ro', type: 'basic' },
  
  { character: 'わ', romaji: 'wa', type: 'basic' },
  { character: 'を', romaji: 'wo', type: 'basic' },
  { character: 'ん', romaji: 'n', type: 'basic' },
  
  // Dakuten and Handakuten
  { character: 'が', romaji: 'ga', type: 'dakuten' },
  { character: 'ぎ', romaji: 'gi', type: 'dakuten' },
  { character: 'ぐ', romaji: 'gu', type: 'dakuten' },
  { character: 'げ', romaji: 'ge', type: 'dakuten' },
  { character: 'ご', romaji: 'go', type: 'dakuten' },
  
  { character: 'ざ', romaji: 'za', type: 'dakuten' },
  { character: 'じ', romaji: 'ji', type: 'dakuten' },
  { character: 'ず', romaji: 'zu', type: 'dakuten' },
  { character: 'ぜ', romaji: 'ze', type: 'dakuten' },
  { character: 'ぞ', romaji: 'zo', type: 'dakuten' },
  
  { character: 'だ', romaji: 'da', type: 'dakuten' },
  { character: 'ぢ', romaji: 'ji', type: 'dakuten' },
  { character: 'づ', romaji: 'zu', type: 'dakuten' },
  { character: 'で', romaji: 'de', type: 'dakuten' },
  { character: 'ど', romaji: 'do', type: 'dakuten' },
  
  { character: 'ば', romaji: 'ba', type: 'dakuten' },
  { character: 'び', romaji: 'bi', type: 'dakuten' },
  { character: 'ぶ', romaji: 'bu', type: 'dakuten' },
  { character: 'べ', romaji: 'be', type: 'dakuten' },
  { character: 'ぼ', romaji: 'bo', type: 'dakuten' },
  
  { character: 'ぱ', romaji: 'pa', type: 'dakuten' },
  { character: 'ぴ', romaji: 'pi', type: 'dakuten' },
  { character: 'ぷ', romaji: 'pu', type: 'dakuten' },
  { character: 'ぺ', romaji: 'pe', type: 'dakuten' },
  { character: 'ぽ', romaji: 'po', type: 'dakuten' },
  
  // Combination Hiragana
  { character: 'きゃ', romaji: 'kya', type: 'combination' },
  { character: 'きゅ', romaji: 'kyu', type: 'combination' },
  { character: 'きょ', romaji: 'kyo', type: 'combination' },
  
  { character: 'しゃ', romaji: 'sha', type: 'combination' },
  { character: 'しゅ', romaji: 'shu', type: 'combination' },
  { character: 'しょ', romaji: 'sho', type: 'combination' },
  
  { character: 'ちゃ', romaji: 'cha', type: 'combination' },
  { character: 'ちゅ', romaji: 'chu', type: 'combination' },
  { character: 'ちょ', romaji: 'cho', type: 'combination' },
  
  { character: 'にゃ', romaji: 'nya', type: 'combination' },
  { character: 'にゅ', romaji: 'nyu', type: 'combination' },
  { character: 'にょ', romaji: 'nyo', type: 'combination' },
  
  { character: 'ひゃ', romaji: 'hya', type: 'combination' },
  { character: 'ひゅ', romaji: 'hyu', type: 'combination' },
  { character: 'ひょ', romaji: 'hyo', type: 'combination' },
  
  { character: 'みゃ', romaji: 'mya', type: 'combination' },
  { character: 'みゅ', romaji: 'myu', type: 'combination' },
  { character: 'みょ', romaji: 'myo', type: 'combination' },
  
  { character: 'りゃ', romaji: 'rya', type: 'combination' },
  { character: 'りゅ', romaji: 'ryu', type: 'combination' },
  { character: 'りょ', romaji: 'ryo', type: 'combination' },
  
  { character: 'ぎゃ', romaji: 'gya', type: 'combination' },
  { character: 'ぎゅ', romaji: 'gyu', type: 'combination' },
  { character: 'ぎょ', romaji: 'gyo', type: 'combination' },
  
  { character: 'じゃ', romaji: 'ja', type: 'combination' },
  { character: 'じゅ', romaji: 'ju', type: 'combination' },
  { character: 'じょ', romaji: 'jo', type: 'combination' },
  
  { character: 'びゃ', romaji: 'bya', type: 'combination' },
  { character: 'びゅ', romaji: 'byu', type: 'combination' },
  { character: 'びょ', romaji: 'byo', type: 'combination' },
  
  { character: 'ぴゃ', romaji: 'pya', type: 'combination' },
  { character: 'ぴゅ', romaji: 'pyu', type: 'combination' },
  { character: 'ぴょ', romaji: 'pyo', type: 'combination' }
];