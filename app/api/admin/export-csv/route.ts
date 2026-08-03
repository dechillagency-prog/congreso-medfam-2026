import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { formatearFechaHora } from "@/lib/utils/fecha";
import type { Registro } from "@/types";

// Columnas que son timestamps UTC y deben mostrarse en hora de Monterrey,
// igual que en el resto del panel — no se toca el valor guardado en la base,
// solo cómo se escribe en el CSV.
const COLUMNAS_FECHA = new Set<keyof Registro>(["created_at", "fecha_aprobacion"]);

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const registros = data as Registro[];

  const headers = [
    "folio", "nombre", "correo", "celular", "estado",
    "especialidad", "tipo_inscripcion", "estatus_pago", "motivo_rechazo",
    "codigo_qr", "fecha_aprobacion", "created_at",
  ];

  const rows = registros.map((r) =>
    headers
      .map((h) => {
        const clave = h as keyof Registro;
        const valor = r[clave];
        const texto = COLUMNAS_FECHA.has(clave) ? formatearFechaHora(valor as string | null) : String(valor ?? "");
        return csvEscape(texto === "—" ? "" : texto);
      })
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="registros-congreso-medfam-${Date.now()}.csv"`,
    },
  });
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
