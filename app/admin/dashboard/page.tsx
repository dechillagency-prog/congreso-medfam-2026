import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import type { Registro, EstatusPago, TipoInscripcion } from "@/types";
import { TIPOS_INSCRIPCION } from "@/lib/validations/registro";
import { EstatusBadge } from "@/components/admin/estatus-badge";
import { AccionesRegistro } from "@/components/admin/acciones-registro";
import { FiltrosRegistros } from "@/components/admin/filtros-registros";

const PRECIOS: Record<TipoInscripcion, number> = Object.fromEntries(
  TIPOS_INSCRIPCION.map((tipo) => [tipo.value, tipo.precio])
) as Record<TipoInscripcion, number>;

interface AdminDashboardPageProps {
  searchParams: Promise<{
    q?: string;
    estatus?: string;
    tipo?: string;
  }>;
}

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const { q = "", estatus = "", tipo = "" } = await searchParams;
  const supabase = await createAdminClient();

  const [
    totalResult,
    pendientesResult,
    aprobadosResult,
    rechazadosResult,
    aprobadosDataResult,
  ] = await Promise.all([
    supabase
      .from("registros")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("registros")
      .select("*", { count: "exact", head: true })
      .eq("estatus_pago", "pendiente"),

    supabase
      .from("registros")
      .select("*", { count: "exact", head: true })
      .eq("estatus_pago", "confirmado"),

    supabase
      .from("registros")
      .select("*", { count: "exact", head: true })
      .eq("estatus_pago", "rechazado"),

    supabase
      .from("registros")
      .select("tipo_inscripcion")
      .eq("estatus_pago", "confirmado"),
  ]);

  const total = totalResult.count ?? 0;
  const pendientes = pendientesResult.count ?? 0;
  const aprobados = aprobadosResult.count ?? 0;
  const rechazados = rechazadosResult.count ?? 0;

  const aprobadosData =
    (aprobadosDataResult.data as Pick<
      Registro,
      "tipo_inscripcion"
    >[] | null) ?? [];

  const ingresosAprobados = aprobadosData.reduce(
    (sum, registro) =>
      sum + (PRECIOS[registro.tipo_inscripcion] ?? 0),
    0
  );

  let query = supabase
    .from("registros")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (q.trim()) {
    const termino = q.trim().replaceAll(",", " ");

    query = query.or(
      `nombre.ilike.%${termino}%,correo.ilike.%${termino}%,folio.ilike.%${termino}%`
    );
  }

  if (estatus) {
    query = query.eq(
      "estatus_pago",
      estatus as EstatusPago
    );
  }

  if (tipo) {
    query = query.eq(
      "tipo_inscripcion",
      tipo as TipoInscripcion
    );
  }

  const { data: registros, error: registrosError } = await query;

  if (registrosError) {
    console.error(
      "Error al obtener registros del panel:",
      registrosError
    );
  }

  const lista = (registros as Registro[] | null) ?? [];

  return (
    <section className="mx-auto max-w-8xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Registros
          </h1>

          <p className="text-sm text-body/60">
            Aprobación de pagos y seguimiento de asistentes
          </p>
        </div>

        <a href="/api/admin/export-csv">
          <button
            type="button"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:border-primary hover:text-primary"
          >
            Exportar CSV
          </button>
        </a>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total inscritos"
          value={total}
        />

        <StatCard
          label="Pagos pendientes"
          value={pendientes}
          tone="amber"
        />

        <StatCard
          label="Pagos aprobados"
          value={aprobados}
          tone="green"
        />

        <StatCard
          label="Pagos rechazados"
          value={rechazados}
          tone="red"
        />

        <StatCard
          label="Ingresos aprobados"
          value={`$${ingresosAprobados.toLocaleString("es-MX")}`}
          tone="green"
        />
      </div>

      <FiltrosRegistros
        q={q}
        estatus={estatus}
        tipo={tipo}
      />

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-body/50">
            <tr>
              <th className="px-4 py-3">Folio</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Estatus</th>
              <th className="px-4 py-3">
                Fecha de registro
              </th>
              <th className="px-4 py-3">Acción</th>
              <th className="px-4 py-3">Detalle</th>
            </tr>
          </thead>

          <tbody>
            {lista.map((registro) => (
              <tr
                key={registro.id}
                className="border-t border-border align-top"
              >
                <td className="px-4 py-3">
                  <p className="font-mono text-xs font-semibold text-ink">
                    {registro.folio}
                  </p>

                  {registro.codigo_qr && (
                    <p className="mt-0.5 font-mono text-[10px] text-body/40">
                      {registro.codigo_qr}
                    </p>
                  )}
                </td>

                <td className="px-4 py-3 font-medium text-ink">
                  {registro.nombre}
                </td>

                <td className="px-4 py-3 text-body/70">
                  {registro.correo}
                </td>

                <td className="px-4 py-3 text-body/70">
                  {registro.tipo_inscripcion}
                </td>

                <td className="px-4 py-3">
                  <EstatusBadge
                    estatus={registro.estatus_pago}
                  />

                  {registro.estatus_pago === "rechazado" &&
                    registro.motivo_rechazo && (
                      <p className="mt-1 max-w-[160px] text-[11px] text-body/50">
                        {registro.motivo_rechazo}
                      </p>
                    )}
                </td>

                <td className="px-4 py-3 text-body/60">
                  {new Date(
                    registro.created_at
                  ).toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                <td className="px-4 py-3">
                  <AccionesRegistro
                    id={registro.id}
                    estatusActual={registro.estatus_pago}
                  />
                </td>

                <td className="px-4 py-3">
                  <Link
                    href={`/admin/dashboard/${registro.id}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}

            {lista.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-body/50"
                >
                  No hay registros que coincidan con la
                  búsqueda o los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  tone?: "amber" | "green" | "red";
}

function StatCard({
  label,
  value,
  tone,
}: StatCardProps) {
  const color =
    tone === "amber"
      ? "text-gold"
      : tone === "green"
        ? "text-primary"
        : tone === "red"
          ? "text-red-600"
          : "text-ink";

  return (
    <div className="rounded-2xl border border-border p-6">
      <p className="text-xs uppercase tracking-wide text-body/50">
        {label}
      </p>

      <p
        className={`mt-2 font-display text-3xl font-extrabold ${color}`}
      >
        {value}
      </p>
    </div>
  );
}