import Link from "next/link";
import { getCountries, getGenres, getSeries } from "@/lib/api";
import SeriesCard from "@/components/series-card";
import { toSeriesCard } from "@/lib/card-data";
import GridSkeleton from "@/components/grid-skeleton";
import Pagination from "@/components/pagination";
import { Suspense } from "react";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

const TYPES = ["Drama", "Movie", "Anime"];
const STATUSES = ["Ongoing", "Completed"];

function FilterRow({
  label,
  options,
  active,
  current,
  paramKey,
}: {
  label: string;
  options: string[];
  active: string | undefined;
  current: Record<string, string>;
  paramKey: string;
}) {
  function href(value?: string) {
    const params = new URLSearchParams(current);
    if (value) params.set(paramKey, value);
    else params.delete(paramKey);
    params.delete("page");
    const s = params.toString();
    return `/browse${s ? `?${s}` : ""}`;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-14 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <Link
        href={href()}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
          !active
            ? "bg-brand text-white"
            : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
        }`}
      >
        Semua
      </Link>
      {options.map((opt) => (
        <Link
          key={opt}
          href={href(opt)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            active?.toLowerCase() === opt.toLowerCase()
              ? "bg-brand text-white"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          {opt}
        </Link>
      ))}
    </div>
  );
}

async function Results({ searchParams }: { searchParams: Record<string, string> }) {
  const page = Number(searchParams.page) || 1;
  const data = await getSeries({
    page,
    limit: 24,
    q: searchParams.q,
    type: searchParams.type,
    status: searchParams.status,
    country: searchParams.country,
    genre: searchParams.genre,
  });

  if (data.results.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 p-16 text-center text-sm text-zinc-500">
        Tidak ada judul yang cocok dengan filter ini.
      </p>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-zinc-500">
        {data.total} judul ditemukan
        {searchParams.q ? ` untuk "${searchParams.q}"` : ""}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {data.results.map((s) => (
          <SeriesCard key={s.slug} data={toSeriesCard(s)} />
        ))}
      </div>
      <Pagination
        page={data.page}
        totalPages={data.total_pages}
        buildHref={(p) => {
          const params = new URLSearchParams(searchParams);
          params.set("page", String(p));
          return `/browse?${params.toString()}`;
        }}
      />
    </>
  );
}

async function GenreRow({ current }: { current: Record<string, string> }) {
  let genres: Awaited<ReturnType<typeof getGenres>>;
  try {
    genres = await getGenres();
  } catch {
    return null;
  }

  return (
    <FilterRow
      label="Genre"
      options={genres.genres.slice(0, 14).map((g) => g.name)}
      active={current.genre}
      current={current}
      paramKey="genre"
    />
  );
}

async function CountryRow({ current }: { current: Record<string, string> }) {
  let countries: Awaited<ReturnType<typeof getCountries>>;
  try {
    countries = await getCountries();
  } catch {
    return null;
  }

  return (
    <FilterRow
      label="Negara"
      options={countries.countries.slice(0, 10).map((c) => c.name)}
      active={current.country}
      current={current}
      paramKey="country"
    />
  );
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const current: Record<string, string> = {};
  for (const key of ["q", "type", "status", "country", "genre", "page"]) {
    const v = first(sp[key]);
    if (v) current[key] = v;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-24">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.35em] text-brand">
        Katalog
      </p>
      <h1 className="font-display text-5xl uppercase tracking-wide">Jelajahi</h1>
      <p className="mb-8 mt-2 text-sm text-zinc-500">
        Filter berdasarkan tipe, status tayang, atau genre favoritmu.
      </p>

      <div className="mb-8 space-y-3 rounded-xl border border-white/5 bg-surface/60 p-4">
        <FilterRow
          label="Tipe"
          options={TYPES}
          active={current.type}
          current={current}
          paramKey="type"
        />
        <FilterRow
          label="Status"
          options={STATUSES}
          active={current.status}
          current={current}
          paramKey="status"
        />
        <Suspense fallback={null}>
          <CountryRow current={current} />
        </Suspense>
        <Suspense fallback={null}>
          <GenreRow current={current} />
        </Suspense>
      </div>

      <Suspense
        key={JSON.stringify(current)}
        fallback={<GridSkeleton count={18} />}
      >
        <Results searchParams={current} />
      </Suspense>
    </div>
  );
}
