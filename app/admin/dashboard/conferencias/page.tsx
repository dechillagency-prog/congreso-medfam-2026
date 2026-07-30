import { createClient } from "@/lib/supabase/server";
import type { Conferencia, Ponente } from "@/types";
import { ConferenciasManager } from "@/components/admin/conferencias-manager";

export default async function AdminConferenciasPage() {
  const supabase = await createClient();
  const [{ data: conferencias }, { data: ponentes }] = await Promise.all([
    supabase.from("conferencias").select("*").order("dia").order("hora_inicio"),
    supabase.from("ponentes").select("*").order("orden"),
  ]);

  return (
    <section className="mx-auto max-w-8xl px-6 py-12">
      <h1 className="text-2xl font-bold text-ink">Conferencias</h1>
      <p className="text-sm text-body/60">Programa académico — se refleja de inmediato en /programa</p>
      <ConferenciasManager
        conferencias={(conferencias as Conferencia[]) ?? []}
        ponentes={(ponentes as Ponente[]) ?? []}
      />
    </section>
  );
}
