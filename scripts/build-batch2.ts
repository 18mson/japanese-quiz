import fs from 'fs';
import path from 'path';

// 1. Load current pools.json and templates.json
const poolsPath = path.resolve('scripts/data/pools.json');
const templatesPath = path.resolve('scripts/templates.json');

const poolsData = JSON.parse(fs.readFileSync(poolsPath, 'utf-8'));
const templatesData = JSON.parse(fs.readFileSync(templatesPath, 'utf-8'));

// 2. Define New Pools for Batch 2 (Bab 17 - 20)
const newPools = {
  // Bab 17
  naide_act: {
    lesson: 17,
    items: [
      { jp: 'ここで写真を撮ら', kana: 'ここでしゃしんをとら', id: 'mengambil foto di sini' },
      { jp: 'ここに車を止め', kana: 'ここにくるまをとめ', id: 'memarkir mobil di sini' },
      { jp: 'たばこを吸わ', kana: 'たばこをすわ', id: 'merokok' },
      { jp: '心配し', kana: 'しんぱいし', id: 'khawatir' },
      { jp: '無理をし', kana: 'むりをし', id: 'memaksakan diri' },
      { jp: 'パスポートを忘れ', kana: 'パスポートをわすれ', id: 'melupakan paspor' },
      { jp: 'ここに入ら', kana: 'ここにはいら', id: 'masuk ke sini' },
      { jp: 'お酒を飲ま', kana: 'おさけをのま', id: 'minum alkohol' },
      { jp: '傘を忘れ', kana: 'かさをわすれ', id: 'melupakan payung' },
      { jp: 'ここに荷物を置か', kana: 'ここににもつをおか', id: 'menaruh barang di sini' }
    ]
  },
  nakereba_act: {
    lesson: 17,
    items: [
      { jp: '薬を飲ま', kana: 'くすりをのま', id: 'minum obat' },
      { jp: '病院へ行か', kana: 'びょういんへいか', id: 'pergi ke rumah sakit' },
      { jp: 'パスポートを見せ', kana: 'パスポートをみせ', id: 'menunjukkan paspor' },
      { jp: '毎日日本語を勉強し', kana: 'まいにちにほんごをべんきょうし', id: 'setiap hari belajar bahasa Jepang' },
      { jp: '本を返さ', kana: 'ほんをかえさ', id: 'mengembalikan buku' },
      { jp: 'お金を払わ', kana: 'おかねをはらわ', id: 'membayar uang' },
      { jp: '早く起き', kana: 'はやくおき', id: 'bangun cepat / pagi' },
      { jp: 'レポートを出さ', kana: 'レポートをださ', id: 'mengumpulkan laporan' },
      { jp: 'うちに帰ら', kana: 'うちにかえら', id: 'pulang ke rumah' }
    ]
  },
  nakutemo_act: {
    lesson: 17,
    items: [
      { jp: '明日来', kana: 'あしたこ', id: 'besok datang' },
      { jp: '急が', kana: 'いそが', id: 'terburu-buru' },
      { jp: '靴を脱が', kana: 'くつをぬが', id: 'melepas sepatu' },
      { jp: '傘を持って行か', kana: 'かさをもっていか', id: 'membawa payung pergi' },
      { jp: '残業し', kana: 'ざんぎょうし', id: 'lembur' },
      { jp: '日曜日働か', kana: 'にちようびはたらか', id: 'bekerja hari Minggu' },
      { jp: '名前を書か', kana: 'なまえをかか', id: 'menulis nama' },
      { jp: 'お金を払わ', kana: 'おかねをはらわ', id: 'membayar uang' }
    ]
  },
  deadline_time: {
    lesson: 17,
    items: [
      { jp: '土曜日までに', kana: 'どようびまでに', id: 'sebelum hari Sabtu' },
      { jp: '5時までに', kana: 'ごじまでに', id: 'sebelum jam 5' },
      { jp: '明日までに', kana: 'あしたまでに', id: 'sebelum besok' },
      { jp: '来週の月曜日までに', kana: 'らいしゅうのげつようびまでに', id: 'sebelum hari Senin depan' },
      { jp: '今週の金曜日までに', kana: 'こんしゅうのきんようびまでに', id: 'sebelum hari Jumat minggu ini' }
    ]
  },
  deadline_duty: {
    lesson: 17,
    items: [
      { jp: 'レポートを出さなければなりません', kana: 'レポートをださなければなりません', id: 'harus mengumpulkan laporan' },
      { jp: '本を返さなければなりません', kana: 'ほんをかえさなければなりません', id: 'harus mengembalikan buku' },
      { jp: 'お金を払わなければなりません', kana: 'おかねをはらわなければなりません', id: 'harus membayar uang' },
      { jp: '荷物を送らなければなりません', kana: 'にもつをおくらなければなりません', id: 'harus mengirim barang' }
    ]
  },

  // Bab 18
  can_act: {
    lesson: 18,
    items: [
      { jp: '漢字を読む', kana: 'かんじをよむ', id: 'membaca kanji' },
      { jp: '日本語を話す', kana: 'にほんごをはなす', id: 'berbicara bahasa Jepang' },
      { jp: 'ピアノを弾く', kana: 'ピアノをひく', id: 'memainkan piano' },
      { jp: '車を運転する', kana: 'くるまをうんてんする', id: 'mengemudikan mobil' },
      { jp: '泳ぐ', kana: 'およぐ', id: 'berenang' },
      { jp: '日本料理を作る', kana: 'にほんりょうりをつくる', id: 'membuat masakan Jepang' },
      { jp: 'スキーをする', kana: 'スキーをする', id: 'bermain ski' },
      { jp: 'カードで払う', kana: 'カードではらう', id: 'membayar dengan kartu' },
      { jp: '歌を歌う', kana: 'うたをうたう', id: 'menyanyikan lagu' }
    ]
  },
  hobby_act: {
    lesson: 18,
    items: [
      { jp: '音楽を聞く', kana: 'おんがくをきく', id: 'mendengarkan musik' },
      { jp: '映画を見る', kana: 'えいがをみる', id: 'menonton film' },
      { jp: '写真を撮る', kana: 'しゃしんをとる', id: 'mengambil foto' },
      { jp: '本を読む', kana: 'ほんをよむ', id: 'membaca buku' },
      { jp: '料理を作る', kana: 'りょうりをつくる', id: 'memasak' },
      { jp: '旅行をする', kana: 'りょこうをする', id: 'berwisata' },
      { jp: '絵を描く', kana: 'えをかく', id: 'menggambar' },
      { jp: '古い切手を集める', kana: 'ふるいきってをあつめる', id: 'mengumpulkan perangko kuno' }
    ]
  },
  before_act: {
    lesson: 18,
    items: [
      { jp: '寝る前に', kana: 'ねるまえに', id: 'sebelum tidur' },
      { jp: 'ご飯を食べる前に', kana: 'ごはんをたべるまえに', id: 'sebelum makan' },
      { jp: '国へ帰る前に', kana: 'くにへかえるまえに', id: 'sebelum pulang ke negara asal' },
      { jp: '旅行に行く前に', kana: 'りょこうにいくまえに', id: 'sebelum pergi berwisata' },
      { jp: '泳ぐ前に', kana: 'およぐまえに', id: 'sebelum berenang' }
    ]
  },
  before_main: {
    lesson: 18,
    items: [
      { jp: '本を読みます', kana: 'ほんをよみます', id: 'membaca buku' },
      { jp: '手を洗います', kana: 'てをあらいます', id: 'mencuci tangan' },
      { jp: 'お祈りをします', kana: 'おいのりをします', id: 'berdoa' },
      { jp: 'お土産を買います', kana: 'おみやげをかいます', id: 'membeli oleh-oleh' },
      { jp: '準備体操をします', kana: 'じゅんびたいそうをします', id: 'senam pemanasan' }
    ]
  },

  // Bab 19
  exp_act: {
    lesson: 19,
    items: [
      { jp: '日本へ行った', kana: 'にほんへいった', id: 'pergi ke Jepang' },
      { jp: '富士山に登った', kana: 'ふじさんにのぼった', id: 'mendaki Gunung Fuji' },
      { jp: 'すしを食べた', kana: 'すしをたべた', id: 'makan sushi' },
      { jp: 'お酒を飲んだ', kana: 'おさけをのんだ', id: 'minum alkohol' },
      { jp: '歌舞伎を見た', kana: 'かぶきをみた', id: 'menonton kabuki' },
      { jp: '馬に乗った', kana: 'うまにのった', id: 'menunggang kuda' },
      { jp: '温泉に入った', kana: 'おんせんにはいった', id: 'berendam di onsen' },
      { jp: '着物を着た', kana: 'きものをきた', id: 'memakai kimono' },
      { jp: 'パチンコをした', kana: 'パチンコをした', id: 'bermain pachinko' }
    ]
  },
  tari_pair: {
    lesson: 19,
    items: [
      { jp: '本を読んだり、音楽を聞いたり', kana: 'ほんをよんだり、おんがくをきいたり', id: 'membaca buku, mendengarkan musik' },
      { jp: 'テニスをしたり、散歩したり', kana: 'テニスをしたり、さんぽしたり', id: 'bermain tenis, berjalan-jalan' },
      { jp: '買い物をしたり、映画を見たり', kana: 'かいものをしたり、えいがをみたり', id: 'berbelanja, menonton film' },
      { jp: '掃除したり、洗濯したり', kana: 'そうじしたり、せんたくしたり', id: 'bersih-bersih, mencuci pakaian' },
      { jp: 'テレビを見たり、手紙を書いたり', kana: 'テレビをみたり、てがみをかいたり', id: 'menonton TV, menulis surat' },
      { jp: '泳いだり、釣りをしたり', kana: 'およいだり、つりをしたり', id: 'berenang, memancing' }
    ]
  },
  become_adj: {
    lesson: 19,
    items: [
      { jp: '寒く', kana: 'さむく', id: 'dingin' },
      { jp: '暖かく', kana: 'あたたかく', id: 'hangat' },
      { jp: '静かに', kana: 'しずかに', id: 'tenang' },
      { jp: '元気に', kana: 'げんきに', id: 'sehat' },
      { jp: 'きれいに', kana: 'きれいに', id: 'cantik / bersih' },
      { jp: '上手に', kana: 'じょうずに', id: 'mahir / pintar' }
    ]
  },

  // Bab 20
  plain_v_statement: {
    lesson: 20,
    items: [
      { jp: '明日東京へ行く', kana: 'あしたとうきょうへいく', id: 'besok pergi ke Tokyo' },
      { jp: '毎日日本語を勉強する', kana: 'まいにちにほんごをべんきょうする', id: 'setiap hari belajar bahasa Jepang' },
      { jp: '昨日映画を見た', kana: 'きのうえいがをみた', id: 'kemarin menonton film' },
      { jp: '朝ご飯を食べなかった', kana: 'あさごはんをたべなかった', id: 'tadi pagi tidak makan sarapan' },
      { jp: 'お酒を飲まない', kana: 'おさけをのまない', id: 'tidak minum alkohol' },
      { jp: '富士山に登った', kana: 'ふじさんにのぼった', id: 'mendaki Gunung Fuji' }
    ]
  },
  plain_adj_statement: {
    lesson: 20,
    items: [
      { jp: '日本料理はおいしい', kana: 'にほんりょうりはおいしい', id: 'masakan Jepang enak' },
      { jp: '昨日は忙しかった', kana: 'きのうはいそがしかった', id: 'kemarin sibuk' },
      { jp: '北海道は寒い', kana: 'ほっかいどうはさむい', id: 'Hokkaido dingin' },
      { jp: 'この部屋は静かだ', kana: 'このへやはしずかだ', id: 'kamar ini tenang' },
      { jp: '今日は暇だ', kana: 'きょうはひまだ', id: 'hari ini senggang' }
    ]
  }
};

