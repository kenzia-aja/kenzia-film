"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, active, duration]);

  return value;
}

function StatIcon({ kind }: { kind: string }) {
  const cls = "h-5 w-5";
  if (kind === "film")
    return (
      <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path strokeLinecap="round" d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
      </svg>
    );
  if (kind === "episode")
    return (
      <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 17.5V7l8 3.5M4 17.5V7l8 3.5-5.2 2.3a1 1 0 0 0-.55 1.3L8 18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7l8 3.5v8.5l-4-1.75" />
      </svg>
    );
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h8M4 12h16M4 18h6M16 12v8M16 12l3 3-3 3" />
    </svg>
  );
}

function StatItem({
  target,
  label,
  icon,
  active,
}: {
  target: number;
  label: string;
  icon: string;
  active: boolean;
}) {
  const value = useCountUp(target, active);
  return (
    <div className="group flex flex-col items-center gap-1.5 px-2 py-5 transition duration-300 hover:bg-white/[0.03] sm:px-8 sm:py-6">
      <span className="mb-1 grid h-10 w-10 place-items-center rounded-full bg-brand/15 text-brand transition duration-300 group-hover:scale-110 group-hover:bg-brand group-hover:text-white">
        <StatIcon kind={icon} />
      </span>
      <span className="text-2xl font-extrabold tabular-nums text-white transition group-hover:text-brand-strong sm:text-3xl">
        {value.toLocaleString("id-ID")}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] pl-[0.2em] text-text-muted">
        {label}
      </span>
    </div>
  );
}

export default function StatsBar({
  totalSeries,
  totalEpisodes,
  totalGenres,
}: {
  totalSeries: number;
  totalEpisodes: number;
  totalGenres: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="group relative">
      {/* Border glow beranimasi mengalir mengelilingi panel */}
      <div className="stat-glow absolute -inset-px rounded-2xl" aria-hidden="true" />
      <div
        ref={ref}
        className="relative grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-surface/70 backdrop-blur-xl"
      >
        <StatItem target={totalSeries} label="Judul" icon="film" active={active} />
        <StatItem target={totalEpisodes} label="Episode" icon="episode" active={active} />
        <StatItem target={totalGenres} label="Genre" icon="genre" active={active} />
      </div>
    </div>
  );
}
