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

---

## 7. Cara Menjalankan Aplikasi (Development)

### Prasyarat

- **Node.js** v18 atau lebih baru (disarankan LTS)
- **Docker Desktop** (untuk database MySQL)
- **npm** v9+ (sudah termasuk saat install Node.js)

### Langkah 1 — Install Dependency

Dari folder root proyek (`KampusBite`), jalankan sekali:

```powershell
npm install
```

Perintah ini otomatis meng-install dependency untuk semua workspace (`api`, `web`, dan `shared`).

### Langkah 2 — Siapkan File Environment

Salin file contoh `.env.example` menjadi `.env`:

```powershell
Copy-Item .env.example .env
Copy-Item apps\api\.env.example apps\api\.env
Copy-Item apps\web\.env.example apps\web\.env
```

Nilai default sudah cocok untuk development lokal, jadi tidak perlu diubah.

### Langkah 3 — Jalankan Database (MySQL via Docker)

```powershell
npm run db:up
```

Perintah ini menyalakan container MySQL di port `3306`. Pastikan Docker Desktop sudah berjalan.

### Langkah 4 — Migrasi & Seed Database

Buat tabel dan isi data contoh (akun demo, toko, produk):

```powershell
npm run prisma:migrate
npm run prisma:seed
```

### Langkah 5 — Jalankan API + Web Sekaligus

```powershell
npm run dev
```

Setelah itu buka browser:

- **Web (frontend):** http://localhost:5173
- **API (backend):** http://localhost:4000

> Ingin menjalankan terpisah? Gunakan `npm run dev:api` (hanya backend) atau `npm run dev:web` (hanya frontend) di dua terminal berbeda.

### Akun Demo (hasil seed)

| Role    | Email                | Password    |
| ------- | -------------------- | ----------- |
| Admin   | admin@kampusbite.id  | `admin123`  |
| Penjual | melati@kampusbite.id | `seller123` |
| Penjual | bagus@kampusbite.id  | `seller123` |
| Pembeli | rina@kampusbite.id   | `buyer123`  |

### Perintah Berguna Lainnya

| Perintah              | Fungsi                       |
| --------------------- | ---------------------------- |
| `npm run db:down`     | Menghentikan container MySQL |
| `npm run prisma:seed` | Mengisi ulang data contoh    |
| `npm run dev:api`     | Menjalankan backend saja     |
| `npm run dev:web`     | Menjalankan frontend saja    |

### Troubleshooting Singkat

- **Port 3306 sudah dipakai:** matikan service MySQL lokal (mis. XAMPP) sebelum `npm run db:up`.
- **Web tidak bisa akses API / error koneksi:** pastikan API jalan di port `4000` dan `apps/web/.env` berisi `VITE_API_URL="http://localhost:4000/api"`.
- **Error Prisma Client:** jalankan `npm run prisma:generate --workspace @kampus-bite/api` lalu ulangi.

---

## 8. Cara Menjalankan Test

Test menggunakan **Vitest**. Prisma di-mock sehingga **tidak perlu database atau Docker** untuk menjalankannya.

### Jalankan Semua Test

Dari folder root proyek (`KampusBite`):

```powershell
npm test
```

Perintah ini menjalankan test untuk workspace `shared` lalu `api` secara berurutan.

### Jalankan Test per Bagian

```powershell
npm run test:api      # hanya test backend (apps/api)
npm run test:shared   # hanya test shared (packages/shared)
```

### Mode Watch (otomatis re-run saat file berubah)

```powershell
npm run test:watch --workspace @kampus-bite/api
npm run test:watch --workspace @kampus-bite/shared
```

### Menjalankan Satu File Test

```powershell
npm run test --workspace @kampus-bite/api -- tests/admin.test.js
```

> Semua test API ada di `apps/api/tests/` dan test shared ada di `packages/shared/tests/`.
