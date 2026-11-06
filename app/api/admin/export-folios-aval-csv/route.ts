import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { formatearFechaHora } from "@/lib/utils/fecha";

type FilaExport = {
  pagina_pdf_origen: number;
  folio: string;
  estado: string;
  asignado_en: string | null;
  registro: { folio: string; nombre: string } | null;
};

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("folios_aval_academico")
    .select("pagina_pdf_origen, folio, estado, asignado_en, registro:registros(folio, nombre)")
    .order("pagina_pdf_origen");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const filas = (data as unknown as FilaExport[]) ?? [];

  const headers = ["pagina_pdf_origen", "folio_oficial", "estado", "folio_registro", "congresista", "asignado_en"];

  const rows = filas.map((f) =>
    [
      String(f.pagina_pdf_origen),
      f.folio,
      f.estado,
      f.registro?.folio ?? "",
      f.registro?.nombre ?? "",
      f.asignado_en ? formatearFechaHora(f.asignado_en) : "",
    ]
      .map(csvEscape)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="folios-aval-academico-${Date.now()}.csv"`,
    },
  });
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
