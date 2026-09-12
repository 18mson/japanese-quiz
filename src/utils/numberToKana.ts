// src/utils/numberToKana.ts
// Converts numbers to Japanese Kana reading with full irregular sound exceptions.
// Follows reference_lampiran.json / Minna no Nihongo rules.

const ONES: Record<number, string> = {
  0: 'ゼロ',
  1: 'いち',
  2: 'に',
  3: 'さん',
  4: 'よん',
  5: 'ご',
  6: 'ろく',
  7: 'なな',
  8: 'はち',
  9: 'きゅう',
};

const HUNDREDS: Record<number, string> = {
  1: 'ひゃく',
  2: 'にひゃく',
  3: 'さんびゃく', // irregular
  4: 'よんひゃく',
  5: 'ごひゃく',
  6: 'ろっぴゃく', // irregular
  7: 'ななひゃく',
  8: 'はっぴゃく', // irregular
  9: 'きゅうひゃく',
};

const THOUSANDS: Record<number, string> = {
  1: 'せん',
  2: 'にせん',
  3: 'さんぜん', // irregular
  4: 'よんせん',
  5: 'ごせん',
  6: 'ろくせん',
  7: 'ななせん',
  8: 'はっせん', // irregular
  9: 'きゅうせん',
};

/**
 * Converts numbers 0 - 99 to Kana
 */
function convertUnder100(num: number): string {
  if (num < 10) return ONES[num];
  const tens = Math.floor(num / 10);
  const ones = num % 10;
  const tensPrefix = tens === 1 ? 'じゅう' : `${ONES[tens]}じゅう`;
  if (ones === 0) return tensPrefix;
  return `${tensPrefix}${ONES[ones]}`;
}

/**
 * Converts numbers 0 - 999 to Kana
 */
function convertUnder1000(num: number): string {
  if (num < 100) return convertUnder100(num);
  const hundreds = Math.floor(num / 100);
  const rem = num % 100;
  const hundredsPrefix = HUNDREDS[hundreds];
  if (rem === 0) return hundredsPrefix;
  return `${hundredsPrefix}${convertUnder100(rem)}`;
}

/**
 * Converts numbers 0 - 9999 to Kana
 */
function convertUnder10000(num: number): string {
  if (num < 1000) return convertUnder1000(num);
  const thousands = Math.floor(num / 1000);
  const rem = num % 1000;
  const thousandsPrefix = THOUSANDS[thousands];
  if (rem === 0) return thousandsPrefix;
  return `${thousandsPrefix}${convertUnder1000(rem)}`;
}

/**
 * Converts numbers 0 - 99,999,999 (under 1億)
 */
function convertUnder100Million(num: number): string {
  if (num < 10000) return convertUnder10000(num);
  const manPart = Math.floor(num / 10000);
  const rem = num % 10000;
  // 10,000 in Japanese is ALWAYS 'いちまん', not 'まん'
  const manPrefix = manPart === 1 ? 'いちまん' : `${convertUnder10000(manPart)}まん`;
  if (rem === 0) return manPrefix;
  return `${manPrefix}${convertUnder10000(rem)}`;
}

/**
 * Primary number to Kana converter.
 * Canonical output matches reference_lampiran.json standard units 100%.
 */
export function numberToKana(num: number): string {
  if (!Number.isFinite(num) || num < 0) {
    throw new Error(`numberToKana only supports non-negative integers, received: ${num}`);
  }
  const intNum = Math.floor(num);
  if (intNum === 0) return 'ゼロ';

  if (intNum < 100000000) {
    return convertUnder100Million(intNum);
  }

  // 100,000,000+ (億 - おく)
  const okuPart = Math.floor(intNum / 100000000);
  const rem = intNum % 100000000;
  // 1億 is ALWAYS 'いちおく'
  const okuPrefix = okuPart === 1 ? 'いちおく' : `${convertUnder10000(okuPart)}おく`;
  if (rem === 0) return okuPrefix;
  return `${okuPrefix}${convertUnder100Million(rem)}`;
}

/**
 * Generates all accepted Kana readings for a given number.
 * For example:
 * 0 -> ['ゼロ', 'ぜろ', 'れい']
 * 4 -> ['よん', 'し']
 * 7 -> ['なな', 'しち']
 * 9 -> ['きゅう', 'く']
 * 14 -> ['じゅうよん', 'じゅうし']
 * 17 -> ['じゅうなな', 'じゅうしち']
 * 19 -> ['じゅうきゅう', 'じゅうく']
 * 70 -> ['ななじゅう', 'しちじゅう']
 */
export function getAcceptedKanaReadings(num: number): string[] {
  const canonical = numberToKana(num);
  const accepted = new Set<string>([canonical]);

  if (num === 0) {
    accepted.add('ぜろ');
    accepted.add('れい');
    return Array.from(accepted);
  }

  // Add variants for last digit 4, 7, 9 in 1-99
  const lastDigit = num % 10;
  if (lastDigit === 4) {
    accepted.add(canonical.replace(/よん$/, 'し'));
  } else if (lastDigit === 7) {
    accepted.add(canonical.replace(/なな$/, 'しち'));
  } else if (lastDigit === 9) {
    accepted.add(canonical.replace(/きゅう$/, 'く'));
  }

  // Add variants for 70 (ななじゅう -> しちじゅう)
  if (Math.floor(num / 10) % 10 === 7) {
    accepted.add(canonical.replace(/ななじゅう/g, 'しちじゅう'));
  }

  // In case 0 was written as ぜろ
  accepted.add(canonical.replace(/ゼロ/g, 'ぜろ'));

  return Array.from(accepted);
}
