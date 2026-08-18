const FECHAS_CONGRESO = "14 al 17 de octubre de 2026";
const SEDE_CONGRESO = "Torreón, Coahuila";

/**
 * Normaliza un celular mexicano a formato E.164 sin el signo "+" (como lo
 * espera wa.me): quita todo lo que no sea dígito, y agrega el prefijo de
 * país 52 solo si hace falta.
 */
export function normalizarCelularMx(celularCrudo: string): string {
  const soloDigitos = celularCrudo.replace(/\D/g, "");

  // Ya trae el prefijo de país — no duplicarlo.
  if (soloDigitos.startsWith("52")) return soloDigitos;

  // Celular nacional de 10 dígitos (formato en el que se guarda en `registros`).
  if (soloDigitos.length === 10) return `52${soloDigitos}`;

  // Cualquier otro formato inesperado: se deja tal cual, ya limpio de símbolos.
  return soloDigitos;
}

/**
 * Arma el texto del mensaje de confirmación. La liga de la comunidad es
 * opcional: si no está configurada, el mensaje simplemente no incluye esa
 * línea (nunca se inventa ni se deja un placeholder roto).
 */
export function construirMensajeConfirmacion({
  nombre,
  folio,
  ligaComunidad,
  ligaCarta,
}: {
  nombre: string;
  folio: string;
  ligaComunidad?: string | null;
  ligaCarta?: string;
}): string {
  const lineas = [
    `Hola, ${nombre}.`,
    "",
    "Tu inscripción al XXV Congreso Regional Noreste de Medicina Familiar ha sido confirmada. ✅",
    "",
    "📄 Folio:",
    folio,
    "",
    "📅 Fechas:",
    FECHAS_CONGRESO,
    "",
    "📍 Sede:",
    SEDE_CONGRESO,
  ];

  if (ligaCarta) {
    lineas.push(
      "",
      "Puedes descargar tu Carta de Congresista aquí:",
      "",
      ligaCarta
    );
  }

  lineas.push("", "Nos dará mucho gusto contar con tu participación.");

  if (ligaComunidad) {
    lineas.push(
      "",
      "Únete a la comunidad oficial del congreso para recibir avisos e información importante:",
      "",
      ligaComunidad
    );
  }

  lineas.push("", "¡Te esperamos!");

  return lineas.join("\n");
}

/** Construye el enlace wa.me con el mensaje ya codificado (mejor compatibilidad en móvil). */
export function construirEnlaceWhatsApp(celular: string, mensaje: string): string {
  const numero = normalizarCelularMx(celular);
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Misma liga que construirEnlaceWhatsApp, pero apuntando a WhatsApp Web —
 * en desktop abre directo la conversación en web.whatsapp.com con el
 * mensaje precargado, en vez de pasar por la pantalla intermedia de
 * wa.me que sugiere "abrir la app". Mismo número, mismo mensaje, sin usar
 * la API de WhatsApp Business.
 */
export function construirEnlaceWhatsAppWeb(celular: string, mensaje: string): string {
  const numero = normalizarCelularMx(celular);
  return `https://web.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`;
}
