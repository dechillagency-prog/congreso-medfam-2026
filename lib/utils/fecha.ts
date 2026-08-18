const ZONA_HORARIA = "America/Monterrey";

/**
 * Todas las fechas se guardan en UTC en Supabase (timestamptz) — este
 * archivo es el único lugar que las convierte a hora local para mostrarlas.
 * No cambia nada en la base de datos, solo la presentación.
 */

function partes(fechaISO: string, opciones: Intl.DateTimeFormatOptions) {
  const fecha = new Date(fechaISO);
  return new Intl.DateTimeFormat("es-MX", { timeZone: ZONA_HORARIA, ...opciones }).formatToParts(fecha);
}

function valorParte(partes: Intl.DateTimeFormatPart[], tipo: Intl.DateTimeFormatPartTypes): string {
  return partes.find((p) => p.type === tipo)?.value ?? "";
}

/**
 * Formato largo con hora, para vistas de detalle:
 * "31 de julio de 2026, 2:57 a.m."
 */
export function formatearFechaHora(fechaISO: string | null | undefined): string {
  if (!fechaISO) return "—";
  const p = partes(fechaISO, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const dia = valorParte(p, "day");
  const mes = valorParte(p, "month");
  const anio = valorParte(p, "year");
  const hora = valorParte(p, "hour");
  const minuto = valorParte(p, "minute");
  const periodo = valorParte(p, "dayPeriod");
  return `${dia} de ${mes} de ${anio}, ${hora}:${minuto} ${periodo}`;
}

/**
 * Formato largo, solo fecha, sin hora: "14 de agosto de 2026"
 */
export function formatearFechaLarga(fechaISO: string | null | undefined): string {
  if (!fechaISO) return "—";
  const p = partes(fechaISO, { day: "numeric", month: "long", year: "numeric" });
  const dia = valorParte(p, "day");
  const mes = valorParte(p, "month");
  const anio = valorParte(p, "year");
  return `${dia} de ${mes} de ${anio}`;
}

/**
 * Formato corto, solo fecha, para tablas: "31 jul 2026"
 */
export function formatearFechaCorta(fechaISO: string | null | undefined): string {
  if (!fechaISO) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: ZONA_HORARIA,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(fechaISO));
}

/**
 * Formato mediano con hora, para listas intermedias (historial de
 * comprobantes): "31 jul 2026, 2:57 a.m."
 */
export function formatearFechaHoraCorta(fechaISO: string | null | undefined): string {
  if (!fechaISO) return "—";
  const p = partes(fechaISO, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const dia = valorParte(p, "day");
  const mes = valorParte(p, "month");
  const anio = valorParte(p, "year");
  const hora = valorParte(p, "hour");
  const minuto = valorParte(p, "minute");
  const periodo = valorParte(p, "dayPeriod");
  return `${dia} ${mes} ${anio}, ${hora}:${minuto} ${periodo}`;
}