// 3. Define New Templates for Batch 2 (Bab 17 - 20)
const newTemplates = [
  // ==================== BAB 17 ====================
  {
    tid: 'L17-T1',
    lesson: 17,
    extra: false,
    slots: { ACT: 'naide_act' },
    jp: 'どうぞ{ACT}ないでください。',
    id_text: 'Silakan tolong jangan {ACT}.',
    must_tags: ['NAIDE_KUDASAI']
  },
  {
    tid: 'L17-T2',
    lesson: 17,
    extra: false,
    slots: { ACT: 'naide_act' },
    jp: 'ここで{ACT}ないでください。',
    id_text: 'Tolong jangan {ACT} di sini.',
    must_tags: ['NAIDE_KUDASAI']
  },
  {
    tid: 'L17-T3',
    lesson: 17,
    extra: false,
    slots: { P: 'person_name', ACT: 'naide_act' },
    jp: '{P}、{ACT}ないでください。',
    id_text: '{P}, tolong jangan {ACT}.',
    must_tags: ['NAIDE_KUDASAI']
  },
  {
    tid: 'L17-T4',
    lesson: 17,
    extra: false,
    slots: { P: 'person_any', ACT: 'nakereba_act' },
    jp: '{P}は{ACT}なければなりません。',
    id_text: '{P} harus {ACT}.',
    must_tags: ['NAKEREBA_NARANAI']
  },
  {
    tid: 'L17-T5',
    lesson: 17,
    extra: false,
    slots: { P: 'person_ask', ACT: 'nakereba_act' },
    jp: '{P}は{ACT}なければなりませんか。',
    id_text: 'Apakah {P} harus {ACT}?',
    must_tags: ['NAKEREBA_NARANAI', 'QUESTION_KA']
  },
  {
    tid: 'L17-T6',
    lesson: 17,
    extra: false,
    slots: { P: 'person_any', ACT: 'nakutemo_act' },
    jp: '{P}は{ACT}なくてもいいです。',
    id_text: '{P} tidak perlu {ACT}.',
    must_tags: ['NAKUTE_MO_II']
  },
  {
    tid: 'L17-T7',
    lesson: 17,
    extra: false,
    slots: { P: 'person_ask', ACT: 'nakutemo_act' },
    jp: '{P}は{ACT}なくてもいいですか。',
    id_text: 'Apakah {P} tidak perlu {ACT}?',
    must_tags: ['NAKUTE_MO_II', 'QUESTION_KA']
  },
  {
    tid: 'L17-T8',
    lesson: 17,
    extra: false,
    slots: { P: 'person_any', TIME: 'deadline_time', DUTY: 'deadline_duty' },
    jp: '{P}は{TIME}{DUTY}。',
    id_text: '{P} {TIME} {DUTY}.',
    must_tags: ['PARTICLE_MADE_NI', 'NAKEREBA_NARANAI']
  },
  {
    tid: 'L17-T9',
    lesson: 17,
    extra: false,
    slots: {},
    jp: '心配しないでください。',
    jp_kana: 'しんぱいしないでください。',
    id_text: 'Jangan khawatir.',
    must_tags: ['NAIDE_KUDASAI']
  },
  {
    tid: 'L17-T10',
    lesson: 17,
    extra: false,
    slots: {},
    jp: '無理をしないでください。',
    jp_kana: 'むりをしないでください。',
    id_text: 'Jangan memaksakan diri.',
    must_tags: ['NAIDE_KUDASAI']
  },

  // ==================== BAB 18 ====================
  {
    tid: 'L18-T1',
    lesson: 18,
    extra: false,
    slots: { P: 'person_any', ACT: 'can_act' },
    jp: '{P}は{ACT}ことができます。',
    id_text: '{P} bisa {ACT}.',
    must_tags: ['KOTO_GA_DEKIRU']
  },
  {
    tid: 'L18-T2',
    lesson: 18,
    extra: false,
    slots: { P: 'person_any', ACT: 'can_act' },
    jp: '{P}は{ACT}ことができません。',
    id_text: '{P} tidak bisa {ACT}.',
    must_tags: ['KOTO_GA_DEKIRU', 'VERB_MASEN']
  },
  {
    tid: 'L18-T3',
    lesson: 18,
    extra: false,
    slots: { P: 'person_ask', ACT: 'can_act' },
    jp: '{P}は{ACT}ことができますか。',
    id_text: 'Apakah {P} bisa {ACT}?',
    must_tags: ['KOTO_GA_DEKIRU', 'QUESTION_KA']
  },
  {
    tid: 'L18-T4',
    lesson: 18,
    extra: false,
    slots: { P: 'person_any', HOBBY: 'hobby_act' },
    jp: '{P}の趣味は{HOBBY}ことです。',
    jp_kana: '{P}のしゅみは{HOBBY}ことです。',
    id_text: 'Hobi {P} adalah {HOBBY}.',
    must_tags: ['SHUMI_KOTO']
  },
  {
    tid: 'L18-T5',
    lesson: 18,
    extra: false,
    slots: { P: 'person_ask' },
    jp: '{P}の趣味は何ですか。',
    jp_kana: '{P}のしゅみはなんですか。',
    id_text: 'Apakah hobi {P}?',
    must_tags: ['QUESTION_KA']
  },
  {
    tid: 'L18-T6',
    lesson: 18,
    extra: false,
    slots: { P: 'person_any', B_ACT: 'before_act', MAIN: 'before_main' },
    jp: '{P}は{B_ACT}、{MAIN}。',
    id_text: '{P} {B_ACT}, {MAIN}.',
    must_tags: ['MAE_NI']
  },
  {
    tid: 'L18-T7',
    lesson: 18,
    extra: false,
    slots: { ACT: 'can_act' },
    jp: 'ここで{ACT}ことができますか。',
    id_text: 'Apakah di sini bisa {ACT}?',
    must_tags: ['KOTO_GA_DEKIRU', 'QUESTION_KA']
  },
  {
    tid: 'L18-T8',
    lesson: 18,
    extra: false,
    slots: {},
    jp: 'カードで払うことができますか。',
    jp_kana: 'カードではらうことができますか。',
    id_text: 'Apakah bisa membayar dengan kartu?',
    must_tags: ['KOTO_GA_DEKIRU', 'QUESTION_KA']
  },

  // ==================== BAB 19 ====================
  {
    tid: 'L19-T1',
    lesson: 19,
    extra: false,
    slots: { P: 'person_any', ACT: 'exp_act' },
    jp: '{P}は{ACT}ことがあります。',
    id_text: '{P} pernah {ACT}.',
    must_tags: ['TA_KOTO_GA_ARU']
  },
  {
    tid: 'L19-T2',
    lesson: 19,
    extra: false,
    slots: { P: 'person_any', ACT: 'exp_act' },
    jp: '{P}は一度も{ACT}ことがありません。',
    jp_kana: '{P}はいちども{ACT}ことがありません。',
    id_text: '{P} belum pernah sekalipun {ACT}.',
    must_tags: ['TA_KOTO_GA_ARU', 'VERB_MASEN']
  },
  {
    tid: 'L19-T3',
    lesson: 19,
    extra: false,
    slots: { P: 'person_ask', ACT: 'exp_act' },
    jp: '{P}は{ACT}ことがありますか。',
    id_text: 'Apakah {P} pernah {ACT}?',
    must_tags: ['TA_KOTO_GA_ARU', 'QUESTION_KA']
  },
  {
    tid: 'L19-T4',
    lesson: 19,
    extra: false,
    slots: { P: 'person_any', TARI: 'tari_pair' },
    jp: '{P}は休みの日に{TARI}します。',
    jp_kana: '{P}はやすみのひに{TARI}します。',
    id_text: '{P} pada hari libur {TARI}.',
    must_tags: ['TARI_TARI']
  },
  {
    tid: 'L19-T5',
    lesson: 19,
    extra: false,
    slots: { P: 'person_any', TARI: 'tari_pair' },
    jp: '{P}は日曜日{TARI}しました。',
    jp_kana: '{P}はにちようび{TARI}しました。',
    id_text: '{P} hari Minggu {TARI}.',
    must_tags: ['TARI_TARI']
  },
  {
    tid: 'L19-T6',
    lesson: 19,
    extra: false,
    slots: { ADJ: 'become_adj' },
    jp: 'だんだん{ADJ}なりました。',
    id_text: 'Sedikit demi sedikit menjadi {ADJ}.',
    must_tags: ['NARIMASU']
  },
  {
    tid: 'L19-T7',
    lesson: 19,
    extra: false,
    slots: { ADJ: 'become_adj' },
    jp: 'これから{ADJ}なります。',
    id_text: 'Mulai sekarang akan menjadi {ADJ}.',
    must_tags: ['NARIMASU']
  },
  {
    tid: 'L19-T8',
    lesson: 19,
    extra: false,
    slots: { P: 'person_any' },
    jp: '{P}は日本語が上手になりました。',
    jp_kana: '{P}はにほんごがじょうずになりました。',
    id_text: '{P} sudah menjadi pintar bahasa Jepang.',
    must_tags: ['NARIMASU']
  },

  // ==================== BAB 20 ====================
  {
    tid: 'L20-T1',
    lesson: 20,
    extra: false,
    slots: { P: 'person_any', ACT: 'plain_v_statement' },
    jp: '{P}は{ACT}。',
    id_text: '{P} {ACT}.',
    must_tags: ['PLAIN_STYLE']
  },
  {
    tid: 'L20-T2',
    lesson: 20,
    extra: false,
    slots: { ADJ: 'plain_adj_statement' },
    jp: '{ADJ}。',
    id_text: '{ADJ}.',
    must_tags: ['PLAIN_STYLE']
  },
  {
    tid: 'L20-T3',
    lesson: 20,
    extra: false,
    slots: {},
    jp: '明日東京へ行く？',
    jp_kana: 'あしたとうきょうへいく？',
    id_text: 'Besok kamu pergi ke Tokyo?',
    must_tags: ['PLAIN_STYLE']
  },
  {
    tid: 'L20-T4',
    lesson: 20,
    extra: false,
    slots: {},
    jp: 'うん、行く。',
    jp_kana: 'うん、いく。',
    id_text: 'Ya, pergi.',
    must_tags: ['PLAIN_STYLE']
  },
  {
    tid: 'L20-T5',
    lesson: 20,
    extra: false,
    slots: {},
    jp: 'ううん、行かない。',
    jp_kana: 'ううん、いかない。',
    id_text: 'Tidak, tidak pergi.',
    must_tags: ['PLAIN_STYLE']
  },
  {
    tid: 'L20-T6',
    lesson: 20,
    extra: false,
    slots: {},
    jp: '今何してる？',
    jp_kana: 'いまなにしてる？',
    id_text: 'Sekarang kamu lagi ngapain?',
    must_tags: ['PLAIN_STYLE']
  },
  {
    tid: 'L20-T7',
    lesson: 20,
    extra: false,
    slots: {},
    jp: '日本語を勉強してる。',
    jp_kana: 'にほんごをべんきょうしてる。',
    id_text: 'Sedang belajar bahasa Jepang.',
    must_tags: ['PLAIN_STYLE']
  },
  {
    tid: 'L20-T8',
    lesson: 20,
    extra: false,
    slots: {},
    jp: '富士山に登ったことがある？',
    jp_kana: 'ふじさんにのぼったことがある？',
    id_text: 'Apakah pernah mendaki Gunung Fuji?',
    must_tags: ['PLAIN_STYLE', 'TA_KOTO_GA_ARU']
  },
  {
    tid: 'L20-T9',
    lesson: 20,
    extra: false,
    slots: {},
    jp: 'うん、ある。',
    jp_kana: 'うん、ある。',
    id_text: 'Ya, pernah.',
    must_tags: ['PLAIN_STYLE']
  },
  {
    tid: 'L20-T10',
    lesson: 20,
    extra: false,
    slots: {},
    jp: 'ううん、一度もない。',
    jp_kana: 'ううん、いちどもない。',
    id_text: 'Tidak, belum pernah sekalipun.',
    must_tags: ['PLAIN_STYLE']
  },
  {
    tid: 'L20-T11',
    lesson: 20,
    extra: false,
    slots: { P: 'person_any', ACT: 'can_act' },
    jp: '{P}は{ACT}ことができる？',
    id_text: 'Apakah {P} bisa {ACT}?',
    must_tags: ['PLAIN_STYLE', 'KOTO_GA_DEKIRU']
  },
  {
    tid: 'L20-T12',
    lesson: 20,
    extra: false,
    slots: { P: 'person_any', ACT: 'can_act' },
    jp: '{P}は{ACT}ことができる。',
    id_text: '{P} bisa {ACT}.',
    must_tags: ['PLAIN_STYLE', 'KOTO_GA_DEKIRU']
  }
];

// 4. Merge pools and templates
Object.assign(poolsData.pools, newPools);

// Filter out existing templates with same tid if re-running
const existingTids = new Set(newTemplates.map(t => t.tid));
templatesData.templates = templatesData.templates.filter(t => !existingTids.has(t.tid));
templatesData.templates.push(...newTemplates);

fs.writeFileSync(poolsPath, JSON.stringify(poolsData, null, 2), 'utf-8');
fs.writeFileSync(templatesPath, JSON.stringify(templatesData, null, 2), 'utf-8');

console.log('Successfully merged Batch 2 pools and templates into pools.json and templates.json!');

