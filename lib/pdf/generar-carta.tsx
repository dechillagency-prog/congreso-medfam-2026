import React from "react";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { CartaCongresista } from "./carta-congresista";
import { SITE_URL } from "@/lib/site-url";

export interface DatosCartaCongresista {
  nombreCompleto: string;
  folio: string;
  tipoInscripcion: string;
  fecha: string;
}

/**
 * Genera el PDF de la Carta de Congresista para un congresista específico.
 * Función pura: no toca Supabase ni Storage, solo recibe datos y devuelve
 * el PDF ya renderizado en memoria, listo para ser subido por quien la
 * llame.
 */
export async function generarCartaCongresistaPdf(datos: DatosCartaCongresista): Promise<Buffer> {
  const qrDataUrl = await QRCode.toDataURL(`${SITE_URL}/programa`, {
    margin: 0,
    width: 300,
    color: { dark: "#0F172A", light: "#FFFFFF" },
  });

  // Copia dedicada en lib/pdf/assets/ (no la de public/images/, que usan
  // otras páginas del sitio). process.cwd() + ruta literal del repo, NO
  // __dirname — ver el comentario en carta-congresista.tsx para el porqué
  // (Next empaqueta este módulo en .next/server/chunks/, así que __dirname
  // en runtime no apunta a lib/pdf/).
  const fotoPath = path.join(process.cwd(), "lib", "pdf", "assets", "congreso-1.jpg");

  return renderToBuffer(
    <CartaCongresista
      nombreCompleto={datos.nombreCompleto}
      folio={datos.folio}
      tipoInscripcion={datos.tipoInscripcion}
      fechaConfirmacion={datos.fecha}
      qrDataUrl={qrDataUrl}
      fotoPath={fotoPath}
    />
  );
}
