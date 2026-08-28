import { NextResponse } from "next/server";
import { getCountries } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getCountries();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Gagal mengambil negara" },
      { status: 500 }
    );
  }
}
