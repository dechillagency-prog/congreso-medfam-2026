"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/supabase";

export interface AccionResult {
  success: boolean;
  message?: string;
}

export async function crearCategoria(data: TablesInsert<"categorias_patrocinio">): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("categorias_patrocinio").insert(data);
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/dashboard/categorias");
  revalidatePath("/admin/dashboard/patrocinadores");
  revalidatePath("/patrocinadores");
  return { success: true };
}

export async function actualizarCategoria(id: string, data: TablesUpdate<"categorias_patrocinio">): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("categorias_patrocinio").update(data).eq("id", id);
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/dashboard/categorias");
  revalidatePath("/admin/dashboard/patrocinadores");
  revalidatePath("/patrocinadores");
  return { success: true };
}

export async function eliminarCategoria(id: string): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("categorias_patrocinio").delete().eq("id", id);
  if (error) {
    // El error más probable es el FK: hay patrocinadores usando esta categoría
    return { success: false, message: "No se puede eliminar: hay patrocinadores en esta categoría." };
  }
  revalidatePath("/admin/dashboard/categorias");
  return { success: true };
}
