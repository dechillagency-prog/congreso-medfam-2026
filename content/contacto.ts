import { normalizarCelularMx } from "@/lib/utils/whatsapp";

export type ContactoTipo = "correo" | "telefono" | "facebook" | "ubicacion";

export type ContactoItem = {
  tipo: ContactoTipo;
  etiqueta: string;
  valor: string;
  href: string;
};

const CORREO = "contacto@congresomedfam2026.mx";
const TELEFONO = "(871) 000 0000";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=100094048287371";
const FACEBOOK_LABEL = "XXV Congreso Regional Noreste";

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

export const CONTACTO_CTA_WHATSAPP = {
  titulo: "¿Necesitas atención directa?",
  texto: "Escríbenos por WhatsApp y te responderemos a la brevedad.",
  boton: "Contactar por WhatsApp",
  href: `https://wa.me/${normalizarCelularMx(TELEFONO)}`,
};

const UBICACION_TEXTO = `${CONTACTO_UBICACION.ciudad}, ${CONTACTO_UBICACION.estado}`;

export const CONTACTO_ITEMS: ContactoItem[] = [
  {
    tipo: "correo",
    etiqueta: "Correo",
    valor: CORREO,
    href: `mailto:${CORREO}`,
  },
  {
    tipo: "telefono",
    etiqueta: "Teléfono / WhatsApp",
    valor: TELEFONO,
    href: `tel:+${normalizarCelularMx(TELEFONO)}`,
  },
  {
    tipo: "facebook",
    etiqueta: "Facebook",
    valor: FACEBOOK_LABEL,
    href: FACEBOOK_URL,
  },
  {
    tipo: "ubicacion",
    etiqueta: "Ubicación",
    valor: UBICACION_TEXTO,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${UBICACION_TEXTO}, ${CONTACTO_UBICACION.pais}`)}`,
  },
];
