import Link from "next/link";
import { Suspense } from "react";
import { getSeries, getHealth, getGenres } from "@/lib/api";
import HeroShowcase, { type HeroTitle } from "@/components/hero-showcase";
import SeriesCard from "@/components/series-card";
import { toSeriesCard } from "@/lib/card-data";
import GridSkeleton from "@/components/grid-skeleton";
import Reveal from "@/components/reveal";
import StatsBar from "@/components/stats-bar";
import ContentRow from "@/components/content-row";

async function Hero() {
  const data = await tryTwice(() =>
    getSeries({ limit: 12, withEpisodes: true })
  );
  const titles: HeroTitle[] = (data?.results ?? [])
    .filter((s) => s.poster)
    .map((s) => ({
      slug: s.slug,
      title: s.title ?? s.slug,
      poster: s.poster ?? null,
      rating: s.rating ?? null,
      type: s.type ?? null,
      genres: s.genres ?? [],
      synopsis: s.synopsis ?? null,
    }));
  if (titles.length === 0) return null;

  return (
    <section className="relative h-[72vh] min-h-[560px] w-full overflow-hidden">
      <HeroShowcase titles={titles.slice(0, 4)} />
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
      <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
        {/* Underline biru solid di bawah teks */}
        <span className="inline-block border-b-2 border-primary pb-1">
          {title}
        </span>
      </h2>
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
/** Kartu error inline saat upstream gagal: bergaya empty-state dashed sistem, dengan taut recovery */
function SectionError({ title, href }: { title: string; href?: string }) {
  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
      <h2 className="mb-4 text-lg font-bold tracking-tight text-white sm:text-xl">
        <span className="inline-block border-b-2 border-primary pb-1">{title}</span>
      </h2>
      <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
        <p className="text-sm text-text-muted">Gagal memuat {title.toLowerCase()} — koneksi ke katalog terputus.</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <a href="." className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-soft focus-visible:ring-offset-2 focus-visible:ring-offset-page">Coba muat ulang</a>
          {href && (
            <Link href={href} className="text-sm font-semibold text-brand-soft transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-soft focus-visible:ring-offset-2 focus-visible:ring-offset-page">
              Buka {href.startsWith("/browse?type=Movie") ? "katalog film" : "katalog series"} →
            </Link>
          )}
        </div>
      </div>
    </section>
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

/** Hanya series yang punya video bisa diputar (servers/embeds terisi) */
function playableOnly(results: Awaited<ReturnType<typeof getSeries>>["results"]) {
  return results.filter((s) =>
    (s.episodes ?? []).some(
      (e) => (e.servers?.length ?? 0) > 0 || (e.embeds?.length ?? 0) > 0
    )
  );
}

/** Skeleton satu baris horizontal: judul section + kartu 2/3 */
function SectionRowSkeleton() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
      <div className="mb-4 skeleton h-5 w-44 rounded" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-[calc(50%-0.375rem)] shrink-0 sm:w-[calc(33.333%-0.5rem)] md:w-[calc(25%-0.5625rem)] lg:w-[calc(20%-0.6rem)]">
            <div className="skeleton aspect-[2/3] w-full rounded-lg" />
            <div className="skeleton mt-2 h-3.5 w-4/5 rounded" />
            <div className="skeleton mt-1.5 h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </section>
  );
}
/** Baris "Update Terbaru" (horizontal scroll + motion) */
async function UpdateRow({ type, title }: { type: "Drama" | "Movie"; title: string }) {
  const browseUrl = type === "Movie" ? "/browse?type=Movie" : "/browse?type=Drama";
  const data = await tryTwice(() =>
    getSeries({ type, limit: 24, withEpisodes: true })
  );
  if (!data) return <SectionError title={title} href={browseUrl} />;
  if (data.results.length === 0) return null;

  const playable = playableOnly(data.results).slice(0, 16);
  if (playable.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
      <SectionTitle title={title} href={browseUrl} />
      <ContentRow items={playable.map(toSeriesCard)} />
    </section>
  );
}

/** Rekomendasi (rating tertinggi): 3 baris × 5 kolom = 15 judul */
async function RecommendationGrid({ type, title }: { type: "Movie" | "Drama"; title: string }) {
  const browseUrl = type === "Movie" ? "/browse?type=Movie" : "/browse?type=Drama";
  const data = await tryTwice(() =>
    getSeries({ type, limit: 40, orderBy: "rating", withEpisodes: true })
  );
  if (!data) return <SectionError title={title} href={browseUrl} />;
  if (data.results.length === 0) return null;

  const playable = playableOnly(data.results).slice(0, 15);
  if (playable.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
      <SectionTitle title={title} href={browseUrl} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {playable.map((s, i) => (
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
        className="inline-flex items-center gap-2 rounded-md bg-brand px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 ring-1 ring-brand-strong/50 transition duration-300 hover:bg-brand-strong hover:shadow-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-soft focus-visible:ring-offset-2 focus-visible:ring-offset-page"
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
        <Suspense fallback={<SectionRowSkeleton />}>
          <UpdateRow type="Drama" title="Update Series" />
        </Suspense>

        <Suspense fallback={<SectionRowSkeleton />}>
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
