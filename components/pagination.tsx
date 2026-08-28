import Link from "next/link";

export default function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const items: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) items.push("…");
    items.push(p);
    prev = p;
  }

  const base =
    "grid h-9 min-w-9 place-items-center rounded-lg px-3 text-sm transition";
  const idle = "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white";

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 && (
        <Link href={buildHref(page - 1)} className={`${base} ${idle}`}>
          ← Sebelumnya
        </Link>
      )}
      {items.map((item, i) =>
        item === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-zinc-600">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildHref(item)}
              className={`${base} ${
                item === page
                  ? "bg-brand font-semibold text-white"
                  : idle
              }`}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </Link>
        )
      )}
      {page < totalPages && (
        <Link href={buildHref(page + 1)} className={`${base} ${idle}`}>
          Berikutnya →
        </Link>
      )}
    </nav>
  );
}
