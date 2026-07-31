"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AccionResult {
  success: boolean;
  message?: string;
}

/**
 * Aprueba un registro: cambia estatus_pago a 'confirmado', registra quién y
 * cuándo aprobó, y genera codigo_qr si aún no existe. Todo ocurre dentro de
 * la función `aprobar_registro` en Postgres (security definer), que valida
 * is_admin() internamente — no se necesita la service_role key aquí.
 */
export async function aprobarRegistro(id: string): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("aprobar_registro", { p_registro_id: id });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/dashboard/${id}`);
  return { success: true };
}

export async function rechazarRegistro(id: string, motivo: string): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("rechazar_registro", {
    p_registro_id: id,
    p_motivo: motivo || "No especificado",
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/dashboard/${id}`);
  return { success: true };
}

/** Regresa un registro a 'pendiente' — por si se aprobó/rechazó por error. */
export async function reabrirRegistro(id: string): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("registros")
    .update({ estatus_pago: "pendiente", motivo_rechazo: null })
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/dashboard/${id}`);
  return { success: true };
}
