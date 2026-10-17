import fs from "node:fs";
import path from "node:path";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

/**
 * Genera la Constancia de Participación sobreponiendo el nombre completo
 * sobre la plantilla oficial (diseño, logos y firmas ya vienen en el PDF
 * provisto por el comité — aquí NUNCA se redibuja nada de eso). Se usa
 * pdf-lib en vez de @react-pdf/renderer a propósito: la plantilla ya es un
 * PDF vectorial terminado, así que basta con cargarla tal cual y dibujar
 * texto encima, sin re-renderizar el documento desde cero (eso garantiza
 * fidelidad 1:1 con el diseño original).
 *
 * process.cwd() + ruta literal del repo, NO __dirname — mismo motivo que
 * en carta-congresista.tsx: Next empaqueta este módulo en
 * .next/server/chunks/, así que __dirname en runtime no apunta a lib/pdf/.
 */
const PLANTILLA_PATH = path.join(process.cwd(), "lib", "pdf", "assets", "constancia-plantilla.pdf");
const FONT_PATH = path.join(process.cwd(), "lib", "pdf", "fonts", "montserrat", "Montserrat-Bold.ttf");

// Coordenadas de la línea en blanco de la plantilla, medidas directamente
// sobre el PDF oficial (792 x 612 pt, carta horizontal) a partir del
// render a 200dpi: la línea va de x=445px a x=1820px, centro en y=965px.
// Conversión: pt = px * 72/200.
const PAGE_WIDTH = 792;
const PAGE_HEIGHT = 612;
const LINEA_X_IZQ = 445 * (72 / 200);
const LINEA_X_DER = 1820 * (72 / 200);
const LINEA_Y_DESDE_ARRIBA = 965 * (72 / 200);
const LINEA_CENTRO_X = (LINEA_X_IZQ + LINEA_X_DER) / 2;
const LINEA_Y = PAGE_HEIGHT - LINEA_Y_DESDE_ARRIBA; // pdf-lib mide y desde abajo

// Margen respecto a los extremos de la línea, para que el nombre nunca la toque.
const ANCHO_MAXIMO = LINEA_X_DER - LINEA_X_IZQ - 40;
const SEPARACION_SOBRE_LINEA = 10;

const TAMANO_INICIAL = 30;
const TAMANO_MINIMO = 14;

// Mismo navy que usa el diseño oficial (muestreado directamente del PDF).
const COLOR_NOMBRE = rgb(0 / 255, 32 / 255, 87 / 255);

export async function generarConstanciaPdf(nombreCompleto: string): Promise<Buffer> {
  const plantillaBytes = fs.readFileSync(PLANTILLA_PATH);
  const fontBytes = fs.readFileSync(FONT_PATH);

  const pdfDoc = await PDFDocument.load(plantillaBytes);
  pdfDoc.registerFontkit(fontkit);
  const fuente = await pdfDoc.embedFont(fontBytes, { subset: true });

  const [pagina] = pdfDoc.getPages();

  const nombre = nombreCompleto.trim().toUpperCase();

  let tamano = TAMANO_INICIAL;
  let ancho = fuente.widthOfTextAtSize(nombre, tamano);
  while (ancho > ANCHO_MAXIMO && tamano > TAMANO_MINIMO) {
    tamano -= 0.5;
    ancho = fuente.widthOfTextAtSize(nombre, tamano);
  }

  pagina.drawText(nombre, {
    x: LINEA_CENTRO_X - ancho / 2,
    y: LINEA_Y + SEPARACION_SOBRE_LINEA,
    size: tamano,
    font: fuente,
    color: COLOR_NOMBRE,
  });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
