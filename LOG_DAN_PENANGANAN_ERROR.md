# Dokumentasi Log Aman, Analisis Penyebab Error, dan Tindakan Perbaikan

**Aplikasi:** KampusBite — Campus Food & Snack Hub  
**Komponen:** Backend API (`apps/api`), Frontend Client (`apps/web`), Shared Library (`packages/shared`), Database MySQL (`prisma`)  
**Tujuan:** Panduan standar operasional untuk pemantauan sistem, pencegahan kebocoran data sensitif (*safe logging*), analisis akar masalah (*root cause analysis*), dan prosedur tindakan perbaikan (*remediation playbook*).

---

## 1. Standar & Prinsip Logging Aman (Safe Logging Principles)

Logging yang baik harus memberikan visibilitas operasional bagi pengembang (*observability*) tanpa mengorbankan privasi data pengguna maupun keamanan sistem (*security & data privacy*).

### A. Format Baku Log KampusBite
Sistem mengimplementasikan utilitas logging terpusat pada [`apps/api/src/utils/Logger.js`](file:///c:/Daffa/Kuliah/KampusBite/apps/api/src/utils/Logger.js) dengan format terstruktur:

```text
[TIMESTAMP_ISO8601] [LOG_LEVEL] PESAN_PERISTIWA | METADATA_TERFILTER
```

### B. Aturan Redaksi Data Sensitif (Data Redaction Policy)
Sistem **DILARANG KERAS** mencatat informasi berikut ke dalam log server:
1. **Password Pengguna:** Baik dalam bentuk plain-text maupun hashed password.
2. **Kredensial Sesi:** String utuh token JWT (`Bearer eyJhbGci...`) dan `JWT_SECRET`.
3. **Kredensial Database:** Password user database MySQL.
4. **Data Pribadi (PII) Lengkap:** Nomor identitas atau nomor WhatsApp pelanggan tanpa masking.

Pada sistem KampusBite, fungsi `MaskSensitive()` secara otomatis mengganti nilai key sensitif (`password`, `token`, `secret`, `authorization`) menjadi `"[REDACTED]"`.

---

## 2. Contoh Log Aman Berdasarkan Skenario Operasional

Berikut adalah perbandingan antara **Log Tidak Aman (Rentan)** vs **Log Aman (Sesuai Standar KampusBite)**:

### Skenario 1: Percobaan Autentikasi Login Gagal
- ❌ **Log Tidak Aman (Membocorkan Password & PII):**
  ```text
  [2026-11-05 09:42:00] User daffa@gmail.com failed login with password 'Rahasia123!'. Stack: at AuthController.js:58
  ```
- ✅ **Log Aman KampusBite:**
  ```text
  [2026-11-05T02:42:00.673Z] [WARN] HttpError 401: Email atau password salah. | {"Path":"/api/auth/login","Method":"POST","UserId":"anonymous"}
  ```
  *Penjelasan:* Pesan kesalahan terstandarisasi, password tidak dicatat sama sekali, dan endpoint tercatat untuk monitoring serangan *credential stuffing*.

---

### Skenario 2: Upaya Akses Terlarang (Role Mismatch / Broken Access Control)
- ❌ **Log Tidak Aman:**
  ```text
  [2026-11-05 09:42:00] User token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6InVzZXItMSIsIlJvbGUiOiJCVVlFUiJ9 tried to access /api/admin/stats
  ```
- ✅ **Log Aman KampusBite:**
  ```text
  [2026-11-05T02:42:00.303Z] [WARN] HttpError 403: Anda tidak memiliki akses untuk aksi ini. | {"Path":"/api/admin/stats","Method":"GET","UserId":"user-1"}
  ```
  *Penjelasan:* Token JWT tidak dibocorkan; hanya `UserId` dan `Path` yang dicatat untuk kebutuhan audit keamanan.

---

### Skenario 3: Penolakan Ulasan Produk Tanpa Riwayat Pembelian (Fraud Review)
- ❌ **Log Tidak Aman:**
  ```text
  [2026-11-05 09:42:00] Phone 081234567890 failed to rate product p1 because no order found.
  ```
- ✅ **Log Aman KampusBite:**
  ```text
  [2026-11-05T02:42:00.354Z] [WARN] HttpError 403: Hanya pembeli yang pernah memesan menu ini yang dapat memberi rating. | {"Path":"/api/reviews","Method":"POST","UserId":"anonymous"}
  ```
  *Penjelasan:* Melindungi privasi nomor kontak pemesan sekaligus mencatat penolakan manipulasi rating palsu.

---

### Skenario 4: Transisi Status Pesanan Berhasil
- ✅ **Log Aman KampusBite:**
  ```text
  [2026-11-05T02:42:01.010Z] [INFO] Order status updated to PREPARING | {"OrderId":"ord-9921","StoreId":"store-melati","UserId":"seller-melati"}
  ```
  *Penjelasan:* Mencatat jejak audit pemrosesan pesanan mahasiswa tanpa mencatat detail rekening pembayaran atau catatan privat pelanggan.

---

### Skenario 5: Kegagalan Internal Server / Database
- ❌ **Log Tidak Aman (Mengekspos String Koneksi Database & Password ke Client):**
  ```json
  HTTP/1.1 500 Internal Server Error
  {"error": "PrismaClientInitializationError: Can't reach database server at localhost:3306 with user 'root' and password 'rahasia'"}
  ```
- ✅ **Log Aman KampusBite (Server Console Log):**
  ```text
  [2026-11-05T02:42:01.200Z] [ERROR] UnhandledException: Can't reach database server at localhost:3306 | {"Path":"/api/products","Method":"GET","UserId":"anonymous"}
  ```
- ✅ **Respon yang Diterima Pengguna (Client Response):**
  ```json
  HTTP/1.1 500 Internal Server Error
  {"Message": "Terjadi kesalahan pada server."}
  ```
  *Penjelasan:* Kredensial dan stack trace internal hanya tercatat di lingkungan server yang terisolasi, sementara pengguna menerima pesan yang aman dan tidak dapat dieksploitasi.

---

## 3. Katalog Error, Penyebab, dan Tindakan Perbaikan (Remediation Playbook)

Berikut adalah panduan identifikasi akar masalah (*root cause*) dan langkah-langkah solutif bagi pengembang dan administrator:

---

### Kasus 1: Gagal Terhubung ke Database MySQL (Connection Refused)
| Atribut | Deskripsi |
| :--- | :--- |
| **Gejala / Error** | `PrismaClientInitializationError: Can't reach database server at localhost:3306` |
| **Kode HTTP** | `500 Internal Server Error` |
| **Akar Masalah** | 1. Service MySQL (Docker / XAMPP) belum dinyalakan.<br>2. Port `3306` bentrok dengan proses lain.<br>3. Konfigurasi `DATABASE_URL` pada `apps/api/.env` salah alamat atau salah kredensial. |
| **Tindakan Perbaikan** | 1. **Jika memakai Docker:** Jalankan `npm run db:up` dan pastikan container aktif (`docker ps`).<br>2. **Jika memakai XAMPP:** Buka XAMPP Control Panel, klik tombol **Start** pada modul MySQL.<br>3. **Verifikasi Port:** Jalankan `netstat -ano \| findstr 3306` untuk memastikan port terbuka.<br>4. **Periksa .env:** Pastikan `DATABASE_URL="mysql://root@localhost:3306/kampus_bite"` (XAMPP) atau `mysql://kampus:kampus@localhost:3306/kampus_bite` (Docker). |
| **Pencegahan** | Tambahkan health check otomatis pada startup service dan dokumentasikan kredensial default di `.env.example`. |

---

### Kasus 2: Token JWT Tidak Ditemukan / Kedaluwarsa (401 Unauthorized)
| Atribut | Deskripsi |
| :--- | :--- |
| **Gejala / Error** | `HttpError 401: Token tidak ditemukan. Silakan login.` atau `Token tidak valid atau sudah kedaluwarsa.` |
| **Kode HTTP** | `401 Unauthorized` |
| **Akar Masalah** | 1. Client belum login sehingga header `Authorization: Bearer <token>` tidak dikirim.<br>2. Token telah melampaui masa kedaluwarsa (default 7 hari).<br>3. Server di-restart dengan perubahan nilai `JWT_SECRET` sehingga token lama menjadi tidak valid. |
| **Tindakan Perbaikan** | 1. Pada frontend, arahkan pengguna ke halaman login (`?view=auth`).<br>2. Bersihkan token basi di client storage: `localStorage.removeItem("kampusbite_token");`.<br>3. Minta pengguna login kembali untuk memperoleh token baru. |
| **Pencegahan** | Implementasikan penanganan status HTTP 401 otomatis di `apps/web/src/api.js` untuk membersihkan local storage dan mengarahkan ke form login. |

---

### Kasus 3: Pelanggaran Hak Akses Peran (403 Forbidden)
| Atribut | Deskripsi |
| :--- | :--- |
| **Gejala / Error** | `HttpError 403: Anda tidak memiliki akses untuk aksi ini.` |
| **Kode HTTP** | `403 Forbidden` |
| **Akar Masalah** | Pengguna yang terautentikasi memiliki peran (`Role`) yang tidak sesuai dengan izin endpoint. Contoh: Akun `BUYER` mencoba mengakses endpoint admin `/api/admin/stats` atau endpoint penjual `/api/stores/mine`. |
| **Tindakan Perbaikan** | 1. Pastikan pengguna masuk menggunakan akun dengan peran yang sesuai:<br>&nbsp;&nbsp;• Admin: `admin@kampusbite.id`<br>&nbsp;&nbsp;• Penjual: `melati@kampusbite.id` atau `bagus@kampusbite.id`<br>2. Periksa definisi middleware rute pada `AdminRoutes.js` atau `StoreRoutes.js`. |
| **Pencegahan** | Sembunyikan elemen antarmuka (UI buttons/links) yang tidak sesuai dengan role aktif pengguna di frontend. |

---

### Kasus 4: Penjual Mencoba Membuat Toko Lebih dari Satu (409 Conflict)
| Atribut | Deskripsi |
| :--- | :--- |
| **Gejala / Error** | `HttpError 409: Setiap penjual hanya boleh memiliki satu toko.` |
| **Kode HTTP** | `409 Conflict` |
| **Akar Masalah** | Pengguna dengan role `SELLER` mencoba mengirim form pembuatan toko baru (`POST /api/stores`), padahal akun tersebut sudah memiliki toko terdaftar di database. |
| **Tindakan Perbaikan** | 1. Gunakan endpoint `GET /api/stores/mine` untuk mengambil toko yang sudah ada.<br>2. Alihkan tampilan penjual langsung ke halaman **Dashboard Penjual** atau **Kelola Menu**, bukan form registrasi toko. |
| **Pencegahan** | UI `seller.js` secara otomatis mengecek kepemilikan toko: jika toko ditemukan, langsung render dashboard. |

---

### Kasus 5: Checkout Ditolak karena Toko Sedang Tutup (400 Bad Request)
| Atribut | Deskripsi |
| :--- | :--- |
| **Gejala / Error** | `HttpError 400: Toko sedang tutup, tidak dapat menerima pesanan.` |
| **Kode HTTP** | `400 Bad Request` |
| **Akar Masalah** | Pelanggan menekan tombol buat pesanan saat toko penjual sedang mengubah status operasionalnya menjadi `IsOpen: false`. |
| **Tindakan Perbaikan** | 1. Penjual membuka kembali status toko melalui dashboard penjual (klik tombol **Toko Tutup** $\rightarrow$ berubah menjadi **Toko Buka**).<br>2. Pembeli dapat memilih menu dari toko kampus lain yang sedang berstatus buka. |
| **Pencegahan** | Tampilkan badge "Toko Tutup" berwarna merah pada kartu produk dan nonaktifkan tombol "Tambah ke Keranjang" jika toko tutup. |

---

### Kasus 6: Ulasan Ditolak karena Belum Pernah Memesan (403 Forbidden)
| Atribut | Deskripsi |
| :--- | :--- |
| **Gejala / Error** | `HttpError 403: Hanya pembeli yang pernah memesan menu ini yang dapat memberi rating.` |
| **Kode HTTP** | `403 Forbidden` |
| **Akar Masalah** | Pengguna mengirim rating bintang pada produk, tetapi nomor WhatsApp yang dimasukkan tidak memiliki catatan transaksi dengan status valid untuk produk tersebut di database. |
| **Tindakan Perbaikan** | 1. Masukkan nomor WhatsApp yang sama persis dengan nomor yang digunakan saat checkout pesanan.<br>2. Lakukan pemesanan menu tersebut terlebih dahulu sebelum memberikan ulasan rating. |
| **Pencegahan** | Fitur pemberian rating hanya ditampilkan pada menu "Lacak Pesanan" setelah riwayat pesanan berhasil ditarik berdasarkan nomor WhatsApp pengguna. |

---

### Kasus 7: Frontend Gagal Menghubungi API / Terhalang CORS (Failed to Fetch)
| Atribut | Deskripsi |
| :--- | :--- |
| **Gejala / Error** | Browser Console: `TypeError: Failed to fetch` atau `Access to fetch at ... blocked by CORS policy` |
| **Kode HTTP** | Network Failure (CORS Block / Connection Refused) |
| **Akar Masalah** | 1. Backend API pada port 4000 belum berjalan.<br>2. Variabel `VITE_API_URL` pada `apps/web/.env` salah mengarah ke host/port yang keliru.<br>3. Variabel `CLIENT_URL` pada backend tidak mengizinkan origin frontend `http://localhost:5173`. |
| **Tindakan Perbaikan** | 1. Pastikan backend aktif: `npm run dev:api` (port 4000).<br>2. Buka `http://localhost:4000/health` di browser; pastikan merespons `{"Status":"ok"}`.<br>3. Periksa file `apps/web/.env`: pastikan `VITE_API_URL="http://localhost:4000/api"`.<br>4. Periksa file `apps/api/.env`: pastikan `CLIENT_URL="http://localhost:5173"`. |
| **Pencegahan** | Konfigurasi CORS Express diatur dengan fallback `process.env.CLIENT_URL ?? "*"` pada mode development. |

---

### Kasus 8: Skema Tabel Database Belum Dimigrasi (Table Doesn't Exist)
| Atribut | Deskripsi |
| :--- | :--- |
| **Gejala / Error** | `PrismaClientKnownRequestError: Table 'kampus_bite.Store' doesn't exist` |
| **Kode HTTP** | `500 Internal Server Error` |
| **Akar Masalah** | Database baru dibuat namun migrasi DDL Prisma belum pernah dieksekusi. |
| **Tindakan Perbaikan** | 1. Jalankan perintah migrasi skema tabel:  
   ```bash
   npm run prisma:migrate
   ```  
   2. Isi data awal melalui seeder:  
   ```bash
   npm run prisma:seed
   ```  
   3. Regenerasi client Prisma:  
   ```bash
   npm run prisma:generate --workspace @kampus-bite/api
   ``` |
| **Pencegahan** | Sertakan perintah `npm run prisma:migrate` dan `npm run prisma:seed` sebagai langkah wajib dalam panduan setup awal `README.md` dan `HowToRun.md`. |

---

## 4. Kesimpulan

Dengan menerapkan utilitas `SafeLog()`, pembatasan data sensitif, penanganan `HttpError` tersentralisasi, dan panduan mitigasi di atas, aplikasi **KampusBite** memiliki standar keamanan data yang tinggi serta kemudahan pelacakan masalah (*troubleshooting*) saat dijalankan di lingkungan pengembangan maupun produksi.
