import { MessageCircle, AlertTriangle } from "lucide-react";
import { construirEnlaceWhatsApp, construirMensajeConfirmacion } from "@/lib/utils/whatsapp";

/**
 * Enlace manual a wa.me con el mensaje de confirmación prellenado. Es solo un
 * <a target="_blank">: no cambia el estatus del registro, no llama ninguna
 * API externa, no confirma que el mensaje se haya entregado — el admin
 * revisa el mensaje y lo envía él mismo desde WhatsApp.
 *
 * Solo se muestra si el pago ya está confirmado; si no hay liga de
 * comunidad configurada, el mensaje se arma sin esa línea y se muestra un
 * aviso junto al botón.
 */
export function WhatsAppConfirmacionLink({
  nombre,
  folio,
  celular,
  estatusPago,
  ligaComunidad,
  compact = false,
}: {
  nombre: string;
  folio: string;
  celular: string;
  estatusPago: string;
  ligaComunidad: string | null;
  compact?: boolean;
}) {
  if (estatusPago !== "confirmado") return null;

  const mensaje = construirMensajeConfirmacion({ nombre, folio, ligaComunidad });
  const href = construirEnlaceWhatsApp(celular, mensaje);

  return (
    <div className={compact ? "flex flex-col items-start gap-1" : "flex flex-wrap items-center gap-3"}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={
          compact
            ? "flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
            : "inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
        }
      >
        <MessageCircle className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        Enviar confirmación por WhatsApp
      </a>
      {!ligaComunidad && (
        <span
          className="flex items-center gap-1 text-[11px] font-medium text-amber-600"
          title='Configura la clave "whatsapp_comunidad_url" en Configuración del evento'
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Sin liga de comunidad configurada
        </span>
      )}
    </div>
  );
}
