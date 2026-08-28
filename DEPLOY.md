# Deploy Kenzia — Vercel (gratis) + Supabase + GitHub Actions

Arsitektur:

```
[scraper.py (GitHub Actions cron / lokal)]
        │  scrape + migrate + sync
        ▼
[Supabase Postgres]  ◄──────  [Next.js di Vercel]  ◄──────  user
```

- **Scraper tetap Python**, tidak perlu di-hosting (jalan lokal atau cron gratis).
- **API sudah di-rewrite ke TypeScript** (route handlers `app/api/*` + `lib/api.ts`),
  membaca langsung dari Supabase — tidak ada backend Python yang perlu dijalankan.
- Streaming video lewat iframe pihak ketiga → bandwidth tidak melewati Vercel.

---

## 1. Siapkan Supabase (gratis)

1. Buat project di [supabase.com](https://supabase.com) (free tier).
2. Buka **SQL Editor** → tempel seluruh isi `supabase/schema.sql` → Run.
   (Membuat tabel `series`, `episodes`, `genres`, `countries`, `schedule` + RLS read-only publik.)
3. Ambil kredensial di **Project Settings → API**:
   - `Project URL`        → ini `SUPABASE_URL`
   - `service_role secret`→ ini `SUPABASE_SERVICE_KEY` (RAHASIA, jangan commit!)

## 2. Isi data pertama kali (lokal)

```bash
cd D:\Bot\newfilm
pip install httpx beautifulsoup4
set SUPABASE_URL=https://xxxx.supabase.co
set SUPABASE_SERVICE_KEY=eyJ...   (service_role)

python scraper.py --catalog-pages 5     # scrape katalog + detail
python migrate_db.py                     # perbaiki nomor/dedup episode
python sync_supabase.py                  # push semua ke Supabase (+ jadwal)
```

Cek di Supabase → Table Editor: tabel `series` harus terisi (± 500+ baris).

## 3. Deploy web ke Vercel (gratis)

1. Push repo `web/` ke GitHub (repo terpisah dari backend).
2. [vercel.com](https://vercel.com) → Add New Project → pilih repo → Deploy.
3. Set **Environment Variables** (Project → Settings → Environment Variables):

| Variable               | Value                          |
|------------------------|--------------------------------|
| `SUPABASE_URL`         | `https://xxxx.supabase.co`     |
| `SUPABASE_SERVICE_KEY` | `eyJ...` (service_role)        |
| `NEXT_PUBLIC_SITE_URL` | `https://<project>.vercel.app` |

4. Redeploy. Selesai — situs live.

> Untuk dev lokal: isi `SUPABASE_URL` & `SUPABASE_SERVICE_KEY` di `web/.env.local`,
> lalu `npm run dev`.

## 4. Otomatisasi scraper (tanpa hosting) — GitHub Actions

Backend (`scraper.py` dkk.) dijadikan repo GitHub sendiri:

```bash
cd D:\Bot\newfilm
git init
git add .github requirements.txt scraper.py migrate_db.py sync_supabase.py main.py
git commit -m "Backend scraper + cron"
git remote add origin https://github.com/<username>/<backend-repo>.git
git push -u origin main
```

Lalu di repo tersebut → **Settings → Secrets and variables → Actions** → tambah:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

Workflow `.github/workflows/scrape-sync.yml` berjalan **otomatis tiap hari 03:00 WIB**
(bisa juga manual via tab Actions → Run workflow). Isinya:
scrape katalog → migrate → sync ke Supabase → web di Vercel otomatis menampilkan data terbaru.

## 5. Struktur endpoint baru (TypeScript)

| Endpoint                          | Fungsi                                  |
|-----------------------------------|-----------------------------------------|
| `GET /api/series?page&limit&q&type&status&country&genre` | Katalog terfilter |
| `GET /api/series/[slug]`          | Detail series + daftar episode          |
| `GET /api/series/[slug]/sources?ep=` | Server video untuk episode           |
| `GET /api/latest?page=`           | Rilisan terbaru (baris trending)        |
| `GET /api/genres` · `/api/countries` | Agregat genre & negara               |
| `GET /api/health`                 | Statistik jumlah data                   |

Bentuk respons identik dengan API Python lama — komponen frontend tidak berubah perilaku.
