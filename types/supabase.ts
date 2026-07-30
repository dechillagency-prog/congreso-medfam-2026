/**
 * Tipos de la base de datos — mismo formato que genera el Supabase CLI.
 *
 * Este archivo se escribió a mano para que el proyecto compile y tenga
 * autocompletado completo ANTES de conectar un proyecto real de Supabase.
 * En cuanto tengas el proyecto creado y las migraciones aplicadas,
 * regenera este archivo con el comando real (ver README.md):
 *
 *   npx supabase gen types typescript --project-id <tu-project-id> > types/supabase.ts
 *
 * Eso garantiza que el tipado quede sincronizado byte a byte con el
 * esquema real, incluyendo cualquier ajuste que hagas después.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string;
          nombre: string;
          rol: "super_admin" | "organizador";
          created_at: string;
        };
        Insert: {
          id: string;
          nombre: string;
          rol?: "super_admin" | "organizador";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admins"]["Insert"]>;
        Relationships: [];
      };
      registros: {
        Row: {
          id: string;
          folio: string;
          nombre: string;
          correo: string;
          celular: string;
          estado: string;
          especialidad: string;
          tipo_inscripcion: "federado" | "no_federado" | "residente";
          comprobante_url: string | null;
          estatus_pago: "pendiente" | "confirmado" | "rechazado";
          aprobado_por: string | null;
          fecha_aprobacion: string | null;
          motivo_rechazo: string | null;
          codigo_qr: string | null;
          constancia_url: string | null;
          asistencia_confirmada: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          folio?: string;
          nombre: string;
          correo: string;
          celular: string;
          estado: string;
          especialidad: string;
          tipo_inscripcion: "federado" | "no_federado" | "residente";
          comprobante_url?: string | null;
          estatus_pago?: "pendiente" | "confirmado" | "rechazado";
          aprobado_por?: string | null;
          fecha_aprobacion?: string | null;
          motivo_rechazo?: string | null;
          codigo_qr?: string | null;
          constancia_url?: string | null;
          asistencia_confirmada?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["registros"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "registros_aprobado_por_fkey";
            columns: ["aprobado_por"];
            isOneToOne: false;
            referencedRelation: "admins";
            referencedColumns: ["id"];
          }
        ];
      };
      comprobantes: {
        Row: {
          id: string;
          registro_id: string;
          storage_path: string;
          url: string;
          subido_en: string;
        };
        Insert: {
          id?: string;
          registro_id: string;
          storage_path: string;
          url: string;
          subido_en?: string;
        };
        Update: Partial<Database["public"]["Tables"]["comprobantes"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "comprobantes_registro_id_fkey";
            columns: ["registro_id"];
            isOneToOne: false;
            referencedRelation: "registros";
            referencedColumns: ["id"];
          }
        ];
      };
      ponentes: {
        Row: {
          id: string;
          nombre: string;
          especialidad: string;
          estado: string;
          foto_url: string | null;
          bio: string | null;
          orden: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          especialidad: string;
          estado: string;
          foto_url?: string | null;
          bio?: string | null;
          orden?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ponentes"]["Insert"]>;
        Relationships: [];
      };
      conferencias: {
        Row: {
          id: string;
          dia: "miercoles" | "jueves" | "viernes" | "sabado";
          hora_inicio: string;
          hora_fin: string;
          titulo: string;
          ponente_id: string | null;
          sala: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          dia: "miercoles" | "jueves" | "viernes" | "sabado";
          hora_inicio: string;
          hora_fin: string;
          titulo: string;
          ponente_id?: string | null;
          sala?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["conferencias"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "conferencias_ponente_id_fkey";
            columns: ["ponente_id"];
            isOneToOne: false;
            referencedRelation: "ponentes";
            referencedColumns: ["id"];
          }
        ];
      };
      categorias_patrocinio: {
        Row: {
          id: string;
          nombre: string;
          orden: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          orden?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categorias_patrocinio"]["Insert"]>;
        Relationships: [];
      };
      patrocinadores: {
        Row: {
          id: string;
          nombre: string;
          categoria_id: string;
          logo_url: string;
          url: string | null;
          orden: number;
        };
        Insert: {
          id?: string;
          nombre: string;
          categoria_id: string;
          logo_url: string;
          url?: string | null;
          orden?: number;
        };
        Update: Partial<Database["public"]["Tables"]["patrocinadores"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "patrocinadores_categoria_id_fkey";
            columns: ["categoria_id"];
            isOneToOne: false;
            referencedRelation: "categorias_patrocinio";
            referencedColumns: ["id"];
          }
        ];
      };
      configuraciones: {
        Row: {
          clave: string;
          valor: Json;
          updated_at: string;
        };
        Insert: {
          clave: string;
          valor: Json;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["configuraciones"]["Insert"]>;
        Relationships: [];
      };
      checkins: {
        Row: {
          id: string;
          registro_id: string;
          registrado_por: string | null;
          checked_in_at: string;
        };
        Insert: {
          id?: string;
          registro_id: string;
          registrado_por?: string | null;
          checked_in_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["checkins"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "checkins_registro_id_fkey";
            columns: ["registro_id"];
            isOneToOne: true;
            referencedRelation: "registros";
            referencedColumns: ["id"];
          }
        ];
      };
      asistencia_conferencias: {
        Row: {
          id: string;
          registro_id: string;
          conferencia_id: string;
          checked_in_at: string;
        };
        Insert: {
          id?: string;
          registro_id: string;
          conferencia_id: string;
          checked_in_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["asistencia_conferencias"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "asistencia_conferencias_registro_id_fkey";
            columns: ["registro_id"];
            isOneToOne: false;
            referencedRelation: "registros";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "asistencia_conferencias_conferencia_id_fkey";
            columns: ["conferencia_id"];
            isOneToOne: false;
            referencedRelation: "conferencias";
            referencedColumns: ["id"];
          }
        ];
      };
      encuestas: {
        Row: {
          id: string;
          titulo: string;
          conferencia_id: string | null;
          preguntas: Json;
          activa: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          conferencia_id?: string | null;
          preguntas?: Json;
          activa?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["encuestas"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "encuestas_conferencia_id_fkey";
            columns: ["conferencia_id"];
            isOneToOne: false;
            referencedRelation: "conferencias";
            referencedColumns: ["id"];
          }
        ];
      };
      encuesta_respuestas: {
        Row: {
          id: string;
          encuesta_id: string;
          registro_id: string | null;
          respuestas: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          encuesta_id: string;
          registro_id?: string | null;
          respuestas: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["encuesta_respuestas"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "encuesta_respuestas_encuesta_id_fkey";
            columns: ["encuesta_id"];
            isOneToOne: false;
            referencedRelation: "encuestas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "encuesta_respuestas_registro_id_fkey";
            columns: ["registro_id"];
            isOneToOne: false;
            referencedRelation: "registros";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      vista_estadisticas_congreso: {
        Row: {
          total_registros: number | null;
          total_confirmados: number | null;
          total_pendientes: number | null;
          total_rechazados: number | null;
          total_checkins: number | null;
          total_federados: number | null;
          total_no_federados: number | null;
          total_residentes: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_super_admin: { Args: Record<string, never>; Returns: boolean };
      aprobar_registro: {
        Args: { p_registro_id: string };
        Returns: Database["public"]["Tables"]["registros"]["Row"];
      };
      rechazar_registro: {
        Args: { p_registro_id: string; p_motivo: string };
        Returns: Database["public"]["Tables"]["registros"]["Row"];
      };
      registrar_checkin: {
        Args: { p_codigo_qr: string };
        Returns: Database["public"]["Tables"]["registros"]["Row"];
      };
      generar_folio: { Args: Record<string, never>; Returns: string };
      generar_codigo_qr: { Args: { p_folio: string }; Returns: string };
    };
    Enums: {
      tipo_inscripcion: "federado" | "no_federado" | "residente";
      estatus_pago: "pendiente" | "confirmado" | "rechazado";
    };
    CompositeTypes: Record<string, never>;
  };
}

// Atajos de conveniencia usados en toda la app
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
