# Sampel Peninjauan Kanji (30 Kanji)

Dokumen ini disusun untuk ditinjau secara manual sebelum persetujuan akhir (`approve.mjs`).

### Ringkasan Jumlah Sampel:
- **Total Sampel**: 30
- **Sumber**: Manual: 0 | Gemini: 30
- **Status**: Approved: 0 | Needs Review: 19 | Draft: 6 | Rejected: 5

| No | Kanji | Sumber | Status | Keyakinan | Reading Hint (Skrip) | Match | Komponen | Alasan Penolakan / Review | Asal-usul (Etymology) | Cara Mengingat (Mnemonic) |
|:---:|:---:|:---:|:---:|:---:|:---|:---:|:---|:---|:---|:---|
| 1 | **中** | gemini | `needs_review` | `uncertain` | - | - | `口(bentuk) 丨(bentuk)` | - | Terdiri dari kotak mulut (口) yang ditusuk garis vertikal (丨) tepat di tengahnya. | Cara mengingat: Garis (丨) membelah kotak (口) tepat di bagian tengah. |
| 2 | **京** | gemini | `needs_review` | `uncertain` | - | - | `亠(bentuk) 口(bentuk) 小(bentuk)` | - | Terdiri dari penutup (亠), mulut (口), dan kecil (小). | Cara mengingat: Kota besar ibu kota dengan bangunan bertingkat. |
| 3 | **便** | gemini | `needs_review` | `traditional` | `bacaan Jepang kini berbeda (更: コウ / 便: ベン, ビン)` | ❌ | `亻(makna) 更(fonetik)` | Klaim phonetic pada '更' tidak cocok rima bacaan on-yomi (コウ vs ベン, ビン) | Gabungan orang dan 更 yang memberikan bunyi ベン. | Cara mengingat: Orang yang membuat urusan menjadi praktis. |
| 4 | **冷** | gemini | `draft` | `traditional` | `令 (レイ) → 冷 (レイ)` | ✅ | `冫(makna) 令(fonetik)` | - | Gabungan es dan 令 yang memberi bunyi レイ. | Cara mengingat: Es dan air dingin membuat tubuh membeku. |
| 5 | **前** | gemini | `needs_review` | `uncertain` | - | - | `八(bentuk) 月(bentuk) 刂(bentuk) 刀(bentuk)` | - | Terdiri dari komponen 八, bulan (月), dan pisau (刂). | Cara mengingat: Ada bulan (月) dan pisau (刂) di bagian depan. |
| 6 | **勉** | gemini | `rejected` | `traditional` | `免 (メン) → 勉 (ベン)` | ✅ | `免(fonetik) 力(makna)` | Mnemonik harus memuat citra konkret atau petunjuk bunyi | Gabungan 免 yang memberi bunyi ベン dan kekuatan. | Cara mengingat: Menggunakan tenaga untuk belajar keras. |
| 7 | **午** | gemini | `needs_review` | `uncertain` | - | - | `丿(bentuk) 干(bentuk)` | - | Terdiri dari komponen 丿 dan 干. | Cara mengingat: Ada garis miring dan benda kering (干) di siang hari (午). |
| 8 | **地** | gemini | `needs_review` | `uncertain` | `bacaan Jepang kini berbeda (也: ヤ, エ / 地: チ, ジ)` | ❌ | `土(makna) 也(fonetik)` | Klaim phonetic pada '也' tidak cocok rima bacaan on-yomi (ヤ, エ vs チ, ジ) | Terdiri dari komponen 土 dan 也. | Cara mengingat: Tanah (土) tempat berpijak di bumi. |
| 9 | **富** | gemini | `needs_review` | `traditional` | `bacaan Jepang kini berbeda (畐: フク, ヒョク, ヒキ / 富: フ, フウ)` | ❌ | `宀(makna) 畐(fonetik)` | Klaim phonetic pada '畐' tidak cocok rima bacaan on-yomi (フク, ヒョク, ヒキ vs フ, フウ) | Gabungan mahkota atap dan komponen 畐 yang memberi bunyi フ. Menggambarkan limpahan kekayaan. | Cara mengingat: Rumah di bawah atap penuh dengan harta. |
| 10 | **屋** | gemini | `needs_review` | `traditional` | `bacaan Jepang kini berbeda (至: シ / 屋: オク)` | ❌ | `尸(bentuk) 至(fonetik)` | Klaim phonetic pada '至' tidak cocok rima bacaan on-yomi (シ vs オク) | Terdiri dari komponen 尸 dan 至 yang memberi petunjuk bunyi. | Cara mengingat: Rumah atau toko tempat orang tiba (至) di bawah atap. |
| 11 | **新** | gemini | `needs_review` | `traditional` | `bacaan Jepang kini berbeda (斤: キン / 新: シン)` | ❌ | `立(makna) 木(makna) 斤(fonetik)` | Klaim phonetic pada '斤' tidak cocok rima bacaan on-yomi (キン vs シン) | Terdiri dari pohon (木) yang berdiri (立) dan kapak (斤). | Cara mengingat: Pohon (木) yang berdiri (立) ditebang menggunakan kapak baru (斤). |
| 12 | **易** | gemini | `needs_review` | `uncertain` | - | - | `日(bentuk) 勿(bentuk)` | - | Terdiri dari komponen 日 dan 勿. | Cara mengingat: Hari (日) tanpa (勿) beban terasa mudah. |
| 13 | **暑** | gemini | `needs_review` | `traditional` | `bacaan Jepang kini berbeda (者: シャ / 暑: ショ)` | ❌ | `日(makna) 者(fonetik)` | Klaim phonetic pada '者' tidak cocok rima bacaan on-yomi (シャ vs ショ) | Terdiri dari matahari (日) di bagian atas dan 者 di bagian bawah sebagai penunjuk bunyi. | Cara mengingat: Matahari (日) bersinar panas pada seseorang (者) saat musim panas. |
| 14 | **曜** | gemini | `needs_review` | `traditional` | `bacaan Jepang kini berbeda (翟: ケキ, ジャク, タク, タイ / 曜: ヨウ)` | ❌ | `日(makna) 翟(fonetik)` | Klaim phonetic pada '翟' tidak cocok rima bacaan on-yomi (ケキ, ジャク, タク, タイ vs ヨウ) | Gabungan matahari dan komponen 翟 yang memberi bunyi ヨウ untuk hari. | Cara mengingat: Matahari bersinar setiap hari dalam seminggu. |
| 15 | **書** | gemini | `rejected` | `traditional` | - | - | `聿(makna) 日(bentuk) 曰(bentuk)` | Karakter CJK '曰' pada field 'etymology_id' tidak diizinkan (bukan kanji target, komponen pohon, KRADFILE, old_form, maupun kata konteks) | Terdiri dari kuas tulis (聿) di atas dan kotak (日/曰) di bawah. | Cara mengingat: Menggunakan kuas (聿) untuk menulis kata-kata setiap hari (日). |
| 16 | **活** | gemini | `needs_review` | `traditional` | `bacaan Jepang kini berbeda (舌: ゼツ / 活: カツ)` | ❌ | `氵(makna) 舌(fonetik)` | Klaim phonetic pada '舌' tidak cocok rima bacaan on-yomi (ゼツ vs カツ) | Gabungan air (氵) dan unsur lidah (舌) sebagai bunyi. | Cara mengingat: Air (氵) menghidupkan lidah (舌) yang haus agar kembali aktif. |
| 17 | **究** | gemini | `draft` | `traditional` | `九 (キュウ) → 究 (キュウ)` | ✅ | `穴(makna) 九(fonetik)` | - | Gabungan lubang (穴) dan unsur sembilan (九) sebagai bunyi. | Cara mengingat: Menggali lubang (穴) untuk menyelidiki secara mendalam. |
| 18 | **符** | gemini | `rejected` | `traditional` | `付 (フ) → 符 (フ)` | ✅ | `竹(makna) 付(fonetik)` | Mnemonik harus memuat citra konkret atau petunjuk bunyi | Gabungan bambu dan 付 yang memberi bunyi フ. Berkaitan dengan tanda atau tiket dari bambu. | Cara mengingat: Potongan bambu yang melekat sebagai tanda tiket. |
| 19 | **美** | gemini | `needs_review` | `uncertain` | - | - | `⺷(bentuk) 大(makna)` | - | Terdiri dari komponen ⺷ dan 大. | Cara mengingat: Domba yang bertubuh besar tampak indah. |
| 20 | **肉** | gemini | `rejected` | `traditional` | - | - | `` | 'components' harus berupa array dan tidak boleh kosong; Mnemonik harus memuat citra konkret atau petunjuk bunyi | Kanji ini adalah gambar penampang daging. | Cara mengingat: Bayangkan bentuk potongan daging tebal. |
| 21 | **花** | gemini | `draft` | `traditional` | `化 (カ) → 花 (カ)` | ✅ | `艹(makna) 化(fonetik)` | - | Gabungan rumput (艹) dan unsur perubahan (化). | Cara mengingat: Rumput (艹) yang berubah (化) indah menjadi bunga. |
| 22 | **菜** | gemini | `draft` | `traditional` | `采 (サイ) → 菜 (サイ)` | ✅ | `艹(makna) 艸(bentuk) 采(fonetik)` | - | Kanji gabungan makna dan bunyi. Komponen rumput (艹) memberikan arti dasar tanaman/sayur, dan 采 memberikan bunyi on-yomi サイ. | Cara mengingat: Tanaman rumput (艹) dan bentuk (采) menghasilkan sayuran. |
| 23 | **計** | gemini | `needs_review` | `traditional` | `bacaan Jepang kini berbeda (十: ジュウ, ジッ, ジュッ / 計: ケイ)` | ❌ | `言(makna) 十(fonetik)` | Klaim phonetic pada '十' tidak cocok rima bacaan on-yomi (ジュウ, ジッ, ジュッ vs ケイ) | Gabungan kata (言) dan angka sepuluh (十) sebagai petunjuk bunyi. | Cara mengingat: Kata-kata (言) yang dihitung dengan angka (十) untuk membuat rencana. |
| 24 | **話** | gemini | `rejected` | `traditional` | `bacaan Jepang kini berbeda (舌: ゼツ / 話: ワ)` | ❌ | `言(makna) 舌(fonetik)` | Mnemonik harus memuat citra konkret atau petunjuk bunyi | Gabungan kata bicara dan lidah yang memberi bunyi. | Cara mengingat: Menggerakkan lidah dan kata untuk berbicara. |
| 25 | **起** | gemini | `draft` | `traditional` | `己 (キ) → 起 (キ)` | ✅ | `走(makna) 己(fonetik)` | - | Gabungan lari (走) dan diri sendiri (己). | Cara mengingat: Berlari (走) untuk membangunkan diri sendiri (己) dari tempat tidur. |
| 26 | **部** | gemini | `needs_review` | `traditional` | `bacaan Jepang kini berbeda (咅: トウ / 部: ブ)` | ❌ | `咅(fonetik) ⻏(bentuk)` | Klaim phonetic pada '咅' tidak cocok rima bacaan on-yomi (トウ vs ブ) | Gabungan komponen 咅 yang memberi bunyi ブ dan bukit/wilayah. | Cara mengingat: Bagian wilayah kantor tempat orang bekerja. |
| 27 | **院** | gemini | `needs_review` | `traditional` | `bacaan Jepang kini berbeda (完: カン / 院: イン)` | ❌ | `⻖(bentuk) 完(fonetik)` | Klaim phonetic pada '完' tidak cocok rima bacaan on-yomi (カン vs イン) | Terdiri dari komponen ⻖ dan 完 yang memberi bunyi. | Cara mengingat: Kompleks bangunan (⻖) yang selesai (完) dibangun. |
| 28 | **電** | gemini | `needs_review` | `uncertain` | - | - | `雨(makna) 日(makna)` | - | Terdiri dari komponen 雨 dan 日. | Cara mengingat: Saat hujan (雨) turun, terlihat kilatan listrik seperti matahari (日). |
| 29 | **靴** | gemini | `draft` | `traditional` | `化 (カ) → 靴 (カ)` | ✅ | `革(makna) 化(fonetik)` | - | Gabungan kulit (革) dan perubahan (化). | Cara mengingat: Kulit (革) yang diubah (化) menjadi sepatu. |
| 30 | **黒** | gemini | `needs_review` | `uncertain` | - | - | `里(bentuk) 灬(bentuk) 火(bentuk)` | - | Terdiri dari komponen 里 dan api (灬). | Cara mengingat: Di desa (里) yang terbakar api (灬) tersisa abu yang hitam (黒). |


