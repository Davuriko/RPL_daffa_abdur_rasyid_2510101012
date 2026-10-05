1. Deskripsi Masalah
   Banyak mahasiswa yang memiliki keahlian memasak, membuat kue, atau meracik minuman rumahan/kossan ingin berjualan untuk menambah uang saku. Namun, mereka terkendala modal untuk membuka toko fisik, kesulitan memasarkan produk di luar jam kuliah, dan promosi di grup WhatsApp kampus seringkali tenggelam oleh informasi akademik. Di sisi lain, mahasiswa pembeli sering bingung mencari pilihan makanan halal, murah, dan dekat di dalam area kampus saat jam istirahat.

2. Profil Target Pengguna
   Admin: Pengelola sistem kampus/organisasi mahasiswa yang bertugas memverifikasi toko, memantau aktivitas transaksi, dan mengelola data master kategori.

Penjual (Mahasiswa): Mahasiswa yang ingin membuka lapak online kecil-kecilan untuk menjual makanan/minuman buatan sendiri ke sesama warga kampus.

Pembeli (Mahasiswa/Dosen): Pengguna kampus yang ingin mencari, memesan, dan membeli makanan praktis langsung dari sesama mahasiswa secara mudah.

3. Manfaat Aplikasi
   Menjadi wadah digital terpusat (marketplace mikro) khusus civitas akademika.

Mempermudah transaksi langsung melalui alur keranjang belanja yang bermuara ke direct checkout via WhatsApp penjual.

Membantu mahasiswa wirausaha (student-preneur) mengelola menu dan pesanan mereka dengan rapi.

4. Daftar Fitur Inti (Realistis untuk 12 Pertemuan)
   Autentikasi & Role: Register/Login untuk 3 Role (Admin, Penjual, Pembeli) dengan enkripsi password dasar dan session/JWT sederhana.

Modul Admin:

Dashboard statistik singkat (total pengguna, total toko aktif).

Verifikasi/manajemen status toko penjual.

Modul Penjual:

Pendaftaran toko (nama toko, deskripsi, kontak WA).

CRUD Menu Makanan/Minuman (nama, harga, kategori, status stok).

Manajemen status pesanan masuk.

Modul Pembeli:

Katalog menu dengan filter pencarian dan kategori.

Keranjang Belanja (Cart) lokal/session.

Checkout pesanan otomatis yang menghasilkan format pesan WhatsApp terstruktur ke nomor penjual.

5. Fitur yang Tidak Dikerjakan (Out of Scope)
   Payment Gateway otomatis (Midtrans/Xendit) – diganti dengan sistem konfirmasi manual / chat WhatsApp.

Fitur Kurir/Ojek Internal Kampus – pengiriman diasumsikan diambil sendiri (Self-Pickup) atau diatur langsung via chat pembeli-penjual.

Notifikasi Push Real-time (WebSocket/Socket.io) – menggunakan polling/refresh sederhana.

6. Kriteria Keberhasilan Aplikasi
   Ketiga role (Admin, Penjual, Pembeli) dapat melakukan registrasi, login, dan masuk ke halaman dashboard masing-masing sesuai hak akses.

Penjual berhasil menambahkan produk menu ke database MySQL.

Pembeli dapat memasukkan produk ke keranjang dan mengklik tombol checkout yang sukses mengarahkan teks pesanan ke WhatsApp penjual.

Aplikasi berjalan di atas arsitektur Monorepo npm workspaces dengan Docker Compose untuk MySQL dan Prisma ORM.
