# Cat Adventure — Test Report

Tanggal pengujian: 6–7 November 2026, Asia/Jakarta.

## Revisi dekorasi, mobile, dan zoom — 7 November

- Pohon, jamur besar, semak, dan lentera diverifikasi terhadap interval tanah nyata pada ketiga map, termasuk lebar objek dan tinggi tanah. Jamur menggantung di bawah papan dihapus. Batang jamur disejajarkan dengan tanah meskipun PNG memiliki ruang transparan di bawahnya.
- `npm run test:mobile`: PASS pada Chrome dengan `isMobile`, `hasTouch`, dan device scale 2. Ukuran 320x568, 390x844, 844x390, 667x375, 768x1024, dan 1024x768. Canvas tetap 16:9, tanpa overflow/irisan area tombol, target sentuh minimal 44 px.
- CDP mengirim sentuhan native beberapa jari: bergerak sambil jump/double jump, larangan lompatan ketiga, touchcancel, pause dengan jari kedua, resume, dan reset input saat rotasi. Awal ketiga level diuji gerak/lompat sentuh; pemilihan level menggunakan fixture, bukan klaim perjalanan penuh dengan sentuhan.
- Navigasi sentuh Cara Bermain, Settings, Level Select diuji pada ponsel kecil, landscape, dan tablet. Screenshot nyata dari browser emulasi diperiksa.
- Shortcut Ctrl +/-/0 dan Ctrl+wheel dicegah; Ctrl+F tetap tersedia. Native pinch dengan enam gerakan bertahap di canvas tidak mengubah `visualViewport.scale`; gesture identik pada halaman kontrol yang mengizinkan zoom meningkatkan skala lebih dari 10%. Ini tidak menguji atau mengendalikan menu zoom browser maupun pembesar OS.
- Bug ditemukan: sentuhan jari kedua pada Pause tidak menghasilkan click browser. Diperbaiki dengan penanganan pointerup sentuh. ResizeObserver memastikan canvas ikut berubah setelah layout React berubah. Input tidak menetap setelah cancel/pause/rotasi.
- Driver tes desktop diperketat: tunggu buffer lompatan habis dan kecepatan vertikal nol sebelum menganggap karakter sudah mendarat. Run awal terhenti karena timing traversal; run final penuh PASS sampai ending dengan skor 980 dan lima hati. Build dan tes browser dijalankan bergantian pada verifikasi akhir.
- Build production berhasil. Smoke production PASS: aset, gerak, pickup, pause/menu, console bersih, tanpa hook inspeksi development.
- Review otomatis tiga putaran: satu P2 terkait kekuatan pembuktian pinch diperbaiki, final PASS tanpa temuan. Detail pada `docs/reviews/2026-11-07-mobile-scenery-zoom.md`.

## Revisi layar dan platform — 7 November

- Semua platform gantung/bergerak turun 12 px; collectible di atasnya mengikuti. Tes memastikan collider pemain masih dapat berjalan di bawah platform.
- Bingkai, header, footer, dan petunjuk luar dihapus. Game memakai seluruh viewport browser dengan kanvas 16:9 tanpa distorsi.
- Petunjuk ditampilkan melalui dialog sebelum run baru, termasuk dari Level Select. Scene gameplay belum aktif sebelum "Mulai Bermain" ditekan. Retry dan Next Level tidak menampilkan ulang petunjuk.
- Browser menguji ukuran 1920x1080, 1366x768, 1024x600, dan 390x844: wadah game tepat sebesar viewport, tidak ada elemen petunjuk luar, kanvas tetap 16:9.
- Auto-review revisi: satu putaran PASS, tanpa temuan. Lihat `docs/reviews/2026-11-07-fullscreen-platforms.md`.

## Lingkungan dan metode

