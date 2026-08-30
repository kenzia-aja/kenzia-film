"use client";

/**
 * Pemutar HLS kustom bergaya IDLIX — pengganti Plyr.
 *
 * Plyr dibuang karena menu Kualitas-nya dibangun sekali saat kontrol dibuat dan
 * tidak bisa diisi ulang setelah manifest HLS tiba, sehingga opsi resolusi selalu
 * kosong untuk stream dinamis. Di sini UI dikontrol penuh: resolusi (switch instan
 * dengan rebuild hls.js), kecepatan, PiP, fullscreen, seek, keyboard.
 *
 * Subtitle sengaja tidak ada — sumber video newfilm hardsub.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import "./player.css";

type Props = {
  src: string;
  title?: string;
  /** Dipanggil saat stream mati total — dipakai untuk pindah server. */
  onError?: () => void;
};

/** Nilai level hls.js untuk mode otomatis (ABR). */
const AUTO = -1;

/* ── Ikon ── */
const Ic = {
  play: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5z" />
    </svg>
  ),
  pause: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 5h3.4v14H7zM13.6 5H17v14h-3.4z" />
    </svg>
  ),
  back10: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9M4.05 11H8M4.5 5.5 8 2" />
      <text x="12.5" y="17" fontSize="9" fill="currentColor" stroke="none" fontWeight="700">10</text>
    </svg>
  ),
  fwd10: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1M20 11h-4M19.5 5.5 16 2" />
      <text x="7" y="17" fontSize="9" fill="currentColor" stroke="none" fontWeight="700">10</text>
    </svg>
  ),
  vol: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
      <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" stroke="none" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />
    </svg>
  ),
  mute: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
      <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" stroke="none" />
      <path d="M17 9.5l4 5M21 9.5l-4 5" strokeLinecap="round" />
    </svg>
  ),
  pip: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="2" y="4" width="20" height="14" rx="2.5" />
      <rect x="12" y="11" width="8" height="5" rx="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  gear: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.4a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.4a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z" />
    </svg>
  ),
  expand: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  ),
  close: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  chev: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
      <path d="M9 6l6 6-6 6" />
    </svg>
  ),
  back: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  ),
  res: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
      <path d="M4 8h10M18 8h2M4 16h2M10 16h10" />
      <circle cx="16" cy="8" r="2" />
      <circle cx="7" cy="16" r="2" />
    </svg>
  ),
  speed: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" />
    </svg>
  ),
  pipIc: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="2" y="4" width="20" height="14" rx="2.5" />
      <rect x="12" y="11" width="8" height="5" rx="1" fill="currentColor" stroke="none" />
    </svg>
  ),
};

function fmt(s: number): string {
  const t = Math.max(0, Math.floor(s || 0));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const sec = t % 60;
  return `${h ? `${h}:${String(m).padStart(2, "0")}` : m}:${String(sec).padStart(2, "0")}`;
}

/**
 * majorplay (Pentos/IDLIX) mensyaratkan token sesi di SETIAP request —
 * playlist variant maupun segmen. TurboVIP tidak butuh (sudah lewat /api/tv).
 */
function sessionToken(src: string): string | null {
  try {
    const u = new URL(src, window.location.href);
    if (!/majorplay\.net$/i.test(u.hostname)) return null;
    return u.searchParams.get("t");
  } catch {
    return null;
  }
}

/* Bentuk loader hls.js yang kita perluas — tipe resminya tidak diekspor lengkap. */
type LoaderCtx = { url: string; type?: string; responseType?: string };
type LoaderCbs = {
  onSuccess: (response: { data?: unknown }, stats: unknown, context: unknown, nd: unknown) => void;
};
type LoaderBase = { load(ctx: LoaderCtx, config: unknown, callbacks: LoaderCbs): void };

function makeLoader(token: string | null): typeof Hls.DefaultConfig.loader {
  const Base = Hls.DefaultConfig.loader as unknown as new () => LoaderBase;

  class IdlixLoader extends Base {
    override load(ctx: LoaderCtx, config: unknown, cbs: LoaderCbs) {
      if (token && ctx.url && !ctx.url.includes("t=")) {
        ctx.url += `${ctx.url.includes("?") ? "&" : "?"}t=${token}&pm=browser`;
      }
      // master playlist majorplay kadang tidak menulis atribut CODECS sehingga
      // hls.js membuang levelnya — tambal agar semua resolusi tersedia.
      if (ctx.type === "manifest") {
        const orig = cbs.onSuccess;
        const wrapped: LoaderCbs = {
          onSuccess: (response, stats, context, nd) => {
            if (typeof response.data === "string") {
              response.data = response.data.replace(
                /#EXT-X-STREAM-INF:[^\n]*/g,
                (line) => (line.includes("CODECS=") ? line : `${line},CODECS="avc1.640028,mp4a.40.2"`),
              );
            }
            orig(response, stats, context, nd);
          },
        };
        super.load(ctx, config, wrapped);
        return;
      }
      super.load(ctx, config, cbs);
    }
  }
  return IdlixLoader as unknown as typeof Hls.DefaultConfig.loader;
}

