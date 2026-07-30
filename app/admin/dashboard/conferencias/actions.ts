"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/supabase";

export interface AccionResult {
  success: boolean;
  message?: string;
}

export async function crearConferencia(data: TablesInsert<"conferencias">): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("conferencias").insert(data);
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/dashboard/conferencias");
  revalidatePath("/programa");
  return { success: true };
}

export async function actualizarConferencia(id: string, data: TablesUpdate<"conferencias">): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("conferencias").update(data).eq("id", id);
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/dashboard/conferencias");
  revalidatePath("/programa");
  return { success: true };
}

export async function eliminarConferencia(id: string): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("conferencias").delete().eq("id", id);
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/dashboard/conferencias");
  revalidatePath("/programa");
  return { success: true };
}
