"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/supabase";

export interface AccionResult {
  success: boolean;
  message?: string;
}

export async function crearPonente(data: TablesInsert<"ponentes">): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("ponentes").insert(data);
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/dashboard/ponentes");
  revalidatePath("/ponentes");
  return { success: true };
}

export async function actualizarPonente(id: string, data: TablesUpdate<"ponentes">): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("ponentes").update(data).eq("id", id);
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/dashboard/ponentes");
  revalidatePath("/ponentes");
  return { success: true };
}

export async function eliminarPonente(id: string): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("ponentes").delete().eq("id", id);
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/dashboard/ponentes");
  revalidatePath("/ponentes");
  return { success: true };
}
