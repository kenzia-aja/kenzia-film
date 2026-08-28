import type { Episode } from "@/lib/api";

/** URL bersih: buang penanda repost (`-nomorsesuaiottviu`, `-episode-4-2` → `-episode-4`). */
function cleanEpisodeUrl(url: string): string {
  return url
    .replace(/-nomorsesuaiottviu/g, "")
    .replace(/(-episode-\d+)(?:-\d+)+$/g, "$1");
}

/** Buang episode duplikat (per nomor; per URL bersih bila tanpa nomor) lalu urutkan menaik. */
export function dedupeAndSortEpisodes(episodes: Episode[]): Episode[] {
  const seenNumbers = new Set<number>();
  const seenUrls = new Set<string>();

  const result = episodes.filter((ep) => {
    if (ep.number !== null && ep.number !== undefined) {
      if (seenNumbers.has(ep.number)) return false;
      seenNumbers.add(ep.number);
      return true;
    }
    const cleanUrl = cleanEpisodeUrl(ep.url);
    if (seenUrls.has(cleanUrl)) return false;
    seenUrls.add(cleanUrl);
    return true;
  });

  result.sort((a, b) => {
    if (a.number != null && b.number != null) return a.number - b.number;
    if (a.number != null) return -1;
    if (b.number != null) return 1;
    return 0;
  });

  return result;
}
