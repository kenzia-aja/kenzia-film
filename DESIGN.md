---
name: Kenzia
description: Situs streaming drama Asia & film bersubtitle Indonesia dengan kualitas tampilan layanan premium
colors:
  page: "#0b0c0e"
  surface: "#151719"
  surface-2: "#1e2124"
  hover: "#23262c"
  beam: "#2563eb"
  beam-strong: "#3b82f6"
  beam-soft: "#93c5fd"
  text-primary: "#f4f5f7"
  text-muted: "#9ba1ab"
  text-faint: "#52525b"
  border-hairline: "rgba(255, 255, 255, 0.08)"
  border-visible: "rgba(255, 255, 255, 0.10)"
typography:
  display:
    fontFamily: "Bebas Neue, Plus Jakarta Sans, sans-serif"
    fontSize: "clamp(3rem, 8vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Bebas Neue, Plus Jakarta Sans, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.025em"
  title:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.375
  body:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.2em"
rounded:
  chip: "6px"
  control: "8px"
  card: "12px"
  panel: "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.beam}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.beam-strong}"
  button-secondary:
    backgroundColor: "rgba(0, 0, 0, 0.20)"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  button-secondary-hover:
    backgroundColor: "rgba(0, 0, 0, 0.40)"
  chip:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.chip}"
    padding: "10px 16px"
  chip-active:
    backgroundColor: "{colors.beam}"
    textColor: "#ffffff"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
---

# Design System: Kenzia

## Overview

**Creative North Star: "Kamar Nonton Pribadi"**

Kenzia adalah kamar nonton privat: lampu dimatikan, hanya cahaya layar (biru *Projector Beam*) yang jatuh di atas poster. Chrome UI bersikap seperti perabot yang baik — hadir, presisi, nyaris tak terdengar — sehingga poster dan jadwal adalah satu-satunya hal yang bicara keras. Suasananya kuratorial dan tenang: jarak lega, copy hemat, quiet confidence; bukan etalase yang menjerit, melainkan koleksi yang dikurasi seseorang dengan selera.

Kepadatan visual rendah-menengah. Poster diberi ruang bernapas di grid lega; teks sekunder diserahkan ke abu netral tanpa bersaing dengan judul. Sistem menolak nuansa dashboard: kartu seragam dengan chrome tebal, warna status di mana-mana, dan panel-padat-panel adalah anti-referensi tegas. Kedalaman dibangun dari bayangan ambient yang lembut — panel terasa *melayang* sedikit di atas near-black, bukan dilubang.

