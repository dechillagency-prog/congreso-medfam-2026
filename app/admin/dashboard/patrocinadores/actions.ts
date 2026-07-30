"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/supabase";

export interface AccionResult {
  success: boolean;
  message?: string;
}

export async function crearPatrocinador(data: TablesInsert<"patrocinadores">): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("patrocinadores").insert(data);
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/dashboard/patrocinadores");
  revalidatePath("/patrocinadores");
  return { success: true };
}

export async function actualizarPatrocinador(id: string, data: TablesUpdate<"patrocinadores">): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("patrocinadores").update(data).eq("id", id);
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/dashboard/patrocinadores");
  revalidatePath("/patrocinadores");
  return { success: true };
}

export async function eliminarPatrocinador(id: string): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("patrocinadores").delete().eq("id", id);
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/dashboard/patrocinadores");
  revalidatePath("/patrocinadores");
  return { success: true };
}
