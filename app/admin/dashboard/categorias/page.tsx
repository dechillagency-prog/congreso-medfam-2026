import { createClient } from "@/lib/supabase/server";
import type { CategoriaPatrocinio } from "@/types";
import { CategoriasManager } from "@/components/admin/categorias-manager";

export default async function AdminCategoriasPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("categorias_patrocinio").select("*").order("orden");

  return (
    <section className="mx-auto max-w-8xl px-6 py-12">
      <h1 className="text-2xl font-bold text-ink">Categorías de patrocinio</h1>
      <p className="text-sm text-body/60">Se usan al crear o editar patrocinadores</p>
      <CategoriasManager categorias={(data as CategoriaPatrocinio[]) ?? []} />
    </section>
  );
}
