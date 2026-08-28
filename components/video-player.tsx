"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type HlsType from "hls.js";
import type PlyrType from "plyr";
import type { VideoServer } from "@/lib/api";

export default function VideoPlayer({ servers }: { servers: VideoServer[] }) {
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

  const handleHlsError = () => {
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
        <HlsVideo key={server.stream} src={server.stream} onError={handleHlsError} />
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
          {/* Menutupi watermark branding di pojok kanan-atas embed */}
          <div
            aria-hidden="true"
            className="absolute right-0 top-0 z-10 h-10 w-36 bg-page"
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

function HlsVideo({ src, onError }: { src: string; onError?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const watchdog = useRef<number | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    let hls: HlsType | null = null;
    let plyr: PlyrType | null = null;

    (async () => {
      const [Hls, Plyr] = await Promise.all([
        import("hls.js"),
        import("plyr"),
      ]);
      const HlsCtor = Hls.default;
      const PlyrCtor = Plyr.default;
      if (cancelled || !video) return;

      // Plyr sebagai kulit player (tanpa video sumber bawaan; kita attach manual via hls.js)
      plyr = new PlyrCtor(video, {
        controls: [
          "play-large",
          "restart",
          "rewind",
          "play",
          "fast-forward",
          "progress",
          "current-time",
          "duration",
          "mute",
          "volume",
          "captions",
          "settings",
          "pip",
          "airplay",
          "fullscreen",
        ],
        settings: ["quality", "speed"],
        autoplay: true,
        muted: false,
        ratio: "16:9",
        tooltips: { controls: true, seek: true },
        loading: "MEMUAT…",
        i18n: {
          qualityLabel: "Kualitas",
          speed: "Kecepatan",
          normal: "Normal",
          play: "Putar",
          pause: "Jeda",
          mute: "Bisu",
          unmute: "Suara",
          settings: "Pengaturan",
          quality: "Kualitas",
          fullscreen: "Layar penuh",
          pip: "Picture-in-Picture",
          airplay: "AirPlay",
          cancel: "Batal",
          enter: "Masuk",
          exit: "Keluar",
        },
      });
      // nonaktifkan penyimpanan kualitas/speed agar selalu mengikuti stream
      plyr.on("loadedmetadata", () => {
        try {
          (plyr as unknown as { storage?: { enabled: boolean } }).storage = { enabled: false };
        } catch {}
      });

      if (HlsCtor.isSupported()) {
        hls = new HlsCtor({
          enableWorker: true,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          // agar tidak stuck loading saat salah satu variant host mati
          startLevel: -1,
          defaultAudioCodec: undefined,
          fragLoadingMaxRetry: 6,
          fragLoadingRetryDelay: 1000,
          fragLoadingMaxRetryTimeout: 15000,
          manifestLoadingMaxRetry: 4,
          manifestLoadingRetryDelay: 1000,
          levelLoadingMaxRetry: 6,
          levelLoadingRetryDelay: 1000,
          levelLoadingMaxRetryTimeout: 20000,
        });
        hls.loadSource(src);
        hls.attachMedia(video);

        // Setelah manifest ter-parse, pastikan kita mulai dari level terendah yang
        // benar-benar online (hindari variant yang host-nya mati / ConnectError).
        hls.on(HlsCtor.Events.MANIFEST_PARSED, (_e, data) => {
          if (cancelled) return;
          const options = data.levels.map((l) => l.height || 0).filter(Boolean);
          try {
            (plyr as unknown as PlyrType & { quality: { options?: number[] } }).quality.options = options;
          } catch {}
          // mulai dari level paling rendah agar cepat start, lalu naik otomatis
          if (data.levels.length > 1 && hls) hls.currentLevel = 0;
          setStatus("ready");
          video.play().catch(() => setAutoplayBlocked(true));

          // Watchdog anti-stuck: kalau 12 detik setelah manifest ter-parse video
          // masih belum punya frame (readyState < 2 / buffered kosong), anggap
          // stream ini gagal — tandai error agar otomatis pindah server.
          const t = window.setTimeout(() => {
            if (cancelled) return;
            const hasData = (video.readyState ?? 0) >= 2 || video.buffered.length > 0;
            if (!hasData) {
              setStatus("error");
              onError?.();
            }
          }, 12000);
          watchdog.current = t;
        });

        hls.on(HlsCtor.Events.LEVEL_SWITCHED, (_e, data) => {
          if (cancelled) return;
          const hlsAny = hls as unknown as { autoLevelEnabled: boolean };
          if (!hlsAny.autoLevelEnabled) {
            try {
              (plyr as unknown as PlyrType & { quality?: { current?: number } }).quality.current = data.level;
            } catch {}
          }
        });

        // Pemulihan dari gagal muat level (host variant mati) — coba level lain.
        hls.on(HlsCtor.Events.ERROR, (_e, data) => {
          if (data.fatal) {
            // Kalau satu level m3u8 (variant) gagal dimuat, pindah ke level lain.
            if (data.details === HlsCtor.ErrorDetails.LEVEL_LOAD_ERROR) {
              const cur = data.level ?? 0;
              const next = cur + 1;
              try {
                if (hls) {
                  hls.startLoad();
                  if (next < (hls.levels?.length ?? 0)) hls.loadLevel = next;
                }
              } catch {}
              return;
            }
            // Coba pulihkan dari error jaringan/media sebelum menyerah.
            if (data.type === HlsCtor.ErrorTypes.NETWORK_ERROR) {
              try {
                hls?.startLoad();
                return;
              } catch {}
            }
            if (data.type === HlsCtor.ErrorTypes.MEDIA_ERROR) {
              try {
                hls?.recoverMediaError();
                return;
              } catch {}
            }
            setStatus("error");
            onError?.();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", () => setStatus("ready"), { once: true });
        video.addEventListener("error", () => {
          setStatus("error");
          onError?.();
        }, { once: true });
      } else {
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      if (watchdog.current) window.clearTimeout(watchdog.current);
      try {
        plyr?.destroy();
      } catch {}
      hls?.destroy();
    };
  }, [src, onError]);

  return (
    <div className="relative w-full">
      <div>
        <video ref={videoRef} playsInline className="player" />
      </div>

      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-3">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-brand" />
            <span className="text-xs font-medium tracking-widest text-zinc-500">
              MEMUAT…
            </span>
          </div>
        </div>
      )}
      {autoplayBlocked && status === "ready" && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <button
            onClick={() => videoRef.current?.play()}
            className="pointer-events-auto rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/40 transition hover:bg-brand-strong"
          >
            Putar
          </button>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 grid place-items-center bg-black/90 p-6 text-center">
          <div>
            <p className="mb-3 text-sm text-zinc-400">
              Stream gagal dimuat. Mencoba server lain otomatis…
            </p>
            <button
              onClick={() => {
                setStatus("loading");
                onError?.();
              }}
              className="rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/15"
            >
              Coba Server Lain
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
