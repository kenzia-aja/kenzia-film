import Link from "next/link";
import { Suspense } from "react";
import { getSeries } from "@/lib/api";
import SeriesCard from "@/components/series-card";
import { toSeriesCard } from "@/lib/card-data";
import GridSkeleton from "@/components/grid-skeleton";
import Reveal from "@/components/reveal";
import ContentRow from "@/components/content-row";

export const revalidate = 300;

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

/** Baris "Update Terbaru" (horizontal scroll + motion) */
async function UpdateRow({ type, title }: { type: "Drama" | "Movie"; title: string }) {
  let data: Awaited<ReturnType<typeof getSeries>> | null = null;
  try {
    data = await getSeries({ type, limit: 16 });
  } catch {
    return null;
  }
  if (!data || data.results.length === 0) return null;

  const browseUrl = type === "Movie" ? "/browse?type=Movie" : "/browse?type=Drama";

  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
      <SectionTitle title={title} href={browseUrl} />
      <ContentRow items={data.results.map(toSeriesCard)} />
    </section>
  );
}

/** Rekomendasi: film dengan rating tertinggi, grid 5 kolom */
async function RecommendationGrid() {
  let data: Awaited<ReturnType<typeof getSeries>> | null = null;
  try {
    data = await getSeries({ type: "Movie", limit: 15, orderBy: "rating" });
  } catch {
    return null;
  }
  if (!data || data.results.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
      <SectionTitle title="Rekomendasi Film" href="/browse?type=Movie" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {data.results.map((s, i) => (
          <Reveal key={s.slug} delay={(i % 5) * 60}>
            <SeriesCard data={toSeriesCard(s)} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-10 pb-12 pt-20 sm:space-y-12 sm:pt-24">
      <Suspense fallback={null}>
        <UpdateRow type="Drama" title="Update Series" />
      </Suspense>

      <Suspense fallback={null}>
        <UpdateRow type="Movie" title="Update Film" />
      </Suspense>

      <Suspense fallback={<GridSkeleton count={10} />}>
        <RecommendationGrid />
      </Suspense>
    </div>
  );
}
