import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const HOTELES = [
  {
    nombre: "Holiday Inn Express Torreón",
    tarifa: "Desde $1,650 MXN / noche",
    imagen: "/images/hotel-holiday-inn.jpg",
    reservar: "#",
  },
  {
    nombre: "Crowne Plaza Torreón",
    tarifa: "Desde $2,100 MXN / noche",
    imagen: "/images/hotel-crowne-plaza.jpg",
    reservar: "#",
  },
];

export default function HospedajePage() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-5xl px-6">
        <p className="eyebrow text-center">Hospedaje</p>
        <h1 className="mt-4 text-center text-4xl font-bold text-ink">Hoteles oficiales</h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-body/70">
          Tarifas preferenciales para asistentes del congreso. Menciona el código del evento al reservar.
        </p>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {HOTELES.map((hotel) => (
            <Card key={hotel.nombre} className="overflow-hidden">
              <div className="relative aspect-[16/10] bg-surface">
                <Image src={hotel.imagen} alt={hotel.nombre} fill sizes="480px" className="object-cover" />
              </div>
              <CardContent>
                <h3 className="text-xl font-bold text-ink">{hotel.nombre}</h3>
                <p className="mt-1 text-sm text-body/60">{hotel.tarifa}</p>
                <a href={hotel.reservar} target="_blank" rel="noopener noreferrer">
                  <Button className="mt-4 w-full" variant="outline">Reservar</Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
