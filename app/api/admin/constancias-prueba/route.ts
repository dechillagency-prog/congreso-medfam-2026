import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolverConstancia, type SolicitudConstancia } from "@/lib/supabase/constancias";

/**
 * Ruta EXCLUSIVA para que un administrador autenticado pruebe el recorrido
 * real de la constancia (búsqueda, verificación, descarga) sin depender de
 * `constancias_habilitadas` — útil para probar antes de que el comité
 * autorice la emisión pública.
 *
 * Protegida en el servidor, no solo oculta en la interfaz: middleware.ts
 * NO cubre esta ruta (su matcher es "/admin/:path*", y esto vive bajo
 * "/api/admin/", igual que app/api/admin/export-csv/route.ts), así que la
 * sesión se verifica aquí mismo con el cliente de sesión antes de tocar
 * cualquier dato. Sin sesión de Supabase Auth válida -> 401, sin excepción.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ mensaje: "No autorizado." }, { status: 401 });
  }

  let body: Partial<SolicitudConstancia>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ mensaje: "Solicitud inválida." }, { status: 400 });
  }

  if (
    (body.tipoIdentificador !== "folio" && body.tipoIdentificador !== "nombre") ||
    typeof body.identificador !== "string" ||
    typeof body.verificacion !== "string"
  ) {
    return NextResponse.json({ mensaje: "Solicitud inválida." }, { status: 400 });
  }

  const resultado = await resolverConstancia({
    tipoIdentificador: body.tipoIdentificador,
    identificador: body.identificador,
    verificacion: body.verificacion,
    omitirChequeoHabilitado: true,
  });

  if (!resultado.ok) {
    return NextResponse.json({ mensaje: resultado.mensaje }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(resultado.pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${resultado.nombreArchivo}"`,
      "Cache-Control": "no-store",
    },
  });
}
