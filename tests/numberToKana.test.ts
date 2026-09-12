// tests/numberToKana.test.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { numberToKana, getAcceptedKanaReadings } from '../src/utils/numberToKana';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load verified reference source data
const rawData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../scripts/reference_source_data.json'), 'utf8')
);

const { units, note_irregular } = rawData.reference_lampiran.kata_bilangan;

console.log('=== TEST 1: Memvalidasi numberToKana terhadap SEMUA kata_bilangan.units ===');
let passCount = 0;
let failCount = 0;

for (const unit of units) {
  const generatedKana = numberToKana(unit.value);
  const acceptedReadings = unit.japanese.split('、').map((s: string) => s.trim());
  const acceptedGenerator = getAcceptedKanaReadings(unit.value);

  // Check that generatedKana matches at least one of the official reference readings
  const isMatch = acceptedReadings.includes(generatedKana);

  if (!isMatch) {
    console.error(`❌ FAIL for ${unit.value}: expected one of [${acceptedReadings.join(', ')}], got '${generatedKana}'`);
    failCount++;
  } else {
    // Also check generator acceptance
    for (const reading of acceptedReadings) {
      if (!acceptedGenerator.includes(reading)) {
        console.error(`⚠️ Generator missing alternate reading '${reading}' for ${unit.value}`);
      }
    }
    passCount++;
  }
}

console.log(`Units validation result: ${passCount} / ${units.length} passed!`);

console.log('\n=== TEST 2: Memvalidasi note_irregular (Pengecualian Bunyi) ===');
const irregularChecks = [
  { val: 300, expected: 'さんびゃく', desc: '300 = さんびゃく (bukan さんひゃく)' },
  { val: 600, expected: 'ろっぴゃく', desc: '600 = ろっぴゃく' },
  { val: 800, expected: 'はっぴゃく', desc: '800 = はっぴゃく' },
  { val: 3000, expected: 'さんぜん', desc: '3000 = さんぜん (bukan さんせん)' },
  { val: 8000, expected: 'はっせん', desc: '8000 = はっせん' },
];

for (const chk of irregularChecks) {
  const res = numberToKana(chk.val);
  if (res === chk.expected) {
    console.log(`✅ PASS: ${chk.desc} -> ${res}`);
  } else {
    console.error(`❌ FAIL: ${chk.desc} -> got ${res}, expected ${chk.expected}`);
    failCount++;
  }
}

console.log('\n=== TEST 3: Memvalidasi Angka Kombinasi Acak ===');
const combinationChecks = [
  { val: 47, expected: 'よんじゅうなな' },
  { val: 347, expected: 'さんびゃくよんじゅうなな' },
  { val: 8888, expected: 'はっせんはっぴゃくはちじゅうはち' },
  { val: 12345, expected: 'いちまんにせんさんびゃくよんじゅうご' },
  { val: 99999, expected: 'きゅうまんきゅうせんきゅうひゃくきゅうじゅうきゅう' },
  { val: 100000000, expected: 'いちおく' },
];

for (const chk of combinationChecks) {
  const res = numberToKana(chk.val);
  if (res === chk.expected) {
    console.log(`✅ PASS: ${chk.val} -> ${res}`);
  } else {
    console.error(`❌ FAIL: ${chk.val} -> got ${res}, expected ${chk.expected}`);
    failCount++;
  }
}

if (failCount === 0) {
  console.log('\n🎉 ALL TESTS PASSED! 100% MATCH DENGAN REFERENCE LAMPIRAN DATA!');
  process.exit(0);
} else {
  console.error(`\n💥 FAILED with ${failCount} errors.`);
  process.exit(1);
}
