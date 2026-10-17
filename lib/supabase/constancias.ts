import { createAdminClient } from "@/lib/supabase/server";
import { getConfiguracion } from "@/lib/config";
import { generarConstanciaPdf } from "@/lib/pdf/generar-constancia";

/**
 * Búsqueda + verificación + generación de la Constancia de Participación.
 *
 * Diseño deliberado para no revelar nunca si un folio, nombre, correo o
 * celular específico existe: la identificación (folio o nombre) y la
 * verificación (correo o celular) se validan juntas en una sola operación
 * server-side, y cualquier combinación que no resuelva a exactamente un
 * registro propio devuelve el mismo mensaje genérico — nunca una lista de
 * candidatos, nunca "el folio existe pero el correo no coincide".
 *
 * Usa createAdminClient() (igual que app/registro/actions.ts): quien busca
 * su constancia es un visitante anónimo sin sesión, así que no hay forma
 * de hacerlo con el cliente de sesión + RLS.
 */

export interface SolicitudConstancia {
  tipoIdentificador: "folio" | "nombre";
  identificador: string;
  verificacion: string; // correo o celular, se detecta el formato automáticamente
}

export type ResultadoConstancia =
  | { ok: true; pdf: Buffer; nombreArchivo: string }
  | { ok: false; codigo: "deshabilitado" | "invalido" | "no_confirmado"; mensaje: string };

const MENSAJE_INVALIDO =
  "No pudimos encontrar una constancia con esos datos. Revisa tu folio o nombre completo, y el correo o celular con el que te registraste, e inténtalo de nuevo.";
const MENSAJE_NO_CONFIRMADO =
  "Tu pago todavía no aparece confirmado en nuestros registros, así que la constancia no está disponible por ahora. Si ya realizaste tu pago, contacta al comité organizador.";
const MENSAJE_DESHABILITADO =
  "La emisión de constancias digitales aún no está habilitada. Vuelve a intentarlo más tarde.";

export function normalizarTexto(valor: string): string {
  return valor.trim().toLowerCase();
}

export function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

// `.ilike()` envía el valor TAL CUAL como patrón de ILIKE a Postgres, donde
// "%" y "_" son comodines y "\" es el carácter de escape — sin esto, un
// identificador como "%" haría que la búsqueda por nombre coincidiera con
// TODA la tabla en vez de un nombre exacto, convirtiendo este endpoint en
// un oráculo para probar correo/celular contra cualquier registro
// confirmado. Se escapan esos tres caracteres para que ilike() se comporte
// como una comparación exacta insensible a mayúsculas, que es la única
// semántica que este código necesita.
export function escaparPatronIlike(valor: string): string {
  return valor.replace(/[\\%_]/g, (caracter) => `\\${caracter}`);
}

export function coincideVerificacion(
  registro: { correo: string; celular: string },
  verificacion: string
): boolean {
  const verifTexto = normalizarTexto(verificacion);
  const verifDigitos = soloDigitos(verificacion);

  const correoCoincide = verifTexto.length > 0 && normalizarTexto(registro.correo) === verifTexto;
  const celularCoincide =
    verifDigitos.length >= 10 && soloDigitos(registro.celular).slice(-10) === verifDigitos.slice(-10);

  return correoCoincide || celularCoincide;
}

export async function resolverConstancia(solicitud: SolicitudConstancia): Promise<ResultadoConstancia> {
  const habilitado = await getConfiguracion<boolean>("constancias_habilitadas", false);
  if (!habilitado) {
    return { ok: false, codigo: "deshabilitado", mensaje: MENSAJE_DESHABILITADO };
  }

  const identificador = solicitud.identificador?.trim();
  const verificacion = solicitud.verificacion?.trim();
  if (!identificador || !verificacion) {
    return { ok: false, codigo: "invalido", mensaje: MENSAJE_INVALIDO };
  }

  const supabase = await createAdminClient();

  const columnaIdentificador = solicitud.tipoIdentificador === "folio" ? "folio" : "nombre";
  const { data: candidatos, error } = await supabase
    .from("registros")
    .select("id, nombre, folio, correo, celular, estatus_pago")
    .ilike(columnaIdentificador, escaparPatronIlike(identificador));

  if (error) {
    return { ok: false, codigo: "invalido", mensaje: MENSAJE_INVALIDO };
  }

  // Puede haber más de un candidato (p. ej. nombres compartidos entre dos
  // congresistas distintos) — nunca se expone la lista; se busca cuál de
  // ellos (si alguno) coincide también con la verificación.
  const coincidencia = (candidatos ?? []).find((registro) => coincideVerificacion(registro, verificacion));

  if (!coincidencia) {
    return { ok: false, codigo: "invalido", mensaje: MENSAJE_INVALIDO };
  }

  if (coincidencia.estatus_pago !== "confirmado") {
    return { ok: false, codigo: "no_confirmado", mensaje: MENSAJE_NO_CONFIRMADO };
  }

  const pdf = await generarConstanciaPdf(coincidencia.nombre);

  return {
    ok: true,
    pdf,
    nombreArchivo: `Constancia-${coincidencia.folio}.pdf`,
  };
}
