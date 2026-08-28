"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-4 text-center">
      <div>
        <p className="font-display text-7xl uppercase tracking-wide text-brand">Oops</p>
        <h1 className="mb-2 mt-2 text-xl font-bold">Terjadi kesalahan</h1>
        <p className="mb-6 text-sm leading-relaxed text-zinc-500">{error.message}</p>
        <button
          onClick={reset}
          className="rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
