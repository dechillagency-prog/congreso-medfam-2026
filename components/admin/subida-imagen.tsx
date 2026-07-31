"use client";

import { useState, useTransition } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { SubirImagenResult } from "@/lib/supabase/storage";

/**
 * Input de URL + botón de subida directa a Storage. Mantiene compatibilidad
 * con URLs existentes (externas o ya subidas antes): el campo de texto
 * siempre queda editable a mano, subir un archivo solo lo rellena con la
 * URL pública resultante.
 */
export function SubidaImagen({
  value,
  onChange,
  accion,
  campoArchivo,
  label,
  className,
}: {
  value: string;
  onChange: (url: string) => void;
  accion: (formData: FormData) => Promise<SubirImagenResult>;
  campoArchivo: string;
  label: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File | null) {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set(campoArchivo, file);
      const res = await accion(formData);
      if (!res.success) {
        setError(res.message);
        return;
      }
      onChange(res.url);
    });
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <input className="input flex-1" placeholder={label} value={value} onChange={(e) => onChange(e.target.value)} />
        {value && (
          // eslint-disable-next-line @next/next/no-img-element -- preview de URL arbitraria, no solo imágenes propias del sitio
          <img src={value} alt="" className="h-11 w-11 shrink-0 rounded-lg border border-border object-cover" />
        )}
        <label
          className={cn(
            "flex h-11 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg border border-dashed border-border px-3 text-sm text-body/70 transition-colors hover:border-primary hover:text-primary",
            isPending && "pointer-events-none opacity-60"
          )}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          Subir
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={isPending}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
