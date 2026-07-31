"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Plus, Trash2, Save, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Configuracion } from "@/types";
import { guardarConfiguracion, eliminarConfiguracion } from "@/app/admin/dashboard/configuracion/actions";

// Claves conocidas del sistema — se editan con un input dedicado, siempre visibles
// en "Ajustes del evento" (aunque todavía no exista la fila en la base de datos),
// y no se pueden borrar.
const CLAVES_CONOCIDAS: Record<
  string,
  { label: string; tipo: "number" | "boolean" | "date" | "text"; validar?: (valor: string) => string | null }
> = {
  cupo_maximo: { label: "Cupo máximo de asistentes", tipo: "number" },
  fecha_limite_tarifa_preferencial: { label: "Fecha límite tarifa preferencial", tipo: "date" },
  inscripciones_abiertas: { label: "Inscripciones abiertas", tipo: "boolean" },
  whatsapp_comunidad_url: {
    label: "Liga de la comunidad de WhatsApp",
    tipo: "text",
    validar: validarLigaWhatsApp,
  },
};

function validarLigaWhatsApp(valor: string): string | null {
  const limpio = valor.trim();
  if (!limpio) return null; // vacío permitido
  let url: URL;
  try {
    url = new URL(limpio);
  } catch {
    return "Debe ser una URL válida (https://chat.whatsapp.com/…) o dejarse vacío.";
  }
  if (url.protocol !== "https:" || url.hostname !== "chat.whatsapp.com") {
    return "Debe ser una liga de comunidad de WhatsApp (https://chat.whatsapp.com/…).";
  }
  return null;
}

export function ConfiguracionManager({ configuraciones }: { configuraciones: Configuracion[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [valores, setValores] = useState<Record<string, string>>(() => {
    const base = Object.fromEntries(configuraciones.map((c) => [c.clave, formatearValor(c.valor)]));
    // Las claves conocidas siempre tienen un valor en el estado (vacío si aún
    // no existe la fila en la base de datos), para que el campo se muestre
    // desde el primer momento en "Ajustes del evento".
    for (const clave of Object.keys(CLAVES_CONOCIDAS)) {
      if (!(clave in base)) base[clave] = "";
    }
    return base;
  });
  const [nuevaClave, setNuevaClave] = useState("");
  const [nuevoValor, setNuevoValor] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Qué clave está en vuelo en este momento — así el spinner solo aparece en
  // el botón que realmente está guardando, no en todos a la vez.
  const [claveGuardando, setClaveGuardando] = useState<string | null>(null);

  // Feedback específico de "whatsapp_comunidad_url" (mensaje visible dentro
  // de su propia tarjeta). Las demás claves conocidas conservan su
  // comportamiento actual (banner de error genérico arriba, sin mensaje de éxito).
  const [whatsappFeedback, setWhatsappFeedback] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  function guardar(clave: string, tipo?: "number" | "boolean" | "date" | "text") {
    setError(null);
    if (clave === "whatsapp_comunidad_url") setWhatsappFeedback(null);

    const raw = valores[clave] ?? "";

    const validar = CLAVES_CONOCIDAS[clave]?.validar;
    if (validar) {
      const mensajeError = validar(raw);
      if (mensajeError) {
        if (clave === "whatsapp_comunidad_url") {
          setWhatsappFeedback({ tipo: "error", texto: mensajeError });
        } else {
          setError(mensajeError);
        }
        return;
      }
    }

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

    setClaveGuardando(clave);
    startTransition(async () => {
      const res = await guardarConfiguracion(clave, valor as never);
      setClaveGuardando(null);

      if (!res.success) {
        if (clave === "whatsapp_comunidad_url") {
          setWhatsappFeedback({ tipo: "error", texto: "No se pudo guardar la liga. Intenta nuevamente." });
        } else {
          setError(res.message ?? "No se pudo guardar.");
        }
        router.refresh();
        return;
      }

      if (clave === "whatsapp_comunidad_url") {
        setWhatsappFeedback({ tipo: "exito", texto: "Liga de WhatsApp guardada correctamente." });
      }
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

  const clavesConocidas = Object.keys(CLAVES_CONOCIDAS);
  const otras = configuraciones.filter((c) => !CLAVES_CONOCIDAS[c.clave]);

  return (
    <div className="mt-6 max-w-2xl space-y-10">
      {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div>
        <h2 className="text-lg font-bold text-ink">Ajustes del evento</h2>
        <div className="mt-4 space-y-4">
          {clavesConocidas.map((clave) => {
            const meta = CLAVES_CONOCIDAS[clave];
            const guardandoEstaClave = isPending && claveGuardando === clave;
            const feedback = clave === "whatsapp_comunidad_url" ? whatsappFeedback : null;
            return (
              <div key={clave} className="rounded-2xl border border-border p-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-sm font-medium text-ink">{meta.label}</label>
                    {meta.tipo === "boolean" ? (
                      <select
                        className="input"
                        value={valores[clave] ?? ""}
                        onChange={(e) => setValores({ ...valores, [clave]: e.target.value })}
                      >
                        <option value="true">Sí</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      <input
                        className="input"
                        type={meta.tipo === "date" ? "date" : meta.tipo === "text" ? "text" : "number"}
                        placeholder={meta.tipo === "text" ? "https://chat.whatsapp.com/…" : undefined}
                        value={valores[clave] ?? ""}
                        onChange={(e) => {
                          setValores({ ...valores, [clave]: e.target.value });
                          if (clave === "whatsapp_comunidad_url") setWhatsappFeedback(null);
                        }}
                      />
                    )}
                  </div>
                  <Button size="sm" onClick={() => guardar(clave, meta.tipo)} disabled={isPending}>
                    {guardandoEstaClave ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>
                {feedback && (
                  <p
                    className={
                      feedback.tipo === "exito"
                        ? "mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700"
                        : "mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                    }
                  >
                    {feedback.tipo === "exito" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0" />
                    )}
                    {feedback.texto}
                  </p>
                )}
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
