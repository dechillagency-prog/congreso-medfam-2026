import { createClient } from "@/lib/supabase/server";
import type { Ponente } from "@/types";
import { PonentesManager } from "@/components/admin/ponentes-manager";

export default async function AdminPonentesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("ponentes").select("*").order("orden", { ascending: true });

  return (
    <section className="mx-auto max-w-8xl px-6 py-12">
      <h1 className="text-2xl font-bold text-ink">Ponentes</h1>
      <p className="text-sm text-body/60">CRUD completo — se reflejan de inmediato en /ponentes</p>
      <PonentesManager ponentes={(data as Ponente[]) ?? []} />
    </section>
  );
}
