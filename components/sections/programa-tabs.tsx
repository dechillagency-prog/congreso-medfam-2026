"use client";

import { useState } from "react";
import { Clock, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Conferencia, Ponente } from "@/types";

const DIAS = [
  { key: "miercoles", label: "Miércoles", fecha: "14 Oct" },
  { key: "jueves", label: "Jueves", fecha: "15 Oct" },
  { key: "viernes", label: "Viernes", fecha: "16 Oct" },
  { key: "sabado", label: "Sábado", fecha: "17 Oct" },
] as const;

export function ProgramaTabs({ conferencias, ponentes }: { conferencias: Conferencia[]; ponentes: Ponente[] }) {
  const [activo, setActivo] = useState<(typeof DIAS)[number]["key"]>("miercoles");

  const nombrePonente = (id: string | null) => ponentes.find((p) => p.id === id)?.nombre;
  const delDia = conferencias
    .filter((c) => c.dia === activo)
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  return (
    <>
      <div className="mt-10 flex justify-center gap-2 overflow-x-auto">
        {DIAS.map((dia) => (
          <button
            key={dia.key}
            onClick={() => setActivo(dia.key)}
            className={cn(
              "rounded-full px-5 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap",
              activo === dia.key ? "bg-primary text-white" : "bg-surface text-body hover:bg-primary/10"
            )}
          >
            {dia.label} <span className="opacity-60">· {dia.fecha}</span>
          </button>
        ))}
      </div>

      <div className="relative mt-12 space-y-4 border-l border-border pl-8">
        {delDia.map((item) => (
          <div key={item.id} className="relative rounded-2xl border border-border bg-white p-6 shadow-card">
            <span className="absolute -left-[calc(2rem+5px)] top-8 h-2.5 w-2.5 rounded-full bg-primary" />
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <Clock className="h-3.5 w-3.5" /> {item.hora_inicio.slice(0, 5)} – {item.hora_fin.slice(0, 5)}
            </p>
            <h3 className="mt-2 text-lg font-bold text-ink">{item.titulo}</h3>
            {nombrePonente(item.ponente_id) && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-body/70">
                <User className="h-3.5 w-3.5" /> {nombrePonente(item.ponente_id)}
              </p>
            )}
            {item.sala && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-body/50">
                <MapPin className="h-3.5 w-3.5" /> {item.sala}
              </p>
            )}
          </div>
        ))}
        {delDia.length === 0 && (
          <p className="py-10 text-center text-body/50">Aún no hay actividades publicadas para este día.</p>
        )}
      </div>
    </>
  );
}
