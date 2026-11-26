// src/utils/conjugationExplanation.ts
// Pembangkit penjelasan & rumus konjugasi spesifik per soal berdasarkan Minna no Nihongo I

export type VerbGroupKey = 'kelompok_1' | 'kelompok_2' | 'kelompok_3';

export interface FormulaTableRow {
  group: string;
  rule: string;
  example: string;
  isMatched: boolean;
}

export interface ConjugationExplanation {
  groupLabel: string;
  specificRule: string;
  stepByStep: string;
  specialNote?: string;
  lessonRef: string;
  tableTitle: string;
  tableRows: FormulaTableRow[];
}

const I_TO_A_MAP: Record<string, { aKana: string; romajiFrom: string; romajiTo: string }> = {
  い: { aKana: 'わ', romajiFrom: 'i', romajiTo: 'wa' },
  き: { aKana: 'か', romajiFrom: 'ki', romajiTo: 'ka' },
  ぎ: { aKana: 'が', romajiFrom: 'gi', romajiTo: 'ga' },
  し: { aKana: 'さ', romajiFrom: 'shi', romajiTo: 'sa' },
  ち: { aKana: 'た', romajiFrom: 'chi', romajiTo: 'ta' },
  に: { aKana: 'な', romajiFrom: 'ni', romajiTo: 'na' },
  び: { aKana: 'ば', romajiFrom: 'bi', romajiTo: 'ba' },
  み: { aKana: 'ま', romajiFrom: 'mi', romajiTo: 'ma' },
  り: { aKana: 'ら', romajiFrom: 'ri', romajiTo: 'ra' }
};

const I_TO_U_MAP: Record<string, { uKana: string }> = {
  い: { uKana: 'う' },
  き: { uKana: 'く' },
  ぎ: { uKana: 'ぐ' },
  し: { uKana: 'す' },
  ち: { uKana: 'つ' },
  に: { uKana: 'ぬ' },
  び: { uKana: 'ぶ' },
  み: { uKana: 'む' },
  り: { uKana: 'る' }
};

function getMasuStem(reading: string): string {
  const clean = (reading || '').replace(/\s+/g, '');
  // Tangani bentuk seperti "あります[おまつりが～]" -> ambil sebelum '[' jika ada
  const base = clean.split('[')[0];
  return base.endsWith('ます') ? base.slice(0, -2) : base;
}

