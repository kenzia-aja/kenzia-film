import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSeriesDetail, type Series } from "@/lib/api";
import { dedupeAndSortEpisodes } from "@/lib/episodes";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const s = await getSeriesDetail(slug);
    return { title: s.title ?? slug, description: s.synopsis ?? undefined };
  } catch {
    return { title: slug };
  }
}

function MetaItem({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-28 shrink-0 text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-200">{value}</span>
    </div>
  );
}

export default async function SeriesDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  let series: Series;
  try {
    series = await getSeriesDetail(slug);
  } catch {
    notFound();
  }

  const isMovie = series.type?.toLowerCase() === "movie";

  const episodes = dedupeAndSortEpisodes(series.episodes ?? []);

  return (
    <div>
      <div className="relative">
        {series.poster && (
          <div className="absolute inset-x-0 top-0 h-[420px] overflow-hidden sm:h-[480px]">
            <Image
              src={series.poster}
              alt=""
              aria-hidden
              fill
              sizes="100vw"
              className="scale-110 object-cover opacity-25 blur-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-page/60 to-page" />
          </div>
        )}

        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-28">
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
            <div className="w-44 shrink-0 sm:w-56">
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg ring-1 ring-white/10 shadow-2xl shadow-black/60">
                {series.poster ? (
                  <Image
                    src={series.poster}
                    alt={series.title ?? slug}
                    fill
                    priority
                    sizes="(max-width: 640px) 60vw, 224px"
                    className="object-cover"
                  />
                ) : (
                  <div className="skeleton aspect-[2/3] w-full" />
                )}
              </div>
              {episodes.length > 0 && (
                <Link
                  href={`/watch/${slug}${episodes[0].number != null ? `?ep=${episodes[0].number}` : ""}`}
                  className="mt-4 flex items-center justify-center gap-2 rounded-md bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5.14v13.72L19 12 8 5.14Z" />
                  </svg>
                  Tonton Sekarang
                </Link>
              )}
            </div>

            <div className="min-w-0 flex-1 pb-2">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                {series.type && (
                  <span className="rounded bg-white/10 px-2.5 py-1 font-medium uppercase tracking-wide text-zinc-200 ring-1 ring-white/10">
                    {series.type}
                  </span>
                )}
                {series.status && (
                  <span
                    className={`rounded px-2.5 py-1 font-semibold ${
                      series.status === "Ongoing"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-zinc-500/15 text-zinc-400"
                    }`}
                  >
                    {series.status}
                  </span>
                )}
                {series.rating && series.rating !== "0" && (
                  <span className="flex items-center gap-1 rounded bg-amber-500/15 px-2.5 py-1 font-bold text-amber-400">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="m12 17.27 4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5Z" />
                    </svg>
                    {series.rating}
                  </span>
                )}
              </div>

              <h1 className="font-display text-5xl uppercase leading-[0.95] tracking-wide sm:text-6xl">
                {series.title}
              </h1>

              <div className="mt-5 grid gap-x-8 gap-y-2 sm:max-w-xl sm:grid-cols-2">
                <MetaItem label="Negara" value={series.country} />
                <MetaItem label="Rilis" value={series.released} />
                <MetaItem label="Network" value={series.network} />
                <MetaItem label="Jumlah Eps" value={series.total_episodes} />
                <MetaItem label="Sutradara" value={series.director} />
              </div>

              {series.genres && series.genres.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {series.genres.map((g) => (
                    <Link
                      key={g}
                      href={`/browse?genre=${encodeURIComponent(g)}`}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 transition hover:border-brand hover:bg-white/10 hover:text-white"
                    >
                      {g}
                    </Link>
                  ))}
                </div>
              )}

              {series.synopsis && (
                <p className="mt-6 max-w-3xl leading-relaxed text-zinc-400">
                  {series.synopsis}
                </p>
              )}

              {series.cast && series.cast.length > 0 && (
                <div className="mt-6 max-w-2xl">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Pemain
                  </p>
                  <p className="text-sm leading-relaxed text-zinc-300">
                    {series.cast.join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div id="episodes" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10">
        <h2 className="mb-5 text-lg font-bold tracking-tight sm:text-xl">
          {isMovie || (episodes.length === 1 && episodes[0].number == null)
            ? "Putar Film"
            : `Daftar Episode (${episodes.length})`}
        </h2>

        {episodes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
            Belum ada episode terdaftar.
          </p>
        ) : isMovie || (episodes.length === 1 && episodes[0].number == null) ? (
          <div className="flex flex-wrap gap-3">
            {episodes.map((ep, idx) => {
              const label = ep.title?.includes("BluRay")
                ? "Putar Versi BluRay"
                : ep.title?.includes("WEBDL")
                ? "Putar Versi WEBDL"
                : ep.title?.includes("TS")
                ? "Putar Versi TS / Cam"
                : "Putar Film Sekarang";
              return (
                <Link
                  key={ep.url || idx}
                  href={`/watch/${slug}`}
                  className="flex items-center gap-2 rounded-md bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5.14v13.72L19 12 8 5.14Z" />
                  </svg>
                  {label}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10">
            {episodes.map((ep, idx) => {
              const num = ep.number;
              return (
                <Link
                  key={`${ep.url}-${idx}`}
                  href={`/watch/${slug}?ep=${num ?? 1}`}
                  className="group grid h-11 place-items-center rounded-md border border-white/10 bg-white/[0.03] text-sm font-semibold text-zinc-300 transition hover:border-brand hover:bg-brand hover:text-white"
                >
                  {num != null ? `Ep ${num}` : ep.title ?? "Play"}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
