export type Hotel = {
  nombre: string;
  tarifa: string;
  imagen: string;
  reservar: string;
};

export const HOSPEDAJE_COPY = {
  eyebrow: "Hospedaje",
  titulo: "Hoteles oficiales",
  descripcion:
    "Tarifas preferenciales para asistentes del congreso. Menciona el código del evento al reservar.",
};

export const HOTELES: Hotel[] = [
  {
    nombre: "Holiday Inn Express Torreón",
    tarifa: "Desde $1,650 MXN / noche",
    imagen: "/images/hoteles/holiday-inn.jpg",
    reservar: "#",
  },
  {
    nombre: "Crowne Plaza Torreón",
    tarifa: "Desde $2,100 MXN / noche",
    imagen: "/images/hoteles/crowne-plaza.jpg",
    reservar: "#",
  },
];
