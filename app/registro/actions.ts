"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { registroSchema } from "@/lib/validations/registro";

export interface RegistroActionState {
  success: boolean;
  message: string;
  folio?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const ACCEPTED_CARTA_FEDERADA_TYPES = ["application/pdf"];

export type EstadoCorreoRegistro = "pendiente" | "confirmado" | "rechazado" | null;

/**
 * Revisa si un correo ya tiene registro(s) y con qué estatus. Un correo
 * puede tener más de un registro (p. ej. uno rechazado y luego otro nuevo),
 * así que prioriza el estatus más "activo": confirmado > pendiente >
 * rechazado. `null` significa que el correo no tiene ningún registro.
 *
 * Usa el cliente admin (service_role) a propósito: quien llena el
 * formulario público no tiene sesión, y `registros` solo es legible por
 * admins vía RLS — igual que el resto de este archivo.
 */
async function obtenerEstadoCorreo(correo: string): Promise<EstadoCorreoRegistro> {
  const correoNormalizado = correo.trim().toLowerCase();
  if (!correoNormalizado) return null;

  const supabase = await createAdminClient();
  const { data } = await supabase
    .from("registros")
    .select("estatus_pago")
    .ilike("correo", correoNormalizado);

  if (!data || data.length === 0) return null;
  if (data.some((r) => r.estatus_pago === "confirmado")) return "confirmado";
  if (data.some((r) => r.estatus_pago === "pendiente")) return "pendiente";
  return "rechazado";
}

/**
 * Validación previa en el cliente (onBlur del campo correo). Es solo UX —
 * la validación que realmente importa se repite dentro de
 * `registrarAsistente` antes de insertar, porque el cliente nunca es de
 * fiar.
 */
export async function verificarCorreoExistente(correo: string): Promise<EstadoCorreoRegistro> {
  return obtenerEstadoCorreo(correo);
}

export async function registrarAsistente(
  _prev: RegistroActionState,
  formData: FormData
): Promise<RegistroActionState> {
  const raw = {
    nombre: formData.get("nombre")?.toString() ?? "",
    correo: formData.get("correo")?.toString() ?? "",
    celular: formData.get("celular")?.toString() ?? "",
    estado: formData.get("estado")?.toString() ?? "",
    especialidad: formData.get("especialidad")?.toString() ?? "",
    tipo_inscripcion: formData.get("tipo_inscripcion")?.toString() ?? "",
    aceptaPrivacidad: formData.get("aceptaPrivacidad") === "on",
  };

  const parsed = registroSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.",
    };
  }

  // No confiar solo en la validación del cliente: se repite aquí antes de
  // insertar. Pendiente o confirmado bloquean un nuevo registro; rechazado
  // permite volver a registrarse con el mismo correo.
  const estadoCorreo = await obtenerEstadoCorreo(parsed.data.correo);
  if (estadoCorreo === "pendiente" || estadoCorreo === "confirmado") {
    return {
      success: false,
      message:
        estadoCorreo === "confirmado"
          ? "Este correo ya cuenta con una inscripción aprobada. No es necesario realizar un nuevo registro."
          : "Ya encontramos un registro con este correo electrónico. Si deseas actualizar tu comprobante o corregir información, comunícate con el comité organizador para evitar registros duplicados.",
    };
  }

  const comprobante = formData.get("comprobante") as File | null;
  if (!comprobante || comprobante.size === 0) {
    return { success: false, message: "Sube tu comprobante de pago." };
  }
  if (comprobante.size > MAX_FILE_SIZE) {
    return { success: false, message: "El comprobante no debe exceder 5MB." };
  }
  if (!ACCEPTED_TYPES.includes(comprobante.type)) {
    return { success: false, message: "Formato de comprobante no permitido (usa JPG, PNG o PDF)." };
  }

  // La Carta Federada solo aplica (y es obligatoria) para "Socios Federados".
  const cartaFederada = formData.get("carta_federada") as File | null;
  if (parsed.data.tipo_inscripcion === "federado") {
    if (!cartaFederada || cartaFederada.size === 0) {
      return { success: false, message: "Sube tu Carta Federada." };
    }
    if (cartaFederada.size > MAX_FILE_SIZE) {
      return { success: false, message: "La Carta Federada no debe exceder 5MB." };
    }
    if (!ACCEPTED_CARTA_FEDERADA_TYPES.includes(cartaFederada.type)) {
      return { success: false, message: "Formato de Carta Federada no permitido (usa PDF)." };
    }
  }

const supabase = await createAdminClient();

  // 1. Subir comprobante al bucket privado "comprobantes"
  const ext = comprobante.name.split(".").pop();
  const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("comprobantes")
    .upload(path, comprobante, { contentType: comprobante.type });

  if (uploadError) {
  console.error(uploadError);

  return {
    success: false,
    message: uploadError.message,
  };
}

const comprobantePath = path;

  // 1.b. Subir Carta Federada al bucket privado "cartas-federadas" (solo federados)
  let cartaFederadaPath: string | null = null;
  if (parsed.data.tipo_inscripcion === "federado" && cartaFederada) {
    const cartaExt = cartaFederada.name.split(".").pop();
    cartaFederadaPath = `${Date.now()}-${crypto.randomUUID()}.${cartaExt}`;

    const { error: cartaUploadError } = await supabase.storage
      .from("cartas-federadas")
      .upload(cartaFederadaPath, cartaFederada, { contentType: cartaFederada.type });

    if (cartaUploadError) {
      console.error(cartaUploadError);

      return {
        success: false,
        message: cartaUploadError.message,
      };
    }
  }

  // 2. Insertar el registro (el folio se genera automáticamente en la base de datos)
  const { data: registro, error: insertError } = await supabase
    .from("registros")
    .insert({
      nombre: parsed.data.nombre,
      correo: parsed.data.correo,
      celular: parsed.data.celular,
      estado: parsed.data.estado,
      especialidad: parsed.data.especialidad,
      tipo_inscripcion: parsed.data.tipo_inscripcion,
      comprobante_url: comprobantePath,
      carta_federada_url: cartaFederadaPath,
      estatus_pago: "pendiente",
    })
    .select("id, folio")
    .single();

  if (insertError) {
  console.error(insertError);

  return {
    success: false,
    message: insertError.message,
  };
}

  // 3. Guardar el comprobante también en la tabla de historial (permite
  // re-subir más adelante si el pago es rechazado, sin perder el rastro).
  await supabase.from("comprobantes").insert({
    registro_id: registro.id,
    storage_path: path,
    url: comprobantePath,
  });

  // TODO: disparar correo de "Confirmación de registro" aquí una vez
  // que se conecte un proveedor de correo (ver lib/email/README.md).

  return {
    success: true,
    message: "¡Registro recibido! Te contactaremos para confirmar tu pago.",
    folio: registro.folio,
  };
}
