/**
 * Detecta si `nombreCompleto` ya trae tratamiento ("Dr."/"Dra.", con o sin
 * punto, cualquier combinación de mayúsculas/minúsculas) para no
 * duplicarlo al construir un saludo. Compartida por construirSaludoCarta()
 * y construirSaludoEmail() — misma detección, cada una con su puntuación.
 */
function detectarTratamiento(nombreCompleto: string): "dra" | "dr" | null {
  const nombre = nombreCompleto.trim();

  if (/^dra\.?\s/i.test(nombre)) return "dra";
  if (/^dr\.?\s/i.test(nombre)) return "dr";
  return null;
}

/**
 * Arma el saludo de la Carta de Congresista (termina en coma): si
 * `nombreCompleto` ya viene con tratamiento se usa tal cual con el género
 * correspondiente; si no, usa un saludo neutral que no asume género ni
 * título. No modifica `nombreCompleto` — solo decide cómo construir el
 * saludo.
 */
export function construirSaludoCarta(nombreCompleto: string): string {
  const nombre = nombreCompleto.trim();
  const tratamiento = detectarTratamiento(nombre);

  if (tratamiento === "dra") return `Estimada ${nombre},`;
  if (tratamiento === "dr") return `Estimado ${nombre},`;
  return `Estimado(a) ${nombre},`;
}

/**
 * Misma lógica que construirSaludoCarta(), pero para el correo de
 * confirmación (termina en dos puntos, formato de carta formal por email).
 */
export function construirSaludoEmail(nombreCompleto: string): string {
  const nombre = nombreCompleto.trim();
  const tratamiento = detectarTratamiento(nombre);

  if (tratamiento === "dra") return `Estimada ${nombre}:`;
  if (tratamiento === "dr") return `Estimado ${nombre}:`;
  return `Estimado(a) ${nombre}:`;
}
