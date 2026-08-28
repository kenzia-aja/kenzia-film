"use client";

import { useRef } from "react";
import SeriesCard from "@/components/series-card";
import type { CardData } from "@/lib/card-data";

/** Row konten yang bisa digeser horizontal (gaya IDLIX) dengan tombol prev/next */
export default function ContentRow({ items }: { items: CardData[] }) {
  const track = useRef<HTMLDivElement>(null);

  function scrollBy(dir: 1 | -1) {
    track.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  }

  return (
    <div className="group/row relative">
      <button
        type="button"
        aria-label="Geser ke kiri"
        onClick={() => scrollBy(-1)}
        className="absolute left-0 top-0 z-10 hidden h-full w-10 place-items-center bg-gradient-to-r from-page to-transparent text-white/70 transition hover:text-white lg:grid"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m15 19-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Geser ke kanan"
        onClick={() => scrollBy(1)}
        className="absolute right-0 top-0 z-10 hidden h-full w-10 place-items-center bg-gradient-to-l from-page to-transparent text-white/70 transition hover:text-white lg:grid"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
        </svg>
      </button>

      <div
        ref={track}
        className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto scroll-smooth px-4 pb-2"
      >
        {items.map((item, i) => (
          <div key={`${item.href}-${i}`} className="w-[140px] shrink-0 sm:w-[170px] md:w-[190px]">
            <SeriesCard data={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
