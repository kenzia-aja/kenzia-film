"use client";

import { useRef } from "react";
import SeriesCard from "@/components/series-card";
import type { CardData } from "@/lib/card-data";

/** Row konten horizontal: scroll native bebas (swipe/wheel/drag), tombol
 *  panah menggeser satu layar. Tanpa animasi otomatis. */
export default function ContentRow({ items }: { items: CardData[] }) {
  const track = useRef<HTMLDivElement>(null);

  function scrollBy(dir: 1 | -1) {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  }

  return (
    <div className="group/row relative">
      <button
        type="button"
        aria-label="Geser ke kiri"
        onClick={() => scrollBy(-1)}
        className="absolute -left-4 top-0 z-10 hidden h-full w-12 place-items-center bg-gradient-to-r from-page via-page/80 to-transparent text-white/70 transition hover:text-white sm:-left-6 lg:-left-12 lg:grid"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m15 19-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Geser ke kanan"
        onClick={() => scrollBy(1)}
        className="absolute -right-4 top-0 z-10 hidden h-full w-12 place-items-center bg-gradient-to-l from-page via-page/80 to-transparent text-white/70 transition hover:text-white sm:-right-6 lg:-right-12 lg:grid"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
        </svg>
      </button>

      <div
        ref={track}
        className="no-scrollbar hscroll -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12"
      >
        {items.map((item, i) => (
          <div
            key={`${item.href}-${i}`}
            className="w-[calc(50%-0.375rem)] shrink-0 sm:w-[calc(33.333%-0.5rem)] md:w-[calc(25%-0.5625rem)] lg:w-[calc(20%-0.6rem)]"
          >
            <SeriesCard data={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
