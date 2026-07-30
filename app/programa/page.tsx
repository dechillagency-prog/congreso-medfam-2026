import { createClient } from "@/lib/supabase/server";
import { ProgramaTabs } from "@/components/sections/programa-tabs";
import type { Conferencia, Ponente } from "@/types";

export default async function ProgramaPage() {
  const supabase = await createClient();
  const [{ data: conferencias }, { data: ponentes }] = await Promise.all([
    supabase.from("conferencias").select("*").order("dia").order("hora_inicio"),
    supabase.from("ponentes").select("*"),
  ]);

  return (
    <section className="section-pad">
      <div className="mx-auto max-w-4xl px-6">
        <p className="eyebrow text-center">Programa académico</p>
        <h1 className="mt-4 text-center text-4xl font-bold text-ink">
          14 al 17 de octubre, 2026
        </h1>

        <ProgramaTabs
          conferencias={(conferencias as Conferencia[]) ?? []}
          ponentes={(ponentes as Ponente[]) ?? []}
        />
      </div>
    </section>
  );
}
