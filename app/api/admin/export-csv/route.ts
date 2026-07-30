import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Registro } from "@/types";

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
    headers.map((h) => csvEscape(String(r[h as keyof Registro] ?? ""))).join(",")
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
