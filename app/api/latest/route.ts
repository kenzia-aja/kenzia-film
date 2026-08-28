import { NextResponse } from "next/server";
import { getLatest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? 1) || 1;
  try {
    const data = await getLatest(page);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Gagal mengambil rilisan terbaru" },
      { status: 500 }
    );
  }
}
