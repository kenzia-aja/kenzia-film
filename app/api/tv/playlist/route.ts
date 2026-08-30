import { NextResponse } from "next/server";
import { buildPlaylist, resolveMaster, isAllowedUrl } from "@/lib/turbovip";

export const dynamic = "force-dynamic";

/**
 * GET /api/tv/playlist?embed=<url-embed>            → resolve master lalu serve
 * GET /api/tv/playlist?embed=<url>&u=<url-playlist> → serve playlist yang di-rewrite
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const embed = searchParams.get("embed");
  const u = searchParams.get("u");
  if (!embed || !isAllowedUrl(embed)) {
    return NextResponse.json({ detail: "embed tidak valid" }, { status: 400 });
  }
  try {
    const url = u ?? (await resolveMaster(embed));
    if (!isAllowedUrl(url)) {
      return NextResponse.json({ detail: "host tidak diizinkan" }, { status: 400 });
    }
    const txt = await buildPlaylist(embed, url);
    return new Response(txt, {
      headers: {
        "content-type": "application/vnd.apple.mpegurl",
        "cache-control": "no-store",
        "access-control-allow-origin": "*",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Gagal mengambil playlist" },
      { status: 502 }
    );
  }
}
