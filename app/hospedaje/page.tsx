import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HOSPEDAJE_COPY, HOTELES } from "@/content/hoteles";

export default function HospedajePage() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-5xl px-6">
        <p className="eyebrow text-center">{HOSPEDAJE_COPY.eyebrow}</p>
        <h1 className="mt-4 text-center text-4xl font-bold text-ink">{HOSPEDAJE_COPY.titulo}</h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-body/70">{HOSPEDAJE_COPY.descripcion}</p>

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
