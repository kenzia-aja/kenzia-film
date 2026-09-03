"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Judul yang dipromosikan di hero: dipilih server dari katalog playable */
export type HeroTitle = {
  slug: string;
  title: string;
  poster: string | null;
  rating: string | null;
  type: string | null;
  genres: string[];
  synopsis: string | null;
};

type Props = {
  titles: HeroTitle[];
};

const SLIDE_INTERVAL = 7000;

export default function HeroShowcase({ titles = [] }: Props) {
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (titles.length < 2) return;
    const t = setTimeout(() => {
      setActive((a) => (a + 1) % titles.length);
    }, SLIDE_INTERVAL);
    return () => clearTimeout(t);
  }, [active, titles.length]);

  if (titles.length === 0) {
    return <div className="absolute inset-0 bg-gradient-to-br from-surface-2 to-black" />;
  }

  const current = titles[active];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Stack poster (dekoratif): crossfade + Ken Burns */}
      <div aria-hidden="true" className="absolute inset-0">
        {titles.map((t, i) => (
          <div
            key={t.slug}
            className="absolute inset-0 transition-opacity duration-[1600ms] ease-in-out"
            style={{ opacity: i === active ? 1 : 0 }}
          >
            {t.poster && (
              <Image
                src={t.poster}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                onLoad={() => setLoaded((m) => ({ ...m, [i]: true }))}
                className={`h-full w-full object-cover object-center will-change-transform transition-opacity duration-500 ${
                  loaded[i] ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  transform:
                    i === active
                      ? "scale(1.08) translate3d(0, 0, 0)"
                      : "scale(1.02) translate3d(0, 0, 0)",
                  transition: `transform ${SLIDE_INTERVAL + 1600}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 500ms`,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Overlay sinematik: gelap kiri untuk konten */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/10" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-page to-transparent" />

      {/* Kartu judul aktif: poster bicara, chrome berbisik */}
      <div className="relative flex h-full items-end pb-10 sm:items-center sm:pb-0">
        <div className="mx-auto flex w-full max-w-[1400px] items-end gap-8 px-4 pb-8 sm:items-center sm:px-6 lg:px-12">
          <div className="relative hidden w-[190px] shrink-0 overflow-hidden rounded-xl ring-1 ring-white/20 shadow-2xl shadow-black/60 sm:block lg:w-[230px]">
            <div className="aspect-[2/3] bg-surface">
              {current.poster && (
                <Image
                  src={current.poster}
                  alt={current.title}
                  fill
                  sizes="230px"
                  className="object-cover"
                />
              )}
            </div>
          </div>

          <div className="min-w-0 max-w-xl">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              {current.type && (
                <span className="rounded bg-white/10 px-2 py-0.5 font-semibold uppercase tracking-wide text-zinc-200 backdrop-blur">
                  {current.type}
                </span>
              )}
              {current.rating && current.rating !== "0" && (
                <span className="font-semibold text-brand-soft">★ {current.rating}</span>
              )}
              {current.genres.length > 0 && (
                <span className="truncate text-text-muted">{current.genres.slice(0, 3).join(" • ")}</span>
              )}
            </div>

            <h1 className="line-clamp-2 font-display text-4xl leading-[0.95] text-white sm:text-6xl lg:text-7xl">
              {current.title}
            </h1>

            {current.synopsis && (
              <p className="mt-4 line-clamp-3 max-w-lg text-sm leading-relaxed text-zinc-300 sm:line-clamp-2 sm:text-base">
                {current.synopsis}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={`/watch/${current.slug}`}
                className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-soft focus-visible:ring-offset-2 focus-visible:ring-offset-page"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5.14v13.72L19 12 8 5.14Z" />
                </svg>
                Tonton sekarang
              </Link>
              <Link
                href={`/series/${current.slug}`}
                className="rounded-md border border-white/20 bg-black/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-soft focus-visible:ring-offset-2 focus-visible:ring-offset-page"
              >
                Detail
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Indikator slide */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 sm:left-auto sm:translate-x-0 sm:bottom-28 sm:right-12">
        {titles.map((t, i) => (
          <button
            key={t.slug}
            onClick={() => setActive(i)}
            aria-label={`Judul ${i + 1}: ${t.title}`}
            aria-current={i === active}
            className="relative grid h-11 w-8 place-items-center"
          >
            <span
              className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-500 ${
                i === active ? "w-7 bg-white/30" : "w-3 bg-white/25 hover:bg-white/50"
              }`}
            >
              {i === active && (
                <span
                  key={`bar-${active}`}
                  className="dot-progress absolute inset-0 rounded-full bg-brand"
                  style={{ "--slide-interval": `${SLIDE_INTERVAL}ms` } as React.CSSProperties}
                />
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
