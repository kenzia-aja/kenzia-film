"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type ScheduleItem = {
  slug: string;
  url: string;
  title: string;
  poster: string | null;
  release_status: string | null;
  episode: string | null;
};

export type ScheduleDay = {
  day: string;
  items: ScheduleItem[];
};

const DAY_ORDER = ["Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Jumat", "Sabtu", "Minggu"];

function todayName(): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];
  return days[new Date().getDay()];
}

function normalize(day: string): string {
  return day.replace("Jum'at", "Jumat").trim();
}

export default function ScheduleTabs({ days }: { days: ScheduleDay[] }) {
  const sorted = useMemo(() => {
    return [...days].sort(
      (a, b) => DAY_ORDER.indexOf(normalize(a.day)) - DAY_ORDER.indexOf(normalize(b.day))
    );
  }, [days]);

  const today = todayName();
  const initial =
    sorted.find((d) => normalize(d.day) === normalize(today)) ?? sorted[0];
  const [activeDay, setActiveDay] = useState(initial?.day ?? "");
  const current = sorted.find((d) => d.day === activeDay) ?? sorted[0];

  if (!current) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
        Jadwal belum tersedia.
      </p>
    );
  }

  return (
    <div>
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
        {sorted.map((d) => {
          const isToday = normalize(d.day) === normalize(today);
          const isActive = d.day === current.day;
          return (
            <button
              key={d.day}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveDay(d.day)}
              className={`flex shrink-0 items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-soft ${isActive ? "bg-brand text-white" : "bg-white/5 text-zinc-400 ring-1 ring-white/10 hover:bg-white/10 hover:text-white"}`}
            >
              {normalize(d.day)}
              {isToday && <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${isActive ? "bg-black/30 text-white" : "bg-brand/15 text-brand"}`}>HARI INI</span>}
            </button>
          );
        })}
      </div>

      {current.items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
          Tidak ada jadwal untuk hari ini.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {current.items.map((item) => (
            <Link
              key={item.slug}
              href={`/series/${item.slug}`}
              className="group block"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface ring-1 ring-white/10 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-2xl group-hover:shadow-black/70 group-hover:ring-white/40">
                {item.poster && (
                  <img
                    src={item.poster}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {item.release_status && (
                  <span
                    className={`absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                      item.release_status.toLowerCase().includes("rilis")
                        ? "bg-emerald-500/90 text-white"
                        : "bg-amber-500/90 text-black"
                    }`}
                  >
                    {item.release_status}
                  </span>
                )}
                {item.episode && (
                  <span className="absolute right-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                    Ep {item.episode}
                  </span>
                )}
                <span className="absolute inset-0 grid place-items-center opacity-0 transition duration-300 group-hover:opacity-100">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-brand shadow-lg shadow-black/50 ring-2 ring-white/70">
                    <svg className="ml-0.5 h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5.14v13.72L19 12 8 5.14Z" />
                    </svg>
                  </span>
                </span>
              </div>
              <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-zinc-200 transition group-hover:text-white">
                {item.title}
              </h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
