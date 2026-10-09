import { TAGS } from './tags.mjs';

/**
 * @typedef {Object} KuromojiToken
 * @property {string} surface_form
 * @property {string} pos
 * @property {string} pos_detail_1
 * @property {string} [pos_detail_2]
 * @property {string} [pos_detail_3]
 * @property {string} [conjugated_type]
 * @property {string} [conjugated_form]
 * @property {string} basic_form
 * @property {string} [reading]
 * @property {string} [pronunciation]
 */

/**
 * Lindungi kata kana-saja (かたかな, ひらがな, ローマじ) sebelum tokenisasi
 * agar Kuromoji tidak memecahnya menjadi partikel palsu (seperti か, た, か, な).
 * @param {string} text
 * @returns {string}
 */
export function sanitizeTextForGrammar(text) {
  if (!text) return text;
  return text
    .replace(/かたかな/g, 'カタカナ')
    .replace(/ひらがな/g, 'ヒラガナ')
    .replace(/ローマじ/g, 'ローマ字');
}

/**
 * Deteksi grammar tags dan unknown constructs dari token Kuromoji.
 * Aturan konservatif: setiap struktur yang tidak dikenali masuk ke `unknown`.
 * 
 * @param {KuromojiToken[]} tokens
 * @returns {{ tags: Set<string>, unknown: string[] }}
 */
