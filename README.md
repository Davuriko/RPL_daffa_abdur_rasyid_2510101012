# 🍱 KampusBite — Campus Food & Snack Hub

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MySQL%208.0-blue.svg)](https://www.mysql.com/)
[![ORM](https://img.shields.io/badge/ORM-Prisma-purple.svg)](https://www.prisma.io/)
[![Frontend](https://img.shields.io/badge/Frontend-Vite%20%2B%20Vanilla%20SPA-yellow.svg)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Unit%20Tests-84%20PASSED-brightgreen.svg)](https://vitest.dev/)
[![Security](https://img.shields.io/badge/Security-Audit%20PASSED-success.svg)](HASIL_UJI_SECURITY.md)

**KampusBite** adalah aplikasi marketplace mikro kuliner berbasis web yang dirancang khusus untuk ekosistem civitas akademika (mahasiswa, dosen, dan staf kampus). Aplikasi ini mempertemukan mahasiswa wirausaha kuliner (*student-preneur*) dengan pembeli di lingkungan kampus melalui alur pemesanan praktis yang bermuara ke *direct checkout* WhatsApp, dilengkapi pelacakan status pesanan real-time, sistem ulasan menu, serta dashboard operasional untuk Penjual dan Admin.

---

## 📌 Daftar Isi
1. [Deskripsi & Manfaat](#-deskripsi--manfaat)
2. [Fitur Inti Aplikasi](#-fitur-inti-aplikasi)
3. [Arsitektur Monorepo](#-arsitektur-monorepo)
4. [Panduan Instalasi Ulang (Fresh Clone Repo)](#-panduan-instalasi-ulang-fresh-clone-repo)
5. [Menjalankan Aplikasi (Mode Development)](#-menjalankan-aplikasi-mode-development)
6. [Kompilasi & Panduan Deploy (Build & Deploy)](#-kompilasi--panduan-deploy-build--deploy)
7. [Akses Paket Demo & Akun Uji Coba](#-akses-paket-demo--akun-uji-coba)
8. [Pengujian Otomatis (Unit Testing)](#-pengujian-otomatis-unit-testing)
9. [Hasil Uji Keamanan](#-hasil-uji-keamanan)
10. [Troubleshooting & Solusi Masalah](#-troubleshooting--solusi-masalah)

---

## 💡 Deskripsi & Manfaat

Banyak mahasiswa yang memiliki keahlian memasak atau membuat jajanan rumahan/kost ingin berjualan untuk menambah uang saku. Namun, mereka terkendala modal sewa lapak fisik, jam kuliah yang padat, dan promosi di grup WhatsApp yang sering tenggelam. Di sisi lain, mahasiswa pembeli membutuhkan makanan/minuman yang halal, murah, dan berada di sekitar gedung kampus.

**Manfaat KampusBite:**
- **Wadah Digital Terpusat:** Menjadi direktori kuliner mikro resmi bagi civitas akademika kampus.
- **Direct Checkout WhatsApp:** Alur keranjang belanja yang otomatis menghasilkan format pesan WhatsApp terstruktur dan diarahkan langsung ke penjual (Self-Pickup / COD / Transfer).
- **Manajemen Student-Preneur:** Membantu mahasiswa penjual mengelola stok menu, status pesanan, dan jam operasional lapak secara rapi.

---

## 🚀 Fitur Inti Aplikasi

### 1. Autentikasi & Otorisasi Pengguna
- Registrasi akun sebagai **Pembeli** atau **Penjual**.
- Enkripsi password menggunakan `bcrypt` dengan 10 salt rounds.
- Login dan penerbitan token sesi JSON Web Token (JWT) masa aktif 7 hari.
- Proteksi Role-Based Access Control (RBAC): `ADMIN`, `SELLER`, dan `BUYER`.

### 2. Modul Pembeli (Customer Flow)
- **Katalog Menu:** Tampilan kartu menu lengkap dengan foto, nama toko, kategori, harga, dan rating bintang.
- **Filter & Pencarian Real-Time:** Filter kategori (*Makanan Berat, Camilan, Minuman, Dessert*), filter toko, dan pencarian kata kunci menu instan.
- **Keranjang Belanja (Cart):** Pengaturan jumlah item, kalkulasi subtotal instan, dan validasi belanja dari satu toko.
- **Direct Checkout:** Pengisian nama, nomor WA, lokasi antar gedung kampus, dan catatan pesanan yang otomatis membuat link chat WhatsApp terstruktur (`wa.me`).
- **Lacak Pesanan (Order Tracking):** Pelacakan riwayat pesanan berdasarkan nomor WhatsApp pemesan dengan indikator status berwarna (*Menunggu Konfirmasi $\rightarrow$ Sedang Dimasak $\rightarrow$ Siap Diantar $\rightarrow$ Selesai*).
- **Ulasan & Rating Menu:** Pembeli yang terverifikasi pernah memesan dapat memberikan rating bintang (skala 1–5) yang tersinkronisasi ke rata-rata produk.

### 3. Modul Penjual (Seller Flow)
- **Pendaftaran Toko:** Form pembukaan toko (1 akun penjual = 1 toko).
- **Dashboard Metrik:** Ringkasan total penjualan, pesanan aktif, total menu, dan status verifikasi Admin.
- **Manajemen Operasional:** Toggle status buka/tutup toko. Toko tutup otomatis menolak checkout baru.
- **Kelola Menu (CRUD):** Tambah menu, edit detail/harga, hapus produk, dan atur ketersediaan stok.
- **Pemrosesan Pesanan:** Alur bertahap konfirmasi pesanan masuk: *Terima & Masak* $\rightarrow$ *Tandai Siap* $\rightarrow$ *Selesaikan Pesanan* (atau *Tolak*).

### 4. Modul Administrator (Admin Flow)
- **Dashboard Statistik Agregat:** Metrik total pengguna, jumlah penjual & pembeli, total toko, toko terverifikasi, dan total pesanan.
- **Verifikasi Toko:** Tinjau dan ubah status verifikasi toko mahasiswa (1-klik verifikasi / pembatalan).
- **Manajemen Pengguna:** Pemantauan daftar seluruh civitas akademika terdaftar beserta peran masing-masing.

---

## 📂 Arsitektur Monorepo

```text
KampusBite/
├── apps/
│   ├── api/                    # Backend REST API (Node.js, Express, Prisma ORM, Vitest)
│   │   ├── prisma/             # Schema database MySQL & Seeder data awal
│   │   ├── src/
│   │   │   ├── controllers/    # Handler logika bisnis (Admin, Auth, Order, Product, Store, Review)
│   │   │   ├── middleware/     # Auth JWT, Role guard, Error handler, Security headers
│   │   │   └── routes/         # Routing REST API
│   │   └── tests/              # 76 Skenario pengujian unit otomatis backend
│   └── web/                    # Frontend SPA (Vanilla JS, HTML5, CSS modern, Vite)
│       └── src/
│           ├── views/          # Komponen tampilan (Catalog, Cart/Checkout, Track, Seller, Admin, Auth)
│           ├── api.js          # HTTP client API
│           ├── auth.js         # Pengelola sesi autentikasi client
│           └── cart.js         # Pengelola state keranjang belanja
├── packages/
│   └── shared/                 # Shared Library antar-workspace
│       ├── src/                # Enums, Constants, Formatters, Helper WhatsApp Link
│       └── tests/              # 8 Skenario pengujian unit shared library
├── docker-compose.yml          # Konfigurasi container database MySQL 8.0
├── package.json                # Root workspace configuration & scripts
├── HowToRun.md                 # Petunjuk teknis menjalankan aplikasi
├── checklist_mvp.md            # Checklist fitur lengkap & status uji unit
├── HASIL_UJI_SECURITY.md       # Laporan lengkap audit keamanan OWASP
├── LOG_DAN_PENANGANAN_ERROR.md # Dokumentasi log aman & katalog penanganan error
└── demo.mp4                    # Video rekaman demonstrasi alur penuh aplikasi
```

---

## 🛠 Panduan Instalasi Ulang (Fresh Clone Repo)

Ikuti langkah-langkah di bawah ini untuk menginstal ulang proyek dari repository bersih (*fresh clone*):

### 1. Prasyarat Sistem
Pastikan lingkungan Anda telah terpasang perangkat lunak berikut:
- **Git** (versi 2.30+)
- **Node.js** (versi 18+ LTS, disarankan v20 atau v24). Cek: `node -v`
- **npm** (versi 9+). Cek: `npm -v`
- **Database MySQL:**
  - *Opsi 1 (Direkomendasikan):* **Docker Desktop**
  - *Opsi 2 (Alternatif):* **XAMPP MySQL** atau service MySQL lokal pada port `3306`.

---

### 2. Clone Repository
Buka terminal dan clone repository ke folder lokal:

```bash
git clone https://github.com/Davuriko/RPL_daffa_abdur_rasyid_2510101012.git KampusBite
cd KampusBite
```

---

### 3. Install Dependensi Workspace
Jalankan instalasi dependensi dari root proyek (otomatis memasang seluruh paket untuk root, `apps/api`, `apps/web`, dan `packages/shared`):

```bash
npm install
```

---

### 4. Konfigurasi File Environment (.env)
Salin berkas template environment:

**Di Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
Copy-Item apps\api\.env.example apps\api\.env
Copy-Item apps\web\.env.example apps\web\.env
```

**Di Linux / macOS (Bash):**
```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

**Sesuaikan `apps/api/.env`:**
- **Jika menggunakan Docker Compose MySQL:**
  ```env
  DATABASE_URL="mysql://kampus:kampus@localhost:3306/kampus_bite"
  API_PORT=4000
  CLIENT_URL="http://localhost:5173"
  JWT_SECRET="kampus-bite-dev-secret-change-me"
  JWT_EXPIRES_IN="7d"
  ```
- **Jika menggunakan XAMPP MySQL lokal (user root tanpa password):**
  ```env
  DATABASE_URL="mysql://root@localhost:3306/kampus_bite"
  API_PORT=4000
  CLIENT_URL="http://localhost:5173"
  JWT_SECRET="kampus-bite-dev-secret-change-me"
  JWT_EXPIRES_IN="7d"
  ```

---

### 5. Menyiapkan Database MySQL

#### Menggunakan Docker Compose (Rekomendasi)
```bash
npm run db:up
```
Container MySQL 8.0 akan berjalan di port `3306` di latar belakang.

#### Menggunakan XAMPP MySQL
1. Buka XAMPP Control Panel dan nyalakan modul **MySQL**.
2. Pastikan database `kampus_bite` tersedia (dapat dibuat melalui phpMyAdmin atau terminal: `mysql -u root -e "CREATE DATABASE IF NOT EXISTS kampus_bite;"`).

---

### 6. Eksekusi Migrasi & Seeding Database
Jalankan migrasi Prisma untuk membuat skema tabel, dilanjutkan seeding data sampel:

```bash
npm run prisma:migrate
npm run prisma:seed
```

Data seed awal mencakup:
- 4 pengguna demo (1 Admin, 2 Penjual, 1 Pembeli).
- 2 toko kuliner aktif dan terverifikasi.
- 4 kategori menu kuliner.
- 6 produk makanan & minuman kampus.
- 2 sampel pesanan aktif.

---

## 💻 Menjalankan Aplikasi (Mode Development)

Jalankan backend API dan frontend Web secara simultan:

```bash
npm run dev
```

Aplikasi dapat diakses melalui browser:
- **Frontend Web:** [http://localhost:5173](http://localhost:5173)
- **Backend REST API:** [http://localhost:4000/api](http://localhost:4000/api)
- **API Health Check:** [http://localhost:4000/health](http://localhost:4000/health)

*(Opsional: Jalankan secara terpisah menggunakan `npm run dev:api` atau `npm run dev:web`).*

---

## 🏗 Kompilasi & Panduan Deploy (Build & Deploy)

### 1. Build Production Frontend
Untuk membuat bundle frontend siap produksi (minified HTML, CSS, JS):

```bash
npm run build
```
Hasil build tersimpan di folder [`apps/web/dist/`](file:///c:/Daffa/Kuliah/KampusBite/apps/web/dist/).

### 2. Menjalankan Backend Production
Pastikan dependensi dan migrasi database sudah diterapkan pada server produksi, kemudian jalankan API:

```bash
npm start
```
Atau menggunakan process manager seperti **PM2**:
```bash
pm2 start apps/api/src/index.js --name "kampusbite-api"
```

### 3. Deploy Frontend Static Assets
Folder `apps/web/dist` dapat disajikan menggunakan berbagai opsi:
- **Nginx / Caddy:** Arahkan root web server ke path `apps/web/dist/` dengan fallback `try_files $uri $uri/ /index.html;`.
- **Platform Cloud (Vercel / Netlify / Cloudflare Pages):** Set build directory ke `apps/web` dengan build command `npm run build` dan publish directory `dist`.

---

## 🎁 Akses Paket Demo & Akun Uji Coba

### 1. Kredensial Akun Demo (Siap Pakai)

| Role | Email | Password | Kegunaan Uji Coba |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@kampusbite.id` | `admin123` | Uji dashboard statistik kampus, verifikasi toko penjual, dan monitor pengguna. |
| **Penjual 1** | `melati@kampusbite.id` | `seller123` | Uji kelola toko *Dapur Kost Melati*, update status pesanan, buka/tutup toko, kelola menu. |
| **Penjual 2** | `bagus@kampusbite.id` | `seller123` | Uji kelola toko *Risol Mayo Kampus*, update stok menu. |
| **Pembeli** | `rina@kampusbite.id` | `buyer123` | Uji belanja katalog, keranjang belanja, direct checkout, lacak pesanan & rating. |

*(Pengguna umum/tamu juga dapat langsung menjelajahi katalog, belanja, checkout, dan melacak pesanan tanpa harus login terlebih dahulu).*

### 2. Berkas Paket Demonstrasi & Pengujian
- **Video Demo Alur Lengkap:** [`demo.mp4`](file:///c:/Daffa/Kuliah/KampusBite/demo.mp4) (H.264, 1280x720, durasi 74.5 detik mencakup 31 langkah demonstrasi modul Pembeli, Penjual, dan Admin).
- **Checklist Fitur MVP:** [`checklist_mvp.md`](file:///c:/Daffa/Kuliah/KampusBite/checklist_mvp.md) (Status pengujian 100% PASSED).
- **Panduan Cepat:** [`HowToRun.md`](file:///c:/Daffa/Kuliah/KampusBite/HowToRun.md).
- **Laporan Audit Keamanan:** [`HASIL_UJI_SECURITY.md`](file:///c:/Daffa/Kuliah/KampusBite/HASIL_UJI_SECURITY.md).
- **Katalog Log & Penanganan Error:** [`LOG_DAN_PENANGANAN_ERROR.md`](file:///c:/Daffa/Kuliah/KampusBite/LOG_DAN_PENANGANAN_ERROR.md).

---

## 🧪 Pengujian Otomatis (Unit Testing)

Aplikasi dilengkapi pengujian unit otomatis berbasis **Vitest**. Seluruh dependency eksternal dan database Prisma di-mock sehingga pengujian dapat dijalankan secara cepat dan independen tanpa membutuhkan container database aktif.

### Jalankan Seluruh Test Suite:
```bash
npm test
```

### Jalankan Test Parsial:
```bash
npm run test:api       # Menguji backend API (Controller, Auth, Route, Middleware, Security)
npm run test:shared    # Menguji shared library (Enums, Formatters, WhatsApp URL builder)
```

### Rekapitulasi Hasil Pengujian (84 / 84 PASSED):
```text
✓ packages/shared/tests/shared.test.js (8 tests)
✓ apps/api/tests/category.test.js     (1 test)
✓ apps/api/tests/dashboard.test.js    (3 tests)
✓ apps/api/tests/middleware.test.js   (5 tests)
✓ apps/api/tests/review.test.js       (5 tests)
✓ apps/api/tests/admin.test.js        (8 tests)
✓ apps/api/tests/product.test.js      (12 tests)
✓ apps/api/tests/store.test.js        (14 tests)
✓ apps/api/tests/order.test.js        (14 tests)
✓ apps/api/tests/auth.test.js         (14 tests)

Total: 84 tests | 84 PASSED (100%)
```

---

## 🛡 Hasil Uji Keamanan

Pengujian keamanan berkala telah dilakukan terhadap aplikasi mencakup pengujian OWASP Top 10, sanitasi input, proteksi otorisasi peran (RBAC), serta audit dependensi pustaka via `npm audit`.

Untuk detail hasil analisis kerentanan, mitigasi CVE, dan catatan perubahan arsitektur keamanan, silakan baca dokumen lengkap:  
👉 **[Laporan Hasil Uji Keamanan (HASIL_UJI_SECURITY.md)](HASIL_UJI_SECURITY.md)**.

---

## 🔧 Troubleshooting & Solusi Masalah

1. **Port 3306 Bentrok:**
   - *Penyebab:* Terdapat instance MySQL lokal/XAMPP yang aktif bersamaan dengan Docker MySQL.
   - *Solusi:* Matikan salah satu service MySQL atau arahkan `DATABASE_URL` ke port MySQL yang aktif.
2. **Koneksi Frontend ke Backend Gagal:**
   - *Penyebab:* Backend belum berjalan di port 4000 atau URL API salah.
   - *Solusi:* Pastikan file `apps/web/.env` memiliki baris `VITE_API_URL="http://localhost:4000/api"` dan buka `http://localhost:4000/health` untuk memastikan API merespons.
3. **Prisma Client Out-of-Sync:**
   - *Solusi:* Jalankan `npm run prisma:generate --workspace @kampus-bite/api` untuk meregenerasi client Prisma.
4. **Menghentikan Database Docker:**
   - *Solusi:* Jalankan `npm run db:down`.
