import type { Tables } from "@/types/supabase";

// Todos los tipos de dominio se derivan del Database generado —
// un solo lugar de verdad. Si el esquema cambia, se regenera
// types/supabase.ts y estos alias se actualizan solos.
export type Registro = Tables<"registros">;
export type Comprobante = Tables<"comprobantes">;
export type Admin = Tables<"admins">;
export type Configuracion = Tables<"configuraciones">;
export type Ponente = Tables<"ponentes">;
export type Conferencia = Tables<"conferencias">;
export type CategoriaPatrocinio = Tables<"categorias_patrocinio">;
export type Patrocinador = Tables<"patrocinadores">;
export type Checkin = Tables<"checkins">;
export type AsistenciaConferencia = Tables<"asistencia_conferencias">;
export type Encuesta = Tables<"encuestas">;
export type EncuestaRespuesta = Tables<"encuesta_respuestas">;

export type TipoInscripcion = Registro["tipo_inscripcion"];
export type EstatusPago = Registro["estatus_pago"];

export interface CostoInscripcion {
  tipo: TipoInscripcion;
  label: string;
  precio: number;
  moneda: "MXN";
}

// Patrocinador con su categoría ya unida (para las pantallas que
// hacen `select("*, categoria:categorias_patrocinio(*)")`)
export type PatrocinadorConCategoria = Patrocinador & {
  categoria: CategoriaPatrocinio | null;
};

// Conferencia con su ponente ya unido
export type ConferenciaConPonente = Conferencia & {
  ponente: Ponente | null;
};
