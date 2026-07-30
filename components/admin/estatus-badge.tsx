import type { EstatusPago } from "@/types";
import { cn } from "@/lib/utils/cn";

const STYLES: Record<EstatusPago, string> = {
  pendiente: "bg-gold/10 text-gold",
  confirmado: "bg-primary/10 text-primary",
  rechazado: "bg-red-50 text-red-600",
};

const LABELS: Record<EstatusPago, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  rechazado: "Rechazado",
};

export function EstatusBadge({ estatus }: { estatus: EstatusPago }) {
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", STYLES[estatus])}>
      {LABELS[estatus]}
    </span>
  );
}
