/**
 * Dukungan server TurboVIP (emturbovid.com) untuk pemutar HLS internal.
 *
 * Temuan teknis (hasil pembongkaran):
 *   1. Halaman embed menyimpan URL master di atribut data-hash:
 *        <div id="video_player" data-hash="https://cdn.turboviplay.com/data3/<id>/<id>.m3u8">
 *   2. Master playlist berisi variant (480p/720p) di host turbosplayer.com.
 *   3. Variant playlist berisi segmen di lh3.googleusercontent.com yang berupa
 *      FILE PNG — video MPEG-TS-nya DISEMBUNYIKAN setelah chunk IEND PNG
 *      (bukan decoy; player asli membongkarnya lewat service worker).
 *   4. Google membalas 429 untuk request browser dan menolak header `referer`
 *      situs embed; semua host juga tanpa header CORS. Karena itu fetch harus
 *      dilakukan dari server (route handler) dengan UA polos tanpa referer.
 *
 * File ini hanya boleh dipakai di server (route handler).
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** Host yang boleh diambil — mencegah endpoint ini jadi open proxy / SSRF. */
const ALLOWED_HOSTS = [
  "turboviplay.com",
  "turbosplayer.com",
  "emturbovid.com",
  "turbovidhls.com",
  "googleusercontent.com",
];

export function isAllowedUrl(raw: string): boolean {
  try {
    const h = new URL(raw).hostname.toLowerCase();
    return ALLOWED_HOSTS.some((a) => h === a || h.endsWith("." + a));
  } catch {
    return false;
  }
}

/**
 * Ambil teks dari URL yang diizinkan.
 * PENTING: jangan kirim header `referer` — Google membalas 429 bila referernya
 * situs embed (emturbovid/turbovidhls). UA polos sudah cukup.
 */
async function fetchText(url: string): Promise<string> {
  if (!isAllowedUrl(url)) throw new Error("host tidak diizinkan");
  const res = await fetch(url, {
    headers: { "user-agent": UA },
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  return res.text();
}

/**
 * Bongkar PNG steganografi → buffer MPEG-TS.
 * Struktur: [PNG asli][padding 0xFF][paket TS 0x47 × 188 byte]
 */
export function unwrapTs(buf: Uint8Array): Uint8Array {
  let iend = -1;
  const limit = Math.min(2000, buf.length - 4);
  for (let i = 0; i < limit; i++) {
    if (buf[i] === 0x49 && buf[i + 1] === 0x45 && buf[i + 2] === 0x4e && buf[i + 3] === 0x44) {
      iend = i;
      break;
    }
  }
  if (iend < 0) return buf; // bukan PNG stego — kembalikan apa adanya

  const off = iend + 8; // lewati IEND + CRC
  // cari awal paket TS: byte 0x47 yang berulang tiap 188 byte
  for (let i = off; i < off + 188 && i < buf.length; i++) {
    let ok = true;
    for (let k = i; k < Math.min(i + 188 * 5, buf.length); k += 188) {
      if (buf[k] !== 0x47) {
        ok = false;
        break;
      }
    }
    if (ok) return buf.subarray(i);
  }
  return buf.subarray(off);
}

/** Ambil satu segmen video (PNG → TS). */
export async function fetchSegment(url: string): Promise<Uint8Array> {
  if (!isAllowedUrl(url)) throw new Error("host tidak diizinkan");
  const res = await fetch(url, {
    headers: { "user-agent": UA },
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  return unwrapTs(new Uint8Array(await res.arrayBuffer()));
}

/**
 * Ambil playlist (master atau variant) lalu tulis ulang URL di dalamnya agar
 * menunjuk kembali ke route /api/tv kita.
 */
export async function buildPlaylist(embed: string, url: string): Promise<string> {
  const txt = await fetchText(url);
  const out: string[] = [];
  for (const line of txt.split("\n")) {
    const t = line.trim();
    if (!t || line.startsWith("#")) {
      out.push(line);
      continue;
    }
    const abs = new URL(t, url).href;
    const q = new URLSearchParams();
    q.set("embed", embed);
    q.set("u", abs);
    // segmen = bukan .m3u8 → endpoint seg; selain itu = playlist
    out.push(/\.m3u8(\?|$)/i.test(abs) ? `/api/tv/playlist?${q}` : `/api/tv/seg?${q}`);
  }
  return out.join("\n");
}

/** Cari URL master HLS dari halaman embed TurboVIP. */
export async function resolveMaster(embed: string): Promise<string> {
  const html = await fetchText(embed);
  const m = html.match(/data-hash=["']?([^"'\\\s>]+\.m3u8)/);
  if (!m) throw new Error("data-hash tidak ditemukan di halaman embed");
  return m[1];
}
