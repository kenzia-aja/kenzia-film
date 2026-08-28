import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getSeries } from "@/lib/api";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/browse`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${SITE_URL}/jadwal`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
  ];

  try {
    const data = await getSeries({ limit: 100 });
    for (const s of data.results) {
      entries.push({
        url: `${SITE_URL}/series/${s.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    /* API belum siap — tetap kembalikan halaman statis */
  }

  return entries;
}
