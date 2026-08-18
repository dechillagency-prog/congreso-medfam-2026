import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Stethoscope, Calendar, FileText } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { getComprobanteSignedUrl, getCartaFederadaSignedUrl } from "@/lib/supabase/storage";
import { getConfiguracion } from "@/lib/config";
import { formatearFechaHora, formatearFechaHoraCorta } from "@/lib/utils/fecha";
import type { Registro, Comprobante } from "@/types";
import { EstatusBadge } from "@/components/admin/estatus-badge";
import { AccionesRegistro } from "@/components/admin/acciones-registro";
import { WhatsAppConfirmacionLink } from "@/components/admin/whatsapp-confirmacion-link";

export default async function AdminRegistroDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createAdminClient();

  const { data: registro } = await supabase.from("registros").select("*").eq("id", id).maybeSingle();

  if (!registro) notFound();

  const r = registro as Registro;

  const [{ data: comprobantes }, aprobador] = await Promise.all([
    supabase
      .from("comprobantes")
      .select("*")
      .eq("registro_id", id)
      .order("subido_en", { ascending: false }),
    r.aprobado_por
      ? supabase.from("admins").select("nombre").eq("id", r.aprobado_por).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const historial = (comprobantes as Comprobante[]) ?? [];

  // Genera una URL firmada temporal (5 min) por cada comprobante del historial —
  // el bucket es privado, por lo que la URL pública guardada en el registro NO
  // sirve para verlos directamente.
  const historialConUrl = await Promise.all(
    historial.map(async (c) => ({
      ...c,
      signedUrl: await getComprobanteSignedUrl(c.storage_path),
    }))
  );

  const comprobanteActual = historialConUrl[0] ?? null;
  const nombreAprobador = aprobador?.data?.nombre ?? (r.aprobado_por ? "Administrador" : null);

  const cartaFederadaSignedUrl = r.carta_federada_url
    ? await getCartaFederadaSignedUrl(r.carta_federada_url)
    : null;

  const ligaComunidad = await getConfiguracion<string | null>("whatsapp_comunidad_url", null);

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/admin/dashboard" className="flex items-center gap-1.5 text-sm text-body/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Volver a Registros
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm font-semibold text-primary">{r.folio}</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{r.nombre}</h1>
          <div className="mt-2 flex items-center gap-3">
            <EstatusBadge estatus={r.estatus_pago} />
            {r.codigo_qr && <span className="font-mono text-xs text-body/40">{r.codigo_qr}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <AccionesRegistro id={r.id} estatusActual={r.estatus_pago} />
          <WhatsAppConfirmacionLink
            id={r.id}
            nombre={r.nombre}
            folio={r.folio}
            estatusPago={r.estatus_pago}
            ligaComunidad={ligaComunidad}
            cartaGenerada={Boolean(r.carta_token)}
          />
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Datos del asistente */}
        <div className="rounded-2xl border border-border p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-body/50">Datos del asistente</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Dato icon={<Mail className="h-4 w-4" />} label="Correo" value={r.correo} />
            <Dato icon={<Phone className="h-4 w-4" />} label="Celular" value={r.celular} />
            <Dato icon={<MapPin className="h-4 w-4" />} label="Estado" value={r.estado} />
            <Dato icon={<Stethoscope className="h-4 w-4" />} label="Especialidad" value={r.especialidad} />
            <Dato icon={<FileText className="h-4 w-4" />} label="Tipo de inscripción" value={r.tipo_inscripcion} />
            <Dato icon={<Calendar className="h-4 w-4" />} label="Fecha de registro" value={formatearFechaHora(r.created_at)} />
          </dl>
        </div>

        {/* Estatus de revisión */}
        <div className="rounded-2xl border border-border p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-body/50">Revisión del pago</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Dato label="Estatus actual" value={<EstatusBadge estatus={r.estatus_pago} />} />
            <Dato
              label={r.estatus_pago === "rechazado" ? "Rechazado por" : "Aprobado por"}
              value={nombreAprobador ?? "— (aún sin revisar)"}
            />
            <Dato
              label="Fecha de revisión"
              value={formatearFechaHora(r.fecha_aprobacion)}
            />
            {r.estatus_pago === "rechazado" && (
              <Dato label="Motivo del rechazo" value={r.motivo_rechazo ?? "No especificado"} />
            )}
            <Dato label="Asistencia confirmada (check-in)" value={r.asistencia_confirmada ? "Sí" : "Aún no"} />
          </dl>
        </div>
      </div>

      {/* Comprobante actual */}
      <div className="mt-8 rounded-2xl border border-border p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-body/50">Comprobante de pago</h2>
        {comprobanteActual ? (
          <div className="mt-4">
            {comprobanteActual.signedUrl ? (
              <a
                href={comprobanteActual.signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
              >
                <FileText className="h-4 w-4" /> Ver comprobante (enlace válido 5 minutos)
              </a>
            ) : (
              <p className="text-sm text-red-600">
                No se pudo generar el enlace del comprobante. Verifica que el archivo siga existiendo en Storage.
              </p>
            )}
            <p className="mt-2 text-xs text-body/40">
              Subido el {formatearFechaHora(comprobanteActual.subido_en)}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-body/50">Este registro no tiene ningún comprobante subido.</p>
        )}
      </div>

      {/* Carta Federada (solo aplica a Socios Federados) */}
      {r.tipo_inscripcion === "federado" && (
        <div className="mt-8 rounded-2xl border border-border p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-body/50">Carta Federada</h2>
          {r.carta_federada_url ? (
            cartaFederadaSignedUrl ? (
              <a
                href={cartaFederadaSignedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
              >
                <FileText className="h-4 w-4" /> Ver / descargar Carta Federada (enlace válido 5 minutos)
              </a>
            ) : (
              <p className="mt-3 text-sm text-red-600">
                No se pudo generar el enlace de la Carta Federada. Verifica que el archivo siga existiendo en Storage.
              </p>
            )
          ) : (
            <p className="mt-3 text-sm text-body/50">Este registro no tiene Carta Federada subida.</p>
          )}
        </div>
      )}

      {/* Carta de Congresista */}
      <div className="mt-8 rounded-2xl border border-border p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-body/50">Carta de congresista</h2>
        {r.carta_token && r.carta_generada_en ? (
          <div className="mt-4">
            <p className="text-sm text-ink">
              Estado: <span className="font-semibold text-primary">Generada</span>
            </p>
            <p className="mt-1 text-xs text-body/40">Generada el {formatearFechaHora(r.carta_generada_en)}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href={`/carta/${r.carta_token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
              >
                <FileText className="h-4 w-4" /> Ver carta
              </a>
              <a
                href={`/carta/${r.carta_token}?download=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink hover:border-primary hover:text-primary"
              >
                <FileText className="h-4 w-4" /> Descargar PDF
              </a>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-body/50">Estado: No generada</p>
        )}
        {r.whatsapp_confirmacion_iniciada_en && (
          <p className="mt-4 text-xs text-body/50">
            Confirmación WhatsApp iniciada: {formatearFechaHora(r.whatsapp_confirmacion_iniciada_en)}
          </p>
        )}
      </div>

      {/* Historial de comprobantes */}
      {historialConUrl.length > 1 && (
        <div className="mt-8 rounded-2xl border border-border p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-body/50">
            Historial de comprobantes ({historialConUrl.length})
          </h2>
          <p className="mt-1 text-xs text-body/50">
            Incluye comprobantes anteriores, por ejemplo si el asistente volvió a subir uno después de un rechazo.
          </p>
          <ul className="mt-4 space-y-2">
            {historialConUrl.map((c, i) => (
              <li key={c.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5 text-sm">
                <span className="text-body/70">
                  {i === 0 ? "Más reciente — " : ""}
                  {formatearFechaHoraCorta(c.subido_en)}
                </span>
                {c.signedUrl ? (
                  <a href={c.signedUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                    Ver
                  </a>
                ) : (
                  <span className="text-red-600">No disponible</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Dato({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="flex items-center gap-2 text-body/50">
        {icon}
        {label}
      </dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
