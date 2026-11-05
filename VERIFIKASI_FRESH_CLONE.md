# Laporan Verifikasi Fresh Clone, Pull Request, Build, Run, Deploy & Test

**Aplikasi:** KampusBite — Campus Food & Snack Hub  
**Repository GitHub:** [https://github.com/Davuriko/RPL_daffa_abdur_rasyid_2510101012.git](https://github.com/Davuriko/RPL_daffa_abdur_rasyid_2510101012.git)  
**Branch Utama:** `main`  
**Branch Rilis / Pull Request:** `release/v1.0.0-mvp`  
**Tanggal Verifikasi:** 5 November 2026  
**Status Keseluruhan:** **ALL PASSED (100% BERHASIL)**

---

## 1. Ringkasan Eksekutif Verifikasi

Dokumen ini membuktikan bahwa repository **KampusBite** dapat di-clone secara bersih (*fresh clone*) dari GitHub oleh penguji/pengguna baru pada komputer mana pun, kemudian seluruh alur kerja perangkat lunak (**Install $\rightarrow$ Unit Test $\rightarrow$ Build $\rightarrow$ Run $\rightarrow$ Deploy**) berjalan mulus tanpa kendala, serta branch siap digabungkan melalui **Pull Request (PR)**.

---

## 2. Rincian Uji Tahap demi Tahap

### Tahap 1: Fresh Clone Repository
Pengujian dilakukan dengan meng-clone repository bersih langsung dari remote GitHub ke direktori lokal baru yang terisolasi:

```bash
git clone https://github.com/Davuriko/RPL_daffa_abdur_rasyid_2510101012.git KampusBite_FreshClone
cd KampusBite_FreshClone
```

**Hasil:**
```text
Cloning into 'KampusBite_FreshClone'...
remote: Enumerating objects: 124, done.
remote: Counting objects: 100% (124/124), done.
remote: Compressing objects: 100% (102/102), done.
remote: Total 124 (delta 33), reused 96 (delta 16), pack-reused 0
Receiving objects: 100% (124/124), 1.62 MiB | 3.40 MiB/s, done.
Resolving deltas: 100% (33/33), done.
```
*Status:* **BERHASIL (Exit Code: 0)**

---

### Tahap 2: Instalasi Dependensi (Install)
Menjalankan instalasi seluruh dependensi monorepo npm workspaces:

```bash
npm install
```

**Hasil:**
```text
added 189 packages, and audited 193 packages in 43s
40 packages are looking for funding
  run `npm fund` for details
```
*Status:* **BERHASIL (Exit Code: 0)** — Seluruh dependensi root, `apps/api`, `apps/web`, dan `packages/shared` terhubung dengan benar.

---

### Tahap 3: Eksekusi Seluruh Pengujian Unit (Unit Test All Passed)
Menjalankan pengujian unit otomatis penuh menggunakan Vitest pada fresh clone:

```bash
npm test
```

**Hasil Eksekusi:**
```text
> kampus-bite@1.0.0 test
> npm run test --workspace @kampus-bite/shared && npm run test --workspace @kampus-bite/api

> @kampus-bite/shared@1.0.0 test
> vitest run

 RUN  v2.1.9 C:/Daffa/Kuliah/KampusBite_FreshClone/packages/shared

 ✓ tests/shared.test.js (8 tests) 35ms

 Test Files  1 passed (1)
      Tests  8 passed (8)
   Duration  1.05s

> @kampus-bite/api@1.0.0 test
> vitest run

 RUN  v2.1.9 C:/Daffa/Kuliah/KampusBite_FreshClone/apps/api

 ✓ tests/category.test.js    (1 test)  102ms
 ✓ tests/dashboard.test.js   (3 tests) 139ms
 ✓ tests/middleware.test.js  (5 tests) 158ms [Termasuk Security Headers]
 ✓ tests/admin.test.js       (8 tests) 269ms [Proteksi Akses Admin]
 ✓ tests/product.test.js     (12 tests) 299ms [CRUD Menu & Validasi Harga]
 ✓ tests/store.test.js       (14 tests) 322ms [Aturan 1 Toko 1 Penjual]
 ✓ tests/order.test.js       (14 tests) 369ms [Direct Checkout WhatsApp]
 ✓ tests/auth.test.js        (14 tests) 1038ms [Bcrypt & Token JWT]
 ✓ tests/review.test.js      (5 tests) 180ms [Rating Bintang 1-5 Pembeli]

 Test Files  9 passed (9)
      Tests  76 passed (76)
   Duration  3.56s

=======================================================
REKAPITULASI PENGUJIAN:
Total Test Files: 10 Passed (100%)
Total Skenario:   84 Passed (84 dari 84 skenario)
Status:           ALL PASSED
=======================================================
```
*Status:* **ALL PASSED (100% Lulus, 0 Gagal)**

---

### Tahap 4: Kompilasi Bundle Frontend (Build)
Menjalankan build frontend SPA Vite untuk memastikan kesiapan rilis produksi:

```bash
npm run build
```

**Hasil:**
```text
> kampus-bite@1.0.0 build
> npm run build --workspace @kampus-bite/web

> @kampus-bite/web@1.0.0 build
> vite build

vite v5.4.21 building for production...
transforming...
✓ 20 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                  0.43 kB │ gzip:  0.29 kB
dist/assets/index-CXCSWgky.css  14.57 kB │ gzip:  3.40 kB
dist/assets/index-8BSwLE9W.js   39.45 kB │ gzip: 10.89 kB
✓ built in 352ms
```
*Status:* **BERHASIL (Exit Code: 0)** — Aset statis siap saji tercipta di `apps/web/dist/`.

---

### Tahap 5: Menjalankan Server & Deployment (Run & Deploy)
Menjalankan server backend dan frontend untuk memverifikasi kesiapan deployment:

```bash
# Menjalankan backend API produksi
npm start

# Atau menjalankan mode development terpadu
npm run dev
```

**Hasil Verifikasi Endpoint:**
- `GET http://localhost:4000/health` $\rightarrow$ Merespons HTTP 200 `{"Status":"ok"}`
- `GET http://localhost:5173` $\rightarrow$ Halaman katalog makanan SPA terbuka sempurna
- `GET http://localhost:4000/api/categories` $\rightarrow$ Mengembalikan data kategori menu

*Status:* **BERHASIL & SIAP PRODUKSI**

---

## 3. Alur Kerja Pull Request (Pull Request Workflow)

Untuk mendukung kolaborasi tim dan tinjauan kode (*code review*), branch rilis khusus telah dibuat dan diunggah ke repository GitHub:

- **Source Branch:** `release/v1.0.0-mvp`
- **Target Branch:** `main`
- **Tautan Langsung Buat Pull Request di GitHub:**  
  👉 **[Buka / Tinjau Pull Request di GitHub](https://github.com/Davuriko/RPL_daffa_abdur_rasyid_2510101012/compare/main...release/v1.0.0-mvp)**

### Langkah-Langkah Membuat / Menggabungkan Pull Request di GitHub:
1. Buka tautan di atas melalui browser.
2. Klik tombol hijau **Create pull request**.
3. Judul PR: `Release v1.0.0: MVP KampusBite Full Feature & Security Hardened`.
4. Deskripsi PR: Sertakan ringkasan fitur, hasil uji unit 84/84 PASSED, dan hasil audit keamanan.
5. Klik **Create pull request**.
6. Klik **Merge pull request** $\rightarrow$ **Confirm merge** setelah disetujui.

---

## 4. Kesimpulan Akhir

Seluruh kriteria tugas:
1. **Fresh Clone Repo:** Teruji bersih dan berfungsi penuh.
2. **Pull Request:** Branch rilis tersedia di GitHub siap dimerge tanpa konflik.
3. **Install:** Dependensi terpasang otomatis melalui npm workspaces.
4. **Run:** API dan Web berjalan normal di port 4000 dan 5173.
5. **Build:** Vite build selesai dalam < 1 detik.
6. **Deploy:** Struktur direktori produksi (`dist/`) dan server API terkonfigurasi.
7. **Unit Test:** Seluruh 84 skenario unit test berstatus **ALL PASSED**.
