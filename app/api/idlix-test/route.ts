/**
 * Route uji: apakah server (Vercel) bisa mengakses API IDLIX
 * tanpa terblokir Cloudflare? Hapus setelah spike selesai.
 */
export const dynamic = "force-dynamic";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const TARGETS: [string, string][] = [
  ["search", "https://z2.idlixku.com/api/search?q=reacher"],
  ["series", "https://z2.idlixku.com/api/series/reacher-2022"],
];

export async function GET() {
  const results: Record<string, { status: number; ok: boolean; body: string }> = {};

  for (const [name, url] of TARGETS) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      const text = await res.text();
      let isCloudflare = false;
      try {
        isCloudflare = text.toLowerCase().includes("just a moment") || text.toLowerCase().includes("challenge");
      } catch {}
      results[name] = {
        status: res.status,
        ok: res.ok && !isCloudflare,
        body: isCloudflare ? "CLOUDFLARE CHALLENGE" : text.slice(0, 300),
      };
    } catch (e) {
      results[name] = {
        status: 0,
        ok: false,
        body: e instanceof Error ? e.message : String(e),
      };
    }
  }

  return Response.json({
    testedAt: new Date().toISOString(),
    runtime: "vercel-edge/node",
    results,
  });
}
