# CAT ADVENTURE

Game platformer 2D untuk proyek UTS. Bantu **Mochi**, kucing oren bertopi merah, pulang melalui tiga dunia side-scrolling. Aset dibuat khusus sebagai PNG terpisah, bukan potongan gambar referensi.

## Menjalankan

Memerlukan Node.js **22.12+** atau versi LTS yang lebih baru, serta npm.

```sh
npm install
npm run dev
```

Buka URL localhost yang ditampilkan Vite. Desktop memakai keyboard; ponsel/tablet memakai tombol sentuh. Pengujian otomatis memakai Chrome desktop dan emulasi perangkat sentuh.

Game memenuhi layar browser tanpa header/footer luar. Klik **Mulai Petualangan**, baca petunjuk di dalam game, lalu tekan **Mulai Bermain**. Pilihan level juga menampilkan petunjuk sebelum run baru. Rasio 16:9 dipertahankan; layar dengan rasio berbeda memakai ruang tepi tanpa merenggangkan gambar.

```sh
npm run build
npm run preview
```

`dist/` berisi build statis siap hosting. Jalankan melalui HTTP; membuka `index.html` lewat `file://` tidak didukung.

## Teknologi

- React 19, Vite 7, JavaScript ES modules.
- Phaser 3.90 dengan Arcade Physics fixed-step 60 Hz.
- Canvas/WebGL 640 x 360, tampilan FIT 16:9, nearest-neighbor.
- Web Audio untuk sembilan efek suara sintetis orisinal.
- LocalStorage untuk high score, level terbuka, mute, dan pengurangan efek gerak.

## Kontrol

| Tombol | Aksi |
| --- | --- |
| A / D atau panah kiri / kanan | Bergerak |
| Space / W / panah atas | Lompat; tekan ulang di udara untuk satu double jump |
| Tahan / lepas tombol lompat | Lompatan lebih tinggi / pendek |
| Esc / P | Pause / resume |
| M | Mute / unmute |

Terdapat coyote time 105 ms, jump buffer 120 ms, akselerasi, pengereman, dan invincibility 1,5 detik. Kehilangan fokus browser otomatis menjeda permainan.

Ponsel/tablet: tahan **KIRI/KANAN**, tekan **LOMPAT** dengan jari lain. Lepas lalu tekan LOMPAT lagi untuk double jump; tahan untuk lompatan tinggi. Tombol **II** menjeda permainan, termasuk saat jari lain masih menekan arah. Rotasi layar atau berpindah aplikasi menjeda permainan; tekan Lanjutkan sesudahnya. Input sentuh dibersihkan saat ukuran layar berubah, pause, atau sentuhan dibatalkan.

Mode portrait dan landscape tersedia. Area kontrol terpisah dari canvas, tombol sentuh minimal 44 px, dan rasio dunia tetap 16:9. Landscape disarankan untuk pandangan lebih besar. Shortcut zoom Ctrl/Cmd `+`, `-`, `0`, roda mouse dengan Ctrl/Cmd, serta pinch pada area game diblokir sejauh didukung browser. Zoom dari menu browser, pengaturan aksesibilitas, atau pembesar OS tetap di bawah kendali perangkat.

Untuk membuka dari ponsel pada Wi-Fi yang sama, jalankan `npm run dev -- --host 0.0.0.0`, lalu buka `http://IP-LAN-KOMPUTER:5173` di ponsel (gunakan alamat IPv4 komputer dari `ipconfig`). Jaringan/firewall harus mengizinkan koneksi tersebut. Alamat `127.0.0.1` hanya berlaku pada komputer yang menjalankan server.

## Tiga level

| Level | Panjang | Target ikan | Karakteristik |
| --- | --- | --- | --- |
| Lost Forest | 2.720 px | 5 dari 10 | Hutan pastel, jurang pendek, hedgehog, platform bertingkat |
| Mushroom Valley | 3.400 px | 7 dari 13 | Jamur raksasa, bat, duri, platform bergerak di jurang tengah |
| Way Back Home | 4.160 px | 10 dari 18 | Senja, crow, dua platform bergerak, jembatan kayu, lentera, rumah Mochi |

Setiap level mempunyai checkpoint. Papan bergerak membawa karakter melalui collider dinamis immovable dan friction horizontal Phaser. Gerbang hanya terbuka ketika target ikan level tersebut terpenuhi. Rumah pada Level 3 mengakhiri permainan.

Revisi 7 November: semua platform gantung dan papan bergerak diturunkan 12 piksel. Ikan/coin yang berada di atas platform ikut turun, sementara spawn, checkpoint, dan tanah tetap pada posisi semula.

