# Checklist Fitur MVP KampusBite & Status Pengujian

Dokumen ini memuat daftar inventaris seluruh fitur inti Minimum Viable Product (MVP) proyek **KampusBite**, cakupan fungsionalitas, integrasi end-to-end, penanganan kasus batas (edge cases), serta status verifikasi pengujian unit test otomatis (**Unit Test: PASSED**).

---

## Ringkasan Status Pengujian Unit Test

| Workspace / Modul | File Test | Skenario Diuji | Status |
| :--- | :--- | :---: | :---: |
| `@kampus-bite/shared` | `packages/shared/tests/shared.test.js` | 8 Skenario | **PASSED** |
| `@kampus-bite/api` | `apps/api/tests/auth.test.js` | 14 Skenario | **PASSED** |
| `@kampus-bite/api` | `apps/api/tests/store.test.js` | 14 Skenario | **PASSED** |
| `@kampus-bite/api` | `apps/api/tests/product.test.js` | 12 Skenario | **PASSED** |
| `@kampus-bite/api` | `apps/api/tests/order.test.js` | 14 Skenario | **PASSED** |
| `@kampus-bite/api` | `apps/api/tests/review.test.js` | 5 Skenario | **PASSED** |
| `@kampus-bite/api` | `apps/api/tests/admin.test.js` | 8 Skenario | **PASSED** |
| `@kampus-bite/api` | `apps/api/tests/dashboard.test.js` | 3 Skenario | **PASSED** |
| `@kampus-bite/api` | `apps/api/tests/middleware.test.js` | 4 Skenario | **PASSED** |
| `@kampus-bite/api` | `apps/api/tests/category.test.js` | 1 Skenario | **PASSED** |
| **TOTAL** | **10 File Pengujian** | **83 Skenario** | **100% PASSED** |

---

## 1. Modul Autentikasi & Manajemen Pengguna (Auth & Role)

Fitur untuk mengatur registrasi akun, login dengan enkripsi password (bcrypt), dan pembatasan hak akses berbasis JSON Web Token (JWT).

- [x] **Registrasi Pengguna Baru**
  - Mendaftar sebagai Pembeli (`BUYER`) atau Penjual (`SELLER`).
  - Validasi kelengkapan form: Nama, Email, Password.
  - Validasi format email baku regex dan panjang password minimal 6 karakter.
  - Penolakan duplikasi email terdaftar (HTTP 409 Conflict).
  - Enkripsi password menggunakan `bcrypt` salt rounds 10.
  - *Status Unit Test:* **PASSED** (`auth.test.js` - 7 skenario)

- [x] **Login & Penerbitan Token JWT**
  - Validasi kecocokan email dan verifikasi password hash.
  - Penolakan kombinasi email/password yang tidak cocok (HTTP 401 Unauthorized).
  - Penerbitan JWT Token dengan payload data pengguna (`Id`, `Role`, `Name`) masa berlaku 7 hari.
  - *Status Unit Test:* **PASSED** (`auth.test.js` - 4 skenario)

- [x] **Profil Pengguna & Middleware Keamanan**
  - Endpoint `GET /api/auth/me` untuk memverifikasi keabsahan sesi pengguna.
  - Middleware `RequireAuth` untuk menolak request tanpa token atau token rusak (HTTP 401).
  - Middleware `RequireRole(roles...)` untuk menolak akses role yang tidak berhak (HTTP 403 Forbidden).
  - *Status Unit Test:* **PASSED** (`auth.test.js`, `middleware.test.js` - 7 skenario)

---

## 2. Modul Penjual (Seller Module)

Fitur khusus bagi mahasiswa wirausaha kampus untuk mendaftarkan lapak online, mengelola menu makanan/minuman, serta memproses pesanan masuk.

- [x] **Pendaftaran & Informasi Toko**
  - Form pendaftaran toko baru (Nama Toko, Nama Pemilik, Nomor WhatsApp, Lokasi Kampus).
  - Batasan integritas bisnis: satu akun penjual maksimal memiliki satu toko (HTTP 409 jika sudah ada).
  - Endpoint `GET /api/stores/mine` untuk mengambil profil toko milik penjual yang sedang login.
  - *Status Unit Test:* **PASSED** (`store.test.js` - 6 skenario)

- [x] **Manajemen Jam Operasional (Buka / Tutup Toko)**
  - Tombol toggle status operasional toko secara real-time.
  - Toko yang tutup otomatis menolak checkout pesanan baru dengan pesan informatif.
  - Label toko tutup ditampilkan pada katalog pembeli.
  - *Status Unit Test:* **PASSED** (`store.test.js`, `order.test.js` - 4 skenario)

