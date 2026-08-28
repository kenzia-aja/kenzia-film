import { NextResponse } from "next/server";
import { getHealth } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getHealth();
    return NextResponse.json({ status: "ok", ...data });
  } catch (e) {
    return NextResponse.json(
      { status: "error", detail: e instanceof Error ? e.message : "Database tidak terjangkau" },
      { status: 500 }
    );
  }
}
