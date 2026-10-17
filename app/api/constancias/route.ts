import { NextResponse, type NextRequest } from "next/server";
import { resolverConstancia, type SolicitudConstancia } from "@/lib/supabase/constancias";

/**
 * Limitador de intentos en memoria, por IP — mitiga fuerza bruta contra la
 * verificación (folio/nombre + correo/celular) y descargas masivas.
 *
 * Limitación conocida: no es compartido entre instancias serverless
 * distintas de Vercel (cada una tiene su propia memoria), así que no es
 * una defensa robusta contra un ataque distribuido o contra tráfico real
 * de lanzamiento repartido entre muchas instancias frías. Es intencional
 * mientras `constancias_habilitadas` siga en `false` y las pruebas sean
 * controladas; antes de una habilitación pública masiva, lo ideal sería
 * moverlo a un backend persistente (Vercel KV / Upstash) para que el
 * límite sea real entre instancias. Se deja documentado aquí a propósito.
 */
const intentos = new Map<string, { conteo: number; inicioVentana: number }>();
const VENTANA_MS = 10 * 60 * 1000;
const LIMITE_INTENTOS = 8;
// Cota dura al tamaño del mapa para que no crezca sin límite en una
// instancia de larga vida si llegaran muchas IPs distintas.
const MAX_IPS_EN_MEMORIA = 5000;

function obtenerIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() ?? "desconocida";
}

function excedeLimite(ip: string): boolean {
  const ahora = Date.now();

  if (intentos.size > MAX_IPS_EN_MEMORIA) {
    intentos.clear();
  }

  const registro = intentos.get(ip);
  if (!registro || ahora - registro.inicioVentana > VENTANA_MS) {
    intentos.set(ip, { conteo: 1, inicioVentana: ahora });
    return false;
  }
  registro.conteo += 1;
  return registro.conteo > LIMITE_INTENTOS;
}

const LONGITUD_MAXIMA_CAMPO = 200;

function esTextoValido(valor: unknown): valor is string {
  return typeof valor === "string" && valor.trim().length > 0 && valor.length <= LONGITUD_MAXIMA_CAMPO;
}

export async function POST(request: NextRequest) {
  const ip = obtenerIp(request);

  if (excedeLimite(ip)) {
    return NextResponse.json(
      { mensaje: "Demasiados intentos. Espera unos minutos antes de volver a intentarlo." },
      { status: 429 }
    );
  }

  let body: Partial<SolicitudConstancia>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ mensaje: "Solicitud inválida." }, { status: 400 });
  }

  if (
    (body.tipoIdentificador !== "folio" && body.tipoIdentificador !== "nombre") ||
    !esTextoValido(body.identificador) ||
    !esTextoValido(body.verificacion)
  ) {
    return NextResponse.json({ mensaje: "Solicitud inválida." }, { status: 400 });
  }

  const resultado = await resolverConstancia({
    tipoIdentificador: body.tipoIdentificador,
    identificador: body.identificador,
    verificacion: body.verificacion,
  });

  if (!resultado.ok) {
    const status = resultado.codigo === "deshabilitado" ? 503 : 404;
    return NextResponse.json({ mensaje: resultado.mensaje }, { status });
  }

  // Un solo registro por solicitud, generado en memoria y nunca escrito a
  // Storage — no hay forma de usar este endpoint para "descargas masivas":
  // cada PDF requiere su propia verificación exitosa, una a la vez.
  return new NextResponse(new Uint8Array(resultado.pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${resultado.nombreArchivo}"`,
      "Cache-Control": "no-store",
    },
  });
}
