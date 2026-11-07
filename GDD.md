# Cat Adventure — Game Design Document

## Overview dan cerita

Platformer single-player desktop, ponsel, dan tablet yang hangat dan ringan. Mochi terpisah dari rumah ketika menjelajahi hutan gugur. Ikan biru menunjukkan arah perjalanan, bendera memberi tempat singgah, dan cahaya rumah menutup petualangan pada senja hari. Tiga chapter memakai satu gameplay scene dengan data level terpisah.

## Karakter

Mochi memakai bulu jingga, wajah/dada krem, belang gelap, ekor jelas, syal merah dengan lonceng, dan topi merah permanen. Sprite sheet mempunyai 16 sel berukuran 48 x 48: idle 4, run 6, jump 1, fall 1, hurt 1, victory 3. Ukuran collider konsisten 23 x 31 sehingga perubahan pose tidak mengubah collision.

## Mekanisme

Kecepatan horizontal maksimum 178 px/detik; akselerasi 1.300 px/detik kuadrat dan drag 1.350. Gravity 1.000 px/detik kuadrat; kecepatan awal lompat -355 dan double jump -330. Lepas tombol saat naik untuk memotong kecepatan vertikal. Coyote time 105 ms dan input buffer 120 ms membantu lompatan di tepi platform. Hanya satu lompatan tambahan di udara; jatuh dari tepi menghabiskan hak ground jump.

Collider static untuk tanah/platform dan collider dynamic immovable untuk papan bergerak. Kamera mengikuti horizontal, dibatasi panjang dunia. Rendering memakai koordinat logis tetap; resize hanya mengubah skala tampilan.

Lima hati pada run baru. Setiap damage mengurangi satu hati dan memindahkan Mochi ke spawn atau checkpoint. Cooldown damage 1,5 detik, kedip visual, animasi hurt, dan camera shake kecil. Hati habis memicu Game Over. Pause menghentikan scene, physics, clock, musuh, dan platform; kembali dari pause membersihkan input yang tertahan.

## Musuh

| Jenis | Perilaku | Level |
| --- | --- | --- |
| Hedgehog | Patrol darat dua arah, membalik pada batas aman | 1, 2, 3 |
| Bat | Patrol horizontal dengan gelombang vertikal kecil | 2 |
| Crow | Patrol lebih cepat dan gelombang vertikal lebih besar | 3 |

Sentuhan memberikan damage, termasuk melompat di atas musuh. Tidak ada serangan atau stomp kill; pemain menghindari musuh.

## Desain level

**Lost Forest.** Empat bagian tanah utama, platform rendah untuk bonus, tiga jurang pendek. Awal aman mengenalkan gerak, tanda jalan mengajarkan double jump. Target 5 ikan, tersedia 10. Checkpoint x=1390, gerbang x=2600. Hedgehog memperkenalkan timing lompatan.

**Mushroom Valley.** Lima bagian tanah dengan jurang tengah yang dijembatani papan horizontal. Jamur besar, partikel cahaya, warna ungu/pink. Platform semakin tinggi, tiga kelompok duri, bat dan hedgehog. Target 7 ikan, tersedia 13. Checkpoint x=1710, gerbang x=3270.

**Way Back Home.** Enam bagian tanah, sebagian lebih tinggi, platform gantung dan dua papan bergerak. Lima kelompok duri, hedgehog, dan crow. Lentera dan rumah menunjukkan tujuan. Target 10 ikan, tersedia 18. Checkpoint x=2090, rumah x=4000. Tidak ada Level 4.

Koordinat lengkap serta jumlah coin/musuh berada di `src/game/levels.js`. Kelebihan ikan menyediakan pilihan rute; semua item bonus tidak wajib diambil.

Revisi ketinggian: platform statis dan bergerak diturunkan 12 px dari desain awal; collectible di atas platform mengikuti perubahan tersebut. Clearance collider pemain saat berjalan di bawah platform tetap tersedia.

## Skor dan kondisi akhir

Ikan +10, Paw Coin +25, penyelesaian level +100, penyelesaian campaign +20 per sisa hati. HUD menampilkan ikan dan target **level saat ini**, coin level, serta skor kumulatif. Ending menampilkan ikan/coin **total run** dan sisa hati.

Gerbang memeriksa posisi dan jumlah ikan; kekurangan ikan ditampilkan, pemain dapat berjalan kembali. Ketika target terpenuhi, input berhenti, pose kemenangan diputar, bonus diberikan tepat sekali, high score dan unlock disimpan. Setelah Level 3, pesan "Mochi Finally Found His Way Home!" muncul dengan Main Lagi dan Main Menu.

Restart memakai snapshot awal level untuk mencegah farming skor. Retry Game Over memberikan hati baru sambil mengembalikan skor/koleksi awal level. Level Select menghormati unlock dan memulai run baru dari level pilihan.

## Presentasi dan aksesibilitas

Palet krem, hijau pastel, oranye gugur, coral, ungu hutan, dan cokelat gelap mengikuti referensi. Layer sky/far/near, pohon, semak, jamur, terrain, karakter, dan item merupakan PNG terpisah. Pixel density konsisten; nearest-neighbor tanpa smoothing. Font lokal Pixelify Sans.

Menu/HUD dibangun dengan React. Tombol HTML punya label, fokus keyboard terlihat, dialog native menjebak fokus, pengaturan memakai checkbox berlabel. Keyboard dan multitouch berbagi controller yang sama. Tombol arah/LOMPAT berada di luar canvas; tombol II mendukung pause ketika jari lain masih bergerak. Permainan visual dan timing-based belum menyediakan navigasi dunia untuk screen reader.

Pohon, jamur, semak, dan lentera mengikuti bidang tanah setiap level; dekorasi darat tidak diletakkan di jurang. Hutan jauh pada parallax adalah latar, bukan objek yang berdiri di jalur pemain.

Layout mengikuti viewport dengan safe area dan rasio dunia 16:9. Rotasi, kehilangan fokus, atau aplikasi tersembunyi menjeda permainan. Zoom keyboard, Ctrl/Cmd+wheel, dan gesture halaman dibatasi sesuai permintaan; menu browser dan aksesibilitas OS tetap dapat mengubah pembesaran.

Game memakai viewport penuh tanpa bingkai situs, header, footer, atau petunjuk di luar game. Sebelum run baru, layar "Sebelum Berpetualang" menjelaskan kontrol, target ikan level, hati, dan checkpoint. Gameplay baru dimulai setelah "Mulai Bermain" ditekan. Retry dan Next Level langsung melanjutkan alur permainan.

Audio dimulai setelah interaksi pengguna. Sembilan suara: jump, double jump, fish, coin, damage, checkpoint, complete, gameover, victory. Toggle mute dan kurangi efek gerak disimpan. Efek gerak mencakup partikel daun/cahaya, collectible sparkle, jump/landing dust, kedip damage, dan shake. Reduced motion menonaktifkan partikel, bob item, serta shake saat scene berikutnya dibuat; animasi karakter dan kedip invincibility tetap dipertahankan sebagai feedback gameplay.
