"use client";

import { useCallback, useEffect, useState } from "react";
import VideoPlayer from "@/components/video-player";
import { apiUrl, type VideoServer } from "@/lib/api";

type Props = {
  slug: string;
  ep: number;
  initialServers?: VideoServer[];
  initialError?: string | null;
};

export default function WatchPlayer({ slug, ep, initialServers, initialError }: Props) {
  const [servers, setServers] = useState<VideoServer[] | null>(initialServers ?? null);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(!initialServers && !initialError);

  const fetchSources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiUrl()}/api/series/${encodeURIComponent(slug)}/sources?ep=${ep}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        let detail = "";
        try {
          const j = JSON.parse(body);
          detail = j.detail || body;
        } catch {
          detail = body.slice(0, 300);
        }
        throw new Error(`API ${res.status}${detail ? `: ${detail}` : ""}`);
      }
      const data = await res.json();
      const list: VideoServer[] = data.servers ?? [];
      if (list.length === 0) {
        setError("Tidak ada server video ditemukan untuk episode ini.");
        setServers([]);
      } else {
        setServers(list);
        setError(null);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("Failed to fetch") || msg.includes("ECONNREFUSED") || msg.includes("NetworkError")) {
        setError(
          "Tidak bisa terhubung ke API (http://127.0.0.1:8000). Pastikan terminal API sedang berjalan: python main.py"
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [slug, ep]);

  useEffect(() => {
    // if we already have servers from SSR, no need to fetch
    if (initialServers && initialServers.length > 0) return;
    // if SSR failed, fetch on client with retry
    // if no initial data (SSR skipped), fetch
    // Dipanggil via microtask agar setState tidak sinkron di dalam effect body
    // (react-hooks/set-state-in-effect).
    if (initialError || servers === null) {
      let cancelled = false;
      const id = setTimeout(() => {
        if (!cancelled) fetchSources();
      }, 0);
      return () => {
        cancelled = true;
        clearTimeout(id);
      };
    }
  }, [initialServers, initialError, servers, fetchSources]);

  // retry handler
  const handleRetry = () => {
    fetchSources();
  };

  if (loading) {
    return (
      <div className="grid aspect-video w-full place-items-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-brand" />
          <span className="text-xs font-medium tracking-widest text-zinc-500">MEMUAT SUMBER…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid aspect-video w-full place-items-center bg-black p-8 text-center">
        <div className="max-w-md">
          <p className="mb-2 text-sm font-semibold text-zinc-300">Gagal memuat sumber video</p>
          <p className="mb-4 text-xs leading-relaxed text-zinc-500">{error}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={handleRetry}
              className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
            >
              Coba Lagi
            </button>
            <a
              href={`/watch/${slug}?ep=${ep}`}
              className="rounded-md bg-white/10 px-5 py-2.5 text-sm font-semibold text-zinc-300 ring-1 ring-white/10 hover:bg-white/15 hover:text-white"
            >
              Muat Ulang Halaman
            </a>
          </div>
          <p className="mt-4 text-[11px] text-zinc-600">
            Tips: pastikan API berjalan di terminal 1 (<code className="text-zinc-400">python main.py</code>) dan web di
            terminal 2 (<code className="text-zinc-400">npm run dev</code>).
          </p>
        </div>
      </div>
    );
  }

  // servers may be empty array (no servers found)
  if (!servers || servers.length === 0) {
    return (
      <div className="grid aspect-video w-full place-items-center bg-black p-8 text-center">
        <div>
          <p className="mb-2 text-sm font-semibold text-zinc-300">Semua server sedang tidak tersedia</p>
          <p className="mb-4 text-xs text-zinc-500">Coba muat ulang halaman atau pilih episode lain.</p>
          <button
            onClick={handleRetry}
            className="rounded-xl bg-white/10 px-5 py-2 text-sm font-semibold ring-1 ring-white/10 hover:bg-white/15"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return <VideoPlayer servers={servers} />;
}
