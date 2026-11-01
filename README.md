# Sabaraha — Frontend

Dashboard harga dan ketersediaan pangan Kota Bandung. Frontend ini membaca data dari API **Sabaraha** (dibangun terpisah di folder `be/`) yang bersumber dari Bank Indonesia – PIHPS Nasional.

## Ringkasan

| | |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Bahasa | TypeScript |
| Styling | Tailwind CSS 4 (theme tokens di `src/app/globals.css`) |
| Grafik | Recharts 3 (dengan alternatif tabel untuk aksesibilitas) |
| Ikon | Lucide React |
| Testing | Vitest + Testing Library |

### Halaman (7 rute utama)

- `/` — **Ringkasan**: KPI indeks harga pangan, tren indeks, status ketersediaan, peringkat naik/turun, tabel harga terkini.
- `/tren` — **Tren Harga**: pergerakan 1–5 komoditas, perbandingan berbasis indeks, filter rentang & agregasi.
- `/periode` — **Periode & Musiman**: harga dengan penanda Ramadan, Idul Fitri, Idul Adha, Natal–Tahun Baru, musim hujan; statistik kenaikan per periode.
- `/volatilitas` — **Volatilitas**: peringkat koefisien variasi, deteksi lonjakan (±2 simpangan baku).
- `/ketersediaan` — **Ketersediaan**: status neraca, pasokan vs kebutuhan, stok akhir. **Data simulasi (dummy)**. Toggle rentang: riwayat (12 bln/3 thn/penuh), **proyeksi 2026–2032**, atau semua; proyeksi diberi label "Proyeksi simulasi".
- `/prediksi` — **Prediksi**: median kenaikan per periode berikutnya dari pola historis.
- `/info` — **Info Data**: sumber, cakupan, metode, dan keterbatasan data.

## Menjalankan secara lokal

```bash
cd fe
npm install
cp .env.example .env.local   # isi API_BASE_URL
npm run dev
```

