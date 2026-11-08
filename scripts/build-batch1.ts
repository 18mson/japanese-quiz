import fs from 'fs';
import path from 'path';

// 1. Load current pools.json and templates.json
const poolsPath = path.resolve('scripts/data/pools.json');
const templatesPath = path.resolve('scripts/templates.json');

const poolsData = JSON.parse(fs.readFileSync(poolsPath, 'utf-8'));
const templatesData = JSON.parse(fs.readFileSync(templatesPath, 'utf-8'));

// 2. Define New Pools for Batch 1 (Bab 13 - 16)
const newPools = {
  // Bab 13
  want_obj: {
    lesson: 13,
    items: [
      { jp: 'パソコン', kana: 'パソコン', id: 'komputer' },
      { jp: '車', kana: 'くるま', id: 'mobil' },
      { jp: 'カメラ', kana: 'カメラ', id: 'kamera' },
      { jp: '自転車', kana: 'じてんしゃ', id: 'sepeda' },
      { jp: '新しい靴', kana: 'あたらしいくつ', id: 'sepatu baru' },
      { jp: '広い部屋', kana: 'ひろいへや', id: 'kamar yang luas' },
      { jp: 'お金', kana: 'おかね', id: 'uang' },
      { jp: '時計', kana: 'とけい', id: 'jam' }
    ]
  },
  want_act: {
    lesson: 13,
    items: [
      { jp: '日本へ行き', kana: 'にほんへいき', id: 'pergi ke Jepang' },
      { jp: 'てんぷらを食べ', kana: 'てんぷらをたべ', id: 'makan tempura' },
      { jp: '映画を見', kana: 'えいがをみ', id: 'menonton film' },
      { jp: 'ビールを飲み', kana: 'ビールをのみ', id: 'minum bir' },
      { jp: '買い物をし', kana: 'かいものをし', id: 'berbelanja' },
      { jp: '友達に会い', kana: 'ともだちにあい', id: 'bertemu teman' },
      { jp: '日本語を勉強し', kana: 'にほんごをべんきょうし', id: 'belajar bahasa Jepang' },
      { jp: 'お茶を飲み', kana: 'おちゃをのみ', id: 'minum teh' },
      { jp: '旅行をし', kana: 'りょこうをし', id: 'berwisata' },
      { jp: '本を読み', kana: 'ほんをよみ', id: 'membaca buku' }
    ]
  },
  purpose_trip: {
    lesson: 13,
    items: [
      { jp: 'プールへ泳ぎに', kana: 'プールへおよぎに', id: 'ke kolam renang untuk berenang' },
      { jp: '川へ釣りに', kana: 'かわへつりに', id: 'ke sungai untuk memancing' },
      { jp: 'デパートへ買い物に', kana: 'デパートへかいものに', id: 'ke department store untuk belanja' },
      { jp: '郵便局へ手紙を出しに', kana: 'ゆうびんきょくへてがみをだしに', id: 'ke kantor pos untuk mengirim surat' },
      { jp: '図書館へ本を借りに', kana: 'としょかんへほんをかりに', id: 'ke perpustakaan untuk meminjam buku' },
      { jp: '日本へ日本語を勉強しに', kana: 'にほんへにほんごをべんきょうしに', id: 'ke Jepang untuk belajar bahasa Jepang' },
      { jp: '駅へ友達を迎えに', kana: 'えきへともだちをむかえに', id: 'ke stasiun untuk menjemput teman' },
      { jp: 'レストランへ食事に', kana: 'レストランへしょくじに', id: 'ke restoran untuk makan' }
    ]
  },

  // Bab 14
  kudasai_action: {
    lesson: 14,
    items: [
      { jp: '名前を書いて', kana: 'なまえをかいて', id: 'tulis nama' },
      { jp: '住所を書いて', kana: 'じゅうしょをかいて', id: 'tulis alamat' },
      { jp: 'もう一度言って', kana: 'もういちどいって', id: 'katakan sekali lagi' },
      { jp: 'ちょっと待って', kana: 'ちょっとまって', id: 'tunggu sebentar' },
      { jp: 'ドアを開けて', kana: 'ドアをあけて', id: 'buka pintu' },
      { jp: '窓を閉めて', kana: 'まどをしめて', id: 'tutup jendela' },
      { jp: '電気をつけて', kana: 'でんきをつけて', id: 'nyalakan lampu' },
      { jp: 'エアコンを消して', kana: 'エアコンをけして', id: 'matikan AC' },
      { jp: 'パスポートを見せて', kana: 'パスポートをみせて', id: 'tunjukkan paspor' },
      { jp: 'ゆっくり話して', kana: 'ゆっくりはなして', id: 'bicara pelan-pelan' },
      { jp: 'ここに座って', kana: 'ここにすわって', id: 'duduk di sini' },
      { jp: '急いで', kana: 'いそいで', id: 'cepat / bergegas' },
      { jp: '手伝って', kana: 'てつだって', id: 'tolong bantu' },
      { jp: 'ボールペンを貸して', kana: 'ボールペンをかして', id: 'pinjamkan pulpen' },
      { jp: '傘を貸して', kana: 'かさをかして', id: 'pinjamkan payung' },
      { jp: '写真を撮って', kana: 'しゃしんをとって', id: 'ambilkan foto' }
    ]
  },
  prog_action: {
    lesson: 14,
    items: [
      { jp: '本を読んで', kana: 'ほんをよんで', id: 'membaca buku' },
      { jp: 'テレビを見て', kana: 'テレビをみて', id: 'menonton TV' },
      { jp: '電話をかけて', kana: 'でんわをかけて', id: 'menelepon' },
      { jp: '料理を作って', kana: 'りょうりをつくって', id: 'memasak' },
      { jp: 'レポートを書いて', kana: 'レポートをかいて', id: 'menulis laporan' },
      { jp: '日本語を勉強して', kana: 'にほんごをべんきょうして', id: 'belajar bahasa Jepang' },
      { jp: '音楽を聞いて', kana: 'おんがくをきいて', id: 'mendengarkan musik' },
      { jp: '手紙を書いて', kana: 'てがみをかいて', id: 'menulis surat' },
      { jp: 'コーヒーを飲んで', kana: 'コーヒーをのんで', id: 'minum kopi' },
      { jp: 'ご飯を食べて', kana: 'ごはんをたべて', id: 'makan nasi' },
      { jp: '新聞を読んで', kana: 'しんぶんをよんで', id: 'membaca koran' }
    ]
  },
  mashouka_action: {
    lesson: 14,
    items: [
      { jp: '荷物を持ち', kana: 'にもつをもち', id: 'membawakan barang' },
      { jp: '傘を貸し', kana: 'かさをかし', id: 'meminjamkan payung' },
      { jp: 'エアコンをつけ', kana: 'エアコンをつけ', id: 'menyalakan AC' },
      { jp: '窓を開け', kana: 'まどをあけ', id: 'membuka jendela' },
      { jp: '手伝い', kana: 'てつだい', id: 'membantu' },
      { jp: 'タクシーを呼び', kana: 'タクシーをよび', id: 'memanggil taksi' },
      { jp: '写真を撮り', kana: 'しゃしんをとり', id: 'mengambilkan foto' },
      { jp: 'ドアを閉め', kana: 'ドアをしめ', id: 'menutup pintu' },
      { jp: '地図を書き', kana: 'ちずをかき', id: 'menggambarkan peta' }
    ]
  },

  // Bab 15
  permit_action: {
    lesson: 15,
    items: [
      { jp: '写真を撮って', kana: 'しゃしんをとって', id: 'mengambil foto' },
      { jp: 'たばこを吸って', kana: 'たばこをすって', id: 'merokok' },
      { jp: 'ここに座って', kana: 'ここにすわって', id: 'duduk di sini' },
      { jp: 'この辞書を使って', kana: 'このじしょをつかって', id: 'menggunakan kamus ini' },
      { jp: 'カタログをもらって', kana: 'カタログをもらって', id: 'mengambil katalog' },
      { jp: 'ここで休んで', kana: 'ここでやすんで', id: 'istirahat di sini' },
      { jp: 'この傘を使って', kana: 'このかさをつかって', id: 'menggunakan payung ini' },
      { jp: '窓を開けて', kana: 'まどをあけて', id: 'membuka jendela' },
      { jp: 'テレビを見て', kana: 'テレビをみて', id: 'menonton TV' },
      { jp: 'この本を読んで', kana: 'このほんをよんで', id: 'membaca buku ini' },
      { jp: 'ここに荷物を置いて', kana: 'ここににもつをおいて', id: 'menaruh barang di sini' }
    ]
  },
  prohibit_action: {
    lesson: 15,
    items: [
      { jp: 'ここで写真を撮って', kana: 'ここでしゃしんをとって', id: 'mengambil foto di sini' },
      { jp: 'ここでたばこを吸って', kana: 'ここでたばこをすって', id: 'merokok di sini' },
      { jp: 'お酒を飲んで', kana: 'おさけをのんで', id: 'minum minuman keras' },
      { jp: 'ここに車を止めて', kana: 'ここにくるまをとめて', id: 'memarkir mobil di sini' },
      { jp: 'ここに入って', kana: 'ここにはいって', id: 'masuk ke sini' },
      { jp: 'ここで泳いで', kana: 'ここでおよいで', id: 'berenang di sini' },
      { jp: 'ボールペンで書いて', kana: 'ボールペンでかいて', id: 'menulis dengan bolpoin' },
      { jp: 'ここに荷物を置いて', kana: 'ここににもつをおいて', id: 'menaruh barang di sini' }
    ]
  },
  state_action: {
    lesson: 15,
    items: [
      { jp: '大阪に住んで', kana: 'おおさかにすんで', id: 'tinggal di Osaka' },
      { jp: '東京に住んで', kana: 'とうきょうにすんで', id: 'tinggal di Tokyo' },
      { jp: '京都に住んで', kana: 'きょうとにすんで', id: 'tinggal di Kyoto' },
      { jp: '神戸に住んで', kana: 'こうべにすんで', id: 'tinggal di Kobe' },
      { jp: 'パソコンを持って', kana: 'パソコンをもって', id: 'memiliki komputer' },
      { jp: '車を持って', kana: 'くるまをもって', id: 'memiliki mobil' },
      { jp: 'カメラを持って', kana: 'カメラをもって', id: 'memiliki kamera' },
      { jp: '自転車を持って', kana: 'じてんしゃをもって', id: 'memiliki sepeda' },
      { jp: '結婚して', kana: 'けっこんして', id: 'menikah' },
      { jp: '銀行で働いて', kana: 'ぎんこうではたらいて', id: 'bekerja di bank' },
      { jp: '会社で働いて', kana: 'かいしゃではたらいて', id: 'bekerja di perusahaan' },
      { jp: '大学で研究して', kana: 'だいがくでけんきゅうして', id: 'meneliti di universitas' }
    ]
  },

  // Bab 16
  seq_pair: {
    lesson: 16,
    items: [
      { jp: '朝ジョギングをして、シャワーを浴びて', kana: 'あさジョギングをして、シャワーをあびて', id: 'joging pagi, mandi shower' },
      { jp: '朝起きて、シャワーを浴びて', kana: 'あさおきて、シャワーをあびて', id: 'bangun pagi, mandi shower' },
      { jp: '神戸へ行って、映画を見て', kana: 'こうべへいって、えいがをみて', id: 'pergi ke Kobe, menonton film' },
      { jp: '図書館へ行って、本を借りて', kana: 'としょかんへいって、ほんをかりて', id: 'pergi ke perpustakaan, meminjam buku' },
      { jp: 'デパートへ行って、買い物をして', kana: 'デパートへいって、かいものをして', id: 'pergi ke department store, berbelanja' },
      { jp: '銀行へ行って、お金を下ろして', kana: 'ぎんこうへいって、おかねをおろして', id: 'pergi ke bank, menarik uang' },
      { jp: 'うちに帰って、ご飯を食べて', kana: 'うちにかえって、ごはんをたべて', id: 'pulang ke rumah, makan nasi' }
    ]
  },
  seq_fin: {
    lesson: 16,
    items: [
      { jp: '会社へ行きます', kana: 'かいしゃへいきます', id: 'pergi ke kantor' },
      { jp: '学校へ行きます', kana: 'がっこうへいきます', id: 'pergi ke sekolah' },
      { jp: 'お茶を飲みました', kana: 'おちゃをのみました', id: 'minum teh' },
      { jp: '勉強しました', kana: 'べんきょうしました', id: 'belajar' },
      { jp: '寝ました', kana: 'ねました', id: 'tidur' }
    ]
  },
  kara_pair: {
    lesson: 16,
    items: [
      { jp: '仕事が終わってから', kana: 'しごとがおわってから', id: 'setelah pekerjaan selesai' },
      { jp: 'ご飯を食べてから', kana: 'ごはんをたべてから', id: 'setelah makan' },
      { jp: 'コンサートが終わってから', kana: 'コンサートがおわってから', id: 'setelah konser selesai' },
      { jp: '国へ帰ってから', kana: 'くにへかえってから', id: 'setelah pulang ke negara asal' },
      { jp: 'お金を下ろしてから', kana: 'おかねをおろしてから', id: 'setelah menarik uang' }
    ]
  },
  kara_next: {
    lesson: 16,
    items: [
      { jp: '泳ぎに行きます', kana: 'およぎにいきます', id: 'pergi berenang' },
      { jp: '薬を飲みます', kana: 'くすりをのみます', id: 'minum obat' },
      { jp: 'レストランで食事をしました', kana: 'レストランでしょくじをしました', id: 'makan di restoran' },
      { jp: '父の会社で働きます', kana: 'ちちのかいしゃではたらきます', id: 'bekerja di perusahaan ayah' },
      { jp: '買い物に行きます', kana: 'かいものにいきます', id: 'pergi berbelanja' }
    ]
  },
  adj_te_pair: {
    lesson: 16,
    items: [
      { jp: '軽くて、便利', kana: 'かるくて、べんり', id: 'ringan dan praktis' },
      { jp: '若くて、親切', kana: 'わかくて、しんせつ', id: 'muda dan ramah' },
      { jp: '大きくて、きれい', kana: 'おおきくて、きれい', id: 'besar dan bersih' },
      { jp: '新しくて、静か', kana: 'あたらしくて、しずか', id: 'baru dan tenang' },
      { jp: '狭くて、暗い', kana: 'せまくて、くらい', id: 'sempit dan gelap' }
    ]
  },
  place_feature: {
    lesson: 16,
    items: [
      { jp: '大阪は食べ物がおいしい', kana: 'おおさかはたべものがおいしい', id: 'Osaka makanannya enak' },
      { jp: '北海道は冬が寒い', kana: 'ほっかいどうはふゆがさむい', id: 'Hokkaido musim dinginnya dingin' },
      { jp: '京都はお寺が多い', kana: 'きょうとはおてらがおおい', id: 'Kyoto kuilnya banyak' },
      { jp: '東京は人が多い', kana: 'とうきょうはひとがおおい', id: 'Tokyo orangnya banyak' },
      { jp: 'マリアさんは髪が長い', kana: 'マリアさんはかみがながい', id: 'Maria rambutnya panjang' },
      { jp: 'サントスさんは背が高い', kana: 'サントスさんはせがたかい', id: 'Santos badannya tinggi' }
    ]
  }
};

