"use client";

import { useEffect, useRef } from "react";
import SeriesCard from "@/components/series-card";
import type { CardData } from "@/lib/card-data";

/** Row konten horizontal (gaya IDLIX): auto-scroll pelan ping-pong via WAAPI.
 *  Jeda saat hover/sentuh; hormati prefers-reduced-motion; tombol panah tetap
 *  menggerakkan scroll manual saat animasi dijeda. */
export default function ContentRow({ items }: { items: CardData[] }) {
  const track = useRef<HTMLDivElement>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof el.animate !== "function") return;

    const GRACE_MS = 2500; // jeda awal: biarkan judul terbaca dulu

    let anim: Animation | undefined;
    let graceTimer: ReturnType<typeof setTimeout> | undefined;

    const setup = () => {
      const max = el.scrollWidth - el.clientWidth;
      const dur = (max / 24) * 1000; // ±24px per detik — pelan
      anim = el.animate(
        [{ transform: "translateX(0)" }, { transform: `translateX(${-max}px)` }],
        { duration: dur, easing: "ease-in-out", direction: "alternate", iterations: Infinity, fill: "both" }
      );
      anim.pause();
      return max > 0;
    };

    // Ukur setelah gambar/layout siap; coba lagi bila belum terukur
    const raf = requestAnimationFrame(() => {
      if (!setup()) {
        graceTimer = setTimeout(setup, 1200);
      }
      if (anim) graceTimer = setTimeout(() => anim?.play(), GRACE_MS);
    });

    const pause = () => {
      clearTimeout(resumeTimer.current);
      anim?.pause();
    };
    const resume = () => {
      clearTimeout(resumeTimer.current);
      resumeTimer.current = setTimeout(() => anim?.play(), 2000);
    };

    const wrap = el.parentElement;
    wrap?.addEventListener("mouseenter", pause);
    wrap?.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume, { passive: true });
    el.addEventListener("pointerdown", pause, { passive: true });
    el.addEventListener("pointerup", resume, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resumeTimer.current);
      anim?.cancel();
      wrap?.removeEventListener("mouseenter", pause);
      wrap?.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("pointerup", resume);
    };
  }, [items]);

  return (
    <div className="group/row relative">
      <button
        type="button"
        aria-label="Geser ke kiri"
        onClick={() => {
          const a = track.current?.getAnimations()[0];
          if (a) a.pause();
          track.current?.scrollBy({ left: -260, behavior: "smooth" });
          resumeTimer.current = setTimeout(() => a?.play(), 2500);
        }}
        className="absolute -left-4 top-0 z-10 hidden h-full w-12 place-items-center bg-gradient-to-r from-page via-page/80 to-transparent text-white/70 transition hover:text-white sm:-left-6 lg:-left-12 lg:grid"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m15 19-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Geser ke kanan"
        onClick={() => {
          const a = track.current?.getAnimations()[0];
          if (a) a.pause();
          track.current?.scrollBy({ left: 260, behavior: "smooth" });
          resumeTimer.current = setTimeout(() => a?.play(), 2500);
        }}
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
