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
  servers?: VideoServer[];
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

/**
 * Embed TurboVIP dapat diputar sebagai HLS oleh pemutar internal lewat route
 * /api/tv (playlist di-rewrite + segmen PNG dibongkar di sisi server).
 * Embed lain tetap memakai iframe.
 */
function turboVipStream(embed: string): string | null {
  return /emturbovid\.com|turbovidhls\.com/i.test(embed)
    ? `/api/tv/playlist?embed=${encodeURIComponent(embed)}`
    : null;
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
    servers: (row.servers ?? []).map((s) => ({
      name: s.name ?? "Server",
      embed: s.embed ?? "",
      stream: s.stream ?? null,
      working: s.working ?? null,
    })),
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

/** Urutan "terbaru": last_update_at (merge episode terbaru) → first_seen → last_scraped.
 *  Fallback berlapis bila kolom belum ada di Supabase. */
let orderFallbackLevel = 0;

function orderNewest(): string {
  const chain = [
    "last_update_at.desc.nullslast",
    "first_seen_at.desc.nullslast",
    "last_scraped_at.desc.nullslast",
  ];
  return chain[Math.min(orderFallbackLevel, chain.length - 1)];
}

async function sbGetWithOrderFallback<T>(
  params: Record<string, string | number>,
  count = false,
  orderOverride?: string
): Promise<{ data: T; total: number | null }> {
  const { sbGet } = await import("./supabase");
  const order = orderOverride ?? orderNewest();
  try {
    return await sbGet<T>("/series", { params: { ...params, order }, count });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const missing = /last_update_at|first_seen_at/i.test(msg);
    if (missing && orderFallbackLevel < 2 && !orderOverride) {
      orderFallbackLevel += 1;
      return sbGet<T>("/series", {
        params: { ...params, order: orderNewest() },
        count,
      });
    }
    throw e;
  }
}

export async function getSeries(opts: {
  page?: number;
  limit?: number;
  q?: string;
  type?: string;
  status?: string;
  country?: string;
  genre?: string;
  /** "newest" (default) = terbaru ditambahkan; "rating" = rating tertinggi */
  orderBy?: "newest" | "rating";
  /** sertakan episodes (untuk filter "sudah punya video" di homepage) */
  withEpisodes?: boolean;
}): Promise<SeriesListResponse> {
  const { sbGet } = await import("./supabase");
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(60, Math.max(1, opts.limit ?? 20));

  const params: Record<string, string | number> = {
    select: opts.withEpisodes ? "*,episodes(number,servers,embeds)" : "*",
    limit,
    offset: (page - 1) * limit,
  };
  if (opts.q) params.title = `ilike.*${opts.q}*`;
  if (opts.type) params.type = `eq.${opts.type}`;
  if (opts.status) params.status = `eq.${opts.status}`;
  if (opts.country) {
    const alias = COUNTRY_ALIASES[opts.country.trim().toLowerCase()];
    params.country = `eq.${alias ?? opts.country}`;
  }
  if (opts.genre) params.genres = `cs.["${opts.genre}"]`;

  const { data, total } = await sbGetWithOrderFallback<
    (SeriesRow & { episodes: EpisodeRow[] | null })[]
  >(
    params,
    true,
    opts.orderBy === "rating" ? "rating.desc.nullslast" : undefined
  );
  const totalCount = total ?? data.length;
  return {
    page,
    limit,
    total: totalCount,
    total_pages: Math.max(1, Math.ceil(totalCount / limit)),
    results: data.map((row) => ({
      ...mapSeries(row),
      episodes: opts.withEpisodes
        ? (row.episodes ?? []).map(mapEpisode)
        : undefined,
    })),
  };
}

export async function getLatest(page = 1): Promise<{ page: number; results: LatestCard[] }> {
  const { sbGet } = await import("./supabase");
  const limit = 16;
  const baseParams: Record<string, string | number> = {
    select: "*,episodes(number,title)",
    "episodes.order": "number.desc.nullslast",
    "episodes.limit": "1",
    limit,
    offset: (page - 1) * limit,
  };
  let data: (SeriesRow & { episodes: { number: number | null }[] | null })[];
  try {
    ({ data } = await sbGet<(SeriesRow & { episodes: { number: number | null }[] | null })[]>(
      "/series",
      { params: { ...baseParams, order: orderNewest() } }
    ));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/last_update_at|first_seen_at/i.test(msg) && orderFallbackLevel < 2) {
      orderFallbackLevel += 1;
      ({ data } = await sbGet<(SeriesRow & { episodes: { number: number | null }[] | null })[]>(
        "/series",
        { params: { ...baseParams, order: orderNewest() } }
      ));
    } else {
      throw e;
    }
  }

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

  // Satu query saja: detail sudah memuat episodes(*) termasuk servers/embeds.
  // revalidate 30s — cukup fresh untuk lazy on-demand yang baru menulis cache.
  const { sbGet } = await import("./supabase");
  const { data } = await sbGet<(SeriesRow & { episodes: EpisodeRow[] | null })[]>("/series", {
    params: {
      select: "source_url,episodes(number,source_url,servers,embeds)",
      "episodes.order": "number.asc.nullslast",
      slug: `eq.${slug}`,
    },
    revalidate: 30,
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
      .map((s) => {
        const stream = s.stream ?? turboVipStream(s.embed ?? "");
        return {
          name: s.name ?? "Server",
          embed: s.embed ?? "",
          stream,
          working: s.working ?? null,
          // stream HLS kita putar sendiri (tanpa iframe pihak ketiga) → tanpa iklan,
          // meski cache lama dari scraper menandai ads: true
          ads: stream ? false : (s.ads ?? true),
        };
      });
  } else if (epRow?.embeds && epRow.embeds.length > 0) {
    servers = epRow.embeds
      .filter((e) => !/minochinos|filelions/i.test(e))
      .map((embed, i) => {
        const stream = turboVipStream(embed);
        return {
          name: `Server ${i + 1}`,
          embed,
          stream,
          working: true,
          ads: !stream,
        };
      });
  }

  servers.sort((a, b) => {
    const aPref = /hydrax/i.test(a.name) ? 0 : 1;
    const bPref = /hydrax/i.test(b.name) ? 0 : 1;
    return aPref - bPref;
  });

  // Kalau belum ada server tersimpan, coba scrape on-demand (lazy) dari halaman sumber.
  if (servers.length === 0 && epRow?.source_url) {
    const scraped = await scrapeServersOnDemand(epRow.source_url);
    if (scraped.length > 0) {
      servers = scraped;
      // cache hasil ke Supabase agar episode berikutnya langsung pakai cache
      try {
        const { sbPatch } = await import("./supabase");
        await sbPatch(`/episodes?source_url=eq.${encodeURIComponent(epRow.source_url)}`, {
          servers: scraped,
          embeds: scraped.map((s) => s.embed),
          stale: false,
          checked_at: new Date().toISOString(),
        });
      } catch {
        /* cache gagal — tidak fatal, next request akan scrape lagi */
      }
    }
  }

  return {
    slug,
    episode: epNum,
    url: epRow?.source_url ?? detail.url ?? "",
    servers,
    cached: true,
  };
}

const CHALLENGE_MARKER = "verify_human";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const BLOCKED_HOSTS = ["minochinos.com", "filelions", "filelions.com"];

/** Scrape daftar server dari satu halaman episode (verifikasi challenge verify_human). */
async function scrapeServersOnDemand(pageUrl: string): Promise<VideoServer[]> {
  // cookie jar sederhana untuk session verify_human; maks 3 percobaan agar tidak menggantung
  const cookies = new Map<string, string>();

  async function fetchPage(url: string, attempt = 0): Promise<string> {
    if (attempt >= 3) throw new Error("Sumber tidak merespons (anti-bot)");
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        ...(cookies.size > 0
          ? { Cookie: [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ") }
          : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    for (const sc of setCookies) {
      const pair = sc.split(";")[0];
      const eq = pair.indexOf("=");
      if (eq > 0) cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
    }
    const text = await res.text();
    // challenge anti-bot → verifikasi sekali lalu ulangi (dengan batas percobaan)
    if (text.length < 2000 && text.includes(CHALLENGE_MARKER)) {
      const origin = new URL(url).origin;
      await fetch(`${origin}/?verify_human=1`, {
        headers: { "User-Agent": USER_AGENT, ...(cookies.size > 0 ? { Cookie: [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ") } : {}) },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      return fetchPage(url, attempt + 1);
    }
    return text;
  }

  const html = await fetchPage(pageUrl);
  return parseServerOptions(html, pageUrl);
}

/** Parse opsi server dari HTML halaman episode (base64 → src iframe). */
function parseServerOptions(html: string, pageUrl: string): VideoServer[] {
  const servers: VideoServer[] = [];
  const seen = new Set<string>();
  const isBlocked = (embed: string, name: string) =>
    BLOCKED_HOSTS.some((h) => embed.toLowerCase().includes(h)) ||
    /filelions/i.test(name);

  // option[value][data-index] — value = base64 yang berisi src iframe
  const optionRe = /<option[^>]*value=["']([^"']*)["'][^>]*data-index=["']([^"']*)["'][^>]*>([^<]*)<\/option>/gi;
  let m: RegExpExecArray | null;
  while ((m = optionRe.exec(html)) !== null) {
    const raw = m[1].trim();
    const idx = m[2].trim();
    const name = (m[3] ?? "").trim() || `Server ${idx}`;
    let decoded = "";
    try {
      decoded = Buffer.from(raw, "base64").toString("utf-8");
    } catch {
      continue;
    }
    const srcMatch = /src=["']([^"']+)["']/i.exec(decoded);
    if (!srcMatch) continue;
    const embed = new URL(srcMatch[1], pageUrl).toString();
    if (seen.has(embed) || isBlocked(embed, name)) continue;
    seen.add(embed);
    servers.push({ name, embed, stream: turboVipStream(embed), working: true, ads: !turboVipStream(embed) });
  }

  // fallback: iframe biasa
  if (servers.length === 0) {
    const iframeRe = /<iframe[^>]*src=["']([^"']+)["']/gi;
    while ((m = iframeRe.exec(html)) !== null) {
      const src = m[1];
      const embed = src.startsWith("//") ? `https:${src}` : new URL(src, pageUrl).toString();
      if (seen.has(embed) || isBlocked(embed, "")) continue;
      seen.add(embed);
      servers.push({ name: "Default", embed, stream: turboVipStream(embed), working: true, ads: !turboVipStream(embed) });
    }
  }

  // prioritas: Hydrax dulu
  servers.sort((a, b) => {
    const aPref = /hydrax/i.test(a.name) ? 0 : 1;
    const bPref = /hydrax/i.test(b.name) ? 0 : 1;
    return aPref - bPref;
  });
  return servers;
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
  // Health = statistik live → tanpa cache (revalidate 0)
  const series = await sbGet<{ id: number }[]>("/series", {
    params: { select: "id" },
    count: true,
    revalidate: 0,
  });
  const episodes = await sbGet<{ id: number }[]>("/episodes", {
    params: { select: "id" },
    count: true,
    revalidate: 0,
  });
  let withEmbeds = 0;
  try {
    const res = await sbGet<{ id: number }[]>("/episodes", {
      params: { select: "id", servers: "neq.[]" },
      count: true,
      revalidate: 0,
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
