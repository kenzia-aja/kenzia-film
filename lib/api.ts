/**
 * Lapisan akses data Kenzia.
 *
 * - Server components/route handlers: query langsung ke Supabase (lib/supabase).
 * - Client components: fetch ke route handler /api/* (same-origin) → apiUrl().
 */

export type Episode = {
  number: number | null;
  title: string | null;
  date: string | null;
  url: string;
  embeds?: string[];
  stale?: boolean;
};

export type Series = {
  slug: string;
  url?: string;
  title: string | null;
  type?: string | null;
  status?: string | null;
  country?: string | null;
  released?: string | null;
  rating?: string | null;
  poster?: string | null;
  network?: string | null;
  director?: string | null;
  total_episodes?: string | null;
  synopsis?: string | null;
  cast?: string[];
  genres?: string[];
  episodes?: Episode[];
};

export type SeriesListResponse = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  results: Series[];
};

export type LatestCard = {
  slug: string;
  url: string;
  title: string;
  type: string | null;
  label: string | null;
  poster: string | null;
  posted: string | null;
  series_slug: string | null;
};

export type VideoServer = {
  name: string;
  embed: string;
  stream: string | null;
  working: boolean | null;
  ads?: boolean | null;
};

export type SourcesResponse = {
  slug: string;
  episode: number | null;
  url: string;
  servers: VideoServer[];
  cached?: boolean;
};

export type GenresResponse = {
  total: number;
  genres: { name: string; count: number }[];
};

export type CountriesResponse = {
  total: number;
  countries: { name: string; count: number }[];
};

/** Base URL API untuk pemakaian client-side (same-origin secara default). */
export function apiUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
}

// ── Pemetaan baris Supabase → tipe aplikasi ──

type SeriesRow = {
  slug: string;
  title: string | null;
  type: string | null;
  status: string | null;
  country: string | null;
  released: string | null;
  rating: number | null;
  poster_url: string | null;
  network: string | null;
  director: string | null;
  total_episodes: string | null;
  synopsis: string | null;
  cast_list: string[] | null;
  genres: string[] | null;
  source_url: string | null;
  last_scraped_at: string | null;
};

type EpisodeRow = {
  number: number | null;
  title: string | null;
  release_date: string | null;
  source_url: string;
  embeds: string[] | null;
  servers?: ServerRow[] | null;
  stale: boolean | null;
};

type ServerRow = {
  name?: string;
  embed?: string;
  stream?: string | null;
  working?: boolean | null;
  ads?: boolean | null;
};

function mapSeries(row: SeriesRow): Series {
  return {
    slug: row.slug,
    url: row.source_url ?? undefined,
    title: row.title,
    type: row.type,
    status: row.status,
    country: row.country,
    released: row.released,
    rating: row.rating ? String(row.rating) : null,
    poster: row.poster_url,
    network: row.network,
    director: row.director,
    total_episodes: row.total_episodes,
    synopsis: row.synopsis,
    cast: row.cast_list ?? [],
    genres: row.genres ?? [],
  };
}

function mapEpisode(row: EpisodeRow): Episode {
  return {
    number: row.number,
    title: row.title,
    date: row.release_date,
    url: row.source_url,
    embeds: row.embeds ?? [],
    stale: row.stale ?? false,
  };
}

/** Alias negara (mengikuti perilaku API Python lama, mis. "Barat" → United States). */
const COUNTRY_ALIASES: Record<string, string> = {
  barat: "United States",
  west: "United States",
  western: "United States",
  usa: "United States",
  us: "United States",
  amerika: "United States",
};

// ── Query utama ──

export async function getSeries(opts: {
  page?: number;
  limit?: number;
  q?: string;
  type?: string;
  status?: string;
  country?: string;
  genre?: string;
}): Promise<SeriesListResponse> {
  const { sbGet } = await import("./supabase");
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(60, Math.max(1, opts.limit ?? 20));

  const params: Record<string, string | number> = {
    select: "*",
    limit,
    offset: (page - 1) * limit,
    order: "last_scraped_at.desc.nullslast",
  };
  if (opts.q) params.title = `ilike.*${opts.q}*`;
  if (opts.type) params.type = `eq.${opts.type}`;
  if (opts.status) params.status = `eq.${opts.status}`;
  if (opts.country) {
    const alias = COUNTRY_ALIASES[opts.country.trim().toLowerCase()];
    params.country = `eq.${alias ?? opts.country}`;
  }
  if (opts.genre) params.genres = `cs.["${opts.genre}"]`;

  const { data, total } = await sbGet<SeriesRow[]>("/series", { params, count: true });
  const totalCount = total ?? data.length;
  return {
    page,
    limit,
    total: totalCount,
    total_pages: Math.max(1, Math.ceil(totalCount / limit)),
    results: data.map(mapSeries),
  };
}

export async function getLatest(page = 1): Promise<{ page: number; results: LatestCard[] }> {
  const { sbGet } = await import("./supabase");
  const limit = 16;
  const { data } = await sbGet<
    (SeriesRow & { episodes: { number: number | null }[] | null })[]
  >("/series", {
    params: {
      select: "*,episodes(number,title)",
      "episodes.order": "number.desc.nullslast",
      "episodes.limit": "1",
      limit,
      offset: (page - 1) * limit,
      order: "last_scraped_at.desc.nullslast",
    },
  });

  return {
    page,
    results: data.map((row) => {
      const latestEp = row.episodes?.[0];
      return {
        slug: row.slug,
        url: row.source_url ?? "",
        title: row.title ?? row.slug,
        type: row.type,
        label: latestEp?.number != null ? `Ep ${latestEp.number}` : null,
        poster: row.poster_url,
        posted: null,
        series_slug: row.slug,
      };
    }),
  };
}

