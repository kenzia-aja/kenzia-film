"use client";

import { useEffect, useRef } from "react";
import SeriesCard from "@/components/series-card";
import type { CardData } from "@/lib/card-data";

/** Row konten horizontal (gaya IDLIX): tombol prev/next + AUTO-SCROLL ping-pong
 *  (kiriâ†”kanan), berhenti sementara saat user hover / menyentuh.
 *  Ukuran kartu = 5 per layar di desktop, sama dengan grid rekomendasi. */
export default function ContentRow({ items }: { items: CardData[] }) {
  const track = useRef<HTMLDivElement>(null);

  // Auto-scroll ping-pong
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let dir = 1;
    let paused = true; // mulai setelah jeda 2 dtk â€” judul & pojok kartu sejajar dulu
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;

    const step = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (!paused && max > 4) {
        el.scrollLeft += dir * 0.6; // Â±36px per detik
        if (el.scrollLeft >= max - 1) dir = -1;
        else if (el.scrollLeft <= 1) dir = 1;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    // Mulai auto-scroll setelah 2 detik
    resumeTimer = setTimeout(() => {
      paused = false;
    }, 2000);

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
        className="no-scrollbar hscroll -mx-4 flex gap-3 overflow-x-auto scroll-smooth px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12"
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
