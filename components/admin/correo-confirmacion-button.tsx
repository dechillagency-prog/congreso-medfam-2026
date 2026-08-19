"use client";

import { useEffect, useState } from "react";
import { Mail, AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import { enviarCorreoRegistro, reenviarCorreoRegistro } from "@/app/admin/dashboard/actions";
import { formatearFechaHora } from "@/lib/utils/fecha";
import { cn } from "@/lib/utils/cn";

type Estado = "idle" | "loading" | "error";

/**
 * Estado del correo de confirmación dentro del bloque "Carta de
 * congresista". Cubre tanto registros nuevos (donde el correo ya se
 * intentó automáticamente al usar "Enviar confirmación por WhatsApp") como
 * registros históricos con carta ya generada pero sin correo enviado
 * (a quienes ya se les compartió la carta por WhatsApp antes de que
 * existiera esta función) — en ambos casos aparece "Enviar correo de
 * confirmación"; una vez enviado, se sustituye por "Reenviar correo".
 *
 * No genera la carta, no toca WhatsApp, no regenera el PDF: reutiliza
 * exactamente lo que ya existe.
 */
export function CorreoConfirmacionButton({
  id,
  correoEnviadoEn,
}: {
  id: string;
  correoEnviadoEn: string | null;
}) {
  const [estado, setEstado] = useState<Estado>("idle");
  const [error, setError] = useState<string | null>(null);
  const [enviadoEn, setEnviadoEn] = useState(correoEnviadoEn);

  // El botón "Enviar confirmación por WhatsApp" también puede enviar este
  // correo automáticamente (registros nuevos) — cuando eso pasa, el
  // servidor revalida la página y este componente recibe un
  // `correoEnviadoEn` nuevo por props; sin este efecto, el useState inicial
  // no lo reflejaría hasta un refresco manual.
  useEffect(() => {
    setEnviadoEn(correoEnviadoEn);
  }, [correoEnviadoEn]);

  const yaEnviado = Boolean(enviadoEn);

  async function manejarClic() {
    if (estado === "loading") return;
    setEstado("loading");
    setError(null);

    const resultado = yaEnviado ? await reenviarCorreoRegistro(id) : await enviarCorreoRegistro(id);

    if (!resultado.success) {
      setEstado("error");
      setError(resultado.message ?? "No se pudo enviar el correo");
      return;
    }

    setEstado("idle");
    if (!resultado.yaEstabaEnviado) {
      setEnviadoEn(new Date().toISOString());
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-ink">
        Correo de confirmación:{" "}
        <span className={cn("font-semibold", yaEnviado ? "text-primary" : "text-body/50")}>
          {yaEnviado ? "Enviado" : "Pendiente"}
        </span>
      </p>
      {yaEnviado && enviadoEn && (
        <p className="text-xs text-body/40">Enviado el {formatearFechaHora(enviadoEn)}</p>
      )}

      <button
        type="button"
        onClick={manejarClic}
        disabled={estado === "loading"}
        className={cn(
          "inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60",
          yaEnviado
            ? "border border-border text-ink hover:border-primary hover:text-primary"
            : "bg-primary/10 text-primary hover:bg-primary/20"
        )}
      >
        {estado === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : yaEnviado ? (
          <RotateCcw className="h-4 w-4" />
        ) : (
          <Mail className="h-4 w-4" />
        )}
        {estado === "loading" ? "Enviando..." : yaEnviado ? "Reenviar correo" : "Enviar correo de confirmación"}
      </button>

      {estado === "error" && error && (
        <span className="flex items-center gap-1 text-[11px] font-medium text-red-600">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {error}
        </span>
      )}
    </div>
  );
}
