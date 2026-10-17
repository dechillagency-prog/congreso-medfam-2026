"use client";

import { useState } from "react";
import { Download, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type TipoIdentificador = "folio" | "nombre";

export function ConstanciaForm() {
  const [tipoIdentificador, setTipoIdentificador] = useState<TipoIdentificador>("folio");
  const [identificador, setIdentificador] = useState("");
  const [verificacion, setVerificacion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setExito(false);
    setEnviando(true);

    try {
      const res = await fetch("/api/constancias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoIdentificador, identificador, verificacion }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ mensaje: "Ocurrió un error inesperado. Inténtalo de nuevo." }));
        setError(data.mensaje ?? "Ocurrió un error inesperado. Inténtalo de nuevo.");
        return;
      }

      const blob = await res.blob();
      const disposicion = res.headers.get("Content-Disposition") ?? "";
      const nombreArchivo = /filename="([^"]+)"/.exec(disposicion)?.[1] ?? "constancia.pdf";

      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = nombreArchivo;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);

      setExito(true);
    } catch {
      setError("No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-10 max-w-md space-y-5 text-left">
      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink">Buscar por</span>
        <div className="inline-flex rounded-lg border border-border p-1">
          {(["folio", "nombre"] as const).map((opcion) => (
            <button
              key={opcion}
              type="button"
              onClick={() => setTipoIdentificador(opcion)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tipoIdentificador === opcion ? "bg-primary text-white" : "text-body/60 hover:text-ink"
              }`}
            >
              {opcion === "folio" ? "Folio" : "Nombre completo"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="identificador" className="mb-1.5 block text-sm font-medium text-ink">
          {tipoIdentificador === "folio" ? "Folio" : "Nombre completo"}
        </label>
        <input
          id="identificador"
          className="input"
          placeholder={tipoIdentificador === "folio" ? "MF2026-0001" : "Dr. Juan Pérez López"}
          value={identificador}
          onChange={(e) => setIdentificador(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="verificacion" className="mb-1.5 block text-sm font-medium text-ink">
          Correo o celular con el que te registraste
        </label>
        <input
          id="verificacion"
          className="input"
          placeholder="correo@ejemplo.com o 8711234567"
          value={verificacion}
          onChange={(e) => setVerificacion(e.target.value)}
          required
        />
        <p className="mt-1.5 text-xs text-body/50">
          Es el dato con el que verificamos que la constancia te pertenece.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {exito && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Tu constancia se descargó correctamente. Revisa la carpeta de descargas de tu dispositivo.
        </div>
      )}

      <Button type="submit" className="w-full" disabled={enviando}>
        {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {enviando ? "Buscando..." : "Descargar mi constancia"}
      </Button>
    </form>
  );
}
