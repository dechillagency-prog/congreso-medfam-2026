/**
 * Dominio real donde el sitio responde hoy (deploy de Vercel) — único lugar
 * de verdad para el dominio base del sitio. Lo usan: metadataBase/OpenGraph
 * (app/layout.tsx), el sitemap (app/sitemap.ts), robots.ts, el QR del
 * programa y la liga /carta/[token] que se comparte por WhatsApp.
 *
 * "congresomedfam2026.mx" fue el dominio propio planeado, pero todavía no
 * resuelve. Cuando se active, este es el único archivo que hay que tocar.
 */
export const SITE_URL = "https://congreso-medfam-2026.vercel.app";
