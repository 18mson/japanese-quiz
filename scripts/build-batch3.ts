import fs from 'fs';
import path from 'path';

// 1. Load current pools.json and templates.json
const poolsPath = path.resolve('scripts/data/pools.json');
const templatesPath = path.resolve('scripts/templates.json');

const poolsData = JSON.parse(fs.readFileSync(poolsPath, 'utf-8'));
const templatesData = JSON.parse(fs.readFileSync(templatesPath, 'utf-8'));

// 2. Define New Pools for Batch 3 (Bab 21 - 25)
const newPools = {
  // Bab 21
  think_opinion: {
    lesson: 21,
    items: [
      { jp: 'あした雨が降る', kana: 'あしたあめがふる', id: 'besok hujan turun' },
      { jp: '日本は物価が高い', kana: 'にほんはぶっかがたかい', id: 'harga barang di Jepang mahal' },
      { jp: '山田さんは来ない', kana: 'やまださんはこない', id: 'Yamada-san tidak akan datang' },
      { jp: 'この映画はおもしろい', kana: 'このえいがおもしろい', id: 'film ini menarik' },
      { jp: '会議はもう終わった', kana: 'かいぎはもうおわった', id: 'rapat sudah selesai' },
      { jp: '新しい車は便利だ', kana: 'あたらしいくるまはべんりだ', id: 'mobil baru praktis' },
      { jp: '日本が勝つ', kana: 'にほんがかつ', id: 'Jepang akan menang' },
      { jp: '日本語は難しい', kana: 'にほんごはむずかしい', id: 'bahasa Jepang sulit' },
      { jp: 'サントスさんは親切だ', kana: 'サントスさんはしんせつだ', id: 'Santos-san ramah' }
    ]
  },
  quote_statement: {
    lesson: 21,
    items: [
      { jp: '来週アメリカへ出張する', kana: 'らいしゅうアメリカへしゅっちょうする', id: 'minggu depan dinas ke Amerika' },
      { jp: '明日は休みだ', kana: 'あしたはやすみだ', id: 'besok libur' },
      { jp: 'もうすぐ結婚する', kana: 'もうすぐけっこんする', id: 'segera akan menikah' },
      { jp: 'ちょっと疲れた', kana: 'ちょっとつかれた', id: 'agak lelah' },
      { jp: 'パーティーに行かない', kana: 'パーティーにいかない', id: 'tidak pergi ke pesta' },
      { jp: '日本はおもしろい', kana: 'にほんはおもしろい', id: 'Jepang menyenangkan' },
      { jp: '車が故障した', kana: 'くるまがこしょうした', id: 'mobilnya rusak' }
    ]
  },

  // Bab 22
  rel_item: {
    lesson: 22,
    items: [
      { jp: '母が作ったケーキ', kana: 'ははがつくったケーキ', id: 'kue yang dibuat ibu' },
      { jp: '昨日買った本', kana: 'きのうかったほん', id: 'buku yang dibeli kemarin' },
      { jp: '先週撮った写真', kana: 'せんしゅうとったしゃしん', id: 'foto yang diambil minggu lalu' },
      { jp: 'わたしが住んでいる部屋', kana: 'わたしがすんでいるへや', id: 'kamar tempat saya tinggal' },
      { jp: 'あそこで新聞を読んでいる人', kana: 'あそこでしんぶんをよんでいるひと', id: 'orang yang sedang membaca koran di sana' },
      { jp: '眼鏡をかけている人', kana: 'めがねをかけているひと', id: 'orang yang memakai kacamata' },
      { jp: 'カリナさんが描いた絵', kana: 'カリナさんがかいたえ', id: 'lukisan yang digambar Karina-san' },
      { jp: '毎日飲む薬', kana: 'まいにちのむくすり', id: 'obat yang diminum setiap hari' },
      { jp: '日本で買ったカメラ', kana: 'にほんでかったカメラ', id: 'kamera yang dibeli di Jepang' },
      { jp: '友達にもらったプレゼント', kana: 'ともだちにもらったプレゼント', id: 'hadiah yang didapat dari teman' },
      { jp: 'あそこに止まっている車', kana: 'あそこにとまっているくるま', id: 'mobil yang sedang parkir di sana' }
    ]
  },
  rel_predicate: {
    lesson: 22,
    items: [
      { jp: 'とてもおいしいです', kana: 'とてもおいしいです', id: 'sangat enak' },
      { jp: 'どこにありますか', kana: 'どこにありますか', id: 'ada di mana' },
      { jp: 'ミラーさんです', kana: 'ミラーさんです', id: 'adalah Miller-san' },
      { jp: 'とてもきれいです', kana: 'とてもきれいです', id: 'sangat indah / bersih' },
      { jp: '狭いですが、便利です', kana: 'せまいですが、べんりです', id: 'sempit tetapi praktis' },
      { jp: 'どこで買いましたか', kana: 'どこでかいましたか', id: 'beli di mana' }
    ]
  },

  // Bab 23
  toki_situation: {
    lesson: 23,
    items: [
      { jp: '図書館で本を借りる', kana: 'としょかんでほんをかりる', id: 'meminjam buku di perpustakaan' },
      { jp: '道を渡る', kana: 'みちをわたる', id: 'menyeberang jalan' },
      { jp: 'お金がない', kana: 'おかねがない', id: 'tidak punya uang' },
      { jp: '朝起きた', kana: 'あさおきた', id: 'bangun pagi' },
      { jp: '頭が痛い', kana: 'あたまがいたい', id: 'sakit kepala' },
      { jp: '寂しい', kana: 'さびしい', id: 'kesepian' },
      { jp: 'わからない', kana: 'わからない', id: 'tidak mengerti' }
    ]
  },
  toki_main: {
    lesson: 23,
    items: [
      { jp: 'カードが要ります', kana: 'カードがいります', id: 'memerlukan kartu' },
      { jp: '車に気をつけてください', kana: 'くるまにきをつけてください', id: 'harap hati-hati terhadap mobil' },
      { jp: '友達に借ります', kana: 'ともだちにかります', id: 'meminjam kepada teman' },
      { jp: '窓を開けます', kana: 'まどをあけます', id: 'membuka jendela' },
      { jp: '薬を飲みます', kana: 'くすりをのみます', id: 'minum obat' },
      { jp: '家族に電話をかけます', kana: 'かぞくにでんわをかけます', id: 'menelepon keluarga' },
      { jp: '先生に聞きます', kana: 'せんせいにききます', id: 'bertanya kepada guru' }
    ]
  },
  to_cond_button: {
    lesson: 23,
    items: [
      { jp: 'このボタンを押す', kana: 'このボタンをおす', id: 'menekan tombol ini' },
      { jp: '右へ曲がる', kana: 'みぎへまがる', id: 'belok ke kanan' },
      { jp: '左へ曲がる', kana: 'ひだりへまがる', id: 'belok ke kiri' },
      { jp: 'これを回す', kana: 'これをまわす', id: 'memutar ini' }
    ]
  },
  to_cond_result: {
    lesson: 23,
    items: [
      { jp: 'お釣りが出ます', kana: 'おつりがでます', id: 'uang kembalian keluar' },
      { jp: '郵便局があります', kana: 'ゆうびんきょくがあります', id: 'ada kantor pos' },
      { jp: '銀行があります', kana: 'ぎんこうがあります', id: 'ada bank' },
      { jp: '音が大きくなります', kana: 'おとがおおきくなります', id: 'suara menjadi keras' }
    ]
  },

  // Bab 24
  help_kureru: {
    lesson: 24,
    items: [
      { jp: '傘を貸して', kana: 'かさをかして', id: 'meminjamkan payung' },
      { jp: '駅まで送って', kana: 'えきまでおくって', id: 'mengantar sampai ke stasiun' },
      { jp: '日本語を教えて', kana: 'にほんごをおしえて', id: 'mengajarkan bahasa Jepang' },
      { jp: '荷物を持って', kana: 'にもつをもって', id: 'membawakan barang' },
      { jp: '地図を書いて', kana: 'ちずをかいて', id: 'menggambarkan peta' },
      { jp: '京都を案内して', kana: 'きょうとをあんないして', id: 'memandu di Kyoto' },
      { jp: '写真を撮って', kana: 'しゃしんをとって', id: 'mengambilkan foto' },
      { jp: '自転車を修理して', kana: 'じてんしゃをしゅうりして', id: 'memperbaiki sepeda' }
    ]
  },
  help_ageru: {
    lesson: 24,
    items: [
      { jp: '本を貸して', kana: 'ほんをかして', id: 'meminjamkan buku' },
      { jp: '手伝って', kana: 'てつだって', id: 'membantu' },
      { jp: '駅まで迎えに行って', kana: 'えきまでむかえにいって', id: 'menjemput ke stasiun' },
      { jp: '料理を作って', kana: 'りょうりをつくって', id: 'membuatkan makanan' },
      { jp: '写真を撮って', kana: 'しゃしんをとって', id: 'mengambilkan foto' },
      { jp: '荷物を持って', kana: 'にもつをもって', id: 'membawakan barang' }
    ]
  },

  // Bab 25
  tara_cond_clause: {
    lesson: 25,
    items: [
      { jp: '雨が降ったら', kana: 'あめがふったら', id: 'kalau hujan turun' },
      { jp: 'お金があったら', kana: 'おかねがあったら', id: 'kalau punya uang' },
      { jp: '時間がなかったら', kana: 'じかんがなかったら', id: 'kalau tidak ada waktu' },
      { jp: '安かったら', kana: 'やすかったら', id: 'kalau murah' },
      { jp: '暇だったら', kana: 'ひまだったら', id: 'kalau senggang' },
      { jp: '駅に着いたら', kana: 'えきについたら', id: 'setelah sampai di stasiun' },
      { jp: '仕事が終わったら', kana: 'しごとがおわったら', id: 'setelah pekerjaan selesai' }
    ]
  },
  tara_main_clause: {
    lesson: 25,
    items: [
      { jp: '出かけません', kana: 'でかけません', id: 'tidak pergi keluar' },
      { jp: '世界旅行をしたいです', kana: 'せかいりょこうをしたいです', id: 'ingin berwisata keliling dunia' },
      { jp: 'タクシーで行きます', kana: 'タクシーでいきます', id: 'pergi dengan taksi' },
      { jp: '買います', kana: 'かいます', id: 'membeli' },
      { jp: '遊びに行きます', kana: 'あそびにいきます', id: 'pergi bermain' },
      { jp: '電話をかけてください', kana: 'でんわをかけてください', id: 'tolong telepon' },
      { jp: '飲みに行きましょう', kana: 'のみにいきましょう', id: 'ayo pergi minum' }
    ]
  },
  temo_cond_clause: {
    lesson: 25,
    items: [
      { jp: '雨が降っても', kana: 'あめがふっても', id: 'meskipun hujan turun' },
      { jp: '高くても', kana: 'たかくても', id: 'meskipun mahal' },
      { jp: '日曜日でも', kana: 'にちようびでも', id: 'meskipun hari Minggu' },
      { jp: '難しくても', kana: 'むずかしくても', id: 'meskipun sulit' },
      { jp: '忙しくても', kana: 'いそがしくても', id: 'meskipun sibuk' }
    ]
  },
  temo_main_clause: {
    lesson: 25,
    items: [
      { jp: '出かけます', kana: 'でかけます', id: 'tetap pergi keluar' },
      { jp: '買いたいです', kana: 'かいたいです', id: 'ingin membeli' },
      { jp: '働きます', kana: 'はたらきます', id: 'tetap bekerja' },
      { jp: '頑張って勉強します', kana: 'がんばってべんきょうします', id: 'tetap semangat belajar' },
      { jp: '映画を見に行きます', kana: 'えいがをみにいきます', id: 'pergi menonton film' }
    ]
  }
};