// 3. Define New Templates for Batch 1 (Bab 13 - 16)
const newTemplates = [
  // ==================== BAB 13 ====================
  {
    tid: 'L13-T1',
    lesson: 13,
    extra: false,
    slots: { P: 'person_any', OBJ: 'want_obj' },
    jp: '{P}は{OBJ}が欲しいです。',
    jp_kana: '{P}は{OBJ}がほしいです。',
    id_text: '{P} ingin {OBJ}.',
    must_tags: ['WANT_HOSHII']
  },
  {
    tid: 'L13-T2',
    lesson: 13,
    extra: false,
    slots: { P: 'person_any', OBJ: 'want_obj' },
    jp: '{P}は{OBJ}が欲しくないです。',
    jp_kana: '{P}は{OBJ}がほしくないです。',
    id_text: '{P} tidak ingin {OBJ}.',
    must_tags: ['WANT_HOSHII']
  },
  {
    tid: 'L13-T3',
    lesson: 13,
    extra: false,
    slots: { P: 'person_ask', OBJ: 'want_obj' },
    jp: '{P}は今{OBJ}が欲しいですか。',
    jp_kana: '{P}はいま{OBJ}がほしいですか。',
    id_text: '{P} apakah sekarang ingin {OBJ}?',
    must_tags: ['WANT_HOSHII', 'QUESTION_KA']
  },
  {
    tid: 'L13-T4',
    lesson: 13,
    extra: false,
    slots: { P: 'person_any', ACT: 'want_act' },
    jp: '{P}は{ACT}たいです。',
    id_text: '{P} ingin {ACT}.',
    must_tags: ['WANT_TAI']
  },
  {
    tid: 'L13-T5',
    lesson: 13,
    extra: false,
    slots: { P: 'person_any', ACT: 'want_act' },
    jp: '{P}は{ACT}たくないです。',
    id_text: '{P} tidak ingin {ACT}.',
    must_tags: ['WANT_TAI']
  },
  {
    tid: 'L13-T6',
    lesson: 13,
    extra: false,
    slots: { P: 'person_ask' },
    jp: '{P}は何を食べたいですか。',
    jp_kana: '{P}はなにをたべたいですか。',
    id_text: '{P} ingin makan apa?',
    must_tags: ['WANT_TAI', 'QUESTION_KA']
  },
  {
    tid: 'L13-T7',
    lesson: 13,
    extra: false,
    slots: { P: 'person_ask' },
    jp: '{P}はどこへ行きたいですか。',
    jp_kana: '{P}はどこへいきたいですか。',
    id_text: '{P} ingin pergi ke mana?',
    must_tags: ['WANT_TAI', 'QUESTION_KA']
  },
  {
    tid: 'L13-T8',
    lesson: 13,
    extra: false,
    slots: { P: 'person_any', TRIP: 'purpose_trip' },
    jp: '{P}は{TRIP}行きます。',
    jp_kana: '{P}は{TRIP}いきます。',
    id_text: '{P} pergi {TRIP}.',
    must_tags: ['PURPOSE_NI_IKU']
  },
  {
    tid: 'L13-T9',
    lesson: 13,
    extra: false,
    slots: { P: 'person_any', TRIP: 'purpose_trip' },
    jp: '{P}は{TRIP}来ました。',
    jp_kana: '{P}は{TRIP}きました。',
    id_text: '{P} datang {TRIP}.',
    must_tags: ['PURPOSE_NI_IKU']
  },
  {
    tid: 'L13-T10',
    lesson: 13,
    extra: false,
    slots: { P: 'person_ask' },
    jp: '{P}は週末どこかへ行きましたか。',
    jp_kana: '{P}はしゅうまつどこかへいきましたか。',
    id_text: '{P} apakah akhir pekan pergi ke suatu tempat?',
    must_tags: ['QUESTION_KA']
  },
  {
    tid: 'L13-T11',
    lesson: 13,
    extra: false,
    slots: {},
    jp: 'おなかがすきましたから、何かを食べたいです。',
    jp_kana: 'おなかがすきましたから、なにかをたべたいです。',
    id_text: 'Karena lapar, saya ingin makan sesuatu.',
    must_tags: ['WANT_TAI']
  },
  {
    tid: 'L13-T12',
    lesson: 13,
    extra: false,
    slots: {},
    jp: 'のどがかわきましたから、何かを飲みたいです。',
    jp_kana: 'のどがかわきましたから、なにかをのみたいです。',
    id_text: 'Karena haus, saya ingin minum sesuatu.',
    must_tags: ['WANT_TAI']
  },

  // ==================== BAB 14 ====================
  {
    tid: 'L14-T1',
    lesson: 14,
    extra: false,
    slots: { ACT: 'kudasai_action' },
    jp: 'すみませんが、{ACT}ください。',
    id_text: 'Permisi, tolong {ACT}.',
    must_tags: ['TE_KUDASAI']
  },
  {
    tid: 'L14-T2',
    lesson: 14,
    extra: false,
    slots: { ACT: 'kudasai_action' },
    jp: 'どうぞ{ACT}ください。',
    id_text: 'Silakan {ACT}.',
    must_tags: ['TE_KUDASAI']
  },
  {
    tid: 'L14-T3',
    lesson: 14,
    extra: false,
    slots: { P: 'person_name', ACT: 'kudasai_action' },
    jp: '{P}、{ACT}ください。',
    id_text: '{P}, tolong {ACT}.',
    must_tags: ['TE_KUDASAI']
  },
  {
    tid: 'L14-T4',
    lesson: 14,
    extra: false,
    slots: { P: 'person_any', ACT: 'prog_action' },
    jp: '{P}は今{ACT}います。',
    id_text: '{P} sekarang sedang {ACT}.',
    must_tags: ['TE_IMASU_PROGRESSIVE']
  },
  {
    tid: 'L14-T5',
    lesson: 14,
    extra: false,
    slots: { P: 'person_ask' },
    jp: '{P}は今何をしていますか。',
    jp_kana: '{P}はいまなにをしていますか。',
    id_text: '{P} sekarang sedang melakukan apa?',
    must_tags: ['TE_IMASU_PROGRESSIVE', 'QUESTION_KA']
  },
  {
    tid: 'L14-T6',
    lesson: 14,
    extra: false,
    slots: {},
    jp: '今雨が降っていますか。',
    jp_kana: 'いまあめがふっていますか。',
    id_text: 'Apakah sekarang sedang turun hujan?',
    must_tags: ['TE_IMASU_PROGRESSIVE', 'QUESTION_KA']
  },
  {
    tid: 'L14-T7',
    lesson: 14,
    extra: false,
    slots: { ACT: 'mashouka_action' },
    jp: '{ACT}ましょうか。',
    id_text: 'Bolehkah saya {ACT}?',
    must_tags: ['VERB_MASHOU']
  },
  {
    tid: 'L14-T8',
    lesson: 14,
    extra: false,
    slots: {},
    jp: '信号を右へ曲がってください。',
    jp_kana: 'しんごうをみぎへまがってください。',
    id_text: 'Tolong belok ke kanan di lampu lalu lintas.',
    must_tags: ['TE_KUDASAI']
  },
  {
    tid: 'L14-T9',
    lesson: 14,
    extra: false,
    slots: {},
    jp: 'まっすぐ行ってください。',
    jp_kana: 'まっすぐいってください。',
    id_text: 'Tolong jalan lurus.',
    must_tags: ['TE_KUDASAI']
  },
  {
    tid: 'L14-T10',
    lesson: 14,
    extra: false,
    slots: { P: 'person_ask', ACT: 'prog_action' },
    jp: '{P}は今{ACT}いますか。',
    id_text: 'Apakah {P} sekarang sedang {ACT}?',
    must_tags: ['TE_IMASU_PROGRESSIVE', 'QUESTION_KA']
  },
  {
    tid: 'L14-T11',
    lesson: 14,
    extra: false,
    slots: { P: 'person_any', ACT: 'prog_action' },
    jp: '{P}は今{ACT}いません。',
    id_text: '{P} sekarang tidak sedang {ACT}.',
    must_tags: ['TE_FORM', 'VERB_MASEN']
  },

  // ==================== BAB 15 ====================
  {
    tid: 'L15-T1',
    lesson: 15,
    extra: false,
    slots: { ACT: 'permit_action' },
    jp: '{ACT}もいいですか。',
    id_text: 'Bolehkah {ACT}?',
    must_tags: ['TE_MO_II', 'QUESTION_KA']
  },
  {
    tid: 'L15-T2',
    lesson: 15,
    extra: false,
    slots: { ACT: 'permit_action' },
    jp: 'はい、{ACT}もいいです。',
    id_text: 'Ya, boleh {ACT}.',
    must_tags: ['TE_MO_II']
  },
  {
    tid: 'L15-T3',
    lesson: 15,
    extra: false,
    slots: { ACT: 'prohibit_action' },
    jp: 'いいえ、{ACT}はいけません。',
    id_text: 'Tidak, tidak boleh {ACT}.',
    must_tags: ['TE_WA_IKEMASEN']
  },
  {
    tid: 'L15-T4',
    lesson: 15,
    extra: false,
    slots: { ACT: 'prohibit_action' },
    jp: '{ACT}はいけません。',
    id_text: 'Dilarang {ACT}.',
    must_tags: ['TE_WA_IKEMASEN']
  },
  {
    tid: 'L15-T5',
    lesson: 15,
    extra: false,
    slots: { P: 'person_any', ACT: 'state_action' },
    jp: '{P}は{ACT}います。',
    id_text: '{P} {ACT}.',
    must_tags: ['TE_IMASU_STATE']
  },
  {
    tid: 'L15-T6',
    lesson: 15,
    extra: false,
    slots: { P: 'person_ask' },
    jp: '{P}はどこに住んでいますか。',
    jp_kana: '{P}はどこにすんでいますか。',
    id_text: '{P} tinggal di mana?',
    must_tags: ['TE_IMASU_STATE', 'QUESTION_KA']
  },
  {
    tid: 'L15-T7',
    lesson: 15,
    extra: false,
    slots: { P: 'person_ask' },
    jp: '{P}は市役所の電話番号を知っていますか。',
    jp_kana: '{P}はしやくしょのでんわばんごうをしっていますか。',
    id_text: 'Apakah {P} tahu nomor telepon kantor wali kota?',
    must_tags: ['TE_IMASU_STATE', 'QUESTION_KA']
  },
  {
    tid: 'L15-T8',
    lesson: 15,
    extra: false,
    slots: {},
    jp: 'いいえ、知りません。',
    jp_kana: 'いいえ、しりません。',
    id_text: 'Tidak, saya tidak tahu.',
    must_tags: ['VERB_MASEN']
  },
  {
    tid: 'L15-T9',
    lesson: 15,
    extra: false,
    slots: {},
    jp: 'この会社はコンピューターのソフトを作っています。',
    jp_kana: 'このかいしゃはコンピューターのソフトをつくっています。',
    id_text: 'Perusahaan ini memproduksi perangkat lunak komputer.',
    must_tags: ['TE_IMASU_STATE']
  },
  {
    tid: 'L15-T10',
    lesson: 15,
    extra: false,
    slots: {},
    jp: 'あの店で古い本を売っています。',
    jp_kana: 'あのみせでふるいほんをうっています。',
    id_text: 'Toko itu menjual buku-buku lama.',
    must_tags: ['TE_IMASU_STATE']
  },
  {
    tid: 'L15-T11',
    lesson: 15,
    extra: false,
    slots: { P: 'person_ask', ACT: 'state_action' },
    jp: '{P}は{ACT}いますか。',
    id_text: 'Apakah {P} {ACT}?',
    must_tags: ['TE_IMASU_STATE', 'QUESTION_KA']
  },
  {
    tid: 'L15-T12',
    lesson: 15,
    extra: false,
    slots: { P: 'person_any', OBJ: 'want_obj' },
    jp: '{P}は{OBJ}を持っています。',
    jp_kana: '{P}は{OBJ}をもっています。',
    id_text: '{P} memiliki {OBJ}.',
    must_tags: ['TE_IMASU_STATE']
  },
  {
    tid: 'L15-T13',
    lesson: 15,
    extra: false,
    slots: { P: 'person_any', OBJ: 'want_obj' },
    jp: '{P}は{OBJ}を持っていません。',
    jp_kana: '{P}は{OBJ}をもっていません。',
    id_text: '{P} tidak memiliki {OBJ}.',
    must_tags: ['TE_FORM', 'VERB_MASEN']
  },
  {
    tid: 'L15-T14',
    lesson: 15,
    extra: false,
    slots: { P: 'person_ask', OBJ: 'want_obj' },
    jp: '{P}は{OBJ}を持っていますか。',
    jp_kana: '{P}は{OBJ}をもっていますか。',
    id_text: 'Apakah {P} memiliki {OBJ}?',
    must_tags: ['TE_IMASU_STATE', 'QUESTION_KA']
  },

  // ==================== BAB 16 ====================
  {
    tid: 'L16-T1',
    lesson: 16,
    extra: false,
    slots: { P: 'person_any', SEQ: 'seq_pair', FIN: 'seq_fin' },
    jp: '{P}は{SEQ}、{FIN}。',
    id_text: '{P} {SEQ}, lalu {FIN}.',
    must_tags: ['TE_SEQUENCE']
  },
  {
    tid: 'L16-T2',
    lesson: 16,
    extra: false,
    slots: { P: 'person_any', KARA: 'kara_pair', NEXT: 'kara_next' },
    jp: '{P}は{KARA}、{NEXT}。',
    id_text: '{P} {KARA}, {NEXT}.',
    must_tags: ['TE_KARA']
  },
  {
    tid: 'L16-T3',
    lesson: 16,
    extra: false,
    slots: { ADJ: 'adj_te_pair' },
    jp: 'このパソコンは{ADJ}です。',
    id_text: 'Komputer ini {ADJ}.',
    must_tags: ['ADJ_TE']
  },
  {
    tid: 'L16-T4',
    lesson: 16,
    extra: false,
    slots: { FEAT: 'place_feature' },
    jp: '{FEAT}です。',
    id_text: '{FEAT}.',
    must_tags: ['PARTICLE_GA_WA_SUBJECT']
  },
  {
    tid: 'L16-T5',
    lesson: 16,
    extra: false,
    slots: {},
    jp: '大学までどうやって行きますか。',
    jp_kana: 'だいがくまでどうやっていきますか。',
    id_text: 'Bagaimana cara pergi sampai ke universitas?',
    must_tags: ['QUESTION_KA']
  },
  {
    tid: 'L16-T6',
    lesson: 16,
    extra: false,
    slots: {},
    jp: '京都駅から16番のバスに乗って、大学前で降ります。',
    jp_kana: 'きょうとえきから16ばんのバスにのって、だいがくまえでおります。',
    id_text: 'Naik bus nomor 16 dari stasiun Kyoto, lalu turun di depan universitas.',
    must_tags: ['TE_FORM']
  },
  {
    tid: 'L16-T7',
    lesson: 16,
    extra: false,
    slots: {},
    jp: 'まず暗証番号を押して、次に金額を押してください。',
    jp_kana: 'まずあんしょうばんごうをおして、つぎにきんがくをおしてください。',
    id_text: 'Pertama-tama tekan nomor PIN, selanjutnya silakan tekan jumlah uang.',
    must_tags: ['TE_KUDASAI']
  },
  {
    tid: 'L16-T8',
    lesson: 16,
    extra: false,
    slots: {},
    jp: 'どの人がミラーさんですか。',
    jp_kana: 'どのひとがミラーさんですか。',
    id_text: 'Orang yang mana adalah Miller-san?',
    must_tags: ['QUESTION_KA']
  },
  {
    tid: 'L16-T9',
    lesson: 16,
    extra: false,
    slots: {},
    jp: 'あの背が高くて、髪が黒い人です。',
    jp_kana: 'あのせがたかくて、かみがくろいひとです。',
    id_text: 'Orang yang berbadan tinggi dan berambut hitam itu.',
    must_tags: ['ADJ_TE']
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

console.log('Successfully merged Batch 1 pools and templates into pools.json and templates.json!');
