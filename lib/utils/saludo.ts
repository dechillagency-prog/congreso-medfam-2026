/**
 * Arma el saludo de la Carta de Congresista sin duplicar el tratamiento:
 * si `nombreCompleto` ya viene con "Dr."/"Dra." (o variantes de mayúsculas,
 * con o sin punto), se usa tal cual con el género correspondiente. Si no
 * trae tratamiento, usa un saludo neutral que no asume género ni título.
 *
 * No modifica `nombreCompleto` — solo decide cómo construir el saludo.
 */
export function construirSaludoCarta(nombreCompleto: string): string {
  const nombre = nombreCompleto.trim();

  if (/^dra\.?\s/i.test(nombre)) {
    return `Estimada ${nombre},`;
  }

  if (/^dr\.?\s/i.test(nombre)) {
    return `Estimado ${nombre},`;
  }

  return `Estimado(a) ${nombre},`;
}
