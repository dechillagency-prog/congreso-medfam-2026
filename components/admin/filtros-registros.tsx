"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

const ESTATUS_OPCIONES = [
  { value: "", label: "Todos los estatus" },
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "rechazado", label: "Rechazado" },
];

const TIPO_OPCIONES = [
  { value: "", label: "Todos los tipos" },
  { value: "federado", label: "Socios Federados" },
  { value: "no_federado", label: "No Federados" },
  { value: "residente", label: "Residentes" },
];

export function FiltrosRegistros({ q, estatus, tipo }: { q: string; estatus: string; tipo: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [texto, setTexto] = useState(q);

  function actualizar(params: { q?: string; estatus?: string; tipo?: string }) {
    const next = new URLSearchParams({
      q: params.q ?? q,
      estatus: params.estatus ?? estatus,
      tipo: params.tipo ?? tipo,
    });
    // Quita las claves vacías para que la URL quede limpia
    for (const key of ["q", "estatus", "tipo"]) {
      if (!next.get(key)) next.delete(key);
    }
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        actualizar({ q: texto });
      }}
      className="mt-6 flex flex-wrap items-center gap-3"
    >
      <div className="relative flex-1 min-w-[220px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body/40" />
        <input
          className="input pl-9"
          placeholder="Buscar por nombre, correo o folio..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>

      <select
        className="input w-auto"
        value={estatus}
        onChange={(e) => actualizar({ estatus: e.target.value })}
      >
        {ESTATUS_OPCIONES.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <select
        className="input w-auto"
        value={tipo}
        onChange={(e) => actualizar({ tipo: e.target.value })}
      >
        {TIPO_OPCIONES.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <button
        type="submit"
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
      >
        Buscar
      </button>

      {(q || estatus || tipo) && (
        <button
          type="button"
          onClick={() => { setTexto(""); router.push(pathname); }}
          className="text-xs font-medium text-body/50 hover:text-ink"
        >
          Limpiar filtros
        </button>
      )}
    </form>
  );
}