export function detectTags(tokens) {
  /** @type {Set<string>} */
  const tags = new Set();
  /** @type {string[]} */
  const unknown = [];

  const len = tokens.length;
  const surfaces = tokens.map(t => t.surface_form);
  const fullText = surfaces.join('');

  // -------------------------------------------------------------
  // 1. CEK UNKNOWN FORMS (Konstruksi di luar kurikulum Minna no Nihongo)
  // -------------------------------------------------------------
  for (let i = 0; i < len; i++) {
    const t = tokens[i];

    // Cek pasif (れる / られる) dan kausatif (せる / させる)
    if (t.pos === '動詞' && (t.basic_form === 'れる' || t.basic_form === 'られる')) {
      unknown.push(`passive_form:${t.surface_form}`);
    }
    if (t.pos === '動詞' && (t.basic_form === 'せる' || t.basic_form === 'させる')) {
      unknown.push(`causative_form:${t.surface_form}`);
    }

    // Cek bentuk kondisional ば (仮定形 dari動詞 yang bukan bagian dari なければなりません)
    if (t.pos === '助詞' && t.pos_detail_1 === '接続助詞' && t.basic_form === 'ば') {
      const prev = tokens[i - 1];
      if (!prev || !prev.surface_form.includes('なけれ')) {
        unknown.push(`ba_conditional:${t.surface_form}`);
      }
    }

    // Cek bentuk perintah kasar (命令形 / 命令ｅ / 命令ｉ dst.) — kecuali ください (くださる)
    if (t.conjugated_form && t.conjugated_form.includes('命令') && t.basic_form !== 'くださる') {
      unknown.push(`imperative_form:${t.surface_form}`);
    }


    // Cek tata bahasa lanjutan (N3/N2/N1 particles & expressions)
    if (t.surface_form === 'わけ' && tokens[i + 1]?.surface_form === 'で' && tokens[i + 2]?.surface_form === 'は') {
      unknown.push(`advanced_grammar:わけではない`);
    }
    if (t.surface_form === 'に' && tokens[i + 1]?.surface_form === '違いない') {
      unknown.push(`advanced_grammar:に違いない`);
    }
    if (t.surface_form === 'べき') {
      unknown.push(`advanced_grammar:べき`);
    }
  }

  /** @param {string} s */
  const hasSurface = (s) => surfaces.includes(s);

  // -------------------------------------------------------------
  // 2. DETEKSI SETIAP TAG GRAMMAR
  // -------------------------------------------------------------

  // --- LESSON 1 ---
  // HONORIFIC_SAN
  for (let i = 0; i < len; i++) {
    if (tokens[i].surface_form === 'さん' && tokens[i].pos === '名詞' && tokens[i].pos_detail_1 === '接尾') {
      tags.add('HONORIFIC_SAN');
    }
  }

  // PARTICLE_WA
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'は' && t.pos === '助詞' && (t.pos_detail_1 === '係助詞' || t.pos_detail_1 === '副助詞')) {
      tags.add('PARTICLE_WA');
    }
  }

  // PARTICLE_MO
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'も' && t.pos === '助詞') {
      const prev = tokens[i - 1];
      if (prev && (prev.surface_form === 'て' || prev.surface_form === 'で' || prev.surface_form === 'なく')) {
        // Bagian dari TE_MO_II, TEMO_CONCESSIVE, atau NAKUTE_MO_II
      } else {
        tags.add('PARTICLE_MO');
      }
    }
  }



  // QUESTION_KA
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'か' && t.pos === '助詞') {
      const prev = tokens[i - 1];
      if (prev && prev.surface_form === 'ん') {
        const prev2 = tokens[i - 2];
        if (prev2 && prev2.surface_form === 'ませ') {
          continue; // VERB_MASENKA
        }
      }
      // Lindungi serpihan かたかな (か + た + か + な)
      if (tokens[i + 1]?.surface_form === 'た' && tokens[i + 2]?.surface_form === 'か' && tokens[i + 3]?.surface_form === 'な') {
        continue;
      }
      if (tokens[i - 2]?.surface_form === 'か' && tokens[i - 1]?.surface_form === 'た' && tokens[i + 1]?.surface_form === 'な') {
        continue;
      }
      tags.add('QUESTION_KA');
    }
  }

  // NEG_JA_ARIMASEN
  if (
    fullText.includes('じゃありません') ||
    fullText.includes('じゃ ありません') ||
    fullText.includes('ではありません') ||
    fullText.includes('では ありません')
  ) {
    tags.add('NEG_JA_ARIMASEN');
  }

  // COPULA_DESU
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.basic_form === 'です' && t.surface_form === 'です') {
      const prev = tokens[i - 1];
      // Adj-i + くなかったです / くありませんでした => TANPA COPULA_DESU
      const isAdjNegDesu = prev && (
        (prev.surface_form === 'た' && tokens[i - 2]?.surface_form === 'なかっ') ||
        prev.surface_form === 'ない'
      );
      if (!isAdjNegDesu) {
        tags.add('COPULA_DESU');
      }
    }
  }

  // --- LESSON 2 ---
  // DEM_THING: これ / それ / あれ
  for (const t of tokens) {
    if ((t.surface_form === 'これ' || t.surface_form === 'それ' || t.surface_form === 'あれ') &&
        t.pos === '名詞' && t.pos_detail_1 === '代名詞') {
      tags.add('DEM_THING');
    }
  }

  // DEM_ADNOM: この / その / あの + N
  for (const t of tokens) {
    if ((t.surface_form === 'この' || t.surface_form === 'その' || t.surface_form === 'あの') &&
        t.pos === '連体詞') {
      tags.add('DEM_ADNOM');
    }
  }

  // PARTICLE_NO & NO_PRONOUN
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'の' && (t.pos === '助詞' || t.pos_detail_1 === '非自立' || t.pos_detail_1 === '連体化')) {
      const next = tokens[i + 1];
      if (next && (next.surface_form === 'です' || next.surface_form === 'だ' || next.surface_form === '。' || next.surface_form === 'か')) {
        tags.add('NO_PRONOUN');
      } else {
        tags.add('PARTICLE_NO');
      }
    } else if (t.surface_form === '木の下' || t.surface_form === '木の上') {
      // Kuromoji membaca 木の下 sebagai satu token nama (木ノ下), sehingga PARTICLE_NO terlewat
      tags.add('PARTICLE_NO');
    }
  }

  // Lindungi jika Kuromoji membaca [nomina]の[kata posisi] (seperti 木の下) sebagai satu token
  const positionPhrasePattern = /の(上|うえ|下|した|前|まえ|後ろ|うしろ|右|みぎ|左|ひだり|中|なか|外|そと|隣|となり|近く|ちかく|間|あいだ)/;
  if (positionPhrasePattern.test(fullText)) {
    tags.add('PARTICLE_NO');
  }

  // SOU_DESU: そうです / そうじゃありません
  if (fullText.includes('そうです') || fullText.includes('そうじゃありません') || fullText.includes('そうじゃ ありません')) {
    tags.add('SOU_DESU');
  }

  // WH_NAN: なん / なに ですか
  for (const t of tokens) {
    if ((t.surface_form === 'なん' || t.surface_form === 'なに' || t.surface_form === '何') &&
        t.pos === '名詞') {
      tags.add('WH_NAN');
    }
  }

  // --- LESSON 3 ---
  // DEM_PLACE: ここ / そこ / あそこ
  for (const t of tokens) {
    if ((t.surface_form === 'ここ' || t.surface_form === 'そこ' || t.surface_form === 'あそこ') &&
        t.pos === '名詞' && t.pos_detail_1 === '代名詞') {
      tags.add('DEM_PLACE');
    }
  }

  // WH_DOKO: どこ
  if (hasSurface('どこ')) tags.add('WH_DOKO');

  // DEM_DIRECTION: こちら / そちら / あちら / どちら
  for (const t of tokens) {
    if (['こちら', 'そちら', 'あちら', 'どちら'].includes(t.surface_form)) {
      tags.add('DEM_DIRECTION');
    }
  }

  // PRICE_IKURA: いくら
  if (hasSurface('いくら')) tags.add('PRICE_IKURA');

  // --- LESSON 4 ---
  // TIME_CLOCK: ～時～分
  let hasClockHour = false;
  let hasClockMinute = false;
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === '時' && t.pos_detail_1 === '接尾') hasClockHour = true;
    if (t.surface_form === '分' && t.pos_detail_1 === '接尾') hasClockMinute = true;
  }
  if (hasClockHour || hasClockMinute) {
    tags.add('TIME_CLOCK');
  }

  // WH_NANJI: なんじ / なんぷん / 何時 / 何分
  if (fullText.includes('何時') || fullText.includes('なんじ') || fullText.includes('何分') || fullText.includes('なんぷん')) {
    tags.add('WH_NANJI');
  }

  // VERB INFLECTIONS (ます / ません / ました / ませんでした / ませんか / ましょう)
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.pos === '助動詞' && t.surface_form === 'ます') {
      const prev = tokens[i - 1];
      if (prev && prev.pos === '動詞') {
        tags.add('VERB_MASU');
      }
    }

    // ました
    if (t.surface_form === 'まし' && tokens[i + 1]?.surface_form === 'た') {
      const prev = tokens[i - 1];
      if (prev && prev.pos === '動詞') {
        tags.add('VERB_MASHITA');
      }
    }
    // ません / ませんでした / ませんか
    if (t.surface_form === 'ませ' && tokens[i + 1]?.surface_form === 'ん') {
      const prev = tokens[i - 1];
      if (prev && (prev.pos === '動詞' || prev.pos === '助動詞')) {
        const prev2 = tokens[i - 2];
        const isCopulaOrAdjNeg = prev.basic_form === 'ある' && prev2 && (
          prev2.surface_form === 'じゃ' ||
          prev2.surface_form === 'では' ||
          prev2.surface_form.endsWith('く') ||
          prev2.pos === '形容詞'
        );
        if (!isCopulaOrAdjNeg) {
          if (tokens[i + 2]?.surface_form === 'か') {
            tags.add('VERB_MASENKA');
          } else if (tokens[i + 2]?.surface_form === 'でし' && tokens[i + 3]?.surface_form === 'た') {
            tags.add('VERB_MASENDESHITA');
          } else {
            tags.add('VERB_MASEN');
          }
        }
      }
    }
    // ましょう
    if ((t.surface_form === 'ましょ' || t.surface_form === 'ましょう') && tokens[i + 1]?.surface_form === 'う') {
      tags.add('VERB_MASHOU');
    }
  }

  // PARTICLE_KARA_MADE: ～から / ～まで
  let hasKara = false;
  let hasMade = false;
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'から' && t.pos === '助詞' && t.pos_detail_1 === '格助詞') hasKara = true;
    if (t.surface_form === 'まで' && t.pos === '助詞') hasMade = true;
  }
  if (hasKara || hasMade) {
    const isDesukara = tokens.some((t, i) => t.surface_form === 'から' && tokens[i - 1]?.surface_form === 'です');
    if (!isDesukara && (hasKara || hasMade)) {
      tags.add('PARTICLE_KARA_MADE');
    }
  }

  // PARTICLE_NI_TIME: waktu に V (angka+時/分/hari/bulan/tahun, 朝, 晩, dst.)
  const TIME_EXPR_WORDS = new Set([
    '朝', '晩', '昼', '夜', '午前', '午後', '今朝', '今晩', '夕方', '毎朝', '毎晩'
  ]);
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'に' && t.pos === '助詞' && t.pos_detail_1 === '格助詞') {
      const prev = tokens[i - 1];
      if (prev) {
        const sf = prev.surface_form;
        if (prev.pos_detail_2 === '人名' || sf === 'さん' || sf === 'ちゃん' || sf === 'くん') {
          continue;
        }
        const isTimeSuffix = (prev.pos_detail_2 === '助数詞' || prev.pos_detail_1 === '接尾') &&
          /(時|分|秒|日|月|年|時半)$/.test(sf);
        const isTimeWord = TIME_EXPR_WORDS.has(sf) || sf.endsWith('曜日') || sf.endsWith('曜');
        const isTimePattern = /^[0-9一二三四五六七八九十百千万]+(時|分|秒|日|月|年|時半)$/.test(sf) ||
          ((tokens[i - 2]?.pos_detail_1 === '数' || /^[0-9一二三四五六七八九十百千万]/.test(tokens[i - 2]?.surface_form || '')) && /(時|分|秒|日|月|年|時半)$/.test(sf));
        const isNanTime = sf.includes('何時') || sf.includes('何分') || sf.includes('何日') || sf.includes('何月') || sf.includes('何年');

        if (isTimeSuffix || isTimeWord || isTimePattern || isNanTime) {
          tags.add('PARTICLE_NI_TIME');
        }
      }
    }
  }

  // PARTICLE_NE
  for (let i = 0; i < len; i++) {
    if (tokens[i].surface_form === 'ね' && tokens[i].pos === '助詞' && tokens[i].pos_detail_1 === '終助詞') {
      tags.add('PARTICLE_NE');
    }
  }

  // PARTICLE_TO_AND: N1 と N2
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'と' && t.pos === '助詞' && (t.pos_detail_1 === '並立助詞' || t.pos_detail_1 === '格助詞')) {
      const prev = tokens[i - 1];
      const next = tokens[i + 1];
      if (prev && prev.pos === '名詞' && next && next.pos === '名詞') {
        tags.add('PARTICLE_TO_AND');
      }
    }
  }

  // --- LESSON 5 ---
  // PARTICLE_HE: tempat へ 行きます / 来ます / 帰ります
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'へ' && t.pos === '助詞' && t.pos_detail_1 === '格助詞') {
      tags.add('PARTICLE_HE');
    }
  }

  // PARTICLE_DE_TRANSPORT: kendaraan で
  const transportWords = ['タクシー', '電車', 'バス', '車', '新幹線', '飛行機', '自転車', '船', '地下鉄'];
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'で' && t.pos === '助詞' && t.pos_detail_1 === '格助詞') {
      const prev = tokens[i - 1];
      if (prev && transportWords.includes(prev.surface_form)) {
        tags.add('PARTICLE_DE_TRANSPORT');
      }
    }
  }

  // PARTICLE_TO_WITH: orang と (bersama)
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'と' && t.pos === '助詞') {
      const prev = tokens[i - 1];
      const personWords = ['家族', '友だち', '友達', '彼', '彼女', 'ミラーさん', '山田さん', '佐藤さん', 'だれ'];
      if (prev && (personWords.includes(prev.surface_form) || prev.surface_form === 'さん')) {
        tags.add('PARTICLE_TO_WITH');
      }
    }
  }

  // WH_ITSU: いつ
  if (hasSurface('いつ') || fullText.includes('いつ')) tags.add('WH_ITSU');

  // DATE_EXPR: tanggal dan hari
  for (const t of tokens) {
    if (t.surface_form.endsWith('曜日')) {
      tags.add('DATE_EXPR');
    }
  }
  if (/(^|[^\d])(\d{1,2}|[一二三四五六七八九十]+)月(\d{1,2}|[一二三四五六七八九十]+)日/.test(fullText)) {
    tags.add('DATE_EXPR');
  }

  // --- LESSON 6 ---
  // PARTICLE_WO: objek を
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'を' && t.pos === '助詞' && t.pos_detail_1 === '格助詞') {
      tags.add('PARTICLE_WO');
    }
  }

  // PARTICLE_DE_PLACE & PARTICLE_DE_MEANS
  const hasSuperlative = hasSurface('いちばん') || hasSurface('一番') || fullText.includes('いちばん') || fullText.includes('一番');
  const hasActionVerb = tokens.some(tk => tk.pos === '動詞' && !['ある', 'いる', 'なる'].includes(tk.basic_form));

  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'で' && t.pos === '助詞' && t.pos_detail_1 === '格助詞') {
      const prev = tokens[i - 1];
      const next = tokens[i + 1];
      // Abaikan bila 'で' berfungsi sebagai lingkup/scope waktu atau superlatif (misal: 1年で一番, 世界で一番, 果物でいちばん)
      const timeScopeUnits = ['年', '月', '週', '日', '分', '秒', '時間', 'か月', '週間', '回'];
      const isTimeScope = prev && (timeScopeUnits.includes(prev.basic_form) || timeScopeUnits.includes(prev.surface_form));
      if (hasSuperlative || isTimeScope) {
        continue;
      }
      if (prev && !transportWords.includes(prev.surface_form)) {
        const meansWords = [
          'ワープロ', '日本語', '英語', 'はし', 'スプーン', 'フォーク',
          'ハサミ', 'はさみ', '手', 'パソコン', 'ファクス', 'ファックス',
          'ナイフ', '鉛筆', 'えんぴつ', 'ボールペン', 'メール'
        ];
        if (meansWords.includes(prev.surface_form)) {
          tags.add('PARTICLE_DE_MEANS');
        } else if (hasActionVerb) {
          tags.add('PARTICLE_DE_PLACE');
        }
      }
    }
  }

  // --- LESSON 7 ---
  // GIVE_AGEMASU & RECEIVE_MORAIMASU & PARTICLE_NI_RECIPIENT & MOU_MASHITA
  for (const t of tokens) {
    if (t.basic_form === 'あげる' && (t.pos === '動詞' || t.pos_detail_1 === '自立')) {
      tags.add('GIVE_AGEMASU');
    }
    if (t.basic_form === 'もらう' && (t.pos === '動詞' || t.pos_detail_1 === '自立')) {
      tags.add('RECEIVE_MORAIMASU');
    }
  }

  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'に' && t.pos === '助詞') {
      const prev = tokens[i - 1];
      if (prev) {
        const isPersonRecipient = ['さん', 'ちゃん', 'くん', '人', 'わたし', 'あなた', '彼', '彼女', '友達', '先生', '母', '父', '家族', '子ども', '兄', '弟', '姉', '妹'].includes(prev.surface_form) || prev.pos_detail_2 === '人名';
        const hasExchangeVerb = tokens.some(tk => ['あげる', 'もらう', 'くれる', '送る', '貸す', '借りる', '教える', '習う', '書く', 'かける'].includes(tk.basic_form));
        if (isPersonRecipient && hasExchangeVerb) {
          tags.add('PARTICLE_NI_RECIPIENT');
        }
      }
    }
  }

  if (hasSurface('もう') || hasSurface('まだ')) {
    tags.add('MOU_MASHITA');
  }

  // --- LESSON 8 ---
  // ADJ_I & ADJ_NA & ADJ_NOUN_MOD & ADJ_NEG
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.pos === '形容詞' && t.pos_detail_1 === '自立') {
      const next = tokens[i + 1];
      const next2 = tokens[i + 2];

      const isRenyouTe = (t.conjugated_form && t.conjugated_form.includes('連用テ接続')) || t.surface_form.endsWith('く');
      // Periksa apakah ～く diikuti bentuk negatif: ない / なかった / ありません / ありませんでした
      const isFollowedByNegative = next && (
        next.basic_form === 'ない' ||
        next.surface_form === 'ない' ||
        next.surface_form.startsWith('なか') ||
        (next.basic_form === 'ある' && next2 && next2.surface_form === 'ませ')
      );
      const isFollowedByVerb = next && next.pos === '動詞';
      // Token 形容詞 dengan bentuk 連用テ接続 (～く) yang LANGSUNG diikuti kata kerja (動詞) = adverbia: JANGAN menghasilkan ADJ_I
      const isAdverbial = isRenyouTe && isFollowedByVerb && !isFollowedByNegative;

      if (!isAdverbial) {
        tags.add('ADJ_I');
        if (next && next.pos === '名詞') {
          tags.add('ADJ_NOUN_MOD');
        }
        if ((t.conjugated_form && t.conjugated_form.includes('連用タ接続')) || t.surface_form.endsWith('かっ')) {
          tags.add('PAST_ADJ_I');
        }
        if (tokens[i + 1]?.surface_form === 'なかっ' || (tokens[i + 1]?.surface_form === 'あり' && tokens[i + 2]?.surface_form === 'ませ')) {
          tags.add('PAST_ADJ_I');
        }
      }
    }
    const naAdjs = ['暇', 'きれい', '静か', '有名', '親切', '元気', '便利', 'にぎやか', 'ハンサム'];
    if (t.pos_detail_1 === '形容動詞語幹' || naAdjs.includes(t.surface_form)) {
      tags.add('ADJ_NA');
      const next = tokens[i + 1];
      if (next && next.surface_form === 'な' && tokens[i + 2]?.pos === '名詞') {
        tags.add('ADJ_NOUN_MOD');
      }
    }
  }

  if (fullText.includes('くない') || fullText.includes('くありませ') || fullText.includes('くなかった') || (tags.has('ADJ_NA') && (fullText.includes('じゃありませ') || fullText.includes('ではありませ')))) {
    tags.add('ADJ_NEG');
  }
  if (hasSurface('とても') || hasSurface('あまり')) {
    tags.add('ADV_TOTEMO_AMARI');
  }
  if (hasSurface('どんな')) {
    tags.add('WH_DONNA');
  }

  // --- LESSON 9 ---
  // PARTICLE_GA_OBJ: N が 好き / わかる / ある / 欲しい / できる
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'が' && t.pos === '助詞' && t.pos_detail_1 === '格助詞') {
      const nextTokens = tokens.slice(i + 1, i + 4);
      const isObject = nextTokens.some(tk => ['好き', '嫌い', 'わかる', '上手', '下手', 'ある', 'いる', '要る', '欲しい', 'できる'].includes(tk.basic_form) || tk.surface_form === '好き');
      if (isObject) {
        tags.add('PARTICLE_GA_OBJ');
      }
    }
  }

  for (const t of tokens) {
    if (['少し', 'よく', 'たくさん', '全然', 'だいたい'].includes(t.surface_form)) {
      tags.add('ADV_AMOUNT');
    }
  }

  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'から' && t.pos === '助詞') {
      const prev = tokens[i - 1];
      if (prev && prev.surface_form !== 'て' && prev.surface_form !== 'で' && (prev.surface_form === 'です' || prev.surface_form === 'だ' || prev.pos === '動詞' || prev.pos === '形容詞' || prev.pos === '助動詞' || t.pos_detail_1 === '接続助詞')) {
        tags.add('KARA_REASON');
      }
    }
  }

  if (hasSurface('どうして')) tags.add('WH_DOUSHITE');

  // --- LESSON 10 ---
  // ARIMASU_IMASU & LOCATION_NI_EXIST & POSITION_NOUN & PARTICLE_YA
  let hasExistVerb = false;
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.basic_form === 'ある' && (t.pos === '動詞' || t.pos === '助動詞' || t.pos_detail_1 === '自立')) {
      const prev = tokens[i - 1];
      const isPartNeg = prev && (
        prev.surface_form === 'じゃ' ||
        prev.surface_form === 'では' ||
        prev.surface_form.endsWith('く') ||
        prev.pos === '形容詞'
      );
      if (!isPartNeg) {
        tags.add('ARIMASU_IMASU');
        hasExistVerb = true;
      }
    } else if (t.basic_form === 'いる' && (t.pos === '動詞' || t.pos_detail_1 === '自立')) {
      // Abaikan bila 'い' adalah bagian dari kata tanya 'いつ' (kuromoji sering memecah いつ menjadi い(動詞) + つ)
      if (t.surface_form === 'い' && tokens[i + 1]?.surface_form === 'つ') {
        continue;
      }
      // kata kerja いる (います/いません/いました/いますか) yang BUKAN mengikuti bentuk て/で (itu progresif, bab 14)
      const prev = tokens[i - 1];
      const isTeOrDe = prev && (prev.surface_form === 'て' || prev.surface_form === 'で') && prev.pos === '助詞';
      if (!isTeOrDe) {
        tags.add('ARIMASU_IMASU');
        hasExistVerb = true;
      }
    }
  }
  if (hasExistVerb) {
    for (let i = 0; i < len; i++) {
      if (tokens[i].surface_form === 'に' && tokens[i].pos === '助詞') {
        tags.add('LOCATION_NI_EXIST');
      }
    }
  }

  // MAE_NI (Bab 18): ～る前に / [Aktivitas]の前に berarti "sebelum (melakukan sesuatu)".
  // Pengecualian: [Nomina tempat/benda] の 前に ... あります/います adalah POSITION_NOUN (Bab 10), BUKAN MAE_NI.
  let hasMaeNi = false;
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if ((t.surface_form === '前' || t.surface_form === 'まえ') && tokens[i + 1]?.surface_form === 'に') {
      if (hasExistVerb) {
        // Pada kalimat keberadaan fisik (あります/います), '前に' adalah posisi spasial (POSITION_NOUN), bukan MAE_NI
        continue;
      }
      const prev = tokens[i - 1];
      if (prev && prev.pos === '動詞' && (prev.conjugated_form === '基本形' || prev.surface_form === prev.basic_form)) {
        hasMaeNi = true;
        tags.add('DICT_FORM');
      } else if (prev && prev.surface_form === 'の') {
        const nounBefore = tokens[i - 2];
        const isActivity = nounBefore && (
          nounBefore.pos_detail_1 === 'サ変接続' ||
          ['食事', '勉強', '仕事', '出発', '旅行', '会議', '授業', '水泳', '運転', '試合'].includes(nounBefore.surface_form)
        );
        if (isActivity) {
          hasMaeNi = true;
        }
      }
    }
  }

  const positionWords = [
    '上', '下', '後ろ', '中', '外', '隣', '近く', '間', '右', '左',
    'うえ', 'した', 'うしろ', 'なか', 'そと', 'となり', 'ちかく', 'あいだ', 'みぎ', 'ひだり'
  ];
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (positionWords.includes(t.surface_form) || t.surface_form === '木の下' || t.surface_form === '木の上') {
      tags.add('POSITION_NOUN');
    } else if (t.surface_form === '前' || t.surface_form === 'まえ') {
      if (hasExistVerb || !hasMaeNi) {
        tags.add('POSITION_NOUN');
      }
    }
  }

  // Lindungi [nomina]の[kata posisi] jika dibaca satu token oleh Kuromoji (misal 木の下)
  if (positionPhrasePattern.test(fullText)) {
    const match = fullText.match(positionPhrasePattern);
    const matchedWord = match ? match[1] : '';
    if (matchedWord === '前' || matchedWord === 'まえ') {
      if (hasExistVerb || !hasMaeNi) {
        tags.add('POSITION_NOUN');
      }
    } else {
      tags.add('POSITION_NOUN');
    }
  }

  for (const t of tokens) {
    if (t.surface_form === 'や' && t.pos === '助詞' && t.pos_detail_1 === '並立助詞') {
      tags.add('PARTICLE_YA');
    }
  }

  // --- LESSON 11 ---
  // COUNTER & DURATION & ADV_GURAI & DAKE_ONLY
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.pos_detail_1 === '数' || t.surface_form.match(/^[0-9]+$/)) {
      const next = tokens[i + 1];
      if (next && ['つ', '人', '枚', '台', '冊', '杯', '回', '番', '個'].includes(next.surface_form)) {
        tags.add('COUNTER');
      }
      if (next && ['年間', '時間', '分間', '週間', 'か月', 'ヶ月'].includes(next.surface_form)) {
        tags.add('DURATION');
      }
    }
    if (['ひとつ', 'ふたつ', 'みっつ', 'よっつ', 'いつつ', 'むっつ', 'ななつ', 'やつ', 'ここのつ', 'とお'].includes(t.surface_form)) {
      tags.add('COUNTER');
    }
    if (['一人', '二人', 'ひとり', 'ふたり'].includes(t.surface_form)) {
      tags.add('COUNTER');
    }
    if (t.surface_form === '1年' || t.surface_form === '一年') {
      tags.add('DURATION');
    }
  }
  if (hasSurface('ぐらい') || hasSurface('くらい')) tags.add('ADV_GURAI');
  if (hasSurface('だけ')) tags.add('DAKE_ONLY');

  // --- LESSON 12 ---
  // PAST_NOUN_NA: N / na-adj でした / だった / じゃありませんでした / ではありませんでした
  if (
    fullText.includes('じゃありませんでした') ||
    fullText.includes('ではありませんでした') ||
    fullText.includes('じゃ ありませんでした') ||
    fullText.includes('では ありませんでした')
  ) {
    tags.add('PAST_NOUN_NA');
    tags.add('NEG_JA_ARIMASEN');
  }
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'でし' && tokens[i + 1]?.surface_form === 'た') {
      const prev = tokens[i - 1];
      if (prev && (prev.pos === '名詞' || prev.pos_detail_1 === '形容動詞語幹')) {
        tags.add('PAST_NOUN_NA');
      }
    }
    if (t.surface_form === 'だっ' && tokens[i + 1]?.surface_form === 'た') {
      const prev = tokens[i - 1];
      if (prev && (prev.pos === '名詞' || prev.pos_detail_1 === '形容動詞語幹')) {
        tags.add('PAST_NOUN_NA');
      }
    }
  }

  if (hasSurface('より')) tags.add('COMPARE_YORI');
  if (hasSurface('ほう') || hasSurface('方')) tags.add('COMPARE_HOU');
  if (hasSurface('いちばん') || hasSurface('一番')) tags.add('SUPERLATIVE_ICHIBAN');
  if (hasSurface('どちら') || hasSurface('どっち')) tags.add('WH_DOCHIRA');

  // --- LESSON 13 ---
  if (fullText.includes('欲しい') || fullText.includes('ほしい')) {
    tags.add('WANT_HOSHII');
  }

  for (const t of tokens) {
    if (t.basic_form === 'たい' && (t.pos === '助動詞' || t.surface_form.includes('たい'))) {
      tags.add('WANT_TAI');
    }
  }

  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'に' && t.pos === '助詞') {
      const prev = tokens[i - 1];
      const next = tokens[i + 1];
      if (prev && (prev.pos === '動詞' || prev.pos_detail_1 === 'サ変接続') &&
          next && (['行く', '来る', '帰る'].includes(next.basic_form) || ['行き', '来', '帰り'].includes(next.surface_form))) {
        tags.add('PURPOSE_NI_IKU');
      }
    }
  }

  // --- LESSON 14 ---
  // TE_FORM & TE_KUDASAI & TE_IMASU_PROGRESSIVE
  let teCount = 0;
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.pos === '助詞' && t.pos_detail_1 === '接続助詞' && (t.surface_form === 'て' || t.surface_form === 'で')) {
      const prev = tokens[i - 1];
      const next = tokens[i + 1];
      if (prev && prev.pos === '動詞') {
        teCount++;
        tags.add('TE_FORM');
        if (next && (next.surface_form === 'ください' || next.surface_form === '頂戴')) {
          tags.add('TE_KUDASAI');
        }
        if (next && (next.basic_form === 'いる' || next.surface_form === 'い')) {
          const stateVerbs = ['持つ', '住む', '知る', '結婚する', '勤める'];
          if (stateVerbs.includes(prev.basic_form)) {
            tags.add('TE_IMASU_STATE');
          } else {
            tags.add('TE_IMASU_PROGRESSIVE');
          }
        }
        if (next && next.surface_form === 'も' && tokens[i + 2]?.surface_form === 'いい') {
          tags.add('TE_MO_II');
        }
        if (next && next.surface_form === 'は' && (tokens[i + 2]?.surface_form === 'いけ' || tokens[i + 2]?.surface_form === 'だめ')) {
          tags.add('TE_WA_IKEMASEN');
        }
        if (next && next.surface_form === 'から') {
          tags.add('TE_KARA');
        }
        if (next && next.basic_form === 'あげる') {
          tags.add('TE_AGEMASU');
        }
        if (next && next.basic_form === 'もらう') {
          tags.add('TE_MORAIMASU');
        }
        if (next && next.basic_form === 'くれる') {
          tags.add('TE_KUREMASU');
        }
      }
    }
  }

  // TE_SEQUENCE: urutan kegiatan jika ada >= 2 Vて dalam 1 kalimat
  if (teCount >= 2) {
    tags.add('TE_SEQUENCE');
  }

  // --- LESSON 16 ---
  // ADJ_TE: 軽くて、便利です
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'て' && tokens[i - 1]?.pos === '形容詞') {
      tags.add('ADJ_TE');
    }
    if (t.surface_form === 'で' && tokens[i - 1]?.pos_detail_1 === '形容動詞語幹') {
      tags.add('ADJ_TE');
    }
  }

  // PARTICLE_GA_WA_SUBJECT: N1 は N2 が [sifat deskriptif] (mis. 大阪は食べ物がおいしいです)
  // Kecuali 好き/上手/わかる yang masuk PARTICLE_GA_OBJ
  if (fullText.match(/.*は.*が.*(おいしい|高い|広い|長い|大きい|小さい|重い|軽い|きれい|静か)/)) {
    if (!tags.has('PARTICLE_GA_OBJ')) {
      tags.add('PARTICLE_GA_WA_SUBJECT');
    }
  }

  // --- LESSON 17 ---
  // NAI_FORM & NAIDE_KUDASAI & NAKEREBA_NARANAI & NAKUTE_MO_II
  if (fullText.includes('ないでください') || fullText.includes('ないで ください')) {
    tags.add('NAI_FORM');
    tags.add('NAIDE_KUDASAI');
  }
  if (fullText.includes('なければなりません') || fullText.includes('なければならない') || fullText.includes('なければ なりません')) {
    tags.add('NAI_FORM');
    tags.add('NAKEREBA_NARANAI');
  }
  if (fullText.includes('なくてもいい') || fullText.includes('なくても いい')) {
    tags.add('NAI_FORM');
    tags.add('NAKUTE_MO_II');
  }
  for (const t of tokens) {
    if (t.basic_form === 'ない' && t.pos === '助動詞') {
      // Pastikan bukan bagian dari negative lampau atau adj-neg
      if (!fullText.includes('なかった') && !fullText.includes('くない')) {
        tags.add('NAI_FORM');
      }
    }
  }

  // --- LESSON 18 ---
  // DICT_FORM & KOTO_GA_DEKIRU & SHUMI_KOTO & MAE_NI
  let hasKotoDekiru = false;
  let hasShumiKoto = false;
  if (fullText.includes('ことが') && (fullText.includes('できます') || fullText.includes('できる'))) {
    tags.add('DICT_FORM');
    tags.add('KOTO_GA_DEKIRU');
    hasKotoDekiru = true;
  }
  if (fullText.includes('趣味') && fullText.includes('ことです')) {
    tags.add('DICT_FORM');
    tags.add('SHUMI_KOTO');
    hasShumiKoto = true;
  }
  if (hasMaeNi) {
    tags.add('MAE_NI');
  }

  // --- LESSON 19 ---
  // TA_FORM & TA_KOTO_GA_ARU & TARI_TARI & NARIMASU
  if (fullText.includes('たことが') || fullText.includes('た ことが')) {
    tags.add('TA_FORM');
    tags.add('TA_KOTO_GA_ARU');
  }
  if (fullText.includes('たり') && fullText.includes('します')) {
    tags.add('TARI_TARI');
  }
  if (fullText.includes('なります') || fullText.includes('なった') || fullText.includes('なる')) {
    tags.add('NARIMASU');
  }

  // TA_FORM: Bentuk lampau biasa kata kerja (V-た/V-だ), BUKAN polite ました atau でした
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.pos === '助動詞' && t.basic_form === 'た') {
      const prev = tokens[i - 1];
      // Jika didahului 動詞 dan BUKAN 'まし' (VERB_MASHITA) dan BUKAN 'でし' (PAST_NOUN_NA)
      if (prev && prev.pos === '動詞' && prev.basic_form !== 'ます') {
        tags.add('TA_FORM');
      }
    }
  }

  // --- LESSON 20 ---
  // PLAIN_STYLE: akhir kalimat berupa だ / だった / じゃない / V biasa / i-adj biasa (tanpa です/ます)
  const lastMeaningfulToken = [...tokens].reverse().find(t => t.pos !== '記号');
  if (lastMeaningfulToken) {
    if (lastMeaningfulToken.surface_form === 'だ' || lastMeaningfulToken.surface_form === 'だった' ||
        lastMeaningfulToken.surface_form === 'ない' || lastMeaningfulToken.surface_form === 'なかった' ||
        (lastMeaningfulToken.pos === '動詞' && lastMeaningfulToken.conjugated_form === '基本形') ||
        (lastMeaningfulToken.pos === '形容詞' && lastMeaningfulToken.surface_form.endsWith('い'))) {
      tags.add('PLAIN_STYLE');
    }
  }

  // --- LESSON 21 ---
  // TO_OMOIMASU & TO_IIMASU & DESHOU
  if (fullText.includes('と思います') || fullText.includes('と思う')) {
    tags.add('TO_OMOIMASU');
  }
  if (fullText.includes('と言いました') || fullText.includes('と言う') || fullText.includes('と言い')) {
    tags.add('TO_IIMASU');
  }
  if (fullText.includes('でしょう')) {
    tags.add('DESHOU');
  }

  // --- LESSON 22 ---
  // REL_CLAUSE: klausa pewatas nomina (V biasa + N)
  // Kecuali 'こと' pada ことができる, 趣味は...ことです, atau たことがある
  const hasKotoPattern = hasKotoDekiru || hasShumiKoto || fullText.includes('ことがある') || fullText.includes('ことがあります');
  for (let i = 0; i < len - 1; i++) {
    const t = tokens[i];
    const next = tokens[i + 1];
    if (t.pos === '動詞' && (t.conjugated_form === '基本形' || t.surface_form.endsWith('た')) && next && next.pos === '名詞') {
      if (!hasKotoPattern || next.surface_form !== 'こと') {
        if (!['まえ', '前', 'とき'].includes(next.surface_form)) {
          tags.add('REL_CLAUSE');
        }
      }
    }
    if (t.surface_form === 'た' && t.pos === '助動詞' && tokens[i - 1]?.pos === '動詞' && next && next.pos === '名詞') {
      if (!hasKotoPattern || next.surface_form !== 'こと') {
        if (!['まえ', '前', 'とき'].includes(next.surface_form)) {
          tags.add('REL_CLAUSE');
        }
      }
    }
  }


  // --- LESSON 23 ---
  // TOKI & TO_CONDITIONAL
  if (fullText.includes('とき、') || fullText.includes('とき')) {
    for (let i = 0; i < len; i++) {
      if (tokens[i].surface_form === 'とき' && tokens[i - 1]?.pos === '動詞') {
        tags.add('TOKI');
      }
    }
  }
  for (let i = 0; i < len; i++) {
    if (tokens[i].surface_form === 'と' && tokens[i].pos_detail_1 === '接続助詞') {
      tags.add('TO_CONDITIONAL');
    }
  }

  // --- LESSON 24 ---
  // KUREMASU
  for (const t of tokens) {
    if (t.basic_form === 'くれる' && t.pos === '動詞') {
      tags.add('KUREMASU');
    }
  }

  // --- LESSON 25 ---
  // TARA_COND & TEMO_CONCESSIVE & MOSHI
  for (let i = 0; i < len; i++) {
    const t = tokens[i];
    if (t.surface_form === 'たら' && t.pos === '助動詞') {
      tags.add('TARA_COND');
    }
    if (t.surface_form === 'て' && tokens[i + 1]?.surface_form === 'も') {
      const prev = tokens[i - 1];
      if (prev && prev.pos === '動詞') {
        if (tokens[i + 2]?.surface_form !== 'いい') {
          tags.add('TEMO_CONCESSIVE');
        }
      }
    }
  }
  if (hasSurface('もし')) tags.add('MOSHI');

  return { tags, unknown };
}