**Key Characteristics:**
- Latar near-black netral (#0b0c0e) dengan satu aksen biru elektrik tunggal
- Tipografi display condensed uppercase (Bebas Neue) versus body humanis (Plus Jakarta Sans)
- Kedalaman dari tonal layering + bayangan ambient lembut, rest-state tenang
- Radius kecil-konsisten (6/8/12px); siluet membulat halus, tidak bubbly
- Motion yang hormat: reveal float-in lembut, reduced-motion dihormati penuh

## Colors

Palet monokrom near-black dengan satu suara biru — di mana pun biru muncul, itu artinya "aksi menonton ada di sini".

### Primary
- **Projector Beam** (#2563eb): satu-satunya aksen. Tombol play/jelajahi, chip hari aktif, badge episode baru, label kicker, fokus ring, glow ambient hero. Dirancang untuk dilihat di atas near-black — jangan dipakai di latar terang.

### Neutral
- **Midnight Page** (#0b0c0e): latar halaman. Near-black netral, bukan hitam murni — menyimpan kedalaman tanpa menghirup teks.
- **Cinema Card** (#151719): kartu poster, panel, permukaan primer.
- **Lifted Surface** (#1e2124): permukaan terangkat — dropdown, panel stats, elemen yang melayang di atas kartu.
- **Press Hover** (#23262c): state hover untuk permukaan terangkat dan baris.
- **Bone Text** (#f4f5f7): teks primer dan judul.
- **Silver Mute** (#9ba1ab): teks sekunder, sub-judul kartu, meta. Abu hangat-netral, bukan abu Tailwind default.
- **Faint Label** (#52525b): teks tersier, copyright footer, meta paling rendah.
- **Hairline** (rgba(255,255,255,0.08) / 0.10): border kartu, divider, ring rest-state. Selalu putih transparan, bukan warna solid.

### Named Rules
**The One Voice Rule.** Projector Beam adalah suara tunggal: tidak ada aksen kedua (merah/emas/hijau) di mana pun. Skala zinc Tailwind (zinc-300/400/500) dan putih/zinc dipakai sebagai tangga netral — itu toleransi, bukan undangan mengimpor warna baru.
**The Screen-Light Rule.** Biru adalah cahaya, bukan cat. Muncul sebagai teks, glow, ring, dan latar tombol — perannya memandu mata ke aksi menonton; tidak pernah jadi latar section besar.

## Typography

**Display Font:** Bebas Neue (fallback Plus Jakarta Sans, sans-serif)
**Body Font:** Plus Jakarta Sans (fallback ui-sans-serif, system-ui, sans-serif)

**Character:** Pasangan kontras-tinggi: display condensed uppercase yang berteriak seperti signage bioskop, body humanis lembut yang berbicara seperti kurator. Bebas Neue hanya satu weight (400) — skala dilakukan lewat ukuran, bukan weight palsu.

### Hierarchy
- **Display** (Bebas Neue 400, clamp(3rem→6rem), lh 0.95, uppercase): hero dan judul section raksasa; dipasangkan dengan ring ruang kosong di sekelilingnya.
- **Headline** (Bebas Neue 400, clamp(2rem→3rem), lh 1, uppercase): judul halaman (Browse, Jadwal, Series).
- **Title** (Plus Jakarta Sans 500, 14px, lh 1.375): judul kartu, item daftar; line-clamp 2.
- **Body** (Plus Jakarta Sans 400, 16px, lh 1.625): sinopsis, deskripsi, copy penjelas; ukuran sm (14px) untuk copy di dalam kartu.
- **Label** (Plus Jakarta Sans 700, 11px, tracking 0.2em, uppercase): kicker, label grup filter, meta tabel; varian micro 10px tracking 0.25–0.35em untuk kicker hero. Teks aksen label memakai beam-soft (#93c5fd).

### Named Rules
**The Signage Rule.** Bebas Neue selalu uppercase dan tidak pernah untuk body — ia adalah papan nama, bukan buku.

## Layout

Mobile-first dengan container `max-w-[1400px]` (halaman berat; px 16 → 24 → 48 di sm/lg) dan `max-w-7xl` (halaman browse). Grid konten mengikuti tangga kolom: 2 → 3 → 4 → 6 kolom (mobile → lg) dengan gap 16px. Baris horizontal di homepage memakai scroller `hscroll` (touch pan-x, scrollbar disembunyikan) — bukan grid penuh. Rhythm vertikal: section dipisah 64–96px; label kicker → judul → copy di hero bernafas dengan margin 16–28px. Navbar fixed transparan yang menandai `scrolled` setelah 24px scroll.

## Elevation & Depth

Kedalaman Kenzia hybrid: dasarnya tonal layering (page → surface → surface-2) yang dipertegas ring hairline putih tipis; di atasnya, bayangan ambient lembut membuat panel terasa melayang di ruang gelap. Bayangan selalu hitam pekat atau berwarna beam — tidak pernah abu dingin generik.

### Shadow Vocabulary
- **Rest card** (`ring-1 ring-white/10`): kartu duduk rata di permukaan; tanpa shadow.
- **Ambient lift** (`shadow-lg shadow-black/50`): dropdown, play-button, elemen terangkat saat muncul.
- **Cinematic float** (`shadow-2xl shadow-black/70`): kartu saat hover — poster mengangkat ke arah pemirsa.
- **Beam glow** (`shadow-brand/40`, `shadow-brand/50`): hanya pada elemen ber-aksen beam (badge, tombol utama) — cahaya biru yang "bocor" dari elemen.

### Named Rules
**The Hover-Lift Rule.** Permukaan flat saat diam; ketinggian adalah balasan atas interaksi. Shadow muncul saat hover/fokus/opening, tidak untuk dekorasi statis.

## Shapes

Siluet membulat-halus, tidak bubbly: chip/badge 6px, tombol dan input 8px (`rounded-md`), kartu poster 12px (`rounded-lg`), panel stats 16px (`rounded-2xl`), avatar/dot `rounded-full`. Border selalu hairline putih transparan; state hover memperjelas ring (white/10 → brand/60 atau white/40). Badge bertumpuk di sudut poster memakai backdrop-blur di atas hitam 70%. State kosong (empty state) memakai border dashed white/10 — satu-satunya tempat garis putus diizinkan.

## Components

### Buttons
- **Shape:** 8px radius; padding 12px 24px (CTA besar) atau 10px 16px (konteks rapat).
- **Primary:** latar beam, teks putih, font-semibold; hover → beam-strong; fokus ring beam-soft 2px dengan offset. Shadow brand halus di bawahnya.
- **Secondary/ghost:** latar hitam 20%, border putih 20%, teks putih; hover → hitam 40%, border putih 40%.
- **Transisi:** 200ms default; tanpa transform di tombol (kartu yang bergerak, tombol hanya berganti warna).

### Chips (tab hari jadwal)
- **Style:** 6px radius, padding 10px 16px, font-semibold 14px.
- **State:** aktif = latar beam + teks putih; tidak aktif = latar putih 5% + ring white/10 + teks zinc-400; hover → putih 10%. Sub-badge "HARI INI" 9px bold: latar hitam 30% (di atas aktif) atau beam 15% + teks beam (di atas non-aktif).

### Cards (poster 2:3)
- **Corner Style:** 12px.
- **Background:** surface + ring white/10; skeleton shimmer saat gambar memuat.
- **Shadow Strategy:** rest flat → hover shadow-2xl black/70 + scale 1.03 (kartu jadwal) atau ring brand/60 (kartu katalog).
- **Badge:** kiri-atas = tipe (backdrop-blur, hitam 70%); kanan-atas = badge episode (beam, teks putih).
- **Hover overlay:** lapisan hitam 10%→25% dengan play button bulat 44px ber-beam — tombol play sebagai kontrak "ini bisa ditonton".

### Inputs (pencarian navbar)
- **Style:** latar surface, radius penuh/kontrol, teks putih, placeholder zinc-500.
- **Focus:** ring beam-soft; Enter navigasi ke `/browse?q=`.

### Navigation
- Fixed atas, transparan di atas hero, latar page/80 + backdrop-blur setelah scroll 24px. Link desktop: zinc-400 → putih saat hover; item aktif putih + underline aksen. Dropdown: panel lifted dengan ring hairline dan shadow ambient. Mobile: drawer layar penuh bertingkat (Drama → negara), font besar mudah dijempol.

### Stats Bar (signature)
Panel 3-kolom rounded-2xl, latar surface/70 + backdrop-blur-xl, border white/10, dengan **stat-glow**: border beam beranimasi yang mengalir mengelilingi panel saat hover (property `--stat-glow-angle`). Angka ekstrabold 24–30px tabular; ikon lingkaran beam/15 → beam penuh saat hover. Ini satu-satunya ornamen beranimasi yang dibiarkan hidup di rest state.

## Do's and Don'ts

### Do:
- **Do** gunakan beam hanya untuk aksi menonton dan arah fokus — hemat, satu suara.
- **Do** beri kartu poster skeleton shimmer + fade-in 500ms; jangan biarkan pop-in.
- **Do** hormati `prefers-reduced-motion` di setiap animasi (sistem sudah mematikan semuanya global).
- **Do** pakai ring hairline putih transparan untuk semua border kartu/panel.

### Don't:
- **Don't** impor aksen kedua (merah/emas/hijau) — pelanggaran One Voice Rule.
- **Don't** tiru dashboard SaaS: kartu seragam chrome-tebal, badge status berwarna di setiap baris, panel-padat-panel.
- **Don't** pakai shadow untuk dekorasi statis — elevasi hanya sebagai balasan interaksi.
- **Don't** pakai Bebas Neue di bawah ukuran headline atau untuk body text.
