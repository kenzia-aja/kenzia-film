import { NextResponse } from "next/server";
import { getSeries } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const first = (k: string) => searchParams.get(k) ?? undefined;
  try {
    const data = await getSeries({
      page: Number(first("page") ?? 1) || 1,
      limit: Number(first("limit") ?? 20) || 20,
      q: first("q"),
      type: first("type"),
      status: first("status"),
      country: first("country"),
      genre: first("genre"),
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Gagal mengambil katalog" },
      { status: 500 }
    );
  }
}
