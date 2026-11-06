import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { regenerarConstanciaAsignada } from "@/lib/supabase/constancias";

/**
 * Ver/descargar la constancia de 2 páginas de un registro que YA tiene
 * folio de aval académico asignado — exclusiva del panel admin
 * (/admin/dashboard/folios-aval).
 *
 * Protección en dos niveles, a propósito más estricta que las demás rutas
 * admin de este proyecto (export-csv, constancias-prueba, que solo
 * verifican "hay sesión"): aquí se exige explícitamente is_admin() vía
 * RPC, no solo que exista un usuario autenticado. middleware.ts tampoco
 * cubre esta ruta (su matcher es "/admin/:path*", y esto vive bajo
 * "/api/admin/"), así que ambas verificaciones ocurren aquí mismo, antes
 * de tocar cualquier dato.
 *
 * Camino 100% de solo lectura: regenerarConstanciaAsignada() nunca llama
 * a asignar_folio_aval, así que no hay forma de que esta ruta consuma un
 * folio nuevo ni toque una asignación existente.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ mensaje: "No autorizado." }, { status: 401 });
  }

  const { data: esAdmin, error: errorAdmin } = await supabase.rpc("is_admin");
  if (errorAdmin || !esAdmin) {
    return NextResponse.json({ mensaje: "No autorizado." }, { status: 403 });
  }

  const registroId = request.nextUrl.searchParams.get("registroId");
  if (!registroId) {
    return NextResponse.json({ mensaje: "Falta registroId." }, { status: 400 });
  }

  const resultado = await regenerarConstanciaAsignada(registroId);
  if (!resultado.ok) {
    return NextResponse.json({ mensaje: resultado.mensaje }, { status: 404 });
  }

  const descargar = request.nextUrl.searchParams.get("download") === "1";

  return new NextResponse(new Uint8Array(resultado.pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${descargar ? "attachment" : "inline"}; filename="${resultado.nombreArchivo}"`,
      "Cache-Control": "no-store",
    },
  });
}