Buka [http://localhost:3001](http://localhost:3001) (atau port yang dipilih).

## Variabel lingkungan

Satu variabel yang dibutuhkan — **hanya dibaca di server, tidak pernah `NEXT_PUBLIC_`** sehingga URL API tidak dibocorkan ke browser:

```
API_BASE_URL=https://sabaraha-nine.vercel.app/api/v1
```

Salin `.env.example` ke `.env.local`. Saat pengembangan lokal, arahkan ke API produksi di atas, atau ke instance `be/` lokal (mis. `http://localhost:3000/api/v1`).

## Deployment

Aplikasi ini di-host di Vercel (proyek `sabaraha-fe`):

- **Frontend**: https://sabaraha-fe.vercel.app
- **API backend**: https://sabaraha-nine.vercel.app/api/v1

Environment variable `API_BASE_URL` diatur di dashboard Vercel (Environment → Production) dan mengarah ke API di atas. Build Next.js memakai `next build`; cukup `vercel --prod` dari folder `fe/`.

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | server pengembangan (Turbopack) |
| `npm run build` | build produksi |
| `npm run start` | jalankan build produksi |
| `npm run check` | typecheck TypeScript (`tsc --noEmit`) |
| `npm run lint` | lint ESLint |
| `npm test` | jalankan seluruh unit test (Vitest) |
| `npm run test:watch` | test mode watch |

## Arsitektur

### Server-first, tanpa panggilan API dari browser

Seluruh data diambil lewat **Server Components** dengan `fetch` + `next: { revalidate: 3600 }` (ISR 1 jam). Browser tidak pernah memanggil API secara langsung, sehingga:

- Tidak ada masalah CORS (backend boleh tetap `ALLOWED_ORIGINS=*`).
- Kunci/URL API tidak pernah dikirim ke klien.

Klien API ada di `src/lib/api.ts` (fungsi `fetchApiData`, `fetchApiEnvelope`, `cobaAmbil`) dan membentuk error `ApiError` dari bentuk `{"galat":{...}}`.

### Filter lewat query string

Filter komoditas/rentang/periode disimpan di URL (`?komoditas=...&hari=90`). Komponen klien `FilterChips` memperbarui URL via `useRouter`, lalu halaman (server) membaca `searchParams` dan mengambil ulang data. Halaman dinamis (`/tren`, `/periode`, `/volatilitas`, `/ketersediaan`, `/prediksi`) server-render on-demand; `/` dan `/info` di-ISR.

### Grafik & aksesibilitas

Setiap grafik dibungkus `ChartFrame` yang menyediakan:
- `role="img"` + `aria-label` ringkasan teks,
- tombol **"Lihat sebagai tabel"** untuk alternatif tabel (WCAG),
- sumber data.

### Prop chart harus serializable

`TrendChart` dan `GroupedBarChart` adalah komponen klien. Mereka menerima prop berupa **enum string** (`xFormat="bulan"`, `yFormat="ton"`), bukan fungsi, karena Next.js melarang pengiriman fungsi dari Server Component ke Client Component. Formatter diselesaikan di dalam komponen klien.

### Grid responsif

Semua layout grid responsif memberi `grid-cols-1` sebagai kolom dasar (mis. `grid grid-cols-1 gap-6 xl:grid-cols-12`). Tanpa ini, kolom implisit memakai sizing `auto` (min-content) sehingga kartu berisi tabel `min-w-*` dapat meluber keluar viewport.

## Konvensi data penting

- **`null` = data tidak tersedia**, selalu ditampilkan sebagai `-`, **tidak pernah** diubah jadi `0` atau `Rp 0`.
- **Data ketersediaan adalah simulasi (dummy)** — diberi label `Simulasi`/`Data simulasi` di UI. Jangan dikutip sebagai data resmi.
- **Ketersediaan punya `jenis_data`**: `riwayat` (historis s.d. Okt 2026) dan `proyeksi` (simulasi tren Nov 2026–Des 2032). Proyeksi **bukan ramalan resmi** dan diberi label "Proyeksi simulasi". "Bulan terkini" selalu memakai riwayat terakhir, tidak pernah proyeksi.
- **Tidak ada angka backtest yang dibuat** — API tidak mengekspos backtest per kejadian, dan UI menyatakan hal ini di `/prediksi` dan `/info`.
- Harga hanya tersedia hari kerja; akhir pekan/libur tidak ada baris (garis tidak disambung melewati nilai kosong).

## Struktur

```
fe/
├── src/
│   ├── app/                    # App Router
│   │   ├── layout.tsx          # root layout (font, lang="id")
│   │   ├── globals.css         # Tailwind 4 theme tokens
│   │   └── (dashboard)/        # shell dashboard + 7 halaman
│   ├── components/
│   │   ├── charts/             # TrendChart, DonutChart, GroupedBarChart, ChartFrame, dll.
│   │   ├── dashboard/          # KPI, ranking, tabel harga, banner simulasi
│   │   ├── filters/            # FilterChips (client, update URL)
│   │   ├── layout/             # Sidebar, Topbar, MobileNav, TextSize
│   │   └── ui/                 # Card, Chip, PageHeader, skeleton, empty/error state
│   └── lib/                    # api, types, format, data, query, filters, navigation
├── tests/                      # unit test (Vitest)
└── .env.example
```

## Backend

Kontrak API resmi ada di [`../be/docs/API.md`](../be/docs/API.md). Proyek backend (terpisah) berada di `../be/`.

## Catatan implementasi

- **Server Components** mengambil data; hanya `FilterChips`, `ChartFrame`, grafik, tabel interaktif, dan kontrol layout yang menjadi `"use client"`.
- **Ukuran teks** (A / A+ / A++) disimpan di `localStorage` dan diterapkan via `data-text-size`, dengan `useSyncExternalStore` agar aman terhadap hydration.
- **`prefers-reduced-motion`** dihormati di `globals.css`.
