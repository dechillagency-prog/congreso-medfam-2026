import { createClient } from "@/lib/supabase/server";
import type { Configuracion } from "@/types";
import { ConfiguracionManager } from "@/components/admin/configuracion-manager";

export default async function AdminConfiguracionPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("configuraciones").select("*").order("clave");

  return (
    <section className="mx-auto max-w-8xl px-6 py-12">
      <h1 className="text-2xl font-bold text-ink">Configuración del evento</h1>
      <p className="text-sm text-body/60">Ajustes globales, editables sin volver a desplegar el sitio</p>
      <ConfiguracionManager configuraciones={(data as Configuracion[]) ?? []} />
    </section>
  );
}
