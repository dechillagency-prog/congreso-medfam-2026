// Dominios de placeholder/prueba que no deben tratarse como imágenes reales
// (p. ej. placehold.co usado como dato de prueba al cargar contenido).
const DOMINIOS_PLACEHOLDER = ["placehold.co", "placeholder.com", "via.placeholder.com", "dummyimage.com"];

// Dominios ya configurados en next.config.mjs `images.remotePatterns` —
// solo estos pueden pasar por el optimizador de next/image.
const DOMINIOS_OPTIMIZABLES = [/(^|\.)supabase\.co$/];

/** ¿Es una URL usable como imagen real (no vacía, no placeholder, http/https)? */
export function esUrlImagenValida(url: string | null | undefined): url is string {
  if (!url) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  if (DOMINIOS_PLACEHOLDER.some((d) => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`))) return false;
  return true;
}

/** ¿El host de esta URL está en `images.remotePatterns`? Si no, next/image debe usarse con `unoptimized`. */
export function esImagenOptimizablePorNextImage(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return DOMINIOS_OPTIMIZABLES.some((re) => re.test(hostname));
  } catch {
    return false;
  }
}
