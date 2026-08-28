import { NextResponse } from "next/server";
import { getSeriesDetail } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const data = await getSeriesDetail(slug);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ detail: `'${slug}' tidak ditemukan` }, { status: 404 });
  }
}
