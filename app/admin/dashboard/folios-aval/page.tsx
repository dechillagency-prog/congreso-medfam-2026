import { createClient } from "@/lib/supabase/server";
import { formatearFechaHora } from "@/lib/utils/fecha";

type FilaFolio = {
  id: string;
  folio: string;
  pagina_pdf_origen: number;
  estado: "disponible" | "asignado";
  asignado_en: string | null;
  registro: { folio: string; nombre: string } | null;
};

export default async function AdminFoliosAvalPage() {
  const supabase = await createClient();

  const [{ count: total }, { count: disponibles }, { count: asignados }, { data: filas }] = await Promise.all([
    supabase.from("folios_aval_academico").select("id", { count: "exact", head: true }),
    supabase
      .from("folios_aval_academico")
      .select("id", { count: "exact", head: true })
      .eq("estado", "disponible"),
    supabase
      .from("folios_aval_academico")
      .select("id", { count: "exact", head: true })
      .eq("estado", "asignado"),
    supabase
      .from("folios_aval_academico")
      .select("id, folio, pagina_pdf_origen, estado, asignado_en, registro:registros(folio, nombre)")
      .order("pagina_pdf_origen"),
  ]);

  const lista = (filas as unknown as FilaFolio[]) ?? [];

  return (
    <section className="mx-auto max-w-8xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Folios de Aval Académico</h1>
          <p className="text-sm text-body/60">
            Inventario de sellos oficiales para la Constancia de Participación de asistentes — exclusivo de
            esta categoría, no se comparte con ponentes, talleristas ni carteles científicos.
          </p>
        </div>

        <a href="/api/admin/export-folios-aval-csv">
          <button
            type="button"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:border-primary hover:text-primary"
          >
            Exportar CSV
          </button>
        </a>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total de folios" value={total ?? 0} />
        <StatCard label="Disponibles" value={disponibles ?? 0} tone="green" />
        <StatCard label="Asignados" value={asignados ?? 0} tone="amber" />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-body/50">
            <tr>
              <th className="px-4 py-3">Página PDF</th>
              <th className="px-4 py-3">Folio oficial</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Folio de registro</th>
              <th className="px-4 py-3">Congresista</th>
              <th className="px-4 py-3">Asignado el</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((f) => (
              <tr key={f.id} className="border-t border-border align-top">
                <td className="px-4 py-3 font-mono text-xs">{f.pagina_pdf_origen}</td>
                <td className="px-4 py-3 font-mono text-xs font-semibold text-ink">{f.folio}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      f.estado === "asignado"
                        ? "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800"
                        : "rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800"
                    }
                  >
                    {f.estado === "asignado" ? "Asignado" : "Disponible"}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{f.registro?.folio ?? "—"}</td>
                <td className="px-4 py-3">{f.registro?.nombre ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-body/60">
                  {f.asignado_en ? formatearFechaHora(f.asignado_en) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "green" | "amber" }) {
  const color = tone === "green" ? "text-primary" : tone === "amber" ? "text-amber-600" : "text-ink";
  return (
    <div className="rounded-2xl border border-border p-6">
      <p className="text-xs uppercase tracking-wide text-body/50">{label}</p>
      <p className={`mt-2 font-display text-3xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}
