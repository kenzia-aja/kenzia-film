"use client";

import { useEffect, useRef } from "react";
import Reveal from "@/components/reveal";
import SeriesCard from "@/components/series-card";
import type { CardData } from "@/lib/card-data";

/** Row konten yang bisa digeser horizontal (gaya IDLIX) dengan tombol prev/next
 *  + efek motion: kartu muncul stagger + AUTO-SCROLL ping-pong (kiri↔kanan),
 *  berhenti sementara saat user hover / menyentuh. */
export default function ContentRow({ items }: { items: CardData[] }) {
  const track = useRef<HTMLDivElement>(null);

  // Auto-scroll ping-pong
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let dir = 1;
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;

    const step = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (!paused && max > 4) {
        el.scrollLeft += dir * 0.6; // ±36px per detik
        if (el.scrollLeft >= max - 1) dir = -1;
        else if (el.scrollLeft <= 1) dir = 1;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const pause = () => {
      paused = true;
      if (resumeTimer) clearTimeout(resumeTimer);
    };
    const resume = () => {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        paused = false;
      }, 2500);
    };

    const wrap = el.parentElement;
    wrap?.addEventListener("mouseenter", pause);
    wrap?.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume, { passive: true });
    el.addEventListener("wheel", pause, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      wrap?.removeEventListener("mouseenter", pause);
      wrap?.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
      el.removeEventListener("wheel", pause);
      if (resumeTimer) clearTimeout(resumeTimer);
    };
  }, [items]);

  function scrollBy(dir: 1 | -1) {
    track.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
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
        className="no-scrollbar hscroll -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12"
      >
        {items.map((item, i) => (
          <div
            key={`${item.href}-${i}`}
            className="w-[140px] shrink-0 snap-start sm:w-[170px] md:w-[190px]"
          >
            <Reveal delay={(i % 8) * 60} className="reveal-x">
              <SeriesCard data={item} />
            </Reveal>
          </div>
        ))}
      </div>
    </div>
  );
}
