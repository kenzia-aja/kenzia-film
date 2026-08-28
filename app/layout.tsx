import type { Metadata } from "next";
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import "plyr/dist/plyr.css";
import Navbar from "@/components/navbar";
import { SITE_URL } from "@/lib/site";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Kenzia — Nonton Drama & Film Subtitle Indonesia',
    template: '%s — Kenzia',
  },
  description:
    'Streaming drama Korea, China, Jepang, dan film dengan subtitle Indonesia. Cepat, ringan, tanpa ribet.',
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${jakarta.variable} ${bebas.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        <footer className="relative mt-20 overflow-hidden border-t border-white/10">
          {/* Glow ambient di footer */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[80%] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-[1400px] px-4 py-12 pb-24 lg:pb-12">
            {/* Baris brand */}
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="https://x.com/kenziaajaa"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2"
              >
                <span className="font-display text-3xl font-black leading-none tracking-[0.05em] text-white transition-colors group-hover:text-brand">
                  KEN<span className="text-brand">ZIA</span>
                </span>
              </Link>
              <p className="max-w-md text-xs leading-relaxed text-zinc-500">
                Nonton drama &amp; film subtitle Indonesia. Cepat, ringan, tanpa ribet.
              </p>
            </div>

            {/* Grid link */}
            <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
              <div className="col-span-2 sm:col-span-1">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                  Jelajahi
                </h3>
                <ul className="space-y-2 text-sm">
                  {[
                    { label: "Film", href: "/browse?type=Movie" },
                    { label: "Serial TV", href: "/browse?type=Drama" },
                    { label: "Anime", href: "/browse?genre=Animation" },
                    { label: "Ongoing", href: "/browse?status=Ongoing" },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-zinc-400 transition hover:text-brand-strong">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                  Katalog
                </h3>
                <ul className="space-y-2 text-sm">
                  {[
                    { label: "Genre", href: "/browse" },
                    { label: "Negara", href: "/browse" },
                    { label: "Tahun", href: "/browse" },
                    { label: "Jadwal Rilis", href: "/jadwal" },
                  ].map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-zinc-400 transition hover:text-brand-strong">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                  Platform
                </h3>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-center gap-4">
                    <Link
                      href="https://x.com/kenziaajaa"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 transition group-hover:bg-brand group-hover:ring-brand">
                        <svg className="h-4 w-4 text-zinc-300 transition group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </span>
                      <span className="text-xs text-zinc-400 transition group-hover:text-white">
                        @kenziaajaa
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Baris bawah */}
            <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 text-xs text-zinc-600 sm:flex-row sm:items-center">
              <span>© {new Date().getFullYear()} Kenzia</span>
              <p className="max-w-xl">
                Demo katalog streaming. Seluruh metadata bersumber dari situs publik; hak
                cipta konten milik pemiliknya masing-masing.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
