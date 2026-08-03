import { z } from "zod";

export const ESTADOS_MX = [
  "Coahuila", "Nuevo León", "Tamaulipas", "Durango", "Chihuahua",
  "San Luis Potosí", "Zacatecas", "Otro",
] as const;

export const TIPOS_INSCRIPCION = [
  { value: "federado", label: "Socios Federados", precio: 2600 },
  { value: "no_federado", label: "No Federados", precio: 2900 },
  { value: "residente", label: "Residentes", precio: 1800 },
] as const;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const ACCEPTED_CARTA_FEDERADA_TYPES = ["application/pdf"];

export const registroSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "Escribe tu nombre completo")
    .max(120, "El nombre es demasiado largo"),
  correo: z.string().trim().email("Escribe un correo válido"),
  celular: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "El celular debe tener 10 dígitos, sin espacios ni guiones"),
  estado: z.enum(ESTADOS_MX, { errorMap: () => ({ message: "Selecciona tu estado" }) }),
  especialidad: z.string().trim().min(2, "Indica tu especialidad").max(120),
  tipo_inscripcion: z.enum(["federado", "no_federado", "residente"], {
    errorMap: () => ({ message: "Selecciona un tipo de inscripción" }),
  }),
  aceptaPrivacidad: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar el aviso de privacidad" }),
  }),
});

export type RegistroFormValues = z.infer<typeof registroSchema>;

// Validación del archivo en el cliente (el input file no se maneja bien con
// react-hook-form + zod resolver directamente, se valida aparte).
export function validarComprobante(file: File | null): string | null {
  if (!file) return "Sube tu comprobante de pago";
  if (file.size > MAX_FILE_SIZE) return "El archivo no debe exceder 5MB";
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) return "Formato no permitido (usa JPG, PNG o PDF)";
  return null;
}

// La Carta Federada solo es obligatoria para "Socios Federados".
export function validarCartaFederada(file: File | null, tipoInscripcion: string): string | null {
  if (tipoInscripcion !== "federado") return null;
  if (!file) return "Sube tu Carta Federada";
  if (file.size > MAX_FILE_SIZE) return "El archivo no debe exceder 5MB";
  if (!ACCEPTED_CARTA_FEDERADA_TYPES.includes(file.type)) return "Formato no permitido (usa PDF)";
  return null;
}

// Chequeo rápido de formato antes de consultar el backend por un correo
// duplicado — evita disparar la consulta con un correo a medio escribir.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function esCorreoValido(correo: string): boolean {
  return EMAIL_REGEX.test(correo.trim());
}
