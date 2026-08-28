import { NextResponse } from "next/server";
import { getEpisodeServers } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const epRaw = searchParams.get("ep");
  const ep = epRaw != null && epRaw !== "" ? Number(epRaw) : undefined;

  try {
    const data = await getEpisodeServers(slug, ep);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Gagal mengambil sumber video" },
      { status: 404 }
    );
  }
}
