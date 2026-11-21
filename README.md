# Sistem Monitoring Satwa Liar — Frontend

README ini adalah dokumentasi utama repository `wildlife-tracking-frontend`. Isinya disusun dari audit langsung terhadap kode sumber frontend, konfigurasi, rute, hook, service, tipe, komponen, dan integrasi API yang ada. Dokumen lama yang menyebut AI belum memiliki UI, logout tidak mencabut token, atau validasi sesi hanya membaca cookie sudah tidak sesuai dengan kode saat ini.

**Audit terakhir:** 21 November 2026.

## Daftar isi

- [1. Ringkasan aplikasi](#1-ringkasan-aplikasi)
- [2. Status implementasi](#2-status-implementasi)
- [3. Tumpukan teknologi](#3-tumpukan-teknologi)
- [4. Arsitektur frontend](#4-arsitektur-frontend)
- [5. Routing dan fitur](#5-routing-dan-fitur)
- [6. Integrasi backend](#6-integrasi-backend)
- [7. Integrasi AI](#7-integrasi-ai)
- [8. UI, validasi, dan pengalaman pengguna](#8-ui-validasi-dan-pengalaman-pengguna)
- [9. Instalasi dan pengembangan](#9-instalasi-dan-pengembangan)
- [10. Pemeliharaan dan konvensi](#10-pemeliharaan-dan-konvensi)
- [11. Keterbatasan dan pekerjaan berikutnya](#11-keterbatasan-dan-pekerjaan-berikutnya)
- [12. Referensi](#12-referensi)

---

## 1. Ringkasan aplikasi

### 1.1 Masalah yang diatasi

Pemantauan satwa liar di Taman Nasional Gunung Leuser membutuhkan data yang tersebar: individu satwa, spesies, perangkat GPS, pembacaan posisi, zona risiko atau koridor, insiden lapangan, notifikasi, serta hasil identifikasi gambar. Tanpa antarmuka terpusat, petugas lapangan, peneliti, administrator, dan pengambil kebijakan harus membaca data dari banyak sumber yang tidak terhubung.

Aplikasi ini menyediakan satu antarmuka web untuk:

- melihat dan mengelola data master satwa, spesies, perangkat, dan zona;
- memantau posisi satwa melalui peta;
- mencatat dan memperbarui laporan insiden;
- melihat notifikasi dan ringkasan operasional;
- mengunggah gambar untuk prediksi spesies berbasis AI;
- memverifikasi prediksi AI oleh peneliti;
- menghasilkan ringkasan eksekutif dari data backend.

### 1.2 Peran frontend

Frontend adalah klien web Next.js App Router. Frontend bertanggung jawab atas tampilan, interaksi, validasi UX, state klien, dan komunikasi dengan API Laravel. Frontend **tidak**:

- terhubung langsung ke database;
- memanggil penyedia AI seperti Groq atau OpenAI;
- menyimpan kunci AI;
- menjadi otoritas akhir untuk validasi data atau otorisasi;
- menggunakan mock data sebagai sumber data utama.

Backend Laravel di repository `wildlife-tracking-backend` adalah sumber kebenaran untuk autentikasi, otorisasi, validasi akhir, logika bisnis, integrasi AI, dan penyimpanan data.

### 1.3 Pengguna dan alur kerja

| Peran | Nilai role | Fokus penggunaan |
| --- | --- | --- |
| Konservasionis Lapangan | `konservasionis_lapangan` | Dashboard, peta langsung, notifikasi, satwa, Wildlife Explorer, insiden |
| Peneliti Ekologi | `peneliti_ekologi` | Dashboard, peta, notifikasi, satwa, spesies, perangkat, verifikasi prediksi AI |
| Administrator Sistem | `administrator_sistem` | Menu peneliti ditambah zona geografis dan pengelolaan data master |
| Pengambil Kebijakan | `pengambil_kebijakan` | Dashboard, peta, notifikasi, statistik, laporan AI |

Role dipetakan di `lib/navigation.ts`. Menu dan akses halaman di frontend bersifat **UX**; backend tetap harus menegakkan otorisasi pada endpoint yang sensitif.

### 1.4 Hubungan antarrepository

| Repository | Peran |
| --- | --- |
| `wildlife-tracking-frontend` | Antarmuka web, state klien, dan komunikasi API |
| `wildlife-tracking-backend` | REST API Laravel, Sanctum, validasi, Eloquent, aturan bisnis, modul AI |
| `wildlife-tracking-database` | Dokumentasi ERD, kamus data, dan rancangan skema |

Port pengembangan default: frontend `:3000`, backend `:8000`. Database bawaan backend dapat memakai SQLite; konfigurasi produksi berada di repository backend.

---

## 2. Status implementasi

Status berikut dinilai dari kode yang benar-benar ada dan integrasinya, bukan dari keberadaan halaman saja.

| Modul | Fungsi | Status | Kekurangan / catatan |
| --- | --- | --- | --- |
| Login dan sesi | Login email/password, cookie httpOnly, verifikasi `/me`, logout | Selesai | `rememberMe` ada di form tetapi tidak dikirim; role gate di frontend bersifat UX |
| Dashboard | Ringkasan satwa, spesies, perangkat, insiden, GPS, notifikasi, alert, prediksi AI | Selesai | Agregasi dihitung di klien, bukan endpoint `/dashboard`; kueri daftar dibatasi 100 data |
| Manajemen satwa | Daftar, detail, pencarian, filter, tambah, ubah, hapus | Selesai | Payload frontend sudah sesuai aturan `AnimalController`; filter daftar kebanyakan di klien |
| Manajemen spesies | Daftar, detail, pencarian, filter, tambah, ubah, hapus | Selesai | Status konservasi mengikuti enam nilai yang juga divalidasi backend |
| Manajemen perangkat | Daftar, detail, tambah, ubah, hapus, alert baterai/sinyal | Sebagian | CRUD utama berfungsi; mengosongkan tanggal nullable gagal; tidak ada UI assign animal |
| GPS dan peta langsung | Peta Leaflet, posisi perangkat, zona, lintasan satwa | Sebagian | Data nyata dari API, tetapi tidak ada auto-refresh/write UI; filter perangkat dilakukan dengan mengambil semua data |
| Zona geografis | Daftar, peta, tambah, ubah, hapus, detail via modal | Sebagian | `polygon_geojson` berisiko double-encoded; field nullable tidak bisa dikosongkan pada update |
| Insiden lapangan | Daftar, filter, tambah, ubah | Sebagian | Tidak ada UI hapus/detail; batas koordinat belum divalidasi backend; sinkronisasi status tidak konsisten |
| Notifikasi | Daftar, filter, tandai dibaca | Sebagian | Endpoint backend untuk read-all, hapus, dan unread-count belum dipakai UI |
| Statistik | Ringkasan numerik dari data API | Sebagian | Dihitung di browser dari maksimal 100 baris per resource; state error/loading tidak memakai primitive bersama |
| Wildlife Explorer | Placeholder eksplorasi satwa | Belum tersedia | Hanya teks placeholder; tidak ada hook, service, atau tampilan data |
| AI Vision | Upload gambar, prediksi, riwayat, detail, verifikasi | Sebagian | Alur inti terhubung; retry/edit/delete prediksi, riwayat media, dan otorisasi backend untuk verifikasi belum ada |
| Laporan eksekutif AI | Ringkasan live dari backend dengan fallback template | Sebagian | Tidak disimpan, tanpa ekspor/riwayat; `success:false` masih memicu toast sukses |
| Profil pengguna | Ubah profil dan kata sandi | Belum tersedia | Backend memiliki `PATCH /me` dan `PUT /me/password`, frontend belum memakainya |
| Manajemen user, role, permission | CRUD user/role/permission | Belum tersedia | Endpoint backend ada, tetapi tidak ada halaman/service frontend |
| Booking dan booking item | Tidak ditemukan | Belum tersedia | Tidak ada rute, komponen, service, atau endpoint backend terkait |
| Laporan agregat dan ekspor | Tidak ditemukan | Belum tersedia | Backend menyediakan endpoint aggregate/export, frontend belum mengonsumsinya |
| Weather, activity log, kunjungan zona | Tidak ditemukan | Belum tersedia | Endpoint backend ada, tidak ada UI frontend |
| Loading level rute | Suspense/loading skeleton per rute | Belum tersedia | Tidak ada `loading.tsx`; tiap view menangani loading sendiri |

Legenda:

- **Selesai**: fungsi utama diimplementasikan dan integrasinya dapat diverifikasi dari kode.
- **Sebagian**: sebagian alur berfungsi, tetapi ada operasi, integrasi, atau batasan yang belum lengkap.
- **Belum tersedia**: tidak ditemukan implementasi bermakna.
- **Perlu verifikasi**: kode ada, tetapi perilaku produksi atau kontrak eksternal belum dapat dipastikan hanya dari repository ini.

---

## 3. Tumpukan teknologi

Versi berasal dari `package.json` dan `package-lock.json`.

| Kategori | Teknologi | Versi | Peran dalam aplikasi |
| --- | --- | --- | --- |
| Framework | Next.js | `16.3.8` | App Router, Server Components, Server Actions, build produksi |
| UI | React, React DOM | `19.2.8` | Render antarmuka dan interaksi klien |
| Bahasa | TypeScript | `^5` | `strict: true` melalui `tsconfig.json` |
| Styling | Tailwind CSS, `@tailwindcss/postcss` | `^4` | CSS-first Tailwind di `app/globals.css` dan `postcss.config.mjs` |
| Data async | TanStack Query | `^5.104.4` | Query, mutasi, cache, invalidasi |
| Tabel | TanStack Table | `^8.21.3` | Sorting, filtering, pagination, seleksi baris di `DataTable` |
| Peta | Leaflet, `@types/leaflet` | `^1.9.4`, `^1.9.22` | Peta langsung dan visualisasi zona |
| Ikon | `lucide-react` | `^1.60.0` | Ikon antarmuka |
| Form login | React Hook Form, `@hookform/resolvers` | `^7.90.0`, `^5.9.2` | Form login dengan `zodResolver` |
| Validasi | Zod | `^4.6.5` | Skema login dan validasi UX form domain melalui `safeParse` manual |
| Utilitas kelas | `clsx`, `tailwind-merge` | `^2.1.1`, `^3.7.0` | Helper `cn()` di `lib/utils.ts` |
| Lint | ESLint, `eslint-config-next` | `^9`, `16.3.8` | `core-web-vitals` dan aturan TypeScript Next.js |
| HTTP | Native `fetch` | bawaan platform | Semua request terkonsentrasi di `services/api.ts` |

Hal yang **tidak** dipakai:

- Axios atau HTTP client lain;
- library UI komersial atau component library eksternal;
- library grafik khusus;
- library toast eksternal — toast dibuat sendiri di `components/providers/toast-provider.tsx`;
- runner test otomatis;
- script `typecheck` di `package.json`.

`package.json` tidak mendeklarasikan `engines` atau `packageManager`. Next.js `16.3.8` di `package-lock.json` membutuhkan Node.js `>=20.9.0`, sehingga gunakan Node.js 20.9 atau lebih baru dengan npm.

---

## 4. Arsitektur frontend

### 4.1 Alur data aktual

```text
Halaman / Komponen
        ↓
Hook TanStack Query / state lokal
        ↓
Service domain (services/*.service.ts)
        ↓
API client terpusat (services/api.ts)
        ↓
Server Action (services/backend-actions.ts)
        ↓
Laravel REST API (/api)
        ↓
Database / backend services
```

Untuk autentikasi server-side, ada jalur tambahan:

```text
services/laravel-auth.service.ts
        ↓
createServerApiClient() dari services/api.ts
        ↓
Laravel /api/login dan /api/me
```

`services/api.ts` juga berisi implementasi client `fetch` langsung, tetapi client yang dipakai service operasional adalah `api = createActionApiClient()`, yang meneruskan request melalui Server Action.

### 4.2 Struktur direktori

```text
wildlife-tracking-frontend/
├── app/
│   ├── (protected)/
│   ├── login/
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   ├── layout/
│   ├── providers/
│   ├── shared/
│   └── ui/
├── hooks/
├── lib/
├── services/
├── types/
├── utils/
├── public/
├── .env.example
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
└── tsconfig.json
```

| Direktori | Tanggung jawab |
| --- | --- |
| `app/` | Routing, layout, metadata, error dan not-found. Semua `page.tsx` adalah Server Component dan mendelegasikan interaktivitas ke komponen lain. |
| `components/ui/` | Primitive generik: button, form, panel, modal, confirmation dialog, data table, filter, loading, empty/error state, badge, stat card, breadcrumb. |
| `components/shared/<domain>/` | View, list, detail, form, kolom tabel, dan filter per modul. |
| `components/layout/` | `AppShell`, `Header`, `Sidebar`, `MobileNav`, `NavIcon`. |
| `components/providers/` | `QueryProvider` dan `ToastProvider`. |
| `hooks/` | Custom hook TanStack Query, auth, debounce, dan utilitas klien. |
| `services/` | API client, Server Action, cookie, auth Laravel, dan service per domain. |
| `types/` | Semua tipe domain, payload, respons API, dan kontrak Server Action. |
| `lib/` | Session, navigasi, nama cookie, helper form, dan `cn()`. |
| `utils/` | Formatter tanggal, nilai tampilan, dan GeoJSON. |
| `public/` | Aset statis, termasuk logo BTNGL. |

Alias `@/*` menunjuk ke root frontend. Tidak ada direktori `src/`, `features/`, `schemas/`, atau `constants/`.

### 4.3 Server Component dan Client Component

- `app/layout.tsx` dan seluruh `app/**/page.tsx` adalah Server Component.
- `app/(protected)/layout.tsx` memverifikasi sesi di server dan membungkus halaman dengan `AppShell`.
- Interaktivitas berada di komponen bertanda `"use client"`, terutama `components/shared/*`, `components/ui/*`, dan `components/providers/*`.
- Satu-satunya file `"use server"` adalah `services/backend-actions.ts`.
- Tidak ada `app/api/`, route handler, `middleware.ts`, atau `proxy.ts`.
- `next.config.ts` hanya menyediakan rewrite legacy `/master-data/{animals,species,devices,geo-zones}` ke rute tanpa prefiks.

### 4.4 State dan data fetching

`QueryProvider` mengatur:

- `staleTime`: 30 detik;
- `retry`: 1;
- `refetchOnWindowFocus`: false.

Hook mengikuti pola `useX`, `useXById`, `useXCreate`, `useXUpdate`, `useXDelete`, lalu mem invalidate query terkait setelah mutasi. Beberapa hook `useInfinite*` tersedia, tetapi tidak ada UI infinite scroll yang mengonsumsinya. Pagination server belum dipakai; tabel memakai pagination klien di atas data yang sudah diambil.

---

## 5. Routing dan fitur

Grup `(protected)` tidak memengaruhi URL. Jika `getVerifiedSession()` gagal, layout mengalihkan pengguna ke `/login?reason=<alasan>`.

### 5.1 Rute publik

| Rute | Perilaku |
| --- | --- |
| `/` | Memverifikasi sesi, lalu redirect ke rute default role atau `/login` |
| `/login` | Form login; redirect otomatis bila sesi masih valid dan tidak ada parameter `reason` |

### 5.2 Dashboard dan pemantauan

| Rute | Fitur | Implementasi |
| --- | --- | --- |
| `/dashboard` | Ringkasan operasional dan tautan cepat | `DashboardView` memakai `useDashboardSummary`, yang mengagregasi data dari beberapa endpoint nyata |
| `/statistics` | Statistik numerik | `StatisticsView` mengambil satwa, spesies, perangkat, dan insiden lalu menghitung ringkasan di klien |
| `/notifications` | Daftar notifikasi | `NotificationListView` menampilkan filter dan aksi tandai dibaca |
| `/tracking/live-map` | Peta posisi | `LiveMapView` memakai Leaflet, data perangkat, pembacaan GPS, dan zona |
| `/wildlife-explorer` | Placeholder | Tidak ada integrasi data |

Peta langsung memakai tile OpenStreetMap eksternal dan tidak memiliki polling otomatis. Istilah "live" pada rute belum berarti pembaruan realtime.

### 5.3 Manajemen data master

| Modul | Rute | Operasi yang tersedia |
| --- | --- | --- |
| Satwa | `/animals`, `/animals/create`, `/animals/[id]/detail`, `/animals/[id]/update` | List, detail, tambah, ubah, hapus; detail GPS dan insiden terkait |
| Spesies | `/species`, `/species/create`, `/species/[id]/detail`, `/species/[id]/update` | List, detail, tambah, ubah, hapus; daftar satwa per spesies |
| Perangkat | `/devices`, `/devices/create`, `/devices/[id]/detail`, `/devices/[id]/update` | List, detail, tambah, ubah, hapus; alert baterai/sinyal dan pembacaan GPS |
| Zona geografis | `/geo-zones`, `/geo-zones/create`, `/geo-zones/[id]/update` | List, peta, detail via modal, tambah, ubah, hapus |
| Insiden | `/incidents`, `/incidents/create`, `/incidents/[id]/update` | List, filter, tambah, ubah |

Create dan Update untuk setiap modul memakai satu form yang sama melalui `components/shared/form-page.tsx`. Halaman update memanggil `notFound()` untuk ID tidak valid. Halaman detail saat ini meneruskan ID invalid menjadi `-1` dan menampilkan empty state, bukan 404.

### 5.4 AI

| Rute | Fitur |
| --- | --- |
| `/ai/vision` | Unggah gambar camera-trap dan lihat prediksi |
| `/ai/vision/history` | Riwayat prediksi dengan filter dan pagination manual |
| `/ai/vision/[id]` | Detail prediksi, gambar media, status, dan verifikasi |
| `/ai/vision/pending` | Antrean verifikasi untuk `peneliti_ekologi` |
| `/ai/reports` | Ringkasan eksekutif AI/template untuk rentang tanggal |

Detail lengkap ada di [bagian 7](#7-integrasi-ai).

---

## 6. Integrasi backend

### 6.1 Konfigurasi URL

Base URL ditentukan di `services/api.ts` dengan prioritas:

1. `API_URL` — hanya server;
2. `NEXT_PUBLIC_API_URL`;
3. `http://127.0.0.1:8000/api`.

Trailing slash dibuang sebelum request. Path resource ditulis di service modul, relatif terhadap base URL tersebut, misalnya `/animals` dan `/ai/upload`.

Variabel environment yang benar-benar dibaca kode:

| Variabel | Penggunaan |
| --- | --- |
| `API_URL` | Base URL prioritas tertinggi untuk server |
| `NEXT_PUBLIC_API_URL` | Fallback base URL |
| `NEXT_PUBLIC_COOKIE_TOKEN` | Nama cookie token; default `wms_token` |
| `NEXT_PUBLIC_COOKIE_EXPIRES_AT` | Nama cookie yang ikut dihapus saat logout; tidak ditulis saat login |
| `NEXT_PUBLIC_COOKIE_TYPE` | Nama cookie yang ikut dihapus saat logout; tidak ditulis saat login |
| `NODE_ENV` | Menentukan atribut `secure` cookie di produksi |

`.env.example` juga berisi `NEXT_PUBLIC_HOST_NAME`, `NEXT_PUBLIC_PORT`, `NEXT_PUBLIC_DOMAIN`, `NEXT_PUBLIC_REQUEST_TIMEOUT_MS`, dan `WILDLIFE_BACKEND_URL`, tetapi Variabel tersebut belum dibaca oleh kode frontend saat ini. Timeout masih konstan 10 detik, kecuali request AI yang menimpa menjadi 30 atau 120 detik.

### 6.2 Autentikasi dan token

Alur login:

1. `LoginForm` memakai validasi Zod dan mengirim `{ email, password }`.
2. `loginAction` memanggil `authenticateWithLaravel()`.
3. `laravel-auth.service.ts` mengirim `POST /api/login`, lalu membaca `data.token`, `data.user`, dan `data.user.role.role_name`.
4. `setAuthCookies()` menulis `wms_session` dan `wms_token` sebagai cookie httpOnly, `sameSite: "lax"`, `path: "/"`, `maxAge` 8 jam, dan `secure` saat produksi.
5. Token bearer tidak pernah dikirim ke JavaScript browser.
6. `getVerifiedSession()` memanggil `GET /api/me` dengan token sebelum halaman protected dirender.
7. `forwardBackendAction()` membaca token di server dan menambahkan header `Authorization: Bearer <token>`.

Logout memanggil `POST /api/logout` dengan token. Jika backend gagal atau token sudah kedaluwarsa, cookie lokal tetap dihapus agar pengguna tidak terjebak di session mati.

Role yang dikenali: `konservasionis_lapangan`, `peneliti_ekologi`, `administrator_sistem`, dan `pengambil_kebijakan`. Route utama hanya memverifikasi autentikasi. `AppShell` membatasi menu/akses berdasarkan role, dan halaman `/ai/vision/pending` melakukan redirect untuk role selain peneliti. Ini tetap bukan pengganti otorisasi backend.

### 6.3 Penanganan request dan respons

`services/api.ts` menyediakan:

- header `Accept: application/json` dan `Content-Type: application/json` untuk request non-multipart;
- `FormData` tanpa `Content-Type` agar boundary multipart dibuat otomatis;
- query builder yang mengabaikan `undefined`, `null`, string kosong, dan `"all"`;
- `AbortController` dan timeout;
- penanganan `204 No Content`;
- `ApiError` dengan `kind`: `unauthorized`, `forbidden`, `validation`, `not_found`, `client`, `server`, `network`, `unknown`;
- `unwrapData()` untuk envelope `{ success, message, data, errors }`;
- `formatApiError()`, `formatApiMessage()`, dan `getApiFieldErrors()` untuk menampilkan pesan backend;
- `getBlob()` untuk respons biner.

Untuk request browser, `forwardBackendAction()` meneruskan method, path, params, body, FormData, token, dan timeout ke server. Respons biner diubah menjadi base64 di Server Action, lalu dikembalikan menjadi `Blob` oleh API client di browser. Ini dipakai untuk gambar media AI.

Keterbatasan: hanya `Content-Type` yang diteruskan dari header caller; header lain diabaikan. Deteksi biner hanya mencakup `image/*` dan `application/octet-stream`.

### 6.4 Endpoint yang dipakai frontend

| Modul | Method dan path |
| --- | --- |
| Auth | `POST /login`, `POST /logout`, `GET /me` |
| Satwa | `GET`, `POST`, `PUT`, `DELETE /animals`; `GET /animals/{id}` |
| Spesies | `GET`, `POST`, `PUT`, `DELETE /species`; `GET /species/{id}` |
| Perangkat | `GET`, `POST`, `PUT`, `DELETE /devices`; `GET /devices/{id}` |
| GPS | `GET /gps-readings`; `GET /animals/{animalId}/track` |
| Zona | `GET`, `POST`, `PUT`, `DELETE /geo-zones`; `GET /geo-zones/{id}` |
| Insiden | `GET /incidents`; `GET /incidents/{id}`; `POST /incidents`; `PUT /incidents/{id}` |
| Notifikasi | `GET /notifications`; `PATCH /notifications/{id}/read` |
| AI | `POST /ai/upload`; `GET /ai-predictions`; `GET /ai-predictions/pending-verification`; `GET /ai-predictions/{id}`; `POST /ai-predictions/{id}/verify`; `GET /media-uploads/{id}/file`; `GET /ai/summary-report` |

Endpoint backend lain seperti dashboard khusus, user/role/permission, weather, aggregate reports, activity logs, export, retry AI, update/delete prediksi AI, dan media uploads list tersedia di `routes/api.php`, tetapi belum dikonsumsi frontend.

### 6.5 Hasil verifikasi kontrak backend

Kontrak berikut diperiksa terhadap controller dan aturan validasi aktif di backend, bukan terhadap FormRequest yang tidak di-inject.

| Modul | Hasil verifikasi |
| --- | --- |
| Species | Field `common_name`, `scientific_name`, `conservation_status` dan aturan backend sesuai frontend |
| Animals | `name`, `species_id`, `birth_date`, `gender`, `is_active` sesuai; frontend menerjemahkan gender ke `male`/`female`/`unknown` |
| Devices | Field utama sesuai; pengosongan `installation_date`/`last_recorded_at` gagal karena frontend menghilangkan key saat nilai kosong dan backend hanya meng-update field yang hadir |
| Geo Zones | Nama dan koordinat sesuai; `polygon_geojson` dikirim sebagai string lalu berisiko double-encoded oleh cast array; field nullable tidak bisa dikosongkan saat update |
| Incidents | Field utama sesuai; backend belum membatasi lat/lon; penghapusan relasi saat update gagal karena key dihilangkan; default DB `pending` tidak sama dengan enum frontend `pending_sync` |
| Login/logout/me | Sesuai dengan `AuthController`; frontend membaca role dari objek relasi dan memetakan `full_name` menjadi `name` |
| AI upload/verify/summary | Sesuai dengan `StoreAiMediaRequest`, controller verifikasi, dan validasi rentang tanggal summary |

Masalah pada Devices, Geo Zones, dan Incidents harus diperbaiki dengan kontrak yang jelas di backend dan/atau pengiriman `null` yang benar di frontend. Frontend tidak boleh menyamarkan kegagalan endpoint ini dengan data palsu.

---

## 7. Integrasi AI

### 7.1 Prinsip integrasi

Frontend tidak memanggil Groq atau penyedia AI lain secara langsung. Tidak ada kunci AI di `.env.example`, tidak ada SDK AI di `package.json`, dan seluruh permintaan AI melewati Laravel API melalui `AI_SERVICE`, `services/api.ts`, dan Server Action.

Hasil prediksi selalu diberi label **"Dihasilkan AI"**. Ringkasan dengan `used_ai=false` diberi label **"Template Backend"** dan dijelaskan sebagai fallback ketika layanan AI tidak tersedia.

### 7.2 Workflow A — AI Vision

| Aspek | Implementasi |
| --- | --- |
| Rute | `/ai/vision`, `/ai/vision/history`, `/ai/vision/[id]`, `/ai/vision/pending` |
| Service | `services/ai.service.ts` → `AI_SERVICE` |
| Hook | `hooks/use-ai.ts` → `useAiPredictionUpload`, `useAiPredictions`, `useAiPendingPredictions`, `useAiPrediction`, `useAiMediaFile`, `useAiPredictionVerification` |
| Upload | `FormData` dengan field `file` dan opsional `report_id`; tipe JPG/JPEG/PNG/WEBP, maksimal 5 MB |
| Riwayat | Filter status proses, status verifikasi, spesies, confidence minimum, tanggal; pagination manual |
| Detail | Informasi media, prediksi, confidence, model, status, spesies terverifikasi, dan gambar dari endpoint blob |
| Verifikasi | `POST /ai-predictions/{id}/verify` dengan `verification_status` dan `verified_species_id` |
| Role | Kontrol verifikasi hanya tampil untuk `peneliti_ekologi`; halaman pending melakukan redirect untuk role lain |
| Label | "Dihasilkan AI" pada hasil; teks advisory bahwa keputusan akhir ada pada petugas |
| State | Loading, error, retry, empty, toast, field error, dan object URL cleanup tersedia |

Yang belum ada pada frontend:

- tombol retry prediksi meskipun backend punya `POST /ai-predictions/{id}/retry`;
- edit dan hapus prediksi meskipun backend punya endpoint admin;
- daftar detail media upload selain pengambilan file gambar;
- total count dari header backend, sehingga halaman berikutnya ditebak dari jumlah data;
- indikator progres unggah, pembatalan request, atau retry otomatis;
- pemeriksaan role di dalam komponen verifikasi — kontrol bergantung pada prop `canVerify` dari halaman.

Backend juga tidak membatasi verifikasi hanya untuk peneliti; pembatasan tersebut saat ini bersifat UX.

### 7.3 Workflow B — Laporan eksekutif AI

| Aspek | Implementasi |
| --- | --- |
| Rute | `/ai/reports` |
| UI | `AiSummaryView`: pilih tanggal mulai/akhir, tombol buat laporan, tampilkan narasi, statistik, distribusi spesies, insiden per jenis, dan rekomendasi |
| Default | 30 hari terakhir sampai tanggal hari ini |
| Service | `AI_SERVICE.getSummaryReport({ start_date, end_date })` |
| Endpoint | `GET /ai/summary-report` dengan timeout 120 detik |
| Hook | `useAiSummaryReport()` berupa mutation |
| Sumber data | Live dari backend; tidak disimpan sebagai riwayat frontend |
| Fallback | `used_ai=false` ditampilkan sebagai "Template Backend" dengan penjelasan bahwa layanan AI tidak tersedia saat pembuatan |
| Error | Validasi tanggal, `FormAlert`, toast, dan penanganan error API tersedia |

Keterbatasan:

- tidak ada riwayat, arsip, atau penyimpanan laporan;
- tidak ada ekspor PDF/CSV;
- `generated_at` ada di tipe tetapi tidak dirender;
- ketika HTTP 2xx tetapi `data.success === false`, UI menampilkan badge "Respons Tidak Berhasil", namun toast tetap menyatakan laporan berhasil — ini perlu diperbaiki;
- halaman tidak punya role gate khusus dan tersedia untuk semua role.

---

## 8. UI, validasi, dan pengalaman pengguna

### 8.1 Primitive dan komponen bersama

`components/ui/` berisi primitive yang dipakai ulang:

- `Button` dengan varian dan state loading;
- `FormField`, `TextInput`, `SelectInput`, `TextArea`, `FormCheckbox`, `FormActions`, `FormAlert`, `FormGrid`, `FormSection`;
- `Panel`, `PageHeader`, `SectionHeader`;
- `Modal`, `ConfirmationDialog`;
- `DataTable`, `DataFilters`;
- `Loading`, `EmptyState`, `ErrorState`;
- `StatusBadge`, `StatCard`, `Breadcrumb`.

`ToastProvider` menyediakan toast dengan maksimal tiga pesan, auto-dismiss, dan dua posisi: tengah sebagai default serta kanan bawah untuk login.

### 8.2 Validasi form

Ada dua pendekatan yang benar-benar dipakai:

1. **Login** memakai React Hook Form + `zodResolver`.
2. **Form domain** (satwa, spesies, perangkat, zona, insiden) memakai Zod `safeParse` manual, state lokal, dan helper `lib/form.ts` untuk memetakan issue ke error per field.

Form domain memakai satu komponen untuk create dan update, mencegah submit ganda, menampilkan error backend per field, dan memetakan nama field backend ke nama field UI bila berbeda, misalnya backend `name` menjadi UI `animal_code`. Validasi Zod hanya untuk UX; backend tetap melakukan validasi akhir.

`AiPredictionVerification` tidak memakai Zod; ia melakukan validasi manual bahwa spesies harus dipilih.

### 8.3 State, error, dan aksesibilitas

Sebagian besar view memakai `Loading`, `EmptyState`, dan `ErrorState` secara konsisten. `ErrorState` mengenal delapan `ApiErrorKind` dan dapat menampilkan daftar error validasi 422. Mutasi menampilkan toast dan mengembalikan error ke field yang sesuai.

Aksesibilitas yang sudah ada:

- skip link ke konten utama;
- `:focus-visible` global;
- label, `aria-invalid`, `aria-describedby`, dan `role="alert"` pada form;
- caption tersembunyi, `aria-sort`, dan baris tabel yang dapat diaktifkan dengan keyboard;
- `role="dialog"`, `aria-modal`, Escape, backdrop, dan fokus awal pada modal;
- `role="status"` pada loading;
- ikon dekoratif dengan `aria-hidden`;
- navigasi aktif dengan `aria-current`.

Kesenjangan yang masih ada:

- tidak ada focus trap atau pengembalian fokus saat modal ditutup;
- `ConfirmationDialog` belum mengisi `aria-describedby` panel;
- tidak ada live region untuk perubahan sorting/pagination tabel;
- tidak ada `prefers-reduced-motion`;
- tidak ada `loading.tsx` level rute;
- Statistik dan notifikasi memiliki loading/empty/error buatan sendiri;
- beberapa warna langsung masih bersaing dengan token `app/globals.css`.

### 8.4 Responsivitas dan sidebar

`AppShell` menampilkan sidebar desktop dan `MobileNav` untuk layar kecil. Sidebar desktop dapat menciut saat tidak di-hover. Header bersifat sticky, memiliki tombol menu pada layar kecil, breadcrumb pada layar `sm` ke atas, lonceng notifikasi, dan menu akun.

Role menentukan menu melalui `NAV_SECTIONS` di `lib/navigation.ts`. Jika role tidak diizinkan mengakses rute, `AppShell` menampilkan panel "Akses ditolak" dan tautan ke rute default, bukan redirect otomatis.

---

## 9. Instalasi dan pengembangan

### 9.1 Prasyarat

- Node.js `>=20.9.0`;
- npm dengan lockfile v3;
- backend Laravel yang berjalan dan dapat diakses dari frontend;
- akses ke variabel environment backend yang diperlukan, tanpa menaruh kunci AI di frontend.

### 9.2 Instalasi

```bash
cd wildlife-tracking-frontend
npm install
```

Jika belum ada file environment lokal:

```bash
cp .env.example .env.local
```

Sesuaikan minimal:

```dotenv
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_COOKIE_TOKEN=wms_token
```

Jangan menyimpan secret di variabel `NEXT_PUBLIC_*`. `API_URL` dapat dipakai untuk konfigurasi server-only.

### 9.3 Menjalankan aplikasi

```bash
npm run dev
```

Frontend tersedia di `http://localhost:3000`. Backend default berada di `http://127.0.0.1:8000/api`.

### 9.4 Build dan validasi

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi Next.js |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | ESLint 9 |
| `npx tsc --noEmit` | Pemeriksaan tipe manual |
| `npm test` | Tidak tersedia |

Baseline saat audit:

- `npx tsc --noEmit`: 0 error;
- `npm run lint`: 0 error, 11 warning yang sudah ada;
- `npm run build`: berhasil.

Warning ESLint berasal terutama dari `react-hooks/exhaustive-deps`, ref cleanup pada peta langsung, dan satu peringatan `useReactTable` dari React Compiler.

### 9.5 Pemeriksaan manual yang disarankan

1. Login dengan kredensial valid, lalu pastikan redirect sesuai role.
2. Akses rute protected tanpa sesi; pastikan redirect ke `/login`.
3. Matikan backend, lalu buka halaman protected; pastikan muncul alasan `backend`.
4. Uji CRUD satwa, spesies, perangkat, zona, dan insiden dengan data nyata.
5. Uji pengosongan field nullable pada perangkat, zona, dan insiden — area ini memiliki defect yang terdokumentasi.
6. Unggah gambar AI, buka riwayat dan detail, lalu verifikasi sebagai peneliti.
7. Buat laporan AI dengan AI aktif dan dengan fallback template bila memungkinkan.
8. Uji lebar 375 px, 768 px, dan 1280 px, termasuk sidebar mobile, modal, dan tabel.
9. Matikan backend saat mutasi berjalan; pastikan toast/error tampil tanpa crash.

---

## 10. Pemeliharaan dan konvensi

### 10.1 Menambah fitur

1. Pastikan fitur masih sesuai Sprint saat ini; jika tidak, catat sebagai backlog.
2. Periksa dulu route, controller, FormRequest/validasi inline, `$fillable`, cast, relasi, dan migrasi backend.
3. Tambahkan tipe payload/respons di `types/`.
4. Tambahkan method ke service modul yang sudah ada; jangan membuat HTTP client baru.
5. Tambahkan hook TanStack Query jika ada pengambilan data atau mutasi.
6. Bangun atau perbarui komponen di `components/shared/<domain>/`.
7. Pasang komponen pada halaman tipis di `app/(protected)/`.
8. Perbarui `lib/navigation.ts` bila menu berubah.
9. Perbarui README ini dalam PR yang sama bila status, endpoint, konfigurasi, atau keterbatasan berubah.
10. Jalankan lint, pemeriksaan tipe, dan build.

### 10.2 Aturan kode

- Gunakan `type`, bukan `interface`.
- Dilarang `any`; gunakan `unknown` lalu lakukan narrowing.
- Pertahankan `strict: true`.
- Tidak ada komentar dalam kode sumber kecuali directive yang benar-benar diperlukan kerangka kerja.
- Page tidak boleh memanggil `fetch`, mengubah cookie, atau membentuk header Authorization sendiri.
- Semua HTTP concern berada di `services/api.ts`.
- Tipe bersama berada di `types/`; service fokus pada komunikasi dan transformasi API.
- Form create/update untuk satu domain memakai satu komponen form yang sama.
- Backend adalah otoritas untuk field, verb, method, dan validasi write.
- Jangan menambah dependensi tanpa pembaruan `package.json`, `package-lock.json`, dan README.

### 10.3 Git dan kolaborasi

Ikuti instruksi di `AGENTS.md` untuk alur Scrum, konvensi branch, PR, dan commit. Jangan commit `.env`, token, kredensial, atau kunci AI. Perubahan yang melibatkan kontrak backend harus diselesaikan di repository backend dan didokumentasikan dalam PR terkait.

---

## 11. Keterbatasan dan pekerjaan berikutnya

### 11.1 Prioritas tinggi

1. Perbaiki pengiriman `null` pada field nullable agar tanggal perangkat, koordinat/radius zona, dan relasi insiden dapat dikosongkan saat update.
2. Perbaiki bentuk `polygon_geojson` agar tidak double-encoded oleh cast array backend.
3. Tambahkan batas koordinat dan batas radius yang sesuai schema di validasi backend.
4. Samakan nilai `sync_status` antara default database dan enum frontend/backend.
5. Terapkan otorisasi backend untuk verifikasi AI jika hanya peneliti yang boleh melakukan verifikasi.
6. Tambahkan penanganan `401` global yang konsisten di lapisan API client.
7. Tambahkan runner test dan pengujian untuk login, sesi, error API, mutation CRUD, dan AI.

### 11.2 Prioritas menengah

1. Konsumsi pagination/server count yang sudah tersedia dari backend, lalu hapus `meta` sintetis dan pagination klien yang menyesatkan.
2. Tambahkan auto-refresh atau kontrol refresh manual pada peta langsung.
3. Lengkapi UI assignment perangkat ke satwa melalui `PATCH /devices/{id}/assign-animal`.
4. Tambahkan retry, edit, dan delete prediksi AI bila sesuai kebutuhan peran.
5. Tambahkan riwayat dan ekspor laporan eksekutif AI.
6. Perbaiki toast ketika `data.success === false` pada summary AI.
7. Seragamkan halaman detail invalid ID agar memakai `notFound()`.
8. Migrasikan Statistik dan Notifikasi ke primitive `Loading`, `EmptyState`, dan `ErrorState`.

### 11.3 Prioritas rendah

1. Tambah focus trap dan focus restore pada modal.
2. Tambah `prefers-reduced-motion` dan live region untuk perubahan tabel.
3. Kurangi warna Tailwind langsung dan gunakan token di `app/globals.css`.
4. Implementasikan Wildlife Explorer atau hapus menu/route bila tidak direncanakan.
5. Gunakan `NEXT_PUBLIC_REQUEST_TIMEOUT_MS` atau hapus dari `.env.example`.
6. Tambahkan `API_URL` ke `.env.example` bila konfigurasi server-only memang diperlukan tim.
7. Evaluasi apakah hook `useInfinite*` perlu dipakai atau dihapus.

---

## 12. Referensi

Dokumen dan konfigurasi yang menjadi acuan langsung:

- `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`
- `.env.example`
- `app/`, `components/`, `hooks/`, `services/`, `types/`, `lib/`, `utils/`
- `../AGENTS.md` untuk aturan operasional lintasrepository
- `../audit.md` untuk catatan audit lintasproyek
- `../wildlife-tracking-backend/routes/api.php` dan controller terkait untuk verifikasi endpoint
- `../wildlife-tracking-backend/README.md` untuk instalasi dan migrasi backend

Dokumen lain di folder parent seperti SKPL, DPPL, dan laporan perancangan dapat digunakan sebagai konteks persyaratan, tetapi tidak boleh menggantikan kode yang aktual saat menentukan fitur yang sudah berjalan.
