"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/supabase";

export interface AccionResult {
  success: boolean;
  message?: string;
}

export async function guardarConfiguracion(clave: string, valor: Json): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("configuraciones").upsert({ clave, valor });
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/dashboard/configuracion");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function eliminarConfiguracion(clave: string): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("configuraciones").delete().eq("clave", clave);
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/dashboard/configuracion");
  return { success: true };
}
