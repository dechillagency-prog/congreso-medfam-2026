"use client";

import { useState, useTransition } from "react";
import { Check, X, RotateCcw, Loader2 } from "lucide-react";
import { aprobarRegistro, rechazarRegistro, reabrirRegistro } from "@/app/admin/dashboard/actions";
import type { EstatusPago } from "@/types";

export function AccionesRegistro({ id, estatusActual }: { id: string; estatusActual: EstatusPago }) {
  const [isPending, startTransition] = useTransition();
  const [mostrarMotivo, setMostrarMotivo] = useState(false);
  const [motivo, setMotivo] = useState("");

  if (estatusActual === "confirmado") {
    return (
      <button
        disabled={isPending}
        onClick={() => startTransition(async () => { await reabrirRegistro(id); })}
        className="flex items-center gap-1.5 text-xs font-medium text-body/60 hover:text-ink"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reabrir
      </button>
    );
  }

  if (estatusActual === "rechazado") {
    return (
      <button
        disabled={isPending}
        onClick={() => startTransition(async () => { await reabrirRegistro(id); })}
        className="flex items-center gap-1.5 text-xs font-medium text-body/60 hover:text-ink"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reabrir
      </button>
    );
  }

  if (mostrarMotivo) {
    return (
      <div className="flex flex-col gap-2">
        <input
          autoFocus
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Motivo del rechazo"
          className="w-40 rounded-lg border border-border px-2 py-1 text-xs"
        />
        <div className="flex gap-2">
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await rechazarRegistro(id, motivo);
                setMostrarMotivo(false);
              })
            }
            className="rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white"
          >
            Confirmar
          </button>
          <button
            onClick={() => setMostrarMotivo(false)}
            className="rounded-lg border border-border px-2 py-1 text-xs"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isPending}
        onClick={() => startTransition(async () => { await aprobarRegistro(id); })}
        className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        Aprobar
      </button>
      <button
        disabled={isPending}
        onClick={() => setMostrarMotivo(true)}
        className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
      >
        <X className="h-3.5 w-3.5" /> Rechazar
      </button>
    </div>
  );
}
