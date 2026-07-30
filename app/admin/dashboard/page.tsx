import { createClient } from "@/lib/supabase/server";
import type { Registro } from "@/types";
import { EstatusBadge } from "@/components/admin/estatus-badge";
import { AccionesRegistro } from "@/components/admin/acciones-registro";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: total }, { count: pendientes }, { count: confirmados }, { data: registros }] =
    await Promise.all([
      supabase.from("registros").select("*", { count: "exact", head: true }),
      supabase.from("registros").select("*", { count: "exact", head: true }).eq("estatus_pago", "pendiente"),
      supabase.from("registros").select("*", { count: "exact", head: true }).eq("estatus_pago", "confirmado"),
      supabase.from("registros").select("*").order("created_at", { ascending: false }).limit(100),
    ]);

  const lista = (registros as Registro[]) ?? [];

  // Distribución por especialidad y estado (para las tarjetas resumen)
  const porEspecialidad = countBy(lista, (r) => r.especialidad);
  const porEstado = countBy(lista, (r) => r.estado);

  return (
    <section className="mx-auto max-w-8xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Registros</h1>
          <p className="text-sm text-body/60">Aprobación de pagos y seguimiento de asistentes</p>
        </div>
        <a href="/api/admin/export-csv">
          <button className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:border-primary hover:text-primary">
            Exportar CSV
          </button>
        </a>
      </div>


      {/* Tarjetas resumen */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total inscritos" value={total ?? 0} />
        <StatCard label="Pagos pendientes" value={pendientes ?? 0} tone="amber" />
        <StatCard label="Pagos confirmados" value={confirmados ?? 0} tone="green" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <BreakdownCard title="Por especialidad" data={porEspecialidad} />
        <BreakdownCard title="Por estado" data={porEstado} />
      </div>

      {/* Tabla de asistentes */}
      <div className="mt-10 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-body/50">
            <tr>
              <th className="px-4 py-3">Folio / QR</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Comprobante</th>
              <th className="px-4 py-3">Estatus</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="px-4 py-3">
                  <p className="font-mono text-xs font-semibold text-ink">{r.folio}</p>
                  {r.codigo_qr && (
                    <p className="mt-0.5 font-mono text-[10px] text-body/40">{r.codigo_qr}</p>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-ink">{r.nombre}</td>
                <td className="px-4 py-3 text-body/70">{r.correo}</td>
                <td className="px-4 py-3 text-body/70">{r.tipo_inscripcion}</td>
                <td className="px-4 py-3">
                  {r.comprobante_url ? (
                    <a href={r.comprobante_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      Ver
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <EstatusBadge estatus={r.estatus_pago} />
                  {r.estatus_pago === "rechazado" && r.motivo_rechazo && (
                    <p className="mt-1 max-w-[160px] text-[11px] text-body/50">{r.motivo_rechazo}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <AccionesRegistro id={r.id} estatusActual={r.estatus_pago} />
                </td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-body/50">
                  Aún no hay registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "amber" | "green" }) {
  const color = tone === "amber" ? "text-gold" : tone === "green" ? "text-primary" : "text-ink";
  return (
    <div className="rounded-2xl border border-border p-6">
      <p className="text-xs uppercase tracking-wide text-body/50">{label}</p>
      <p className={`mt-2 font-display text-3xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

function BreakdownCard({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 6);
  return (
    <div className="rounded-2xl border border-border p-6">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <ul className="mt-3 space-y-2">
        {entries.map(([key, count]) => (
          <li key={key} className="flex items-center justify-between text-sm text-body/70">
            <span>{key}</span>
            <span className="font-semibold text-ink">{count}</span>
          </li>
        ))}
        {entries.length === 0 && <li className="text-sm text-body/40">Sin datos aún.</li>}
      </ul>
    </div>
  );
}

function countBy<T>(arr: T[], fn: (item: T) => string): Record<string, number> {
  return arr.reduce((acc, item) => {
    const key = fn(item) || "Sin especificar";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
