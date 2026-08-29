"use client";

import { useEffect, useState } from "react";

/** Daftar foto hero (/jisoo/jisoo-N.jpg) dideteksi dari server di app/page.tsx */
type Props = {
  photos?: string[];
};

const SLIDE_INTERVAL = 5000;

export default function JisooGallery({ photos = [] }: Props) {
  const [active, setActive] = useState(0);

  // Slideshow: interval di-reset setiap `active` berubah (termasuk klik manual)
  useEffect(() => {
    if (photos.length < 2) return;
    const t = setTimeout(() => {
      setActive((a) => (a + 1) % photos.length);
    }, SLIDE_INTERVAL);
    return () => clearTimeout(t);
  }, [active, photos]);

  if (photos.length === 0) {
    return <div className="absolute inset-0 bg-gradient-to-br from-surface-2 to-black" />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Stack foto dekoratif (TIDAK interaktif): crossfade + efek Ken Burns (zoom lambat) */}
      <div aria-hidden="true" className="absolute inset-0">
        {photos.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-[1600ms] ease-in-out"
            style={{ opacity: i === active ? 1 : 0 }}
          >
            {/* object-center: foto selalu terpotong di tengah, subjek tetap di center */}
            <img
              src={src}
              alt=""
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={i === 0 ? "high" : undefined}
              className="h-full w-full object-cover object-center will-change-transform"
              style={{
                transform:
                  i === active
                    ? "scale(1.1) translate3d(0, 0, 0)"
                    : "scale(1.02) translate3d(0, 0, 0)",
                transition: `transform ${SLIDE_INTERVAL + 1600}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Overlay sinematik: gelap kiri untuk konten + gradasi atas */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
      {/* Ambient glow violet khas palet baru */}
      <div className="ambient-glow absolute -left-24 bottom-0 h-96 w-96 rounded-full blur-3xl" />

      {/* Indikator slide + progres */}
      <div className="absolute bottom-4 right-6 z-10 flex items-center gap-2">
        <span className="mr-1 font-display text-sm tracking-[0.25em] text-brand">
          JISOO
        </span>
        {photos.map((src, i) => (
          <button
            key={src}
            onClick={() => setActive(i)}
            aria-label={`Foto ${i + 1}`}
            aria-current={i === active}
            className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-500 ${
              i === active
                ? "w-7 bg-white/20"
                : "w-3 bg-white/25 hover:bg-white/50"
            }`}
          >
            {i === active && (
              <span
                key={`bar-${active}`}
                className="dot-progress absolute inset-0 rounded-full bg-brand"
                style={{ "--slide-interval": `${SLIDE_INTERVAL}ms` } as React.CSSProperties}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
