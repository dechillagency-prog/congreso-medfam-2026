import { createAdminClient } from "@/lib/supabase/server";
import { getConfiguracion } from "@/lib/config";
import { construirConstanciaPdfDoc, anexarPaginaSello } from "@/lib/pdf/generar-constancia";

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
  // SOLO la ruta de prueba admin-only (app/api/admin/constancias-prueba)
  // pasa esto en true, después de verificar sesión de administrador por su
  // cuenta. La ruta pública (app/api/constancias) nunca lo envía, así que
  // su comportamiento queda exactamente igual que antes de esto existir.
  omitirChequeoHabilitado?: boolean;
  // SOLO la ruta de prueba admin-only. Nunca llama a asignar_folio_aval
  // (nunca consume un folio nuevo): si el registro YA tiene folio real
  // asignado lo muestra tal cual (es de solo lectura); si no, usa la
  // página 1 del PDF de sellos como vista previa fija, sin tocar el
  // inventario en absoluto. Así se puede validar el diseño del PDF de 2
  // páginas cuantas veces se quiera sin gastar ningún sello oficial.
  modoVistaPrevia?: boolean;
}

export type ResultadoConstancia =
  | { ok: true; pdf: Buffer; nombreArchivo: string }
  | { ok: false; codigo: "deshabilitado" | "invalido" | "no_confirmado" | "sin_folios"; mensaje: string };

const MENSAJE_INVALIDO =
  "No pudimos encontrar una constancia con esos datos. Revisa tu folio o nombre completo, y el correo o celular con el que te registraste, e inténtalo de nuevo.";
const MENSAJE_NO_CONFIRMADO =
  "Tu pago todavía no aparece confirmado en nuestros registros, así que la constancia no está disponible por ahora. Si ya realizaste tu pago, contacta al comité organizador.";
const MENSAJE_DESHABILITADO =
  "La emisión de constancias digitales aún no está habilitada. Vuelve a intentarlo más tarde.";
const MENSAJE_SIN_FOLIOS =
  "Por el momento no hay sellos oficiales de aval académico disponibles para generar tu constancia. El comité organizador ya está al tanto; vuelve a intentarlo más tarde o contáctalos directamente.";
const PAGINA_VISTA_PREVIA = 1;

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
  if (!solicitud.omitirChequeoHabilitado) {
    const habilitado = await getConfiguracion<boolean>("constancias_habilitadas", false);
    if (!habilitado) {
      return { ok: false, codigo: "deshabilitado", mensaje: MENSAJE_DESHABILITADO };
    }
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

  let paginaPdfOrigen: number;

  if (solicitud.modoVistaPrevia) {
    // Solo lectura: si ya existe una asignación REAL para este registro
    // (p. ej. porque ya descargó su constancia de verdad), se usa esa
    // misma — mostrarla no es "consumir" nada nuevo. Si no existe, se usa
    // una página fija de vista previa sin tocar folios_aval_academico.
    const { data: asignacionExistente } = await supabase
      .from("folios_aval_academico")
      .select("pagina_pdf_origen")
      .eq("registro_id", coincidencia.id)
      .maybeSingle();

    paginaPdfOrigen = asignacionExistente?.pagina_pdf_origen ?? PAGINA_VISTA_PREVIA;
  } else {
    // Asignación atómica real — una sola llamada RPC, una sola transacción
    // en Postgres (ver 0010_folios_aval_academico.sql). Idempotente: si el
    // registro ya tiene folio, regresa el mismo; nunca asigna uno nuevo a
    // quien ya tiene.
    const { data: asignacion, error: errorAsignacion } = await supabase.rpc("asignar_folio_aval", {
      p_registro_id: coincidencia.id,
    });

    if (errorAsignacion) {
      if (errorAsignacion.message.includes("SIN_FOLIOS_DISPONIBLES")) {
        return { ok: false, codigo: "sin_folios", mensaje: MENSAJE_SIN_FOLIOS };
      }
      return { ok: false, codigo: "invalido", mensaje: MENSAJE_INVALIDO };
    }

    const fila = asignacion?.[0];
    if (!fila) {
      return { ok: false, codigo: "invalido", mensaje: MENSAJE_INVALIDO };
    }
    paginaPdfOrigen = fila.pagina_pdf_origen;
  }

  const pdfDoc = await construirConstanciaPdfDoc(coincidencia.nombre);
  await anexarPaginaSello(pdfDoc, paginaPdfOrigen);
  const pdf = Buffer.from(await pdfDoc.save());

  return {
    ok: true,
    pdf,
    nombreArchivo: `Constancia-${coincidencia.folio}.pdf`,
  };
}
