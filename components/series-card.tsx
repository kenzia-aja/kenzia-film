"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CardData } from "@/lib/card-data";

export default function SeriesCard({ data }: { data: CardData }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link
      href={data.href}
      className="group block focus-visible:outline-none"
      // Accessible name memuat semua teks yang tampil (type/badge/judul/sub)
      // agar konsisten untuk screen reader dan lolos audit label-content-name-mismatch
      aria-label={[data.type, data.badge, data.title, data.sub].filter(Boolean).join(", ")}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-surface ring-1 ring-white/10 transition-all duration-300 group-hover:scale-[1.04] group-hover:shadow-2xl group-hover:shadow-black/70 group-hover:ring-brand/60">
        {!loaded && <div className="skeleton absolute inset-0" />}
        {data.poster && (
          <Image
            src={data.poster}
            alt={data.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 190px"
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            className={`object-cover transition-opacity duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />

        {data.type && (
          <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-200 backdrop-blur">
            {data.type}
          </span>
        )}
        {data.badge && (
          <span className="absolute right-2 top-2 rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md shadow-brand/40">
            {data.badge}
          </span>
        )}

        <span className="absolute inset-0 grid place-items-center opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="grid h-12 w-12 scale-75 place-items-center rounded-full bg-brand shadow-lg shadow-brand/50 ring-2 ring-white/70 transition-transform duration-300 group-hover:scale-100">
            <svg className="ml-0.5 h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5.14v13.72L19 12 8 5.14Z" />
            </svg>
          </span>
        </span>
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-zinc-200 transition group-hover:text-white">
        {data.title}
      </h3>
      {data.sub && <p className="mt-0.5 truncate text-xs text-zinc-500">{data.sub}</p>}
    </Link>
  );
}
