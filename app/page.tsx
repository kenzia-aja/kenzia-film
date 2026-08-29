import Link from "next/link";
import { Suspense } from "react";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { getSeries, getHealth, getGenres } from "@/lib/api";
import SeriesCard from "@/components/series-card";
import { toSeriesCard } from "@/lib/card-data";
import GridSkeleton from "@/components/grid-skeleton";
import Reveal from "@/components/reveal";
import StatsBar from "@/components/stats-bar";
import JisooGallery from "@/components/jisoo-gallery";
import ContentRow from "@/components/content-row";

export const revalidate = 300;

const HERO_PHOTO_DIR = path.join(process.cwd(), "public", "jisoo");

/** Baca daftar foto hero dari /public/jisoo (jisoo-1.jpg, jisoo-2.jpg, …) di server */
async function getHeroPhotos(): Promise<string[]> {
  try {
    const files = await readdir(HERO_PHOTO_DIR);
    return files
      .map((file) => ({ file, num: Number(/^jisoo-(\d+)\./i.exec(file)?.[1] ?? NaN) }))
      .filter(({ num }) => Number.isInteger(num))
      .sort((a, b) => a.num - b.num)
      .map(({ file }) => `/jisoo/${file}`);
  } catch {
    /* folder tidak ada / kosong */
    return [];
  }
}

