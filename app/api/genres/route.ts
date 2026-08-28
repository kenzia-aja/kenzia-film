import { NextResponse } from "next/server";
import { getGenres } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getGenres();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Gagal mengambil genre" },
      { status: 500 }
    );
  }
}
