/**
 * Klien Supabase REST (server-only).
 *
 * Hanya dipakai di server components / route handlers — SUPABASE_SERVICE_KEY
 * tidak boleh sampai ke browser (tidak memakai NEXT_PUBLIC_*).
 */

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn(
    "[supabase] SUPABASE_URL / SUPABASE_SERVICE_KEY belum diset — query database akan gagal."
  );
}

const REST = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1`;

type Options = {
  params?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
  count?: boolean;
};

function headersFor(count?: boolean): Record<string, string> {
  const h: Record<string, string> = {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    "Content-Type": "application/json",
  };
  if (count) h.Prefer = "count=exact";
  return h;
}

/** GET dari PostgREST; mengembalikan JSON hasil atau melempar Error. */
export async function sbGet<T>(
  path: string,
  { params = {}, count = false }: Options = {}
): Promise<{ data: T; total: number | null }> {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") search.set(k, String(v));
  }
  const res = await fetch(`${REST}${path}?${search.toString()}`, {
    headers: headersFor(count),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Supabase ${res.status} untuk ${path}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as T;
  const contentRange = res.headers.get("content-range"); // "0-19/533"
  const total = count && contentRange?.includes("/") ? Number(contentRange.split("/")[1]) : null;
  return { data, total: Number.isFinite(total as number) ? total : null };
}
