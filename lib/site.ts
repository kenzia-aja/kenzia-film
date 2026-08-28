/**
 * Konfigurasi identitas situs.
 * SITE_URL bisa dioverride lewat env NEXT_PUBLIC_SITE_URL saat deploy (harus HTTPS).
 */
export const SITE_NAME = "Kenzia";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kenzia.example.com";
