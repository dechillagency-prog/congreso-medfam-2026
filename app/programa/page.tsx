import { existsSync } from "fs";
import path from "path";
import { Download, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProgramaTabs } from "@/components/sections/programa-tabs";
import { Button } from "@/components/ui/button";
import { PROGRAMA_PDF } from "@/content/programa";
import type { Conferencia, Ponente } from "@/types";

export default async function ProgramaPage() {
  const supabase = await createClient();
  const [{ data: conferencias }, { data: ponentes }] = await Promise.all([
    supabase.from("conferencias").select("*").order("dia").order("hora_inicio"),
    supabase.from("ponentes").select("*"),
  ]);

  const pdfDisponible = existsSync(path.join(process.cwd(), "public", "documents", path.basename(PROGRAMA_PDF.ruta)));

  return (
    <section className="section-pad">
      <div className="mx-auto max-w-4xl px-6">
        <p className="eyebrow text-center">Programa académico</p>
        <h1 className="mt-4 text-center text-4xl font-bold text-ink">
          14 al 17 de octubre, 2026
        </h1>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-4">
            <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:flex">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">{PROGRAMA_PDF.titulo}</h2>
              <p className="mt-1 text-sm text-body/70">{PROGRAMA_PDF.descripcion}</p>
            </div>
          </div>

          {pdfDisponible ? (
            <a href={PROGRAMA_PDF.ruta} target="_blank" rel="noopener noreferrer" download className="shrink-0">
              <Button variant="outline" className="whitespace-nowrap">
                <Download className="h-4 w-4" /> {PROGRAMA_PDF.boton}
              </Button>
            </a>
          ) : (
            <Button variant="outline" disabled className="shrink-0 whitespace-nowrap">
              <Download className="h-4 w-4" /> {PROGRAMA_PDF.botonNoDisponible}
            </Button>
          )}
        </div>

        <ProgramaTabs
          conferencias={(conferencias as Conferencia[]) ?? []}
          ponentes={(ponentes as Ponente[]) ?? []}
        />
      </div>
    </section>
  );
}
