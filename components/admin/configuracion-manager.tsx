"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Configuracion } from "@/types";
import { guardarConfiguracion, eliminarConfiguracion } from "@/app/admin/dashboard/configuracion/actions";

// Claves conocidas del sistema — se editan con un input dedicado y no se pueden borrar.
const CLAVES_CONOCIDAS: Record<string, { label: string; tipo: "number" | "boolean" | "date" }> = {
  cupo_maximo: { label: "Cupo máximo de asistentes", tipo: "number" },
  fecha_limite_tarifa_preferencial: { label: "Fecha límite tarifa preferencial", tipo: "date" },
  inscripciones_abiertas: { label: "Inscripciones abiertas", tipo: "boolean" },
};

export function ConfiguracionManager({ configuraciones }: { configuraciones: Configuracion[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [valores, setValores] = useState<Record<string, string>>(
    Object.fromEntries(configuraciones.map((c) => [c.clave, formatearValor(c.valor)]))
  );
  const [nuevaClave, setNuevaClave] = useState("");
  const [nuevoValor, setNuevoValor] = useState("");
  const [error, setError] = useState<string | null>(null);

  function guardar(clave: string, tipo?: "number" | "boolean" | "date") {
    setError(null);
    const raw = valores[clave] ?? "";
    let valor: unknown = raw;
    if (tipo === "number") valor = Number(raw);
    if (tipo === "boolean") valor = raw === "true";
    if (!tipo) {
      try {
        valor = JSON.parse(raw);
      } catch {
        valor = raw; // se guarda como string plano si no es JSON válido
      }
    }
    startTransition(async () => {
      const res = await guardarConfiguracion(clave, valor as never);
      if (!res.success) setError(res.message ?? "No se pudo guardar.");
      router.refresh();
    });
  }

  function crearNueva() {
    if (!nuevaClave) return;
    setError(null);
    let valor: unknown;
    try {
      valor = JSON.parse(nuevoValor);
    } catch {
      valor = nuevoValor;
    }
    startTransition(async () => {
      const res = await guardarConfiguracion(nuevaClave, valor as never);
      if (!res.success) return setError(res.message ?? "No se pudo crear.");
      setNuevaClave("");
      setNuevoValor("");
      router.refresh();
    });
  }

  function eliminar(clave: string) {
    if (!confirm(`¿Eliminar la configuración "${clave}"?`)) return;
    startTransition(() => {
      eliminarConfiguracion(clave).then(() => router.refresh());
    });
  }

  const conocidas = configuraciones.filter((c) => CLAVES_CONOCIDAS[c.clave]);
  const otras = configuraciones.filter((c) => !CLAVES_CONOCIDAS[c.clave]);

  return (
    <div className="mt-6 max-w-2xl space-y-10">
      {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div>
        <h2 className="text-lg font-bold text-ink">Ajustes del evento</h2>
        <div className="mt-4 space-y-4">
          {conocidas.map((c) => {
            const meta = CLAVES_CONOCIDAS[c.clave];
            return (
              <div key={c.clave} className="flex items-end gap-3 rounded-2xl border border-border p-4">
                <div className="flex-1">
                  <label className="mb-1.5 block text-sm font-medium text-ink">{meta.label}</label>
                  {meta.tipo === "boolean" ? (
                    <select
                      className="input"
                      value={valores[c.clave]}
                      onChange={(e) => setValores({ ...valores, [c.clave]: e.target.value })}
                    >
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      className="input"
                      type={meta.tipo === "date" ? "date" : "number"}
                      value={valores[c.clave] ?? ""}
                      onChange={(e) => setValores({ ...valores, [c.clave]: e.target.value })}
                    />
                  )}
                </div>
                <Button size="sm" onClick={() => guardar(c.clave, meta.tipo)} disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-ink">Otras configuraciones</h2>
        <p className="mt-1 text-xs text-body/50">Valores libres en formato JSON (texto, número, true/false, listas, objetos).</p>
        <div className="mt-4 space-y-3">
          {otras.map((c) => (
            <div key={c.clave} className="flex items-end gap-3 rounded-2xl border border-border p-4">
              <div className="flex-1">
                <label className="mb-1.5 block text-sm font-medium text-ink">{c.clave}</label>
                <input
                  className="input font-mono text-xs"
                  value={valores[c.clave] ?? ""}
                  onChange={(e) => setValores({ ...valores, [c.clave]: e.target.value })}
                />
              </div>
              <Button size="sm" variant="outline" onClick={() => guardar(c.clave)} disabled={isPending}>
                <Save className="h-4 w-4" />
              </Button>
              <button onClick={() => eliminar(c.clave)} className="text-body/40 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-end gap-3 rounded-2xl border border-dashed border-border p-4">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-ink">Nueva clave</label>
            <input className="input" placeholder="p. ej. banner_aviso" value={nuevaClave} onChange={(e) => setNuevaClave(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-ink">Valor (JSON)</label>
            <input className="input font-mono text-xs" placeholder='"texto" o 123 o true' value={nuevoValor} onChange={(e) => setNuevoValor(e.target.value)} />
          </div>
          <Button size="sm" onClick={crearNueva} disabled={isPending || !nuevaClave}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatearValor(valor: unknown): string {
  if (typeof valor === "string") return valor.replace(/^"|"$/g, "");
  return JSON.stringify(valor);
}