async function Hero() {
  const photos = await getHeroPhotos();

  const line1 = "Semua Cerita. Semua Drama.";
  const line2 = "Satu Tempat. Tanpa Ribet.";

  return (
    <section className="relative h-[86vh] min-h-[580px] w-full overflow-hidden">
      <JisooGallery photos={photos} />
      {/* Fade bawah menyatu ke konten (overlay kiri ditangani gallery) */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-page via-page/70 to-transparent" />

      {/* Partikel/sparkle dekoratif di sekitar hero */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="animate-sparkle absolute left-[18%] top-[30%] size-1.5 rounded-full bg-brand-strong" style={{ animationDelay: "0ms" }} />
        <span className="animate-sparkle absolute left-[32%] top-[22%] size-1 rounded-full bg-white/80" style={{ animationDelay: "1s" }} />
        <span className="animate-sparkle absolute right-[24%] top-[36%] size-1.5 rounded-full bg-brand-soft" style={{ animationDelay: "1.8s" }} />
        <span className="animate-sparkle absolute left-[48%] top-[56%] size-1 rounded-full bg-white/60" style={{ animationDelay: "2.4s" }} />
      </div>

      <div className="absolute inset-0 flex items-center pb-24">
        {/* Ambient glow biru (lebih kuat & bernapas) */}
        <div className="ambient-glow pointer-events-none absolute -left-32 bottom-[-120px] h-[520px] w-[520px] rounded-full blur-3xl" />
        <div className="ambient-glow pointer-events-none absolute right-[8%] top-[10%] h-[280px] w-[280px] rounded-full blur-3xl" style={{ animationDelay: "2s" }} />

        <div className="relative mx-auto w-full max-w-[1400px] px-4 pb-8">
          <p
            className="animate-float-in mb-5 inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-brand-soft backdrop-blur sm:text-xs"
            style={{ animationDelay: "0ms" }}
          >
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-brand-strong" />
            Streaming • Subtitle Indonesia
          </p>

          <h1 className="font-display text-6xl uppercase leading-[0.92] tracking-wide sm:text-7xl lg:text-8xl">
            <span className="block" aria-label={line1}>
              {line1}
            </span>
            <span className="block text-brand" aria-label={line2}>
              {line2}
            </span>
          </h1>

          <p
            className="animate-float-in mt-5 max-w-xl text-sm text-zinc-300 sm:text-base"
            style={{ animationDelay: "1050ms" }}
          >
            Drama Korea, China, Jepang, sampai film barat — selalu update, subtitle
            Indonesia, langsung tonton kualitas maksimal. Klik, nikmati, tanpa henti.
          </p>

          <div className="animate-float-in mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "1200ms" }}>
            <Link
              href="/browse"
              className="btn-shine rounded-md bg-brand px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 ring-1 ring-brand-strong/50 transition duration-300 hover:scale-[1.03] hover:bg-brand-strong hover:shadow-brand/50"
            >
              Mulai Nonton
            </Link>
            <Link
              href="/jadwal"
              className="rounded-md bg-white/10 px-7 py-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur transition duration-300 hover:scale-[1.03] hover:bg-white/20 hover:ring-white/40"
            >
              Jadwal Rilis
            </Link>

            <span className="animate-float-y hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 backdrop-blur md:flex" style={{ animationDelay: "1.3s" }}>
              <svg className="h-4 w-4 text-brand" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l2.4 2.4 3.3-.4.6 3.3 3 1.5-1.5 3 1.5 3-3 1.5-.6 3.3-3.3-.4L12 22l-2.4-2.4-3.3.4-.6-3.3-3-1.5 1.5-3-1.5-3 3-1.5.6-3.3 3.3.4L12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />
              </svg>
              <span className="text-white">4K</span> Ultra HD
            </span>
            <span className="animate-float-y hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 backdrop-blur md:flex" style={{ animationDelay: "2s" }}>
              <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 19V6l6 1v13M13 6H5v13h8M5 19h13" />
              </svg>
              Tanpa iklan
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

async function Stats() {
  let stats: { series: number; episodes: number; genres: number } | null = null;
  try {
    const [h, g] = await Promise.all([getHealth(), getGenresSafe()]);
    if (h.cached_series) {
      stats = { series: h.cached_series, episodes: h.cached_episodes, genres: g.total };
    }
  } catch {
    return null;
  }
  if (!stats) return null;
  return (
    <StatsBar
      totalSeries={stats.series}
      totalEpisodes={stats.episodes}
      totalGenres={stats.genres}
    />
  );
}

async function getGenresSafe() {
  try {
    return await getGenres();
  } catch {
    return { total: 0, genres: [] };
  }
}

function SectionTitle({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">{title}</h2>
      {href && (
        <Link
          href={href}
          className="text-xs font-semibold text-text-muted transition hover:text-primary-strong"
        >
          {linkLabel ?? "Lihat semua"} →
        </Link>
      )}
    </div>
  );
}

/** Coba 2x sebelum menyerah (query paralel kadang gagal sesaat) */
async function tryTwice<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    try {
      await new Promise((r) => setTimeout(r, 500));
      return await fn();
    } catch {
      return null;
    }
  }
}

/** Baris "Update Terbaru" (horizontal scroll + motion) */
async function UpdateRow({ type, title }: { type: "Drama" | "Movie"; title: string }) {
  const data = await tryTwice(() => getSeries({ type, limit: 16 }));
  if (!data || data.results.length === 0) return null;

  const browseUrl = type === "Movie" ? "/browse?type=Movie" : "/browse?type=Drama";

  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
      <SectionTitle title={title} href={browseUrl} />
      <ContentRow items={data.results.map(toSeriesCard)} />
    </section>
  );
}

/** Rekomendasi (rating tertinggi): 3 baris × 5 kolom = 15 judul */
async function RecommendationGrid({ type, title }: { type: "Movie" | "Drama"; title: string }) {
  const data = await tryTwice(() =>
    getSeries({ type, limit: 15, orderBy: "rating" })
  );
  if (!data || data.results.length === 0) return null;

  const browseUrl = type === "Movie" ? "/browse?type=Movie" : "/browse?type=Drama";

  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
      <SectionTitle title={title} href={browseUrl} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {data.results.map((s, i) => (
          <Reveal key={s.slug} delay={(i % 5) * 50}>
            <SeriesCard data={toSeriesCard(s)} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Tombol "Lihat Semua" di akhir halaman (gaya sebelumnya) */
async function SeeAllButton() {
  let total: number | null = null;
  try {
    const h = await getHealth();
    total = h.cached_series || null;
  } catch {
    total = null;
  }

  return (
    <div className="text-center">
      <Link
        href="/browse"
        className="btn-shine inline-flex items-center gap-2 rounded-md bg-brand px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 ring-1 ring-brand-strong/50 transition duration-300 hover:scale-[1.03] hover:bg-brand-strong hover:shadow-brand/50"
      >
        Lihat Semua{total ? ` ${total.toLocaleString("id-ID")}` : ""} Judul →
      </Link>
    </div>
  );
}

export default function HomePage() {
  return (
    <div>
      <Hero />

      {/* Stats: jarak antara jumbotron dan konten */}
      <div className="relative z-10 mx-auto -mt-16 max-w-[1400px] px-4 sm:-mt-20">
        <div className="group/stats animate-float-in" style={{ animationDelay: "400ms" }}>
          <Suspense fallback={null}>
            <Stats />
          </Suspense>
        </div>
      </div>

      {/* Update terbaru: series dulu, lalu film */}
      <div className="mt-14 space-y-12 sm:mt-16">
        <Suspense fallback={null}>
          <UpdateRow type="Drama" title="Update Series" />
        </Suspense>

        <Suspense fallback={null}>
          <UpdateRow type="Movie" title="Update Film" />
        </Suspense>

        <Suspense fallback={<GridSkeleton count={15} />}>
          <RecommendationGrid type="Movie" title="Rekomendasi Film" />
        </Suspense>

        <Suspense fallback={<GridSkeleton count={15} />}>
          <RecommendationGrid type="Drama" title="Rekomendasi Series" />
        </Suspense>

        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <Suspense fallback={null}>
            <SeeAllButton />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
