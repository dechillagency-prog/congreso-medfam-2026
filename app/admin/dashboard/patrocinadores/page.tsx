import { createClient } from "@/lib/supabase/server";
import type { Patrocinador, CategoriaPatrocinio } from "@/types";
import { PatrocinadoresManager } from "@/components/admin/patrocinadores-manager";

export default async function AdminPatrocinadoresPage() {
  const supabase = await createClient();
  const [{ data: patrocinadores }, { data: categorias }] = await Promise.all([
    supabase.from("patrocinadores").select("*").order("orden"),
    supabase.from("categorias_patrocinio").select("*").order("orden"),
  ]);

  return (
    <section className="mx-auto max-w-8xl px-6 py-12">
      <h1 className="text-2xl font-bold text-ink">Patrocinadores</h1>
      <p className="text-sm text-body/60">Se reflejan de inmediato en /patrocinadores</p>
      <PatrocinadoresManager
        patrocinadores={(patrocinadores as Patrocinador[]) ?? []}
        categorias={(categorias as CategoriaPatrocinio[]) ?? []}
      />
    </section>
  );
}
