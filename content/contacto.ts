export type ContactoItem = {
  tipo: "correo" | "telefono" | "ubicacion";
  valor: string;
};

const CORREO = "contacto@congresomedfam2026.mx";
const TELEFONO = "(871) 000 0000";

// Fuente única de la ubicación: cada consumidor compone su propio formato
// (ej. "Ciudad, Estado" vs "Ciudad, Estado, País") a partir de estos mismos campos.
export const CONTACTO_UBICACION = {
  ciudad: "Torreón",
  estado: "Coahuila",
  pais: "México",
};

export const CONTACTO_COPY = {
  eyebrow: "Contacto",
  titulo: "¿Tienes dudas?",
  descripcion: "Escríbenos y el comité organizador te responderá a la brevedad.",
};

export const CONTACTO_ITEMS: ContactoItem[] = [
  { tipo: "correo", valor: CORREO },
  { tipo: "telefono", valor: TELEFONO },
  { tipo: "ubicacion", valor: `${CONTACTO_UBICACION.ciudad}, ${CONTACTO_UBICACION.estado}` },
];
