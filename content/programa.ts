// Ruta centralizada del PDF del programa preliminar. Coloca el archivo real
// en `public/documents/programa-preliminar-xxv-congreso-2026.pdf` — mientras
// no exista, /programa muestra el botón deshabilitado automáticamente
// (ver `PROGRAMA_PDF_EXISTE` en app/programa/page.tsx, que revisa el
// archivo en disco). No se genera ni se usa un PDF de relleno.
export const PROGRAMA_PDF = {
  ruta: "/documents/programa-preliminar-xxv-congreso-2026.pdf",
  rutaEnDisco: "public/documents/programa-preliminar-xxv-congreso-2026.pdf",
  titulo: "Programa preliminar",
  descripcion: "Consulta la agenda en línea o descarga la versión completa para conservarla e imprimirla.",
  boton: "Descargar programa preliminar completo",
  botonNoDisponible: "Programa PDF próximamente disponible",
};