export default function KustomPlayer({ src, title, onError }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const seekRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufEnd, setBufEnd] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [levels, setLevels] = useState<{ index: number; label: string }[]>([]);
  const [level, setLevel] = useState(AUTO);
  const [rate, setRate] = useState(1);
  const [chrome, setChrome] = useState(true);
  const [settings, setSettings] = useState(false);
  const [sub, setSub] = useState<null | "res" | "speed">(null);
  const [pipOn, setPipOn] = useState(false);
  const [toast, setToast] = useState("");
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  /** Permintaan pergantian level; resumeAt dipakai untuk melanjutkan posisi. */
  const [levelReq, setLevelReq] = useState<{ level: number; resumeAt: number | null }>({
    level: AUTO,
    resumeAt: null,
  });

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 1800);
  }, []);

  const showChrome = useCallback(() => {
    setChrome(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      const v = videoRef.current;
      if (v && !v.paused) setChrome(false);
    }, 3200);
  }, []);

  /* ── Bangun ulang hls.js setiap kali src / permintaan level berubah ──
     Mengganti hls.currentLevel saja tidak mengosongkan buffer, sehingga
     perubahan resolusi baru terlihat setelah buffer lama habis. Membangun
     instance baru dengan startLevel membuat pergantian langsung terasa. */
  useEffect(() => {
    let cancelled = false;
    let watchdog = 0;
    const video = videoRef.current;
    if (!video) return;

    const resumeAt = levelReq.resumeAt;

    hlsRef.current?.destroy();
    hlsRef.current = null;

    if (!Hls.isSupported()) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        setReady(true);
      } else {
        setFailed(true);
        onError?.();
      }
      return;
    }

    const hls = new Hls({
      enableWorker: true,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      startLevel: levelReq.level,
      defaultAudioCodec: "mp4a.40.2",
      loader: makeLoader(sessionToken(src)),
      fragLoadingMaxRetry: 6,
      fragLoadingRetryDelay: 1000,
      fragLoadingMaxRetryTimeout: 15000,
      manifestLoadingMaxRetry: 4,
      manifestLoadingRetryDelay: 1000,
      levelLoadingMaxRetry: 6,
      levelLoadingRetryDelay: 1000,
      levelLoadingMaxRetryTimeout: 20000,
    });
    hlsRef.current = hls;

    const readLevels = () => {
      const seen = new Set<string>();
      const out: { index: number; label: string }[] = [];
      hls.levels.forEach((l, i) => {
        const name =
          l.attrs?.NAME ||
          (l.height ? `${l.height}p` : `${Math.round((l.bitrate || 0) / 1000)}kbps`);
        if (seen.has(name)) return;
        seen.add(name);
        out.push({ index: i, label: name });
      });
      setLevels(out);
    };

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (cancelled) return;
      readLevels();
      setReady(true);
      // `startLevel` hanya menentukan level awal; ABR tetap menyala dan bisa
      // naik sendiri. currentLevel mengunci level (mematikan ABR).
      if (levelReq.level !== AUTO) hls.currentLevel = levelReq.level;
      if (resumeAt != null) video.currentTime = resumeAt;
      video.playbackRate = rate;
      video.play().catch(() => setAutoplayBlocked(true));
      // anti-stuck: 12 detik tanpa frame dianggap stream mati
      watchdog = window.setTimeout(() => {
        if (cancelled) return;
        const alive = video.readyState >= 2 || video.buffered.length > 0;
        if (!alive) {
          setFailed(true);
          onError?.();
        }
      }, 12000);
    });

    hls.on(Hls.Events.LEVELS_UPDATED, readLevels);
    hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
      if (cancelled) return;
      setLevel(hls.autoLevelEnabled ? AUTO : data.level);
    });

    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (cancelled || !data.fatal) return;
      // variant host mati → coba level lain sebelum menyerah
      if (data.details === Hls.ErrorDetails.LEVEL_LOAD_ERROR) {
        const next = (data.level ?? 0) + 1;
        try {
          hls.startLoad();
          if (next < hls.levels.length) hls.loadLevel = next;
        } catch {}
        return;
      }
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        try {
          hls.startLoad();
          return;
        } catch {}
      }
      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        try {
          hls.recoverMediaError();
          return;
        } catch {}
      }
      setFailed(true);
      onError?.();
    });

    hls.loadSource(src);
    hls.attachMedia(video);

    return () => {
      cancelled = true;
      if (watchdog) window.clearTimeout(watchdog);
    };
    // rate & levelReq.level sengaja tidak dijadikan dependensi:
    // rate diterapkan lewat handler, level lewat rebuild eksplisit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, levelReq]);

  /* ── state elemen video ── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      setTime(video.currentTime);
      const b = video.buffered;
      setBufEnd(b.length ? b.end(b.length - 1) : 0);
    };
    const onMeta = () => setDuration(video.duration || 0);
    const onPlay = () => {
      setPlaying(true);
      setAutoplayBlocked(false);
    };
    const onPause = () => {
      setPlaying(false);
      setChrome(true);
    };
    const onVol = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };
    const onEnterPiP = () => setPipOn(true);
    const onLeavePiP = () => setPipOn(false);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("progress", onTime);
    video.addEventListener("durationchange", onMeta);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVol);
    video.addEventListener("enterpictureinpicture", onEnterPiP);
    video.addEventListener("leavepictureinpicture", onLeavePiP);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("progress", onTime);
      video.removeEventListener("durationchange", onMeta);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVol);
      video.removeEventListener("enterpictureinpicture", onEnterPiP);
      video.removeEventListener("leavepictureinpicture", onLeavePiP);
    };
  }, [setChrome]);

  /* ── aksi ── */
  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => setAutoplayBlocked(true));
    else v.pause();
    showChrome();
  }, [showChrome]);

  const skip = useCallback((delta: number) => {
    const v = videoRef.current;
    if (v) v.currentTime = Math.max(0, v.currentTime + delta);
    showChrome();
  }, [showChrome]);

  const pickLevel = useCallback((idx: number) => {
    const v = videoRef.current;
    setLevelReq({ level: idx, resumeAt: v && v.duration ? v.currentTime : null });
    setSub(null);
  }, []);

  const pickRate = useCallback((r: number) => {
    setRate(r);
    const v = videoRef.current;
    if (v) v.playbackRate = r;
    setSub(null);
  }, []);

  const togglePip = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await v.requestPictureInPicture();
    } catch {
      showToast("PiP tidak didukung browser ini");
    }
  }, [showToast]);

  const toggleFs = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else box.requestFullscreen().catch(() => showToast("Fullscreen ditolak"));
  }, [showToast]);

  /* ── keyboard ─ */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const box = boxRef.current;
      if (!box || !box.isConnected) return;
      // jangan rampas tombol saat user sedang mengetik di input
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          toggle();
          break;
        case "ArrowRight":
          skip(5);
          break;
        case "ArrowLeft":
          skip(-5);
          break;
        case "ArrowUp": {
          const v = videoRef.current;
          if (v) v.volume = Math.min(1, v.volume + 0.05);
          break;
        }
        case "ArrowDown": {
          const v = videoRef.current;
          if (v) v.volume = Math.max(0, v.volume - 0.05);
          break;
        }
        case "m": {
          const v = videoRef.current;
          if (v) v.muted = !v.muted;
          break;
        }
        case "f":
          toggleFs();
          break;
        case "Escape":
          setSettings(false);
          setSub(null);
          break;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [toggle, skip, toggleFs]);

  /* ── seek bar ── */
  const seekAt = useCallback((clientX: number) => {
    const el = seekRef.current;
    const v = videoRef.current;
    if (!el || !v || !v.duration) return;
    const r = el.getBoundingClientRect();
    v.currentTime = Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * v.duration;
  }, []);

  const pct = duration ? (time / duration) * 100 : 0;
  const bufPct = duration ? (bufEnd / duration) * 100 : 0;
  const levelLabel = level === AUTO ? "Auto" : levels.find((l) => l.index === level)?.label ?? "?";

  if (failed) {
    return (
      <div className="grid aspect-video w-full place-items-center bg-black p-6 text-center">
        <div>
          <p className="mb-3 text-sm text-zinc-400">Stream gagal dimuat. Mencoba server lain otomatis…</p>
          <button
            onClick={onError}
            className="rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/15"
          >
            Coba Server Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={boxRef}
      className="kp"
      onMouseMove={showChrome}
      onTouchStart={showChrome}
      onClick={(e) => {
        if (e.target === videoRef.current) toggle();
      }}
      onDoubleClick={toggleFs}
    >
      <video ref={videoRef} playsInline preload="metadata" />

      {!ready && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-3">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-brand" />
            <span className="text-xs font-medium tracking-widest text-zinc-500">MEMUAT…</span>
          </div>
        </div>
      )}

      {autoplayBlocked && ready && !playing && (
        <div className="kp-big" onClick={toggle}>
          <span>{Ic.play}</span>
        </div>
      )}

      <div className={`kp-chrome${chrome ? "" : " kp-hide"}`}>
        <div className="kp-top">
          <div className="kp-title">{title}</div>
        </div>

        <div className="kp-bottom">
          <div
            ref={seekRef}
            className="kp-seek"
            onPointerDown={(e) => {
              dragging.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              seekAt(e.clientX);
            }}
            onPointerMove={(e) => dragging.current && seekAt(e.clientX)}
            onPointerUp={() => (dragging.current = false)}
          >
            <div className="kp-seek-track" />
            <div className="kp-seek-buf" style={{ width: `${bufPct}%` }} />
            <div className="kp-seek-fill" style={{ width: `${pct}%` }} />
            <div className="kp-seek-knob" style={{ left: `${pct}%` }} />
          </div>

          <div className="kp-ctrls">
            <button className="kp-ibtn" onClick={toggle} aria-label={playing ? "Jeda" : "Putar"}>
              {playing ? Ic.pause : Ic.play}
            </button>
            <button className="kp-ibtn" onClick={() => skip(-10)} aria-label="Mundur 10 detik">{Ic.back10}</button>
            <button className="kp-ibtn" onClick={() => skip(10)} aria-label="Maju 10 detik">{Ic.fwd10}</button>
            <div className="kp-volwrap">
              <button
                className="kp-ibtn"
                onClick={() => {
                  const v = videoRef.current;
                  if (v) v.muted = !v.muted;
                }}
                aria-label={muted ? "Suara" : "Bisu"}
              >
                {muted || !volume ? Ic.mute : Ic.vol}
              </button>
              <input
                className="kp-vol"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => {
                  const v = videoRef.current;
                  if (!v) return;
                  v.volume = Number(e.target.value);
                  v.muted = false;
                }}
              />
            </div>
            <div className="kp-time">
              {fmt(time)} / {fmt(duration)}
            </div>
            <div className="kp-spacer" />
            <button className="kp-ibtn" onClick={togglePip} aria-label="Picture-in-Picture">{Ic.pip}</button>
            <button
              className="kp-ibtn"
              aria-label="Pengaturan"
              aria-expanded={settings}
              onClick={(e) => {
                e.stopPropagation();
                setSettings((s) => !s);
                setSub(null);
              }}
            >
              {Ic.gear}
            </button>
            <button className="kp-ibtn" onClick={toggleFs} aria-label="Layar penuh">{Ic.expand}</button>
          </div>
        </div>

        {settings && (
          <div className="kp-settings" onClick={(e) => e.stopPropagation()}>
            {sub === null ? (
              <>
                <button className="kp-srow" onClick={() => setSub("res")}>
                  {Ic.res}
                  <span className="lbl">Resolusi</span>
                  <span className="val">{levelLabel}{Ic.chev}</span>
                </button>
                <button className="kp-srow" onClick={() => setSub("speed")}>
                  {Ic.speed}
                  <span className="lbl">Kecepatan</span>
                  <span className="val">{rate}x{Ic.chev}</span>
                </button>
                <button className="kp-srow" onClick={togglePip}>
                  {Ic.pipIc}
                  <span className="lbl">Picture-in-Picture</span>
                  <span className="val">{pipOn ? "On" : "Off"}</span>
                </button>
              </>
            ) : (
              <>
                <div className="kp-shead" onClick={() => setSub(null)}>
                  {Ic.back}
                  <span>{sub === "res" ? "Resolusi" : "Kecepatan"}</span>
                </div>
                {(sub === "res"
                  ? [{ index: AUTO, label: "Auto" }, ...levels]
                  : [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((r, i) => ({ index: i, label: `${r}x`, r }))
                ).map((o) => {
                  const on = sub === "res" ? level === o.index : rate === (o as { r?: number }).r;
                  const value = (o as { r?: number }).r ?? o.index;
                  return (
                    <button
                      key={o.label}
                      className="kp-srow"
                      onClick={() => (sub === "res" ? pickLevel(o.index) : pickRate(value as number))}
                    >
                      <span className="lbl">{o.label}</span>
                      <span className="val">
                        <span className={`kp-chk${on ? " on" : ""}`}>
                          {on && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" aria-hidden>
                              <path d="M4 12l6 6L20 6" />
                            </svg>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        )}

        {toast && <div className="kp-toast on">{toast}</div>}
      </div>
    </div>
  );
}
