"use client";

import { useState } from "react";
import { MessageCircle, AlertTriangle, Loader2 } from "lucide-react";
import { prepararConfirmacionWhatsApp } from "@/app/admin/dashboard/actions";
import { cn } from "@/lib/utils/cn";

type Estado = "idle" | "loading" | "error" | "bloqueado";

/** Heurística estándar de user-agent — no hay forma 100% confiable sin ella. */
function esDispositivoMovil(): boolean {
  return /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);
}

/**
 * Botón de confirmación por WhatsApp. Al hacer clic:
 * 1. Llama a la Server Action, que genera (o reutiliza) la Carta de
 *    Congresista y arma el mensaje con su liga.
 * 2. Solo cuando la respuesta está lista abre WhatsApp — nunca se abre una
 *    pestaña vacía primero. En móvil usa wa.me (mejor compatibilidad con la
 *    app); en desktop usa WhatsApp Web directo (evita la pantalla
 *    intermedia de wa.me que ahí solo sugiere "usar WhatsApp Web").
 * Sigue siendo solo un enlace manual: no envía nada por sí mismo, el admin
 * revisa el mensaje y lo envía él mismo desde WhatsApp.
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
  const [correoError, setCorreoError] = useState<string | null>(null);

  if (estatusPago !== "confirmado") return null;

  async function iniciarConfirmacion() {
    if (estado === "loading") return;
    setEstado("loading");
    setError(null);
    setEnlacePendiente(null);
    setCorreoError(null);

    const resultado = await prepararConfirmacionWhatsApp(id);

    if (!resultado.success || !resultado.data) {
      setEstado("error");
      setError(resultado.message ?? "No se pudo preparar la confirmación");
      return;
    }

    // WhatsApp sigue su curso aunque el correo haya fallado — solo se avisa,
    // sin bloquear nada; "Enviar correo de confirmación" queda disponible
    // en el bloque de la carta para reintentar.
    if (resultado.data.correoError) {
      setCorreoError(resultado.data.correoError);
    }

    const enlaceElegido = esDispositivoMovil()
      ? resultado.data.enlaceWhatsApp
      : resultado.data.enlaceWhatsAppWeb;

    // El navegador puede bloquear window.open() aquí porque ya no ocurre de
    // forma síncrona dentro del clic (hubo un await de por medio). Si eso
    // pasa, no se pierde el enlace: se deja un botón manual para abrirlo.
    const ventana = window.open(enlaceElegido, "_blank", "noopener,noreferrer");
    if (!ventana) {
      setEstado("bloqueado");
      setEnlacePendiente(enlaceElegido);
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

      {correoError && (
        <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> WhatsApp listo, pero el correo de confirmación falló: {correoError}
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