---
### Laporan Khusus Komponen Fonetik (reading_match):
| Kanji | Sumber | Komponen Fonetik | On-yomi Komponen | On-yomi Kanji | Match | Catatan |
|:---:|:---:|:---:|:---|:---|:---:|:---|
| **便** | gemini | **更** | `コウ` | `ベン, ビン` | ❌ false |  |
| **冷** | gemini | **令** | `レイ` | `レイ` | ✅ true |  |
| **勉** | gemini | **免** | `メン` | `ベン` | ✅ true |  |
| **地** | gemini | **也** | `ヤ, エ` | `チ, ジ` | ❌ false |  |
| **富** | gemini | **畐** | `フク, ヒョク, ヒキ` | `フ, フウ` | ❌ false |  |
| **屋** | gemini | **至** | `シ` | `オク` | ❌ false |  |
| **新** | gemini | **斤** | `キン` | `シン` | ❌ false |  |
| **暑** | gemini | **者** | `シャ` | `ショ` | ❌ false |  |
| **曜** | gemini | **翟** | `ケキ, ジャク, タク, タイ` | `ヨウ` | ❌ false |  |
| **活** | gemini | **舌** | `ゼツ` | `カツ` | ❌ false |  |
| **究** | gemini | **九** | `キュウ, ク` | `キュウ, ク` | ✅ true |  |
| **符** | gemini | **付** | `フ` | `フ` | ✅ true |  |
| **花** | gemini | **化** | `カ, ケ` | `カ, ケ` | ✅ true |  |
| **菜** | gemini | **采** | `サイ` | `サイ` | ✅ true |  |
| **計** | gemini | **十** | `ジュウ, ジッ, ジュッ` | `ケイ` | ❌ false |  |
| **話** | gemini | **舌** | `ゼツ` | `ワ` | ❌ false |  |
| **起** | gemini | **己** | `コ, キ` | `キ` | ✅ true |  |
| **部** | gemini | **咅** | `トウ` | `ブ` | ❌ false |  |
| **院** | gemini | **完** | `カン` | `イン` | ❌ false |  |
| **靴** | gemini | **化** | `カ, ケ` | `カ` | ✅ true |  |

---
*Jangan menyetujui apa pun sebelum peninjauan selesai. Gunakan `approve.mjs --only <daftar>` hanya setelah ditinjau.*
