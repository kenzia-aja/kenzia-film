import { NextResponse } from "next/server";
import { fetchSegment, isAllowedUrl } from "@/lib/turbovip";

export const dynamic = "force-dynamic";

/**
 * GET /api/tv/seg?u=<url-segmen-png>
 * Ambil segmen PNG dari Google (lolos 429 karena sisi server), bongkar
 * MPEG-TS yang tersembunyi setelah IEND, sajikan sebagai video/mp2t.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const u = searchParams.get("u");
  if (!u || !isAllowedUrl(u)) {
    return NextResponse.json({ detail: "url tidak valid" }, { status: 400 });
  }
  try {
    const ts = await fetchSegment(u);
    return new Response(ts as unknown as BodyInit, {
      headers: {
        "content-type": "video/mp2t",
        "content-length": String(ts.byteLength),
        "cache-control": "public, max-age=86400, immutable",
        "access-control-allow-origin": "*",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Gagal mengambil segmen" },
      { status: 502 }
    );
  }
}