function buildVerbExplanation(params: {
  baseWord: string;
  baseReading?: string;
  targetFormKey: string;
  correctAnswer: string;
  group: VerbGroupKey;
  lesson?: number;
}): ConjugationExplanation {
  const reading = (params.baseReading || params.baseWord || '').replace(/\s+/g, '').split('[')[0];
  const stem = getMasuStem(reading);
  const lastChar = stem.slice(-1);
  const prefix = stem.slice(0, -1);
  const baseNoBracket = params.baseWord.split('[')[0];
  const isIkimasu = baseNoBracket === '行きます' || reading === 'いきます';
  const isArimasu = baseNoBracket === 'あります' || reading === 'あります';
  const isKimasu = baseNoBracket === '来ます' || reading === 'きます';

  const groupLabel =
    params.group === 'kelompok_1'
      ? 'Kelompok I (Godan / Vokal -i sebelum ます)'
      : params.group === 'kelompok_2'
        ? 'Kelompok II (Ichidan / Vokal -e & beberapa -i sebelum ます)'
        : 'Kelompok III (Fukisoku / Kata Kerja Tidak Beraturan)';

  const lessonMap: Record<string, string> = {
    te: 'Minna no Nihongo Bab 14',
    nai: 'Minna no Nihongo Bab 17',
    kamus: 'Minna no Nihongo Bab 18',
    ta: 'Minna no Nihongo Bab 19'
  };
  const lessonRef = lessonMap[params.targetFormKey] || `Minna no Nihongo Bab ${params.lesson || ''}`.trim();

  // 1. BENTUK -TE (て形)
  if (params.targetFormKey === 'te') {
    let matchedKey = '';
    let specificRule = '';
    let stepByStep = '';
    let specialNote: string | undefined;

    if (params.group === 'kelompok_3') {
      matchedKey = isKimasu ? 'k3_kimasu' : 'k3_shimasu';
      specificRule = isKimasu ? 'きます → きて' : '～します → ～して';
      stepByStep = `${reading} → ${prefix}${isKimasu ? 'きて' : 'して'}`;
      specialNote = 'Kata kerja Kelompok III adalah kata tidak beraturan, cukup buang ます dan tambah て.';
    } else if (params.group === 'kelompok_2') {
      matchedKey = 'k2';
      specificRule = 'Buang ます, tambahkan て (～ます → ～て)';
      stepByStep = `${reading} → ${stem} + て = ${params.correctAnswer}`;
    } else if (isIkimasu) {
      matchedKey = 'k1_ikimasu';
      specificRule = 'Pengecualian: いきます → いって';
      stepByStep = `いきます → いって`;
      specialNote = 'Meskipun berakhiran き (biasanya menjadi いて), khusus 行きます (pergi) berubah menjadi 行って (いって).';
    } else if (['い', 'ち', 'り'].includes(lastChar)) {
      matchedKey = 'k1_ichiri';
      specificRule = `Akhiran ${lastChar}ます → って`;
      stepByStep = `${reading} → ${prefix} + って = ${params.correctAnswer}`;
    } else if (['み', 'び', 'に'].includes(lastChar)) {
      matchedKey = 'k1_mibini';
      specificRule = `Akhiran ${lastChar}ます → んで`;
      stepByStep = `${reading} → ${prefix} + んで = ${params.correctAnswer}`;
    } else if (lastChar === 'き') {
      matchedKey = 'k1_ki';
      specificRule = 'Akhiran きます → いて';
      stepByStep = `${reading} → ${prefix} + いて = ${params.correctAnswer}`;
    } else if (lastChar === 'ぎ') {
      matchedKey = 'k1_gi';
      specificRule = 'Akhiran ぎます → いで';
      stepByStep = `${reading} → ${prefix} + いで = ${params.correctAnswer}`;
    } else {
      matchedKey = 'k1_shi';
      specificRule = 'Akhiran します → して';
      stepByStep = `${reading} → ${prefix} + して = ${params.correctAnswer}`;
    }

    return {
      groupLabel,
      specificRule,
      stepByStep,
      specialNote,
      lessonRef,
      tableTitle: 'Rumus Konjugasi Bentuk て (て形)',
      tableRows: [
        { group: 'Kel. I (い・ち・り)', rule: 'い / ち / り + ます → って', example: 'かいます → かって', isMatched: matchedKey === 'k1_ichiri' },
        { group: 'Kel. I (み・び・に)', rule: 'み / び / に + ます → んで', example: 'のみます → のんで', isMatched: matchedKey === 'k1_mibini' },
        { group: 'Kel. I (き)', rule: 'きます → いて', example: 'かきます → かいて', isMatched: matchedKey === 'k1_ki' },
        { group: 'Kel. I (Pengecualian)', rule: 'いきます → いって', example: '行きます → 行って', isMatched: matchedKey === 'k1_ikimasu' },
        { group: 'Kel. I (ぎ)', rule: 'ぎます → いで', example: 'およぎます → およいで', isMatched: matchedKey === 'k1_gi' },
        { group: 'Kel. I (し)', rule: 'します → して', example: 'はなします → はなして', isMatched: matchedKey === 'k1_shi' },
        { group: 'Kel. II (Ichidan)', rule: 'Buang ます + て', example: 'たべます → たべて', isMatched: matchedKey === 'k2' },
        { group: 'Kel. III (します / 来ます)', rule: 'します → して / きます → きて', example: 'べんきょうします → べんきょうして', isMatched: matchedKey.startsWith('k3') }
      ]
    };
  }

  // 2. BENTUK -NAI (ない形)
  if (params.targetFormKey === 'nai') {
    let matchedKey = '';
    let specificRule = '';
    let stepByStep = '';
    let specialNote: string | undefined;

    if (params.group === 'kelompok_3') {
      matchedKey = isKimasu ? 'k3_kimasu' : 'k3_shimasu';
      specificRule = isKimasu ? 'きます → こない' : '～します → ～しない';
      stepByStep = `${reading} → ${isKimasu ? 'こない' : `${prefix}しない`}`;
      if (isKimasu) {
        specialNote = 'Perubahan vokal khusus: き pada 来ます berubah menjadi こ (こない), bukan きない.';
      }
    } else if (params.group === 'kelompok_2') {
      matchedKey = 'k2';
      specificRule = 'Buang ます, tambahkan ない (～ます → ～ない)';
      stepByStep = `${reading} → ${stem} + ない = ${params.correctAnswer}`;
    } else if (isArimasu) {
      matchedKey = 'k1_arimasu';
      specificRule = 'Pengecualian: あります → ない (bukan あらない)';
      stepByStep = `あります → ない`;
      specialNote = 'Kata kerja あります (ada) adalah pengecualian penting di Bab 17: bentuk negatif kasualnya langsung ない, bukan あらない.';
    } else if (lastChar === 'い') {
      matchedKey = 'k1_i';
      specificRule = 'Akhiran います → わない';
      stepByStep = `${reading} → ${prefix}わ + ない = ${params.correctAnswer}`;
      specialNote = 'Khusus akhiran い sebelum ます, berubah menjadi わ (bukan あ) agar tidak terjadi dua bunyi vokal "a" berurutan.';
    } else {
      matchedKey = 'k1_regular';
      const mapped = I_TO_A_MAP[lastChar];
      specificRule = mapped
        ? `Ubah baris -i (${lastChar}) ke baris -a (${mapped.aKana}) + ない`
        : 'Ubah huruf sebelum ます ke deret vokal -a + ない';
      stepByStep = mapped
        ? `${reading} → ${prefix}${mapped.aKana} + ない = ${params.correctAnswer}`
        : `${reading} → ${params.correctAnswer}`;
    }

    return {
      groupLabel,
      specificRule,
      stepByStep,
      specialNote,
      lessonRef,
      tableTitle: 'Rumus Konjugasi Bentuk ない (ない形)',
      tableRows: [
        { group: 'Kel. I (Umum)', rule: 'Ubah vokal -i sebelum ます ke deret -a + ない', example: 'かきます → かかない / のみます → のまない', isMatched: matchedKey === 'k1_regular' },
        { group: 'Kel. I (Akhiran い)', rule: 'います → わない (bukan あない)', example: 'あらいます → あらわない / あいます → あわない', isMatched: matchedKey === 'k1_i' },
        { group: 'Kel. I (Pengecualian)', rule: 'あります → ない', example: 'あります → ない (bukan あらない)', isMatched: matchedKey === 'k1_arimasu' },
        { group: 'Kel. II (Ichidan)', rule: 'Buang ます + ない', example: 'たべます → たべない / みます → みない', isMatched: matchedKey === 'k2' },
        { group: 'Kel. III (します)', rule: 'します → しない', example: 'べんきょうします → べんきょうしない', isMatched: matchedKey === 'k3_shimasu' },
        { group: 'Kel. III (来ます)', rule: 'きます → こない', example: '来ます (きます) → 来ない (こない)', isMatched: matchedKey === 'k3_kimasu' }
      ]
    };
  }

  // 3. BENTUK KAMUS (辞書形)
  if (params.targetFormKey === 'kamus') {
    let matchedKey = '';
    let specificRule = '';
    let stepByStep = '';
    let specialNote: string | undefined;

    if (params.group === 'kelompok_3') {
      matchedKey = isKimasu ? 'k3_kimasu' : 'k3_shimasu';
      specificRule = isKimasu ? 'きます → くる' : '～します → ～する';
      stepByStep = `${reading} → ${isKimasu ? 'くる' : `${prefix}する`}`;
    } else if (params.group === 'kelompok_2') {
      matchedKey = 'k2';
      specificRule = 'Buang ます, tambahkan る (～ます → ～る)';
      stepByStep = `${reading} → ${stem} + る = ${params.correctAnswer}`;
    } else {
      matchedKey = 'k1';
      const mapped = I_TO_U_MAP[lastChar];
      specificRule = mapped
        ? `Ubah baris -i (${lastChar}) ke baris -u (${mapped.uKana})`
        : 'Ubah huruf sebelum ます ke deret vokal -u';
      stepByStep = mapped
        ? `${reading} → ${prefix}${mapped.uKana} = ${params.correctAnswer}`
        : `${reading} → ${params.correctAnswer}`;
      if (lastChar === 'り') {
        specialNote = 'Hati-hati membedakan Kel. I berakhiran ります (seperti とります → とる) dengan Kel. II (seperti たべます → たべる).';
      }
    }

    return {
      groupLabel,
      specificRule,
      stepByStep,
      specialNote,
      lessonRef,
      tableTitle: 'Rumus Konjugasi Bentuk Kamus (辞書形)',
      tableRows: [
        { group: 'Kel. I (Godan)', rule: 'Ubah vokal -i sebelum ます ke deret -u (い→う, き→く, ぎ→ぐ, し→す, ち→つ, に→ぬ, び→ぶ, み→む, り→る)', example: 'かきます → かく / あいます → あう', isMatched: matchedKey === 'k1' },
        { group: 'Kel. II (Ichidan)', rule: 'Buang ます + る', example: 'たべます → たべる / みます → みる', isMatched: matchedKey === 'k2' },
        { group: 'Kel. III (します)', rule: 'します → する', example: 'うんてんします → うんてんする', isMatched: matchedKey === 'k3_shimasu' },
        { group: 'Kel. III (来ます)', rule: 'きます → くる', example: '来ます (きます) → 来る (くる)', isMatched: matchedKey === 'k3_kimasu' }
      ]
    };
  }

  // 4. BENTUK -TA (た形)
  let matchedKey = '';
  let specificRule = '';
  let stepByStep = '';
  let specialNote: string | undefined;

  if (params.group === 'kelompok_3') {
    matchedKey = isKimasu ? 'k3_kimasu' : 'k3_shimasu';
    specificRule = isKimasu ? 'きます → きた' : '～します → ～した';
    stepByStep = `${reading} → ${isKimasu ? 'きた' : `${prefix}した`}`;
  } else if (params.group === 'kelompok_2') {
    matchedKey = 'k2';
    specificRule = 'Buang ます, tambahkan た (～ます → ～た)';
    stepByStep = `${reading} → ${stem} + た = ${params.correctAnswer}`;
  } else if (isIkimasu) {
    matchedKey = 'k1_ikimasu';
    specificRule = 'Pengecualian: いきます → いった';
    stepByStep = `いきます → いった`;
    specialNote = 'Sama seperti Bentuk -Te, khusus 行きます berubah menjadi 行った (いった), bukan いいた.';
  } else if (['い', 'ち', 'り'].includes(lastChar)) {
    matchedKey = 'k1_ichiri';
    specificRule = `Akhiran ${lastChar}ます → った`;
    stepByStep = `${reading} → ${prefix} + った = ${params.correctAnswer}`;
  } else if (['み', 'び', 'に'].includes(lastChar)) {
    matchedKey = 'k1_mibini';
    specificRule = `Akhiran ${lastChar}ます → んだ`;
    stepByStep = `${reading} → ${prefix} + んだ = ${params.correctAnswer}`;
  } else if (lastChar === 'き') {
    matchedKey = 'k1_ki';
    specificRule = 'Akhiran きます → いた';
    stepByStep = `${reading} → ${prefix} + いた = ${params.correctAnswer}`;
  } else if (lastChar === 'ぎ') {
    matchedKey = 'k1_gi';
    specificRule = 'Akhiran ぎます → いだ';
    stepByStep = `${reading} → ${prefix} + いだ = ${params.correctAnswer}`;
  } else {
    matchedKey = 'k1_shi';
    specificRule = 'Akhiran します → した';
    stepByStep = `${reading} → ${prefix} + した = ${params.correctAnswer}`;
  }

  return {
    groupLabel,
    specificRule,
    stepByStep,
    specialNote: specialNote || 'Aturan Bentuk -Ta sama persis dengan Bentuk -Te: cukup ubah て menjadi た, dan で menjadi だ.',
    lessonRef,
    tableTitle: 'Rumus Konjugasi Bentuk た (た形)',
    tableRows: [
      { group: 'Kel. I (い・ち・り)', rule: 'い / ち / り + ます → った', example: 'かいます → かった', isMatched: matchedKey === 'k1_ichiri' },
      { group: 'Kel. I (み・び・に)', rule: 'み / び / に + ます → んだ', example: 'のみます → のんだ', isMatched: matchedKey === 'k1_mibini' },
      { group: 'Kel. I (き)', rule: 'きます → いた', example: 'かきます → かいた', isMatched: matchedKey === 'k1_ki' },
      { group: 'Kel. I (Pengecualian)', rule: 'いきます → いった', example: '行きます → 行った', isMatched: matchedKey === 'k1_ikimasu' },
      { group: 'Kel. I (ぎ)', rule: 'ぎます → いだ', example: 'およぎます → およいだ', isMatched: matchedKey === 'k1_gi' },
      { group: 'Kel. I (し)', rule: 'します → した', example: 'はなします → はなした', isMatched: matchedKey === 'k1_shi' },
      { group: 'Kel. II (Ichidan)', rule: 'Buang ます + た', example: 'たべます → たべた', isMatched: matchedKey === 'k2' },
      { group: 'Kel. III (します / 来ます)', rule: 'します → した / きます → きた', example: 'します → した / きます → きた', isMatched: matchedKey.startsWith('k3') }
    ]
  };
}

