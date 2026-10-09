import { fileURLToPath } from 'node:url';
import {
  initTokenizer,
  toHiragana,
  stripHonorific,
  hasKanji,
  kanjiToDigits,
  normalizeAnswer,
  buildJpAnswers
} from './generator/utils.mjs';
import { POOLS, resolvePool } from './generator/pools.mjs';
import {
  loadRawWordsData,
  loadVocabBookData,
  buildVocabEntries,
  checkVocabMatch,
  classifyPoolWord,
  CURRICULUM_FIRST_TAUGHT,
  autoAddPoolWords,
  loadVocabularyIndex,
  VOCAB_INDEX,
  checkToken,
  checkItemGating
} from './generator/vocab.mjs';
import {
  TEMPLATES,
  generateAllCombinationsForTemplate,
  generateQuestionsForLesson
} from './generator/builder.mjs';

// Re-export all public symbols for backwards compatibility
export {
  initTokenizer,
  toHiragana,
  stripHonorific,
  hasKanji,
  kanjiToDigits,
  normalizeAnswer,
  buildJpAnswers,
  POOLS,
  resolvePool,
  loadRawWordsData,
  loadVocabBookData,
  buildVocabEntries,
  checkVocabMatch,
  classifyPoolWord,
  CURRICULUM_FIRST_TAUGHT,
  autoAddPoolWords,
  loadVocabularyIndex,
  VOCAB_INDEX,
  checkToken,
  checkItemGating,
  TEMPLATES,
  generateAllCombinationsForTemplate,
  generateQuestionsForLesson
};

// -------------------------------------------------------------
// CLI Runner
// -------------------------------------------------------------
export async function runCli() {
  const isStrict = process.argv.includes('--strict');
  console.log('=== NIHONGO MASTER TEMPLATE GENERATOR ===');
  console.log(`Mode: ${isStrict ? 'STRICT (Auto-Add Dinonaktifkan)' : 'AUTO-ADD AKTIF (Suplemen Kosakata)'}`);
  console.log('Menginisialisasi Kuromoji tokenizer & indeks kosakata...');
  const tokenizer = await initTokenizer();

  const { reportSummary } = autoAddPoolWords(isStrict);

  console.log('\n======================================================');
  console.log('       RINGKASAN SUPLEMEN KOSAKATA (vocab-extra)      ');
  console.log('======================================================');
  console.log(`Total kata dalam vocab-extra.json: ${reportSummary.totalCount} kata`);
  console.log('Rincian kata berdasarkan alasan penambahan:');
  console.log(`  - missing          : ${reportSummary.byReason.missing || 0} kata`);
  console.log(`  - later_lesson     : ${reportSummary.byReason.later_lesson || 0} kata`);
  console.log(`  - reading_conflict : ${reportSummary.byReason.reading_conflict || 0} kata`);

  console.log('\nDaftar kata dengan alasan BUKAN "missing":');
  if (reportSummary.nonMissing && reportSummary.nonMissing.length > 0) {
    for (const nm of reportSummary.nonMissing) {
      console.log(`  - ${nm.jp} (kana: ${nm.kana}, arti: ${nm.id}, bab: ${nm.lesson}, alasan: ${nm.reason})`);
    }
  } else {
    console.log('  (Tidak ada kata non-missing)');
  }

  const vocabIndex = loadVocabularyIndex({ isStrict });
  const allSummary = [];
  const globalDiscarded = new Set();
  const globalSkipped = [];
  const targetPerLesson = 150;

  let targetLessons = [1, 2, 3, 4, 5, 6, 7, 8];
  const lessonArgIdx = process.argv.indexOf('--lessons');
  if (lessonArgIdx !== -1 && process.argv[lessonArgIdx + 1]) {
    const val = process.argv[lessonArgIdx + 1];
    if (val.includes('-')) {
      const [start, end] = val.split('-').map(Number);
      targetLessons = Array.from({ length: end - start + 1 }, (_, k) => start + k);
    } else {
      targetLessons = val.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    }
  }

  for (const lesson of targetLessons) {
    const discardedSet = new Set();
    const currentTarget = (lesson >= 9 && lesson <= 12) ? 255 : targetPerLesson;
    const result = generateQuestionsForLesson(lesson, tokenizer, currentTarget, 10, discardedSet, vocabIndex);
    allSummary.push({ lesson, target: currentTarget, result });

    for (const w of result.discardedWords) globalDiscarded.add(w);
    for (const s of result.skippedTemplates) globalSkipped.push({ lesson, ...s });
  }

  console.log('\n======================================================');
  console.log(`              LAPORAN GENERASI SOAL BAB ${targetLessons[0]} - ${targetLessons[targetLessons.length - 1]}          `);
  console.log('======================================================');
  console.log('Bab  | Target | Jumlah Soal Terpilih | Status Template Aktif');
  console.log('-----+--------+----------------------+----------------------');
  for (const item of allSummary) {
    const activeCount = Object.values(item.result.templateStats).filter(c => c > 0).length;
    const totalTpl = Object.keys(item.result.templateStats).length;
    console.log(
      `${String(item.lesson).padStart(3)}  |  ${String(item.target || targetPerLesson).padStart(5)} | ${String(item.result.questions.length).padStart(20)} | ${activeCount}/${totalTpl} template aktif`
    );
  }

  console.log('\n------------------------------------------------------');
  console.log('Rincian Soal per Template (Target min 10):');
  console.log('------------------------------------------------------');
  for (const item of allSummary) {
    console.log(`\nBab ${item.lesson}:`);
    for (const [tid, count] of Object.entries(item.result.templateStats)) {
      console.log(`  - ${tid}: ${count} soal`);
    }
  }

  console.log('\n------------------------------------------------------');
  console.log('Daftar Template yang Di-Skip:');
  console.log('------------------------------------------------------');
  if (globalSkipped.length === 0) {
    console.log('  ✓ SEMUA TEMPLATE AKTIF (0 template di-skip)');
  } else {
    for (const s of globalSkipped) {
      console.log(`  - [Bab ${s.lesson}] ${s.tid}: ${s.reason}`);
    }
  }

  console.log('\n------------------------------------------------------');
  console.log(`Daftar Kata yang Masih Terbuang oleh Gating (${globalDiscarded.size} kata):`);
  console.log('------------------------------------------------------');
  for (const w of globalDiscarded) {
    console.log(`  - ${w}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCli().catch(err => {
    console.error('Fatal generator error:', err);
    process.exit(1);
  });
}