export async function getSeriesDetail(slug: string): Promise<Series> {
  const { sbGet } = await import("./supabase");
  const { data } = await sbGet<(SeriesRow & { episodes: EpisodeRow[] | null })[]>("/series", {
    params: {
      select: "*,episodes(*)",
      "episodes.order": "number.asc.nullslast",
      slug: `eq.${slug}`,
    },
  });
  const row = data[0];
  if (!row) throw new Error(`Series '${slug}' tidak ditemukan`);
  return { ...mapSeries(row), episodes: (row.episodes ?? []).map(mapEpisode) };
}

/** Server video untuk satu episode (bentuk respons = API Python lama). */
export async function getEpisodeServers(slug: string, ep?: number): Promise<SourcesResponse> {
  const detail = await getSeriesDetail(slug);
  const episodes = detail.episodes ?? [];

  let target = episodes[0];
  let epNum: number | null = ep ?? null;
  if (episodes.length > 0) {
    if (ep != null) {
      target =
        episodes.find((e) => e.number != null && e.number === ep) ??
        (ep - 1 >= 0 && ep - 1 < episodes.length ? episodes[ep - 1] : undefined) ??
        episodes[0];
    }
    epNum = target?.number ?? ep ?? null;
  } else {
    epNum = null;
  }

  // Ambil kolom servers dari baris episode terkait (query sekali lagi, murah).
  const { sbGet } = await import("./supabase");
  const { data } = await sbGet<(SeriesRow & { episodes: EpisodeRow[] | null })[]>("/series", {
    params: {
      select: "source_url,episodes(number,source_url,servers,embeds)",
      "episodes.order": "number.asc.nullslast",
      slug: `eq.${slug}`,
    },
  });
  const row = data[0];
  const epRows = row?.episodes ?? [];
  const epRow =
    (epNum != null ? epRows.find((e) => e.number === epNum) : undefined) ?? epRows[0];

  const blocked = (s: ServerRow) =>
    /minochinos|filelions/i.test(s.embed ?? "") || /filelions/i.test(s.name ?? "");

  let servers: VideoServer[] = [];
  if (epRow?.servers && epRow.servers.length > 0) {
    servers = epRow.servers
      .filter((s) => !blocked(s))
      .map((s) => ({
        name: s.name ?? "Server",
        embed: s.embed ?? "",
        stream: s.stream ?? null,
        working: s.working ?? null,
        ads: s.ads ?? (s.stream == null),
      }));
  } else if (epRow?.embeds && epRow.embeds.length > 0) {
    servers = epRow.embeds
      .filter((e) => !/minochinos|filelions/i.test(e))
      .map((embed, i) => ({
        name: `Server ${i + 1}`,
        embed,
        stream: null,
        working: true,
        ads: true,
      }));
  }

  servers.sort((a, b) => {
    const aPref = /hydrax/i.test(a.name) ? 0 : 1;
    const bPref = /hydrax/i.test(b.name) ? 0 : 1;
    return aPref - bPref;
  });

  return {
    slug,
    episode: epNum,
    url: epRow?.source_url ?? detail.url ?? "",
    servers,
    cached: true,
  };
}

export async function getGenres(): Promise<GenresResponse> {
  const { sbGet } = await import("./supabase");
  const { data } = await sbGet<{ name: string; count: number }[]>("/genres", {
    params: { select: "name,count", order: "count.desc.nullslast" },
  });
  return { total: data.length, genres: data };
}

export async function getCountries(): Promise<CountriesResponse> {
  const { sbGet } = await import("./supabase");
  const { data } = await sbGet<{ name: string; count: number }[]>("/countries", {
    params: { select: "name,count", order: "count.desc.nullslast" },
  });
  return { total: data.length, countries: data };
}

export type ScheduleItem = {
  slug: string;
  url: string;
  title: string;
  poster: string | null;
  release_status: string | null;
  episode: string | null;
};

export type ScheduleDay = {
  day: string;
  items: ScheduleItem[];
};

/** Jadwal rilis mingguan (disinkronkan scraper ke tabel `schedule`). */
export async function getSchedule(): Promise<ScheduleDay[]> {
  const { sbGet } = await import("./supabase");
  const { data } = await sbGet<
    { day: string; items: ScheduleItem[] | null; updated_at: string }[]
  >("/schedule", {
    params: { select: "day,items,updated_at" },
  });
  return data.map((row) => ({ day: row.day, items: row.items ?? [] }));
}

export type HealthInfo = {
  cached_series: number;
  cached_episodes: number;
  episodes_with_embeds: number;
};

export async function getHealth(): Promise<HealthInfo> {
  const { sbGet } = await import("./supabase");
  const series = await sbGet<{ id: number }[]>("/series", {
    params: { select: "id" },
    count: true,
  });
  const episodes = await sbGet<{ id: number }[]>("/episodes", {
    params: { select: "id" },
    count: true,
  });
  let withEmbeds = 0;
  try {
    const res = await sbGet<{ id: number }[]>("/episodes", {
      params: { select: "id", servers: "neq.[]" },
      count: true,
    });
    withEmbeds = res.total ?? 0;
  } catch {
    withEmbeds = 0;
  }
  return {
    cached_series: series.total ?? 0,
    cached_episodes: episodes.total ?? 0,
    episodes_with_embeds: withEmbeds,
  };
}