function buildAdjectiveExplanation(params: {
  baseWord: string;
  baseReading?: string;
  targetFormKey: string;
  correctAnswer: string;
  adjType: 'i' | 'na';
}): ConjugationExplanation {
  const isIi = params.baseWord === 'いい' || params.baseReading === 'いい';
  const groupLabel = params.adjType === 'i' ? 'Kata Sifat-i (い形容詞)' : 'Kata Sifat-na (な形容詞)';

  const formSpecs: Record<string, {
    iRule: string;
    naRule: string;
    iiRule: string;
    lessonRef: string;
    tableTitle: string;
    iExample: string;
    naExample: string;
  }> = {
    presentNegative: {
      iRule: 'Buang い di akhir, tambahkan くない',
      naRule: 'Tambahkan じゃない (atau ではない)',
      iiRule: 'Pengecualian: いい memakai bentuk dasar よい → よくない',
      lessonRef: 'Minna no Nihongo Bab 8',
      tableTitle: 'Rumus Bentuk Negatif Kata Sifat',
      iExample: 'たかい → たかくない',
      naExample: 'ひま → ひまじゃない'
    },
    pastPositive: {
      iRule: 'Buang い di akhir, tambahkan かった',
      naRule: 'Tambahkan だった',
      iiRule: 'Pengecualian: いい memakai bentuk dasar よい → よかった',
      lessonRef: 'Minna no Nihongo Bab 12',
      tableTitle: 'Rumus Bentuk Lampau Kata Sifat',
      iExample: 'たかい → たかかった',
      naExample: 'ひま → ひまだった'
    },
    pastNegative: {
      iRule: 'Buang い di akhir, tambahkan くなかった',
      naRule: 'Tambahkan じゃなかった (atau ではなかった)',
      iiRule: 'Pengecualian: いい memakai bentuk dasar よい → よくなかった',
      lessonRef: 'Minna no Nihongo Bab 12',
      tableTitle: 'Rumus Bentuk Negatif Lampau Kata Sifat',
      iExample: 'たかい → たかくなかった',
      naExample: 'ひま → ひまじゃなかった'
    },
    teForm: {
      iRule: 'Buang い di akhir, tambahkan くて',
      naRule: 'Tambahkan で',
      iiRule: 'Pengecualian: いい memakai bentuk dasar よい → よくて',
      lessonRef: 'Minna no Nihongo Bab 16',
      tableTitle: 'Rumus Bentuk Sambung (て) Kata Sifat',
      iExample: 'おおきい → おおきくて',
      naExample: 'しずか → しずかで'
    }
  };

  const spec = formSpecs[params.targetFormKey] || formSpecs.presentNegative;
  const specificRule = isIi ? spec.iiRule : params.adjType === 'i' ? spec.iRule : spec.naRule;
  const stem = params.adjType === 'i' && params.baseWord.endsWith('い')
    ? (isIi ? 'よ' : params.baseWord.slice(0, -1))
    : params.baseWord;

  const suffix = params.adjType === 'i'
    ? (params.targetFormKey === 'presentNegative' ? 'くない' : params.targetFormKey === 'pastPositive' ? 'かった' : params.targetFormKey === 'pastNegative' ? 'くなかった' : 'くて')
    : (params.targetFormKey === 'presentNegative' ? 'じゃない' : params.targetFormKey === 'pastPositive' ? 'だった' : params.targetFormKey === 'pastNegative' ? 'じゃなかった' : 'で');

  const stepByStep = `${params.baseWord} → ${stem} + ${suffix} = ${params.correctAnswer}`;
  const specialNote = isIi
    ? 'Kata sifat いい (bagus/baik) selalu berubah memakai bentuk asalnya よい saat dikonjugasikan, sehingga menjadi よくない / よかった / よくなかった / よくて.'
    : params.adjType === 'na'
      ? 'Untuk Kata Sifat-na (seperti きれい・ゆうめい yang kebetulan berakhiran い), tetap ikuti pola Kata Sifat-na, jangan buang い!'
      : undefined;

  return {
    groupLabel,
    specificRule,
    stepByStep,
    specialNote,
    lessonRef: spec.lessonRef,
    tableTitle: spec.tableTitle,
    tableRows: [
      { group: 'Kata Sifat-i (い形容詞)', rule: spec.iRule, example: spec.iExample, isMatched: params.adjType === 'i' && !isIi },
      { group: 'Pengecualian (いい)', rule: spec.iiRule, example: 'いい → よくない / よかった / よくて', isMatched: isIi },
      { group: 'Kata Sifat-na (な形容詞)', rule: spec.naRule, example: spec.naExample, isMatched: params.adjType === 'na' }
    ]
  };
}

export function buildConjugationExplanation(params: {
  category: 'verb' | 'adjective';
  baseWord: string;
  baseReading?: string;
  targetFormKey: string;
  correctAnswer: string;
  verbGroup?: VerbGroupKey;
  adjType?: 'i' | 'na';
  lesson?: number;
}): ConjugationExplanation {
  if (params.category === 'verb') {
    return buildVerbExplanation({
      baseWord: params.baseWord,
      baseReading: params.baseReading,
      targetFormKey: params.targetFormKey,
      correctAnswer: params.correctAnswer,
      group: params.verbGroup || 'kelompok_1',
      lesson: params.lesson
    });
  }
  return buildAdjectiveExplanation({
    baseWord: params.baseWord,
    baseReading: params.baseReading,
    targetFormKey: params.targetFormKey,
    correctAnswer: params.correctAnswer,
    adjType: params.adjType || 'i'
  });
}
