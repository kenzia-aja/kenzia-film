"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type MenuItem = { label: string; href: string };

const DRAMA_SUB: MenuItem[] = [
  { label: "Drama Korea", href: "/browse?type=Drama&country=South+Korea" },
  { label: "Drama China", href: "/browse?type=Drama&country=China" },
  { label: "Drama Jepang", href: "/browse?type=Drama&country=Japan" },
  { label: "Drama Thailand", href: "/browse?type=Drama&country=Thailand" },
  { label: "Drama Taiwan", href: "/browse?type=Drama&country=Taiwan" },
  { label: "Drama Filipina", href: "/browse?type=Drama&country=Philippines" },
  { label: "Series Barat", href: "/browse?type=Drama&country=Barat" },
];

const FILM_SUB: MenuItem[] = [
  { label: "Film Korea", href: "/browse?type=Movie&country=South+Korea" },
  { label: "Film China", href: "/browse?type=Movie&country=China" },
  { label: "Film Hong Kong", href: "/browse?type=Movie&country=Hong+Kong" },
  { label: "Film Jepang", href: "/browse?type=Movie&country=Japan" },
  { label: "Film Thailand", href: "/browse?type=Movie&country=Thailand" },
  { label: "Film Taiwan", href: "/browse?type=Movie&country=Taiwan" },
  { label: "Film India", href: "/browse?type=Movie&country=India" },
  { label: "Film Barat", href: "/browse?type=Movie&country=Barat" },
];

const MOBILE_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Film", href: "/browse?type=Movie" },
  { label: "Serial TV", href: "/browse?type=Drama" },
  { label: "Anime", href: "/browse?genre=Animation" },
  { label: "Jadwal", href: "/jadwal" },
];

function Chevron({ open }: { open?: boolean }) {
  return (
    <svg
      className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
    </svg>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : false;
  return (
    <Link
      href={href}
      className={`group relative flex h-16 items-center px-3.5 text-sm transition-all duration-200 ${
        active
          ? "font-semibold text-white"
          : "text-zinc-300 hover:text-white"
      }`}
    >
      {children}
      <span
        className={`absolute inset-x-3.5 bottom-0 h-0.5 origin-left rounded-full bg-gradient-to-r from-brand to-brand-strong transition-transform duration-300 ${
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </Link>
  );
}

function Dropdown({ label, items }: { label: string; items: MenuItem[] }) {
  return (
    <div className="group relative">
      <button className="flex h-16 items-center gap-1.5 px-3 text-sm text-zinc-300 transition hover:text-white">
        {label}
        <Chevron />
      </button>
      <div className="invisible absolute left-0 top-full z-50 min-w-44 pt-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-surface py-1.5 shadow-2xl shadow-black/70 ring-1 ring-brand/20">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block border-l-2 border-transparent px-4 py-2 text-sm text-zinc-400 transition hover:border-brand hover:bg-brand/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSub, setMobileSub] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query) router.push(`/browse?q=${encodeURIComponent(query)}`);
  }

  const itemIcon = (outline: boolean) => (
    <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      {outline ? (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 3h4l2 12h11l2.5-8H6.5" />
          <circle cx="8" cy="18.5" r="1.5" fill="currentColor" />
          <circle cx="17" cy="18.5" r="1.5" fill="currentColor" />
        </>
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h9l5 5v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h10" />
        </>
      )}
    </svg>
  );

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-page/95 backdrop-blur-xl"
          : "bg-gradient-to-b from-black/80 via-black/40 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Kenzia">
          <span className="font-display text-2xl font-black leading-none tracking-[0.05em] text-brand">
            KENZIA
          </span>
        </Link>

        <nav className="hidden items-center lg:flex">
          <NavLink href="/">Beranda</NavLink>
          <Link
            href="/browse?status=Ongoing"
            className="group flex h-16 items-center px-3.5 text-sm text-zinc-300 transition-all duration-200 hover:scale-105 hover:text-white"
          >
            Ongoing
            <span className="absolute inset-x-3.5 bottom-0 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-brand to-brand-strong transition-transform duration-300 group-hover:scale-x-100" />
          </Link>
          <Link
            href="/browse?status=Completed"
            className="group relative flex h-16 items-center px-3.5 text-sm text-zinc-300 transition-all duration-200 hover:scale-105 hover:text-white"
          >
            Completed
            <span className="absolute inset-x-3.5 bottom-0 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-brand to-brand-strong transition-transform duration-300 group-hover:scale-x-100" />
          </Link>
          <Dropdown label="Drama" items={DRAMA_SUB} />
          <Dropdown label="Film" items={FILM_SUB} />
          <Link
            href="/browse?genre=Animation"
            className="group relative flex h-16 items-center px-3.5 text-sm text-zinc-300 transition-all duration-200 hover:scale-105 hover:text-white"
          >
            Animasi
            <span className="absolute inset-x-3.5 bottom-0 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-brand to-brand-strong transition-transform duration-300 group-hover:scale-x-100" />
          </Link>
          <NavLink href="/jadwal">Jadwal</NavLink>
        </nav>

        <form onSubmit={submit} className="group ml-auto w-full max-w-[220px] transition-all duration-300 focus-within:max-w-[300px] lg:max-w-[240px] lg:focus-within:max-w-[320px]">
          <label className="relative block">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition group-focus-within:text-brand"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
              />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari judul…"
              className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-9 text-sm placeholder-zinc-500 outline-none transition-all duration-300 focus:border-brand focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.25)]"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Hapus pencarian"
                className="absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-zinc-500 transition hover:bg-white/10 hover:text-white"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            )}
          </label>
        </form>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-zinc-300 hover:bg-white/5 lg:hidden"
          aria-label="Menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-white/5 bg-page/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-0.5">
            {MOBILE_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </Link>
            ))}

            {[
              { key: "drama", label: "Drama", items: DRAMA_SUB },
              { key: "film", label: "Film", items: FILM_SUB },
            ].map((group) => (
              <div key={group.key}>
                <button
                  onClick={() => setMobileSub(mobileSub === group.key ? null : group.key)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
                >
                  {group.label}
                  <Chevron open={mobileSub === group.key} />
                </button>
                {mobileSub === group.key && (
                  <div className="ml-3 flex flex-col border-l border-white/10 pl-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-md px-3 py-2 text-sm text-zinc-500 hover:bg-white/5 hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      )}

      {/* Bottom navigation mobile ala IDLIX */}
      <nav
        className="mobile-nav-grid fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-page/95 backdrop-blur-xl lg:hidden"
        aria-label="Navigasi bawah"
      >
        {MOBILE_LINKS.map((l) => {
          const active = l.href === "/" ? pathname === "/" : false;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition ${
                active ? "text-brand" : "text-zinc-500 hover:text-white"
              }`}
            >
              {itemIcon(!active)}
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
