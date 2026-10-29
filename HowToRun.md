# Panduan Menjalankan KampusBite (HowToRun.md)

**KampusBite** adalah aplikasi marketplace mikro kuliner kampus berbasis web yang dirancang khusus untuk civitas akademika (mahasiswa, dosen, dan staf). Aplikasi ini menghubungkan pembeli kampus dengan mahasiswa penjual (student-preneur) melalui katalog menu, keranjang belanja, direct checkout ke WhatsApp penjual, pelacakan status pesanan real-time, sistem rating menu, serta dashboard manajemen untuk Penjual dan Admin.

---

## 1. Prasyarat Sistem

Sebelum menjalankan aplikasi, pastikan komputer Anda telah terpasang:
- **Node.js** versi 18 atau lebih baru (disarankan LTS v20 atau v24). Cek dengan: `node -v`
- **npm** versi 9 atau lebih baru. Cek dengan: `npm -v`
- **MySQL Database**:
  - **Opsi A (Rekomendasi):** **Docker Desktop** (untuk menyalakan container MySQL otomatis).
  - **Opsi B (Alternatif):** **XAMPP MySQL** lokal yang berjalan pada port default `3306`.
- **Web Browser modern** (Google Chrome, Microsoft Edge, Mozilla Firefox, dll).

---

## 2. Struktur Proyek (Monorepo npm workspaces)

```text
KampusBite/
├── apps/
│   ├── api/             # Backend REST API (Express.js, Prisma ORM, MySQL, Vitest)
│   └── web/             # Frontend Client SPA (HTML5, Vanilla JS, CSS3, Vite)
├── packages/
│   └── shared/          # Shared Enums, DTO, Constants, dan Utilities
├── docker-compose.yml   # Konfigurasi container MySQL 8.0
├── package.json         # Workspace root scripts
├── HowToRun.md          # Petunjuk menjalankan aplikasi
├── checklist_mvp.md     # Checklist fitur & status pengujian unit test
└── demo.mp4             # Video demo rekaman alur lengkap aplikasi
```

---

## 3. Langkah-Langkah Menjalankan Aplikasi

### Langkah 1: Install Seluruh Dependensi

Buka terminal (PowerShell / Command Prompt / Bash) di folder root `KampusBite`, lalu jalankan:

```powershell
npm install
```

> Perintah ini secara otomatis mengunduh dan menghubungkan seluruh dependensi untuk workspace root, `@kampus-bite/api`, `@kampus-bite/web`, dan `@kampus-bite/shared`.

---

### Langkah 2: Konfigurasi File Environment (.env)

Pastikan file konfigurasi environment telah tersedia. Jika belum ada, salin dari template `.env.example`:

**Di root folder:**
```powershell
Copy-Item .env.example .env
```
*(Di Linux / macOS: `cp .env.example .env`)*

**Di folder apps/api:**
```powershell
Copy-Item apps\api\.env.example apps\api\.env
```

**Di folder apps/web:**
```powershell
Copy-Item apps\web\.env.example apps\web\.env
```

Isi default konfigurasi:
- **`apps/api/.env`**:
  ```env
  DATABASE_URL="mysql://root@localhost:3306/kampus_bite"
  API_PORT=4000
  CLIENT_URL="http://localhost:5173"
  JWT_SECRET="kampus-bite-dev-secret-change-me"
  JWT_EXPIRES_IN="7d"
  ```
  *(Catatan: Jika memakai MySQL Docker dengan kredensial default docker-compose, ubah `DATABASE_URL` menjadi `mysql://kampus:kampus@localhost:3306/kampus_bite`).*

- **`apps/web/.env`**:
  ```env
  VITE_API_URL="http://localhost:4000/api"
  ```

---

### Langkah 3: Menjalankan Database MySQL

Pilih salah satu metode berikut:

#### Opsi A: Menggunakan Docker Desktop (Sesuai Docker Compose)
Pastikan Docker Desktop sudah aktif, lalu jalankan:
```powershell
npm run db:up
```
Container MySQL akan menyala di port `3306`.

#### Opsi B: Menggunakan XAMPP / MySQL Lokal
Jika Anda menggunakan XAMPP:
1. Buka **XAMPP Control Panel**.
2. Klik tombol **Start** pada modul **MySQL** (port `3306`).
3. Buat database baru bernama `kampus_bite` jika belum ada:
   ```powershell
   mysql -u root -e "CREATE DATABASE IF NOT EXISTS kampus_bite;"
   ```

---

### Langkah 4: Migrasi & Seeding Database

Jalankan perintah berikut untuk membuat skema tabel dan mengisi data awal (akun demo, toko contoh, menu makanan, dan pesanan sampel):

```powershell
npm run prisma:migrate
npm run prisma:seed
```

Hasil seed akan mencakup:
- 4 pengguna demo (1 Admin, 2 Penjual, 1 Pembeli)
- 2 toko kuliner aktif dan terverifikasi
- 4 kategori menu (Makanan Berat, Camilan, Minuman, Dessert)
- 6 produk menu kuliner kampus
- 2 pesanan sampel dengan variasi status

---

### Langkah 5: Menjalankan Aplikasi (API + Web)

Jalankan backend API dan frontend Web secara bersamaan dengan satu perintah:

