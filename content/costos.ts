import { TIPOS_INSCRIPCION } from "@/lib/validations/registro";

type TipoInscripcion = (typeof TIPOS_INSCRIPCION)[number]["value"];

export type PlanCosto = {
  value: TipoInscripcion;
  label: string;
  precio: number;
  incluye: string[];
};

export const COSTOS_COPY = {
  eyebrow: "Inversión",
  titulo: "Costos de inscripción",
  descripcion: "Precios en pesos mexicanos (MXN). Incluye acceso completo al congreso.",
};

const INCLUYE: Record<TipoInscripcion, string[]> = {
  federado: [
    "Acceso a las 4 sesiones",
    "Constancia con valor curricular",
    "Material del congreso",
    "Coffee breaks",
  ],
  no_federado: [
    "Acceso a las 4 sesiones",
    "Constancia con valor curricular",
    "Material del congreso",
    "Coffee breaks",
  ],
  residente: ["Acceso a las 4 sesiones", "Constancia con valor curricular", "Material del congreso"],
};

export const PLANES_COSTOS: PlanCosto[] = TIPOS_INSCRIPCION.map((tipo) => ({
  ...tipo,
  incluye: INCLUYE[tipo.value],
}));
