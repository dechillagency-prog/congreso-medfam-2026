"use client";

import { useState } from "react";
import { MessageCircle, AlertTriangle, Loader2 } from "lucide-react";
import { prepararConfirmacionWhatsApp } from "@/app/admin/dashboard/actions";
import { cn } from "@/lib/utils/cn";

type Estado = "idle" | "loading" | "error" | "bloqueado";

/**
 * Botón de confirmación por WhatsApp. Al hacer clic:
 * 1. Llama a la Server Action, que genera (o reutiliza) la Carta de
 *    Congresista y arma el mensaje con su liga.
 * 2. Solo cuando la respuesta está lista abre wa.me — nunca se abre una
 *    pestaña vacía primero.
 * Sigue siendo solo un enlace manual a wa.me: no envía nada por sí mismo,
 * el admin revisa el mensaje y lo envía él mismo desde WhatsApp.
 */
export function WhatsAppConfirmacionLink({
  id,
  nombre,
  folio,
  estatusPago,
  ligaComunidad,
  cartaGenerada,
  compact = false,
}: {
  id: string;
  nombre: string;
  folio: string;
  estatusPago: string;
  ligaComunidad: string | null;
  cartaGenerada: boolean;
  compact?: boolean;
}) {
  const [estado, setEstado] = useState<Estado>("idle");
  const [error, setError] = useState<string | null>(null);
  const [enlacePendiente, setEnlacePendiente] = useState<string | null>(null);

  if (estatusPago !== "confirmado") return null;

  async function iniciarConfirmacion() {
    if (estado === "loading") return;
    setEstado("loading");
    setError(null);
    setEnlacePendiente(null);

    const resultado = await prepararConfirmacionWhatsApp(id);

    if (!resultado.success || !resultado.data) {
      setEstado("error");
      setError(resultado.message ?? "No se pudo preparar la confirmación");
      return;
    }

    // El navegador puede bloquear window.open() aquí porque ya no ocurre de
    // forma síncrona dentro del clic (hubo un await de por medio). Si eso
    // pasa, no se pierde el enlace: se deja un botón manual para abrirlo.
    const ventana = window.open(resultado.data.enlaceWhatsApp, "_blank", "noopener,noreferrer");
    if (!ventana) {
      setEstado("bloqueado");
      setEnlacePendiente(resultado.data.enlaceWhatsApp);
      return;
    }

    setEstado("idle");
  }

  const etiqueta =
    estado === "loading"
      ? cartaGenerada
        ? "Preparando WhatsApp..."
        : "Generando carta..."
      : "Enviar confirmación por WhatsApp";

  return (
    <div className={compact ? "flex flex-col items-start gap-1" : "flex flex-wrap items-center gap-3"}>
      <button
        type="button"
        onClick={iniciarConfirmacion}
        disabled={estado === "loading"}
        title={`${nombre} — ${folio}`}
        className={cn(
          compact
            ? "flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
            : "inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        {estado === "loading" ? (
          <Loader2 className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4", "animate-spin")} />
        ) : (
          <MessageCircle className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        )}
        {etiqueta}
      </button>

      {!ligaComunidad && (
        <span
          className="flex items-center gap-1 text-[11px] font-medium text-amber-600"
          title='Configura la clave "whatsapp_comunidad_url" en Configuración del evento'
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Sin liga de comunidad configurada
        </span>
      )}

      {estado === "error" && error && (
        <span className="flex items-center gap-1 text-[11px] font-medium text-red-600">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {error}
        </span>
      )}

      {estado === "bloqueado" && enlacePendiente && (
        <a
          href={enlacePendiente}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setEstado("idle")}
          className="flex items-center gap-1 text-[11px] font-semibold text-primary underline"
        >
          Tu navegador bloqueó la ventana — abrir WhatsApp manualmente
        </a>
      )}
    </div>
  );
}