- [x] **Dashboard Metrik Penjualan Toko**
  - Statistik ringkasan pendapatan: Total Penjualan (akumulasi pesanan berstatus Selesai).
  - Indikator Pesanan Aktif (pesanan yang sedang menunggu konfirmasi, dimasak, atau siap).
  - Jumlah total menu yang terdaftar di toko.
  - Penanda badge verifikasi toko oleh Administrator.
  - *Status Unit Test:* **PASSED** (`dashboard.test.js` - 3 skenario)

- [x] **Pengelolaan Menu Kuliner (CRUD Menu)**
  - **Tambah Menu:** Input Nama, Kategori, Harga (Rupiah), Deskripsi, URL Foto, dan Status Ketersediaan Stok.
  - **Daftar Menu:** Tampilan tabel terstruktur dengan foto, kategori, format harga Rp, rating bintang, dan status.
  - **Edit Menu:** Pembaruan data produk secara real-time.
  - **Hapus Menu:** Konfirmasi sebelum menghapus dengan feedback visual.
  - Validasi penolakan harga negatif dan input tidak lengkap (HTTP 400).
  - *Status Unit Test:* **PASSED** (`product.test.js` - 12 skenario)

- [x] **Manajemen Status Pesanan Masuk (Order Workflow)**
  - Tampilan daftar pesanan masuk terurut dari yang terbaru.
  - Tombol aksi transisi status bertahap:
    - `PENDING` (Menunggu Konfirmasi) → `PREPARING` (Terima & Masak) atau `CANCELLED` (Tolak)
    - `PREPARING` (Sedang Dimasak) → `READY` (Tandai Siap)
    - `READY` (Siap Diambil/Diantar) → `COMPLETED` (Selesaikan Pesanan)
  - Penolakan nilai status pesanan di luar enum yang valid (HTTP 400).
  - *Status Unit Test:* **PASSED** (`order.test.js` - 6 skenario)

---

## 3. Modul Pembeli (Customer Module)

Fitur ramah pengguna untuk mahasiswa dan civitas akademika dalam mencari, memesan jajanan, dan melacak status pesanan.

- [x] **Eksplorasi & Filter Katalog Menu**
  - Tampilan grid kartu produk dengan foto menu, nama toko, rating bintang, dan harga Rp.
  - Filter interaktif berbasis kategori: "Semua", "Makanan Berat", "Camilan", "Minuman", "Dessert".
  - Filter berbasis toko kuliner dengan indikator status Buka/Tutup.
  - Pencarian menu real-time berdasarkan kata kunci nama produk (contoh: "Geprek", "Risol").
  - *Status Unit Test:* **PASSED** (`product.test.js`, `category.test.js` - 3 skenario)

- [x] **Keranjang Belanja (Cart Management)**
  - Penambahan menu ke keranjang belanja dengan visual badge jumlah item.
  - Pengaturan kuantitas produk (tombol `+` dan `−`) serta kalkulasi subtotal instan.
  - Aturan bisnis satu toko: dialog konfirmasi otomatis jika pembeli ingin berpindah ke toko lain.
  - Validasi stok habis: menu berstatus `IsAvailable: false` atau toko yang tutup dinonaktifkan dari keranjang.
  - *Status Unit Test:* **PASSED** (`shared.test.js`, `order.test.js` - 4 skenario)

- [x] **Direct Checkout via WhatsApp Penjual**
  - Form checkout lengkap: Nama Lengkap, Nomor WhatsApp, Lokasi Antar di Area Kampus, Catatan Pesanan (opsional).
  - Otomatis mengingat nomor WhatsApp dan nama pemesan di penyimpanan lokal browser (`localStorage`).
  - Pencatatan pesanan ke database MySQL dengan status awal `PENDING`.
  - Generasi pesan WhatsApp otomatis terstruktur:
    - Nama toko tujuan
    - Daftar rincian kuantitas, nama menu, harga satuan, dan subtotal
    - Total biaya pesanan
    - Data pengiriman (Nama, WA, Lokasi Antar, Catatan)
    - Metode pembayaran (COD / Transfer ke Penjual)
  - Pembukaan link `wa.me/<nomor>?text=<pesan>` ke nomor WhatsApp penjual.
  - *Status Unit Test:* **PASSED** (`order.test.js`, `shared.test.js` - 8 skenario)

- [x] **Pelacakan Status Pesanan (Order Tracking)**
  - Akses riwayat pesanan dengan nomor WhatsApp pemesan.
  - Otomatis memuat data pesanan jika nomor WhatsApp telah tersimpan dari transaksi sebelumnya.
  - Tampilan kartu pesanan dengan badge status berwarna:
    - Kuning: Menunggu Konfirmasi
    - Biru: Sedang Dimasak/Disiapkan
    - Ungu: Siap Diambil/Diantar
    - Hijau: Selesai
  - *Status Unit Test:* **PASSED** (`order.test.js` - 4 skenario)