- Windows, Node.js 26.13.0, npm 11.20.0.
- React 19.2.0, Phaser 3.90.0, Vite 7.3.7, Playwright 1.56.1.
- Google Chrome nyata dalam mode headless dengan profil sementara, melalui Playwright. Chrome DevTools MCP tidak tersedia; **tidak mengklaim menggunakan MCP tersebut**.
- `npm test`: pengujian `node:test` tanpa framework tambahan.
- `npm run test:browser`: pengujian DOM, keyboard, screenshot, console, storage, dan physics Phaser.
- Traversal tiga level memakai tombol A/D/Space sungguhan melalui Playwright. Tidak memindahkan pemain, mengubah inventori, menonaktifkan musuh, atau menambah hati selama traversal.
- Tes kasus khusus menempatkan body pemain sebagai fixture untuk damage, checkpoint, coyote time, input buffer, jurang, duri, dan pijakan platform. Fixture bukan bukti traversal; hasilnya dicatat terpisah.

## Hasil fitur

| Pengujian | Hasil |
| --- | --- |
| Skor +10 ikan, +25 coin, +100 level, +20/hati pada ending | PASS, unit dan browser |
| Skor/hati/koleksi kumulatif lintas tiga level | PASS |
| Snapshot restart dan Retry tanpa farming skor | PASS |
| Parsing save rusak, tipe tidak valid, storage gagal | PASS |
| Target ikan, lebar dunia, checkpoint aman, batas patrol | PASS |
| Batas dua lompatan pada render di atas 60 Hz | PASS, regresi controller dengan flag physics tertinggal |
| Gerak, collision tanah, jump dan double jump | PASS, browser |
| Coyote time dan jump buffer | PASS, fixture pada controller/physics asli |
| Lima hati, damage musuh/duri/jurang, respawn | PASS, browser |
| Invincibility 1,5 detik dan pause saat kebal | PASS, browser |
| Checkpoint aktif dan mempertahankan item saat respawn | PASS |
| Moving platform membawa pemain saat diam dan berbalik | PASS, diam 3,8 detik di atas collider asli |
| Batas gelombang bat dan freeze pola terbang saat pause | PASS |
| Gerbang menolak pemain yang belum cukup ikan | PASS |
| Menu, How to Play, Settings, Pause, Game Over, Retry | PASS |
| Fokus dialog native dan tombol keyboard | PASS; fokus browser chrome tidak dianggap kebocoran fokus halaman |
| Penyimpanan mute/reduced motion setelah reload | PASS |
| High score dan unlock Level 2/3 setelah reload | PASS |
| Level Select menghormati lock dan memulai run baru | PASS |
| Kegagalan aset mempertahankan dialog error; reload pulih | PASS, request aset sengaja dibatalkan pada halaman tes terpisah |
| Lifecycle restart tidak menggandakan canvas | PASS |
| Space yang ditahan tidak menggulir halaman | PASS, event keyboard repeat |
| Web Audio aktif setelah interaksi | PASS, state AudioContext; kualitas suara tidak diuji lewat pendengaran manusia |

## Bukti penyelesaian tiga level

Traversal campaign versi revisi menggunakan keyboard, lima hati tetap utuh:

| Level | Ikan level / target | Coin level | Skor kumulatif | Checkpoint | Akhir |
| --- | --- | --- | --- | --- | --- |
| Lost Forest | 7 / 5 | 5 | 295 | Aktif | Level Completed |
| Mushroom Valley | 9 / 7 | 3 | 560 | Aktif | Level Completed |
| Way Back Home | 12 / 10 | 4 | 980 | Aktif | Victory / rumah Mochi |

Ending revisi menampilkan 28 ikan, 12 coin, 5 hati, skor 980. Bonus hati +100 sudah termasuk. Skor akhir terkonfirmasi sebagai high score setelah reload; ketiga level terbuka.

Driver menunggu siklus moving platform dan crow pada beberapa titik. Percobaan awal driver gagal karena lompatan terlalu jauh, melompat menuju musuh, atau melepas gerak terlalu dekat duri. Rute diperbaiki memakai posisi dan arah gerak aktual; tidak menggunakan invincibility atau teleport untuk melewati bagian sulit. Kasus kegagalan ini tidak dilaporkan sebagai traversal berhasil.

Versi akhir driver menunggu ambang posisi lewat polling setiap animation frame di browser, lalu melepas tombol melalui Playwright. Ini mengurangi overshoot akibat perjalanan pesan antarproses. Run terakhir full suite dan production smoke sama-sama keluar dengan exit code 0.

