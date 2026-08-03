"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, FileText, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Input de archivo con confirmación visual inmediata tras seleccionar:
 * nombre real del archivo, ícono verde de "listo para enviarse", miniatura
 * si es imagen, y opción de quitar/reemplazar. Esto SOLO confirma la
 * selección local — el archivo aún no se ha enviado al servidor, por eso
 * nunca dice "subido correctamente".
 *
 * El <input type="file"> real permanece montado en todo momento con el
 * mismo `name`, así que el envío del formulario (FormData nativo) no
 * cambia en absoluto.
 */
export function CampoArchivo({
  name,
  accept,
  label,
  dropzoneTexto,
  archivo,
  error,
  onSeleccionar,
}: {
  name: string;
  accept: string;
  label: string;
  dropzoneTexto: string;
  archivo: File | null;
  error?: string | null;
  onSeleccionar: (file: File | null) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (archivo && archivo.type.startsWith("image/")) {
      const url = URL.createObjectURL(archivo);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [archivo]);

  function quitar() {
    if (inputRef.current) inputRef.current.value = "";
    onSeleccionar(null);
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink" htmlFor={inputId}>
        {label}
      </label>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        name={name}
        accept={accept}
        className="hidden"
        onChange={(e) => onSeleccionar(e.target.files?.[0] ?? null)}
      />

      {archivo ? (
        <div
          className={cn(
            "rounded-xl border px-4 py-3",
            error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"
          )}
        >
          <div className="flex items-center gap-3">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- preview local (object URL), no imagen del sitio
              <img
                src={previewUrl}
                alt=""
                className="h-12 w-12 shrink-0 rounded-lg border border-white object-cover"
              />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white bg-white text-primary">
                <FileText className="h-6 w-6" />
              </span>
            )}
            <div className="min-w-0 flex-1 text-left">
              {error ? (
                <p className="text-sm font-semibold text-red-700">{error}</p>
              ) : (
                <p className="flex items-center gap-1.5 text-sm font-semibold text-green-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> Archivo listo para enviarse
                </p>
              )}
              <p className="mt-0.5 truncate text-xs text-body/70" title={archivo.name}>
                {archivo.name}
              </p>
            </div>
            <button
              type="button"
              onClick={quitar}
              aria-label="Quitar archivo"
              className="shrink-0 rounded-full p-1.5 text-body/40 transition-colors hover:bg-white hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {!error && (
            <p className="mt-2 text-xs text-body/50">Puedes reemplazarlo antes de enviar el registro.</p>
          )}
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed bg-surface px-6 py-8 text-center transition-colors hover:border-primary",
            error ? "border-red-300" : "border-border"
          )}
        >
          <UploadCloud className="h-6 w-6 text-primary" />
          <span className="text-sm text-body/70">{dropzoneTexto}</span>
        </label>
      )}

      {!archivo && error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