- [x] **Ulasan & Rating Menu (Customer Reviews)**
  - Komponen input bintang interaktif (skala 1 sampai 5).
  - Validasi otoritas ulasan: hanya pembeli yang nomor WhatsApp-nya tercatat pernah memesan menu terkait yang dapat memberikan rating (HTTP 403 Forbidden untuk selain pembeli sah).
  - Mekanisme upsert rating: pembeli dapat memperbarui rating ulasannya.
  - Perhitungan otomatis rata-rata rating (`RatingAverage`) dan jumlah pemberi ulasan (`RatingCount`) yang tersinkronisasi ke katalog produk.
  - *Status Unit Test:* **PASSED** (`review.test.js` - 5 skenario)

---

## 4. Modul Administrator (Admin Module)

Fitur khusus pengelola sistem/organisasi kampus untuk memantau ekosistem kuliner dan memverifikasi toko pedagang.

- [x] **Dashboard Statistik Agregat Kampus**
  - Kartu metrik ringkasan ekosistem:
    - Total Pengguna Terdaftar
    - Total Penjual Aktif
    - Total Pembeli Aktif
    - Total Toko Terdaftar
    - Jumlah Toko Terverifikasi
    - Jumlah Toko yang Sedang Buka
    - Total Menu Produk
    - Total Pesanan Masuk
  - *Status Unit Test:* **PASSED** (`admin.test.js` - 3 skenario)

- [x] **Verifikasi Toko Penjual**
  - Daftar seluruh toko terdaftar beserta nama penjual, kontak WhatsApp, dan lokasi di kampus.
  - Tombol aksi verifikasi satu-klik ("Verifikasi Toko" / "Batalkan Verifikasi").
  - Pembaruan status boolean `IsVerified` pada database dengan proteksi role `ADMIN`.
  - *Status Unit Test:* **PASSED** (`admin.test.js` - 3 skenario)

- [x] **Manajemen & Pemantauan Pengguna**
  - Tabel komprehensif daftar seluruh civitas akademika terdaftar (Nama, Email, dan Role Badge).
  - Proteksi endpoint agar hanya dapat diakses oleh Admin.
  - *Status Unit Test:* **PASSED** (`admin.test.js` - 2 skenario)

---

## 5. Kualitas Kode, Penanganan Error & UX (Edge Cases)

- [x] **Penanganan Input Tidak Valid:**
  - Validasi harga negatif pada produk (`Price < 0`).
  - Validasi email tidak sesuai standar format.
  - Validasi panjang password kurang dari 6 karakter.
  - Validasi form checkout kosong (nama, wa, lokasi).
  - Validasi rating di luar rentang 1-5.
- [x] **Penanganan Data Kosong (Empty States):**
  - Pesan ramah pada katalog jika hasil pencarian/filter tidak ditemukan.
  - Tampilan informatif saat keranjang masih kosong.
  - Tampilan informatif saat penjual belum memiliki menu atau belum ada pesanan masuk.
  - Tampilan informatif saat nomor WhatsApp belum memiliki riwayat pesanan.
- [x] **Indikator Loading:**
  - Status pemuatan data menu ("Memuat menu...").
  - Status pemrosesan form ("Menyimpan...", "Memproses...", "Mencari...").
  - Tombol submit otomatis di-disable saat pengiriman berlangsung untuk mencegah double submit.
- [x] **Penanganan Kegagalan (Failure Handling):**
  - Error dari API ditangkap dan ditampilkan ke pengguna dalam kotak pesan alert merah tanpa merusak tata letak halaman.
- [x] **Uji Regresi:**
  - Pengujian regresi menyeluruh dijalankan pada seluruh workspace: **83 / 83 PASSED (100% Berhasil)**.

---

## 6. Berkas Pengumpulan Akhir

1. **Kode Versi Final:** Seluruh kode backend (`apps/api`), frontend (`apps/web`), skema database (`prisma/schema.prisma`), shared library (`packages/shared`), dan konfigurasi monorepo telah lengkap dan terintegrasi.
2. **Petunjuk Menjalankan:** Tersedia lengkap pada berkas [`HowToRun.md`](file:///c:/Daffa/Kuliah/KampusBite/HowToRun.md).
3. **Checklist Fitur & Pengujian:** Tersedia lengkap pada berkas [`checklist_mvp.md`](file:///c:/Daffa/Kuliah/KampusBite/checklist_mvp.md).
4. **Video Demo Alur Lengkap:** Tersedia berkas [`demo.mp4`](file:///c:/Daffa/Kuliah/KampusBite/demo.mp4) (H.264, resolusi 1280x720, durasi 74.5 detik mencakup 31 langkah demonstrasi seluruh modul).

