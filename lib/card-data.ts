import type { LatestCard, Series } from "@/lib/api";

export type CardData = {
  href: string;
  title: string;
  poster: string | null | undefined;
  type: string | null | undefined;
  badge: string | null | undefined;
  sub?: string | null | undefined;
};

export function toSeriesCard(s: Series): CardData {
  return {
    href: `/series/${s.slug}`,
    title: s.title ?? s.slug,
    poster: s.poster ?? null,
    type: s.type ?? null,
    badge: s.rating && s.rating !== "0" ? `★ ${s.rating}` : s.status,
    sub: s.genres?.slice(0, 3).join(" • ") || s.country || null,
  };
}

export function toLatestCard(l: LatestCard): CardData {
  const epNum = (l.label ?? "").replace(/\D/g, "") || "1";
  return {
    href: l.series_slug ? `/watch/${l.series_slug}?ep=${epNum}` : `/series/${l.slug}`,
    title: l.title,
    poster: l.poster,
    type: l.type,
    badge: l.label,
    sub: l.posted ? l.posted : null,
  };
}
