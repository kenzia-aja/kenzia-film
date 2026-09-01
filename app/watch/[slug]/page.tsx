import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSeriesDetail, getEpisodeServers, type VideoServer } from "@/lib/api";
import { dedupeAndSortEpisodes } from "@/lib/episodes";
import WatchPlayer from "@/components/watch-player";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Tonton ${slug}` };
}

function EpisodeNavButton({
  slug,
  ep,
  label,
  disabled,
}: {
  slug: string;
  ep: number;
  label: string;
  disabled: boolean;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-md border border-white/10 bg-white/[0.02] px-5 py-2.5 text-sm font-medium text-zinc-600">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={`/watch/${slug}?ep=${ep}`}
      className="rounded-md bg-white/5 px-5 py-2.5 text-sm font-semibold text-zinc-200 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
    >
      {label}
    </Link>
  );
}

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const epParam = Array.isArray(sp.ep) ? sp.ep[0] : sp.ep;

  let series;
  try {
    series = await getSeriesDetail(slug);
  } catch {
    notFound();
  }
  if (!series || !series.title) notFound();

  const isMovie = series.type?.toLowerCase() === "movie";

  const episodes = dedupeAndSortEpisodes(series.episodes ?? []);

  const current =
    (epParam ? episodes.find((e) => e.number != null && String(e.number) === epParam) : null) ??
    (episodes.find((e) => e.number === 1) ?? episodes[0]);

  const currentEpNum = current?.number ?? null;

  let servers: VideoServer[] | undefined = undefined;
  let sourcesError: string | null = null;
  if (current) {
    try {
      const data = await getEpisodeServers(slug, currentEpNum ?? undefined);
      servers = data.servers ?? [];
    } catch (e) {
      sourcesError = e instanceof Error ? e.message : String(e);
    }
  }

  const currentIndex = current
    ? episodes.findIndex((e) => e.url === current.url || (current.number != null && e.number === current.number))
    : -1;
  const prevEp = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const nextEp =
    currentIndex >= 0 && currentIndex < episodes.length - 1
      ? episodes[currentIndex + 1]
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-24">
      <nav className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/" className="transition hover:text-brand">
          Beranda
        </Link>
        <span>/</span>
        <Link href={`/series/${slug}`} className="transition hover:text-brand">
          {series.title}
        </Link>
        <span>/</span>
        <span className="text-zinc-300">
          {currentEpNum == null ? "Film Penuh" : `Episode ${currentEpNum}`}
        </span>
      </nav>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl shadow-black/60">
        {current ? (
          <WatchPlayer
            key={`${slug}-${currentEpNum ?? "movie"}`}
            slug={slug}
            ep={currentEpNum ?? 1}
            title={`${series.title}${currentEpNum != null ? ` — Episode ${currentEpNum}` : ""}`}
            initialServers={servers}
            initialError={sourcesError}
          />
        ) : (
          <div className="grid aspect-video w-full place-items-center p-8 text-center">
            <p className="text-sm text-zinc-400">Episode tidak ditemukan.</p>
          </div>
        )}
      </div>

      {servers && servers.some((s) => s.stream) && (
        <p className="mt-2 text-xs text-zinc-500">
          Pilih resolusi lewat tombol roda gigi di pemutar.
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wide sm:text-4xl">{series.title}</h1>
          <p className="text-sm text-zinc-500">
            {currentEpNum == null ? "Film penuh" : `Episode ${currentEpNum}${current?.date ? ` • ${current.date}` : ""}`}
          </p>
        </div>
        <div className="flex gap-2">
          {prevEp && (
            <EpisodeNavButton
              slug={slug}
              ep={prevEp.number ?? 1}
              label="← Sebelumnya"
              disabled={false}
            />
          )}
          {nextEp && (
            <EpisodeNavButton
              slug={slug}
              ep={nextEp.number ?? 1}
              label="Berikutnya →"
              disabled={false}
            />
          )}
        </div>
      </div>

      {series.synopsis && (
        <div className="mt-6 max-w-3xl">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            Sinopsis
          </h2>
          <p className="leading-relaxed text-zinc-400">{series.synopsis}</p>
        </div>
      )}

      {!isMovie && episodes.length > 1 && (
        <div className="mt-8 rounded-xl border border-white/5 bg-surface/60 p-4">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">
            Semua Episode ({episodes.length})
          </h2>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
            {episodes.map((ep, idx) => {
              const isActive =
                current &&
                (ep.url === current.url || (ep.number != null && ep.number === current.number));
              const num = ep.number;
              return (
                <Link
                  key={`${ep.url}-${idx}`}
                  href={`/watch/${slug}?ep=${num ?? 1}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`grid h-10 place-items-center rounded-md text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-soft ${isActive ? "bg-brand text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"}`}
                >
                  {num ?? "Play"}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