Pohon, jamur besar, semak, dan lentera kini ditempatkan hanya pada tanah yang menopang lebarnya. Tinggi dekorasi mengikuti tanah bertingkat; jurang tidak diberi dekorasi darat melayang. Siluet hutan jauh tetap menjadi latar parallax.

## Skor, hati, dan penyimpanan

- Mulai baru atau melalui Level Select: 5 hati dan skor 0.
- Ikan +10, Paw Coin +25, selesai level +100, ending +20 per hati tersisa.
- Skor, total koleksi, dan sisa hati diteruskan saat menekan Next Level.
- Damage musuh, duri, atau jurang mengurangi satu hati lalu respawn di titik aman. Item yang sudah diambil tidak muncul lagi setelah respawn.
- Restart mengembalikan skor/koleksi/hati ke snapshot awal level. Retry setelah Game Over memakai snapshot yang sama tetapi memberikan 5 hati.
- Level 2/3 terbuka setelah level sebelumnya selesai. Level Select memulai perjalanan baru dari level terbuka tersebut.
- Save memakai key `cat-adventure-v1`. Posisi karakter, checkpoint, dan run yang sedang berlangsung **tidak** disimpan setelah halaman dimuat ulang. Unlock, high score, dan pengaturan disimpan.
- Jika LocalStorage diblokir/penuh, permainan tetap berjalan dan memberi pemberitahuan bahwa save hanya bertahan pada sesi ini.

## Struktur

```text
src/
  main.jsx                  React entry
  game/
    createGame.js           Inisialisasi dan lifecycle Phaser
    BootScene.js, assets.js Loading dan registrasi animasi
    MenuScene.js            Latar hidup pada menu utama
    PlayScene.js            Satu gameplay scene untuk seluruh level
    levels.js              Semua koordinat level
    Player.js              Controller, coyote time, buffer, double jump
    enemies.js             Patrol hedgehog, gelombang bat/crow
    collectibles.js        Pengambilan item dan feedback
    checkpoint.js          Aktivasi bendera dan respawn
    scenery.js             Parallax, terrain, partikel
    state.js, save.js       Skor, snapshot, penyimpanan tervalidasi
    audio.js               Sintesis Web Audio
  ui/
    App.jsx                Host game dan navigasi UI
    HUD.jsx, Overlays.jsx  HUD dan dialog HTML yang bisa diakses keyboard
    TouchControls.jsx      Tombol multitouch dengan pointer capture
    styles.css             Palet, tipografi, layout responsif
public/assets/             PNG, sprite sheet, font lokal, lisensi font
scripts/generate_assets.py Generator PNG deterministik
tests/                     Unit dan tes browser yang dapat dijalankan
docs/reviews/              Hasil auto Codex review
GDD.md                     Desain sesuai implementasi
TEST_REPORT.md             Bukti uji dan batasannya
```

## Pengujian

```sh
npm test
```

Tes browser memerlukan **Google Chrome** terpasang dan Vite berjalan di `http://127.0.0.1:5173`.

```sh
npm run dev -- --port 5173
# terminal kedua, dari folder proyek:
npm run test:browser
npm run test:mobile
```

Tes memakai profil browser sementara, tidak menyentuh profil pribadi. Screenshot dan catatan pengujian ditulis ke `test-results/`. Hook inspeksi `window.__CAT_GAME__` hanya tersedia di development, dihapus dari build production. Rute keyboard dibedakan dari pengujian fixture yang memindahkan karakter untuk menyiapkan kasus khusus.

Smoke test build production: jalankan `npm run preview -- --port 4173`, lalu `node tests/production.mjs` pada terminal kedua.

## Aset dan lisensi

- 39 PNG: dibuat orisinal secara programatis untuk proyek ini. Tidak memakai gambar referensi sebagai background atau sprite sheet.
- Semua sprite, tile, scenery, dan kode proyek: MIT, lihat `LICENSE`.
- Efek suara: osilator Web Audio orisinal, tanpa file audio eksternal.
- **Pixelify Sans**, font lokal dari Google Fonts: SIL Open Font License 1.1. Lihat `public/assets/FONT-LICENSE.txt`; sumber: https://github.com/google/fonts/tree/main/ofl/pixelifysans.
- React/Vite: MIT. Phaser: MIT. Playwright (dev dependency): Apache-2.0. Lisensi dependency tersedia pada paket masing-masing.
- Gambar referensi pengguna dipakai sebagai arahan visual saja dan tidak didistribusikan dalam proyek.

PNG sudah disertakan; Python tidak diperlukan untuk menjalankan game. Untuk menggambar ulang seluruh aset:

```sh
python -m pip install Pillow
python scripts/generate_assets.py
```

Kontrol sentuh diuji melalui emulasi Chrome, belum melalui perangkat Android/iOS fisik. Tidak ada sistem pertarungan.