// 3. Define New Templates for Batch 3 (Bab 21 - 25)
const newTemplates = [
  // ==================== BAB 21 ====================
  {
    tid: 'L21-T1',
    lesson: 21,
    extra: false,
    slots: { P: 'person_any', OPIN: 'think_opinion' },
    jp: '{P}は{OPIN}と思います。',
    jp_kana: '{P}は{OPIN}とおもいます。',
    id_text: '{P} berpikir {OPIN}.',
    must_tags: ['TO_OMOIMASU']
  },
  {
    tid: 'L21-T2',
    lesson: 21,
    extra: false,
    slots: { P: 'person_ask', OPIN: 'think_opinion' },
    jp: '{P}は{OPIN}と思いますか。',
    jp_kana: '{P}は{OPIN}とおもいますか。',
    id_text: 'Apakah {P} berpikir {OPIN}?',
    must_tags: ['TO_OMOIMASU', 'QUESTION_KA']
  },
  {
    tid: 'L21-T3',
    lesson: 21,
    extra: false,
    slots: { P: 'person_name', QUOTE: 'quote_statement' },
    jp: '{P}は{QUOTE}と言いました。',
    jp_kana: '{P}は{QUOTE}といいました。',
    id_text: '{P} berkata {QUOTE}.',
    must_tags: ['TO_IIMASU']
  },
  {
    tid: 'L21-T4',
    lesson: 21,
    extra: false,
    slots: { P: 'person_ask' },
    jp: '{P}は日本についてどう思いますか。',
    jp_kana: '{P}はにほんについてどうおもいますか。',
    id_text: 'Bagaimana pendapat {P} tentang Jepang?',
    must_tags: ['TO_OMOIMASU', 'QUESTION_KA']
  },
  {
    tid: 'L21-T5',
    lesson: 21,
    extra: false,
    slots: {},
    jp: 'あした雨が降るでしょう。',
    jp_kana: 'あしたあめがふるでしょう。',
    id_text: 'Besok mungkin hujan akan turun, kan?',
    must_tags: ['DESHOU']
  },
  {
    tid: 'L21-T6',
    lesson: 21,
    extra: false,
    slots: { OPIN: 'think_opinion' },
    jp: 'わたしもそう思います。',
    jp_kana: 'わたしもそうおもいます。',
    id_text: 'Saya juga berpikir begitu.',
    must_tags: ['TO_OMOIMASU']
  },
  {
    tid: 'L21-T7',
    lesson: 21,
    extra: false,
    slots: {},
    jp: 'わたしはそう思いません。',
    jp_kana: 'わたしはそうおもいません。',
    id_text: 'Saya tidak berpikir begitu.',
    must_tags: ['VERB_MASEN']
  },

  // ==================== BAB 22 ====================
  {
    tid: 'L22-T1',
    lesson: 22,
    extra: false,
    slots: { ITEM: 'rel_item', PRED: 'rel_predicate' },
    jp: 'これは{ITEM}です。{PRED}。',
    id_text: 'Ini adalah {ITEM}. {PRED}.',
    must_tags: ['REL_CLAUSE']
  },
  {
    tid: 'L22-T2',
    lesson: 22,
    extra: false,
    slots: { ITEM: 'rel_item' },
    jp: '{ITEM}はどこですか。',
    id_text: '{ITEM} di mana?',
    must_tags: ['REL_CLAUSE', 'QUESTION_KA']
  },
  {
    tid: 'L22-T3',
    lesson: 22,
    extra: false,
    slots: { ITEM: 'rel_item' },
    jp: 'これは{ITEM}です。',
    id_text: 'Ini adalah {ITEM}.',
    must_tags: ['REL_CLAUSE']
  },
  {
    tid: 'L22-T4',
    lesson: 22,
    extra: false,
    slots: { ITEM: 'rel_item' },
    jp: '{ITEM}を知っていますか。',
    jp_kana: '{ITEM}をしっていますか。',
    id_text: 'Apakah kamu tahu {ITEM}?',
    must_tags: ['REL_CLAUSE', 'QUESTION_KA']
  },
  {
    tid: 'L22-T5',
    lesson: 22,
    extra: false,
    slots: { P: 'person_any' },
    jp: '{P}は買い物に行く時間がありません。',
    jp_kana: '{P}はかいものにいくじかんがありません。',
    id_text: '{P} tidak memiliki waktu untuk pergi berbelanja.',
    must_tags: ['REL_CLAUSE', 'VERB_MASEN']
  },
  {
    tid: 'L22-T6',
    lesson: 22,
    extra: false,
    slots: { P: 'person_any' },
    jp: '{P}は友達と約束があります。',
    jp_kana: '{P}はともだちとやくそくがあります。',
    id_text: '{P} ada janji dengan teman.',
    must_tags: ['ARIMASU_IMASU']
  },
  {
    tid: 'L22-T7',
    lesson: 22,
    extra: false,
    slots: { P: 'person_any', ITEM: 'rel_item' },
    jp: '{P}は{ITEM}を持っています。',
    id_text: '{P} memiliki {ITEM}.',
    must_tags: ['REL_CLAUSE', 'TE_IMASU_STATE']
  },
  {
    tid: 'L22-T8',
    lesson: 22,
    extra: false,
    slots: { P: 'person_any', ITEM: 'rel_item' },
    jp: '{P}は{ITEM}が好きです。',
    id_text: '{P} suka {ITEM}.',
    must_tags: ['REL_CLAUSE', 'PARTICLE_GA_OBJ']
  },
  {
    tid: 'L22-T9',
    lesson: 22,
    extra: false,
    slots: { P: 'person_any', ITEM: 'rel_item' },
    jp: '{P}は{ITEM}を買いました。',
    id_text: '{P} telah membeli {ITEM}.',
    must_tags: ['REL_CLAUSE', 'VERB_MASHITA']
  },

  // ==================== BAB 23 ====================
  {
    tid: 'L23-T1',
    lesson: 23,
    extra: false,
    slots: { SITU: 'toki_situation', MAIN: 'toki_main' },
    jp: '{SITU}とき、{MAIN}。',
    id_text: 'Saat {SITU}, {MAIN}.',
    must_tags: ['TOKI']
  },
  {
    tid: 'L23-T2',
    lesson: 23,
    extra: false,
    slots: { P: 'person_any', SITU: 'toki_situation', MAIN: 'toki_main' },
    jp: '{P}は{SITU}とき、{MAIN}。',
    id_text: '{P} saat {SITU}, {MAIN}.',
    must_tags: ['TOKI']
  },
  {
    tid: 'L23-T3',
    lesson: 23,
    extra: false,
    slots: { BTN: 'to_cond_button', RES: 'to_cond_result' },
    jp: '{BTN}と、{RES}。',
    id_text: 'Kalau {BTN}, {RES}.',
    must_tags: ['TO_CONDITIONAL']
  },
  {
    tid: 'L23-T4',
    lesson: 23,
    extra: false,
    slots: { SITU: 'toki_situation' },
    jp: '{SITU}とき、どうしますか。',
    id_text: 'Saat {SITU}, apa yang Anda lakukan?',
    must_tags: ['TOKI', 'QUESTION_KA']
  },
  {
    tid: 'L23-T5',
    lesson: 23,
    extra: false,
    slots: {},
    jp: '橋を渡ると、右に駅があります。',
    jp_kana: 'はしをわたると、みぎにえきがあります。',
    id_text: 'Kalau menyeberang jembatan, di sebelah kanan ada stasiun.',
    must_tags: ['TO_CONDITIONAL']
  },

  // ==================== BAB 24 ====================
  {
    tid: 'L24-T1',
    lesson: 24,
    extra: false,
    slots: { P: 'person_name', ACT: 'help_kureru' },
    jp: '{P}はわたしに{ACT}くれました。',
    id_text: '{P} telah {ACT} untuk saya.',
    must_tags: ['TE_KUREMASU']
  },
  {
    tid: 'L24-T2',
    lesson: 24,
    extra: false,
    slots: { P: 'person_name', ACT: 'help_kureru' },
    jp: '{P}はわたしに{ACT}くれます。',
    id_text: '{P} mau {ACT} untuk saya.',
    must_tags: ['TE_KUREMASU']
  },
  {
    tid: 'L24-T3',
    lesson: 24,
    extra: false,
    slots: { P: 'person_name', ACT: 'help_kureru' },
    jp: 'わたしは{P}に{ACT}もらいました。',
    id_text: 'Saya telah dibantu {ACT} oleh {P}.',
    must_tags: ['TE_MORAIMASU']
  },
  {
    tid: 'L24-T4',
    lesson: 24,
    extra: false,
    slots: { P: 'person_name', ACT: 'help_ageru' },
    jp: 'わたしは{P}に{ACT}あげました。',
    id_text: 'Saya telah {ACT} untuk {P}.',
    must_tags: ['TE_AGEMASU']
  },
  {
    tid: 'L24-T5',
    lesson: 24,
    extra: false,
    slots: { P: 'person_name', ACT: 'help_kureru' },
    jp: '{P}がわたしに{ACT}くれました。',
    id_text: '{P}-lah yang telah {ACT} untuk saya.',
    must_tags: ['TE_KUREMASU']
  },
  {
    tid: 'L24-T6',
    lesson: 24,
    extra: false,
    slots: { P: 'person_name' },
    jp: '{P}はわたしにお土産をくれました。',
    jp_kana: '{P}はわたしにおみやげをくれました。',
    id_text: '{P} memberi saya oleh-oleh.',
    must_tags: ['KUREMASU']
  },

  // ==================== BAB 25 ====================
  {
    tid: 'L25-T1',
    lesson: 25,
    extra: false,
    slots: { TARA: 'tara_cond_clause', MAIN: 'tara_main_clause' },
    jp: '{TARA}、{MAIN}。',
    id_text: '{TARA}, {MAIN}.',
    must_tags: ['TARA_COND']
  },
  {
    tid: 'L25-T2',
    lesson: 25,
    extra: false,
    slots: { P: 'person_any', TARA: 'tara_cond_clause', MAIN: 'tara_main_clause' },
    jp: '{P}は{TARA}、{MAIN}。',
    id_text: '{P} {TARA}, {MAIN}.',
    must_tags: ['TARA_COND']
  },
  {
    tid: 'L25-T3',
    lesson: 25,
    extra: false,
    slots: { TEMO: 'temo_cond_clause', MAIN: 'temo_main_clause' },
    jp: '{TEMO}、{MAIN}。',
    id_text: '{TEMO}, {MAIN}.',
    must_tags: ['TEMO_CONCESSIVE']
  },
  {
    tid: 'L25-T4',
    lesson: 25,
    extra: false,
    slots: { P: 'person_any', TEMO: 'temo_cond_clause', MAIN: 'temo_main_clause' },
    jp: '{P}は{TEMO}、{MAIN}。',
    id_text: '{P} {TEMO}, {MAIN}.',
    must_tags: ['TEMO_CONCESSIVE']
  },
  {
    tid: 'L25-T5',
    lesson: 25,
    extra: false,
    slots: { TARA: 'tara_cond_clause' },
    jp: '{TARA}、どうしますか。',
    id_text: '{TARA}, apa yang akan Anda lakukan?',
    must_tags: ['TARA_COND', 'QUESTION_KA']
  },
  {
    tid: 'L25-T6',
    lesson: 25,
    extra: false,
    slots: {},
    jp: 'もし1億円あったら、何をしたいですか。',
    jp_kana: 'もし1おくえんあったら、なにをしたいですか。',
    id_text: 'Seandainya punya 100 juta yen, apa yang ingin Anda lakukan?',
    must_tags: ['TARA_COND', 'MOSHI', 'WANT_TAI', 'QUESTION_KA']
  },
  {
    tid: 'L25-T7',
    lesson: 25,
    extra: false,
    slots: {},
    jp: 'いくら考えても、わかりません。',
    jp_kana: 'いくらかんがえても、わかりません。',
    id_text: 'Berapa pun saya pikirkan, saya tetap tidak mengerti.',
    must_tags: ['TEMO_CONCESSIVE', 'VERB_MASEN']
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

console.log('Successfully merged Batch 3 pools and templates into pools.json and templates.json!');
