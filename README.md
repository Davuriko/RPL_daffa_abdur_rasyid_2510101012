# KampusBite — Campus Food & Snack Hub

Platform jual-beli makanan, camilan, dan minuman buatan mahasiswa di dalam kampus.
Penjual bisa mendaftarkan toko, mengelola menu, dan memantau pesanan. Pembeli bisa
menelusuri menu, menambah ke keranjang, checkout, lalu meneruskan pesanan ke penjual
lewat WhatsApp.

## Teknologi

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + TypeScript + Express
- **Database:** MySQL (via Docker Compose)
- **ORM:** Prisma
- **Monorepo:** npm workspaces

## Struktur Proyek

```
kampus-bite/
├── apps/
│   ├── api/            # REST API (Express + Prisma)
│   └── web/            # Frontend (React + Vite + Tailwind)
├── packages/
│   └── shared/         # Domain models, enums, DTOs, konstanta bersama
├── docker-compose.yml  # MySQL
└── .env.example
```

Tipe data bersama berada di `@kampus-bite/shared` dan dipakai oleh `api` maupun `web`.
Frontend tidak pernah mengimpor tipe Prisma secara langsung.

## Prasyarat

- Node.js 18+ dan npm 9+
- Docker Desktop (untuk MySQL)

## 1. Instalasi Dependensi

Dari folder root proyek:

```bash
npm install
```

Salin file environment lalu sesuaikan bila perlu:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

> Di PowerShell gunakan `Copy-Item .env.example .env` (lakukan untuk tiap file).

## 2. Menjalankan Database (Docker)

Jalankan MySQL memakai Docker Compose:

```bash
docker compose up -d
```

Perintah lain yang berguna:

```bash
docker compose ps        # cek status kontainer
docker compose logs -f   # lihat log MySQL
docker compose down      # hentikan kontainer
```

Konfigurasi default (lihat `docker-compose.yml`):

- Host: `localhost:3306`
- Database: `kampus_bite`
- User / Password: `kampus` / `kampus`

`DATABASE_URL` pada `apps/api/.env` sudah cocok dengan nilai di atas:

```
DATABASE_URL="mysql://kampus:kampus@localhost:3306/kampus_bite"
```

## 3. Migrasi & Seed Database (Prisma)

Setelah MySQL berjalan, buat skema dan isi data contoh:

```bash
# Generate Prisma Client
npm run prisma:generate --workspace @kampus-bite/api

# Jalankan migrasi (membuat tabel di database)
npm run prisma:migrate --workspace @kampus-bite/api

# Isi data contoh (2 toko, 4 kategori, 6 produk, 2 pesanan)
npm run prisma:seed --workspace @kampus-bite/api
```

Opsional, buka Prisma Studio untuk melihat data:

```bash
npm run prisma:studio --workspace @kampus-bite/api
```

## 4. Menjalankan Server

### Cara cepat (backend + frontend sekaligus)

Dari root:

```bash
npm run dev
```

Perintah ini akan build package `shared`, lalu menjalankan API dan Web bersamaan.

### Menjalankan terpisah

Backend (Express, default `http://localhost:4000`):

```bash
npm run build:shared
npm run dev:api
```

Frontend (Vite, default `http://localhost:5173`):

```bash
npm run dev:web
```

Buka `http://localhost:5173` di browser.

- **Tampilan Pelanggan:** `http://localhost:5173/?view=customer`
- **Dashboard Penjual:** `http://localhost:5173/?view=seller`

## API Endpoints

Base URL: `http://localhost:4000/api`

| Method | Endpoint                     | Keterangan                    |
| ------ | ---------------------------- | ----------------------------- |
| GET    | `/stores`                    | Daftar toko                   |
| GET    | `/stores/:Id`                | Detail toko                   |
| POST   | `/stores`                    | Tambah toko                   |
| PUT    | `/stores/:Id`                | Ubah toko                     |
| PATCH  | `/stores/:Id/toggle-status`  | Buka/tutup toko               |
| GET    | `/categories`                | Daftar kategori               |
| GET    | `/products`                  | Daftar produk (filter query)  |
| GET    | `/products/:Id`              | Detail produk                 |
| POST   | `/products`                  | Tambah produk                 |
| PUT    | `/products/:Id`              | Ubah produk                   |
| DELETE | `/products/:Id`              | Hapus produk                  |
| POST   | `/orders`                    | Buat pesanan (+ URL WhatsApp) |
| GET    | `/stores/:StoreId/orders`    | Daftar pesanan toko           |
| PATCH  | `/orders/:Id/status`         | Ubah status pesanan           |
| GET    | `/stores/:StoreId/dashboard` | Ringkasan dashboard penjual   |

Filter produk: `/products?StoreId=...&CategoryId=...&IsAvailable=true`

## Skrip npm (root)

| Skrip                    | Fungsi                                        |
| ------------------------ | --------------------------------------------- |
| `npm run dev`            | Build shared + jalankan API dan Web bersamaan |
| `npm run dev:api`        | Jalankan API saja                             |
| `npm run dev:web`        | Jalankan Web saja                             |
| `npm run build:shared`   | Build package `shared`                        |
| `npm run db:up`          | `docker compose up -d`                        |
| `npm run db:down`        | `docker compose down`                         |
| `npm run prisma:migrate` | Migrasi database                              |
| `npm run prisma:seed`    | Seed data contoh                              |

## Alur WhatsApp

Saat pembeli checkout, backend menghitung ulang total di sisi server (integritas
harga), menyimpan `Order` beserta `OrderItem` secara transaksional, lalu mengembalikan
URL siap kirim berformat `https://wa.me/<nomor_penjual>?text=...`. Pembeli menekan
tombol "Kirim Pesanan ke WhatsApp Penjual" untuk meneruskan detail pesanan.
