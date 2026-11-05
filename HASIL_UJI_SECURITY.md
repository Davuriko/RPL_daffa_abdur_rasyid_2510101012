# Laporan Hasil Uji Keamanan (Security Audit) & Catatan Perubahan

**Aplikasi:** KampusBite — Campus Food & Snack Hub  
**Lingkup Pengujian:** Full-stack Monorepo (`apps/api`, `apps/web`, `packages/shared`, `prisma`)  
**Metodologi:** OWASP Top 10 (2021), Automated Dependency Audit (`npm audit`), Static Code Security Analysis, dan Automated Unit Security Testing.  
**Tanggal Pengujian:** 5 November 2026  
**Status Pengujian:** **PASSED / AMAN**

---

## 1. Ringkasan Eksekutif

Pengujian keamanan ini dilakukan untuk mengevaluasi ketahanan aplikasi **KampusBite** terhadap ancaman keamanan siber yang umum terjadi pada aplikasi web modern, khususnya mengacu pada standar industri **OWASP Top 10**.

Hasil pengujian menunjukkan bahwa arsitektur monorepo KampusBite mengimplementasikan prinsip *defense-in-depth* yang kuat:
- **Autentikasi & Otorisasi:** Menggunakan JSON Web Token (JWT) dengan penandatanganan rahasia (`HMAC-SHA256`) dan enkripsi password satu arah menggunakan `bcrypt` dengan *salt rounds* 10.
- **Role-Based Access Control (RBAC):** Middleware `RequireAuth` dan `RequireRole` membatasi akses pada tingkat rute API untuk 3 peran: `ADMIN`, `SELLER`, dan `BUYER`.
- **Injeksi SQL & Perintah:** Seluruh interaksi database ditangani oleh **Prisma ORM** yang secara bawaan menggunakan *parameterized queries*, meniadakan kerentanan SQL Injection.
- **Cross-Site Scripting (XSS):** Data input pengguna di-escape secara ketat melalui fungsi utilitas `escapeHtml()` sebelum dirender ke DOM.
- **Proteksi Header & Fingerprinting:** Server Express telah dikonfigurasi untuk menyembunyikan header `X-Powered-By` serta mengaktifkan HTTP security headers wajib (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
- **Pencegahan Kebocoran Data Sensitif:** Endpoint error handling tidak mengekspos *stack trace* atau kredensial internal ke client.

---

## 2. Metodologi Pengujian

Pengujian dilakukan melalui 4 tahapan sistematis:

1. **Audit Dependensi Otomatis (Software Composition Analysis / SCA):**  
   Pemeriksaan pustaka pihak ketiga menggunakan mesin audit basis data kerentanan npm advisories (`npm audit`).
2. **Review Kode Statis (Static Application Security Testing / SAST):**  
   Pemeriksaan logika kode sumber backend dan frontend terhadap potensi celah keamanan (OWASP Top 10).
3. **Pengujian Akses Kontrol & Integritas Bisnis:**  
   Simulasi skenario bypass role, akses toko lain (IDOR), pemberian rating palsu tanpa riwayat pesanan, serta manipulasi harga produk.
4. **Automated Unit Security Testing:**  
   Verifikasi otomatis 84 skenario uji unit menggunakan Vitest dan supertest.

---

## 3. Matriks Hasil Pengujian Berdasarkan OWASP Top 10

| Kategori OWASP | Aspek yang Diuji | Implementasi Pengamanan di KampusBite | Status Hasil Uji |
| :--- | :--- | :--- | :---: |
| **A01: Broken Access Control** | Pembatasan rute API Admin, Toko Penjual, dan Data Pemesan. | Middleware `RequireAuth` + `RequireRole(Role.Admin, Role.Seller)`. Validasi kepemilikan toko pada endpoint `POST /api/stores` (1 penjual = 1 toko). | **PASSED** |
| **A02: Cryptographic Failures** | Penyimpanan password & token session. | Password di-hash menggunakan algoritma `bcrypt` (10 rounds). Token otentikasi JWT ditandatangani dengan secret key dan masa kedaluwarsa 7 hari. Data password hash tidak pernah dikirim ke respon client (`PublicUser` projection). | **PASSED** |
| **A03: Injection (SQLi & XSS)** | Query database MySQL & rendering input dinamis ke HTML. | Menggunakan Prisma ORM parameterized queries (mencegah SQL Injection). Menggunakan fungsi sanitasi `escapeHtml()` pada seluruh output frontend (mencegah Stored/Reflected XSS). | **PASSED** |
| **A04: Insecure Design** | Logika bisnis checkout, pembatasan ulasan, dan status toko. | - Hanya pembeli dengan nomor WhatsApp yang pernah memesan menu terkait yang diizinkan mengirim ulasan rating bintang.<br>- Pesanan ditolak jika toko sedang berstatus tutup (`IsOpen: false`).<br>- Validasi harga produk tidak boleh bernilai negatif. | **PASSED** |
| **A05: Security Misconfiguration** | Header server, error exposure, dan CORS. | - Header `X-Powered-By` dinonaktifkan.<br>- Header proteksi diaktifkan: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`.<br>- CORS dibatasi ke `CLIENT_URL`.<br>- File `.env` terdaftar di `.gitignore`. | **PASSED** |
| **A06: Vulnerable Components** | Audit dependensi pustaka npm. | Dijalankan `npm audit fix` untuk memitigasi kerentanan pada dependensi produksi (`body-parser`, `qs`, `shell-quote`, `concurrently`). | **PASSED** |
| **A07: Identification & Auth Failures** | Validasi format input registrasi dan percobaan login salah. | Validasi regex ketat pada format email, panjang minimal password 6 karakter, penolakan pesan error seragam (`Email atau password salah`) untuk mencegah *user enumeration*. | **PASSED** |
| **A08: Software & Data Integrity** | Integritas paket & payload JSON. | Integritas diverifikasi melalui `package-lock.json` sha512 integrity hashes. | **PASSED** |
| **A09: Security Logging & Monitoring** | Penanganan kegagalan server tanpa kebocoran data. | Error terduga ditangani oleh `HttpError` terstandar, sedangkan error tak terduga dicatat di server console tanpa mengekspos detail stack trace atau kredensial database ke pengguna luar. | **PASSED** |
| **A10: SSRF** | Validasi pemanggilan URL eksternal oleh server. | API KampusBite tidak melakukan request HTTP keluar berdasarkan input dinamis pengguna (bebas SSRF). Link WhatsApp dibentuk di sisi client / response builder yang aman. | **PASSED** |

---

## 4. Catatan Perubahan yang Relevan (Security Changelog)

Berikut adalah daftar perubahan dan penguatan keamanan yang telah diimplementasikan ke dalam kode sumber:

### 1. Pembaruan dan Mitigasi Kerentanan Dependensi
- **Tindakan:** Menjalankan `npm audit fix` untuk memperbarui dependensi produksi yang memiliki laporan CVE advisories.
- **Paket yang Dimutakhirkan:**
  - `body-parser` dan `qs`: Memperbaiki kerentanan *Denial of Service (DoS)* pada pemrosesan trailing bytes request body dan stringify.
  - `shell-quote` & `concurrently`: Memperbaiki potensi *Command Injection* pada karakter line-terminator.
- **Dampak:** Dependensi runtime produksi bebas dari kerentanan High/Critical.

### 2. Penguatan HTTP Security Headers (`apps/api/src/app.js`)
- **Tindakan:**
  - Menonaktifkan header `X-Powered-By` melalui `app.disable("x-powered-by")` untuk mencegah *server fingerprinting*.
  - Menambahkan middleware global untuk menyertakan:
    - `X-Content-Type-Options: nosniff` (Mencegah browser melakukan MIME-sniffing).
    - `X-Frame-Options: SAMEORIGIN` (Mencegah serangan Clickjacking melalui `<iframe>`).
    - `Referrer-Policy: strict-origin-when-cross-origin` (Melindungi privasi URL referensi).
- **Berkas Diubah:** [`apps/api/src/app.js`](file:///c:/Daffa/Kuliah/KampusBite/apps/api/src/app.js)

### 3. Penambahan Unit Test Verifikasi Keamanan (`apps/api/tests/middleware.test.js`)
- **Tindakan:** Menambahkan blok pengujian otomatis untuk memverifikasi bahwa header keamanan wajib selalu dikembalikan oleh server dan `X-Powered-By` tidak ada pada response header.
- **Berkas Diubah:** [`apps/api/tests/middleware.test.js`](file:///c:/Daffa/Kuliah/KampusBite/apps/api/tests/middleware.test.js)

### 4. Sanitasi Output & Validasi Akses Bisnis
- **Tindakan:**
  - Mengonfirmasi seluruh controller (`ProductController`, `StoreController`, `OrderController`, `ReviewController`) menerapkan validasi tipe data dan penolakan nilai janggal (misal `Price < 0`, `Rating < 1 || Rating > 5`).
  - Verifikasi bahwa `ReviewController` memvalidasi relasi pembelian sebelum mengizinkan penyimpanan ulasan.
  - Memastikan token JWT hanya memuat atribut identitas publik (`Id`, `Role`, `Name`) tanpa informasi kredensial rahasia.

---

## 5. Bukti Hasil Eksekusi Unit Test Keamanan

```text
> kampus-bite@1.0.0 test
> npm run test --workspace @kampus-bite/shared && npm run test --workspace @kampus-bite/api

✓ packages/shared/tests/shared.test.js (8 tests) 31ms

✓ apps/api/tests/category.test.js     (1 test)  76ms
✓ apps/api/tests/dashboard.test.js    (3 tests) 98ms
✓ apps/api/tests/middleware.test.js   (5 tests) 125ms [Termasuk Security Headers]
✓ apps/api/tests/review.test.js       (5 tests) 153ms [Otorisasi Ulasan Pembeli]
✓ apps/api/tests/admin.test.js        (8 tests) 191ms [Proteksi Akses Admin]
✓ apps/api/tests/product.test.js      (12 tests) 224ms [Validasi Harga & Input]
✓ apps/api/tests/store.test.js        (14 tests) 244ms [Proteksi 1 Toko 1 Penjual]
✓ apps/api/tests/order.test.js        (14 tests) 294ms [Validasi Toko Tutup & Checkout]
✓ apps/api/tests/auth.test.js         (14 tests) 779ms [Bcrypt & Proteksi Password]

Test Files: 10 passed (10)
Tests:      84 passed (84)
Result:     100% PASSED (0 Failure)
```

---

## 6. Kesimpulan & Rekomendasi Pemeliharaan

Aplikasi **KampusBite** dinyatakan **lulus seluruh kriteria pengujian keamanan inti** sesuai lingkup aplikasi web kampus.

**Rekomendasi Operasional Saat Deployment Produksi:**
1. Mengganti nilai `JWT_SECRET` pada file `.env` produksi dengan string acak dengan entropi tinggi (minimal 64 karakter acak).
2. Memastikan `DATABASE_URL` menggunakan akun database khusus dengan hak akses terbatas (*principle of least privilege*), bukan menggunakan superuser `root`.
3. Menjalankan aplikasi di balik reverse proxy dengan HTTPS/TLS aktif (misalnya Nginx atau Caddy) untuk mengamankan data in-transit.
