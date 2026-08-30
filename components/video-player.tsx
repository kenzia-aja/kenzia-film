"use client";

import { useMemo, useState } from "react";
import type { VideoServer } from "@/lib/api";
import KustomPlayer from "./kustom-player";

export default function VideoPlayer({
  servers,
  title,
}: {
  servers: VideoServer[];
  title?: string;
}) {
  // Server yang sudah gagal diputar — disembunyikan
  const [failed, setFailed] = useState<Set<string>>(new Set());

  // Hanya server yang tidak dinyatakan mati (working !== false) TANPA yang sudah
  // gagal diputar. Server `working=null` (belum diverifikasi) tetap ditampilkan
  // agar tidak menyembunyikan server yang mungkin sehat.
  const usable = useMemo(() => {
    return servers
      .filter((s) => s.working !== false && !failed.has(s.embed))
      .sort((a, b) => {
        // prioritas: server bebas iklan (stream HLS) di depan
        const aAds = a.ads ?? a.stream == null;
        const bAds = b.ads ?? b.stream == null;
        if (aAds !== bAds) return aAds ? 1 : -1;
        return 0;
      });
  }, [servers, failed]);

  const initial = useMemo(() => {
    const idx = usable.findIndex((s) => s.stream);
    return idx >= 0 ? idx : 0;
  }, [usable]);

  const [selected, setSelected] = useState(initial);
  const [prevInitial, setPrevInitial] = useState(initial);
  // Sync `selected` saat `initial` berubah (mis. server berganti setelah retry)
  // dengan pola "adjust state during render" — tanpa effect (react-hooks/set-state-in-effect).
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setSelected(initial);
  }
  const server = usable[selected];

  // Tandai server gagal — hilangkan dari daftar & otomatis pindah ke berikutnya
  const markFailed = (embed: string) => {
    setFailed((prev) => {
      if (prev.has(embed)) return prev;
      const next = new Set(prev);
      next.add(embed);
      return next;
    });
  };

  const handleError = () => {
    if (server) markFailed(server.embed);
  };

  if (!server) {
    return (
      <div className="grid aspect-video w-full place-items-center rounded-2xl border border-white/5 bg-black p-8 text-center">
        <div>
          <p className="mb-2 text-lg font-semibold text-zinc-300">
            Semua server sedang tidak tersedia
          </p>
          <p className="text-sm text-zinc-500">
            Coba muat ulang halaman, atau jalankan scraper ulang untuk memperbarui link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {server.stream ? (
        <KustomPlayer
          key={server.stream}
          src={server.stream}
          title={title ?? server.name}
          onError={handleError}
        />
      ) : (
        <div className="relative aspect-video w-full">
          <iframe
            key={server.embed}
            src={server.embed}
            title={`${server.name} player`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            loading="lazy"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      )}

      {usable.length > 1 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
              Pilih Server
            </span>
            <span className="text-[11px] text-zinc-600">
              {selected + 1}/{usable.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {usable.map((s, i) => {
              const isActive = i === selected;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  aria-pressed={isActive}
                  className={`group relative flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "border-brand bg-brand/15 text-white shadow-lg shadow-brand/20"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/25 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {/* Icon status */}
                  {s.stream ? (
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-md ${
                        isActive ? "bg-brand text-white" : "bg-brand/20 text-brand-soft"
                      }`}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 17V7l9 5-9 5zM17 6v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1z" />
                      </svg>
                    </span>
                  ) : (
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-md ${
                        isActive ? "bg-white/20 text-white" : "bg-white/10 text-zinc-400"
                      }`}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM11 9.5l3.5 2.5L11 14.5z" />
                      </svg>
                    </span>
                  )}
                  <span>{s.name}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${
                      isActive
                        ? "bg-black/25 text-white"
                        : "bg-black/40 text-zinc-500"
                    }`}
                  >
                    {s.stream ? "HLS" : "IFRAME"}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${
                      (s.ads ?? s.stream == null)
                        ? "bg-amber-500/25 text-amber-400"
                        : "bg-emerald-500/25 text-emerald-400"
                    }`}
                  >
                    {(s.ads ?? s.stream == null) ? "IKLAN" : "BEBAS IKLAN"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {usable.length < servers.length && (
        <p className="mt-3 text-xs text-zinc-600">
          {servers.length - usable.length} server tidak tersedia / gagal dimuat dan
          disembunyikan.
        </p>
      )}
    </div>
  );
}