```powershell
npm run dev
```

Terminal akan menjalankan:
- **Backend API**: `http://localhost:4000`
- **Frontend Web**: `http://localhost:5173`

Buka browser Anda dan kunjungi: **[http://localhost:5173](http://localhost:5173)**

> **Tips:** Jika ingin menjalankan API dan Web di dua jendela terminal terpisah:
> - Terminal 1 (API): `npm run dev:api`
> - Terminal 2 (Web): `npm run dev:web`

---

## 4. Daftar Akun Demo (Hasil Seeding)

Anda dapat langsung mencoba semua peran (roles) tanpa perlu mendaftar dari awal:

| Peran (Role) | Email | Password | Hak Akses & Fitur |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@kampusbite.id` | `admin123` | Dashboard statistik kampus, verifikasi toko penjual, pemantauan daftar pengguna & toko. |
| **Penjual 1** | `melati@kampusbite.id` | `seller123` | Mengelola toko *Dapur Kost Melati*, update status pesanan, buka/tutup toko, CRUD menu. |
| **Penjual 2** | `bagus@kampusbite.id` | `seller123` | Mengelola toko *Risol Mayo Kampus*, kelola stok & pesanan masuk. |
| **Pembeli** | `rina@kampusbite.id` | `buyer123` | Belanja di katalog, keranjang belanja, checkout ke WhatsApp, lacak status & rating. |

*(Pengguna umum/tamu juga dapat langsung menjelajahi katalog, belanja, checkout, dan melacak pesanan tanpa harus login).*

---

## 5. Cara Menjalankan Pengujian (Testing)

Proyek ini dilengkapi dengan rangkaian pengujian unit otomatis komprehensif menggunakan **Vitest** dan mock layer Prisma (sehingga unit test dapat berjalan cepat dan independen tanpa ketergantungan koneksi database).

### Menjalankan Seluruh Test Suite:
```powershell
npm test
```
*Perintah ini menjalankan unit test untuk `@kampus-bite/shared` dan `@kampus-bite/api`.*

### Menjalankan Test per Bagian:
```powershell
npm run test:api       # Hanya menguji backend API (controller, middleware, route)
npm run test:shared    # Hanya menguji shared library (enums, formatters, whatsapp link)
```

### Menjalankan Test dalam Mode Watch (TDD):
```powershell
npm run test:watch --workspace @kampus-bite/api
```

### Hasil Pengujian (Status: 100% PASSED):
```text
✓ packages/shared/tests/shared.test.js (8 tests)
✓ apps/api/tests/category.test.js     (1 test)
✓ apps/api/tests/dashboard.test.js    (3 tests)
✓ apps/api/tests/middleware.test.js   (4 tests)
✓ apps/api/tests/review.test.js       (5 tests)
✓ apps/api/tests/admin.test.js        (8 tests)
✓ apps/api/tests/product.test.js      (12 tests)
✓ apps/api/tests/store.test.js        (14 tests)
✓ apps/api/tests/order.test.js        (14 tests)
✓ apps/api/tests/auth.test.js         (14 tests)

Total: 83 tests | 83 PASSED
```

---

## 6. Video Demonstrasi (demo.mp4)

Rekaman alur lengkap aplikasi siap didemonstrasikan dan tersimpan di folder root proyek:
- **Nama File:** `demo.mp4`
- **Format:** MP4 (Video H.264, Resolusi 1280x720, 25 FPS)
- **Cakupan Video:**
  1. **Alur Pembeli:** Eksplorasi katalog, filter kategori, pencarian menu real-time, penambahan produk ke keranjang belanja, proses checkout, generasi link WhatsApp otomatis, pelacakan pesanan, dan pemberian rating bintang 5.
  2. **Alur Penjual:** Login penjual, peninjauan dashboard metrik toko, pemrosesan pesanan bertahap (Terima & Masak → Tandai Siap → Selesaikan), toggle status Buka/Tutup toko, dan penambahan menu baru pada katalog toko.
  3. **Alur Admin:** Login administrator, visualisasi ringkasan statistik agregat kampus, verifikasi kelayakan toko mahasiswa baru, dan pemantauan daftar pengguna aktif.

---

## 7. Pemecahan Masalah (Troubleshooting)

1. **Port 3306 bentrok / sudah dipakai:**
   - Jika Anda memiliki MySQL lokal (misalnya dari service Windows atau XAMPP), hentikan salah satu service sebelum menjalankan `npm run db:up`, atau arahkan `DATABASE_URL` di `apps/api/.env` ke MySQL yang sedang aktif.
2. **Koneksi Frontend ke Backend gagal:**
   - Pastikan backend API berjalan di port `4000`. Cek endpoint health check dengan membuka browser di `http://localhost:4000/health` (harus mengembalikan `{"Status":"ok"}`).
   - Pastikan file `apps/web/.env` memiliki baris: `VITE_API_URL="http://localhost:4000/api"`.
3. **Prisma Client out-of-sync:**
   - Jika skema database diubah, perbarui client dengan:
     ```powershell
     npm run prisma:generate --workspace @kampus-bite/api
     ```
4. **Menghentikan Container MySQL:**
   - Jalankan: `npm run db:down`