## Visual dan ukuran layar

Screenshot nyata diperiksa pada desktop serta emulasi ponsel portrait/landscape. Rasio canvas tetap 16:9 dan tidak ada overflow horizontal. Pengujian sentuh dan ukuran perangkat pada revisi terbaru dicatat di bagian awal laporan.

Screenshot menu, ketiga tema, dan ending tersedia di `docs/screenshots/`. Aset asli terpisah di `public/assets/`; gambar referensi tidak dimasukkan ke runtime.

Sampel singkat 89 interval animation frame pada lingkungan headless teramati rata-rata sekitar 16,7 ms. Ini **bukan** jaminan 60 FPS untuk semua perangkat atau benchmark sesi panjang. Physics memakai fixed-step 60 Hz; pengujian high-refresh melindungi batas jumlah lompatan, bukan profil performa perangkat fisik 144 Hz.

## Build dan audit

- `npm install`: berhasil; lockfile disertakan.
- `npm test`: **7/7 lulus**, termasuk ketinggian platform dan dukungan tanah untuk dekorasi.
- `npm run build`: berhasil, output pada `dist/`.
- `npm audit`: **0 vulnerabilities** setelah pembaruan Vite ke 7.3.7.
- Campaign browser berhasil tanpa console error atau warning.
- `node tests/production.mjs`: PASS pada preview port 4173; aset tidak gagal, gerak/pickup/pause/menu bekerja, console bersih, hook debug tidak tersedia.

## Bug ditemukan dan diperbaiki

1. Gelombang musuh terbang bergeser akibat integrasi velocity dari fase awal berbeda. Diganti sinus terikat tinggi konfigurasi; jalur bat tidak mengganggu tempat berdiri pada platform.
2. Pada render lebih cepat dari physics, flag grounded lama bisa mengisi kembali jump count. Grounded sekarang mensyaratkan kecepatan vertikal tidak naik. Tes regresi gagal sebelum perbaikan dan lulus sesudahnya.
3. Timestamp absolut menghabiskan immunity dan mengubah fase terbang selama pause. Semua timer gameplay kini memakai akumulasi waktu scene yang aktif.
4. Menu muncul setelah aset gagal dimuat. Boot kini menahan startup dan menampilkan pemulihan sampai reload berhasil.
5. Event keyboard repeat melewati pencegahan scroll. Pencegahan default gameplay sekarang dilakukan sebelum pemeriksaan repeat.
6. Ukuran game awal terlalu tinggi untuk laptop 768 px. Lebar maksimum kini memperhitungkan tinggi viewport sambil mempertahankan 16:9.
7. Fatal fall bersamaan dengan habisnya pesan HUD menimpa Game Over dengan status playing. Update kini langsung berhenti setelah kematian; regresi browser membuktikan dialog Retry tetap tersedia.

## Keterbatasan

- Kontrol sentuh diuji pada emulasi Chrome. Perangkat Android/iOS fisik, Safari, Firefox, perangkat lambat, dan sesi bermain panjang belum diverifikasi.
- Browser/OS dapat mengabaikan larangan zoom halaman untuk aksesibilitas; zoom melalui menu browser atau pembesar OS tidak dapat dijamin terblokir.
- Pengaturan/unlock/high score disimpan, tetapi posisi run dan checkpoint tidak dilanjutkan setelah reload, sesuai perilaku README.
- Efek suara sintetis, tanpa musik latar. AudioContext dan pemicu gameplay diuji; belum ada uji dengar manusia.
- Review otomatis: tiga putaran, empat temuan diperbaiki, hasil akhir PASS tanpa temuan tersisa. Detail pada `docs/reviews/2026-11-07-cat-adventure.md`; status review tidak disamakan dengan hasil build atau tes browser.

## Mengulang pengujian

```sh
npm install
npm test
npm run build
npm run dev -- --port 5173
# Pada terminal kedua:
npm run test:browser
npm run test:mobile
```

Chrome harus terpasang. Hasil aktual setiap run tersedia di `test-results/results.json`, dengan screenshot dan `failure.png` jika suatu assertion gagal.
