import { Mail, Phone, MapPin, type LucideIcon } from "lucide-react";
import { CONTACTO_COPY, CONTACTO_ITEMS, type ContactoItem } from "@/content/contacto";

export const metadata = { title: "Contacto" };

const ICONOS: Record<ContactoItem["tipo"], LucideIcon> = {
  correo: Mail,
  telefono: Phone,
  ubicacion: MapPin,
};

export default function ContactoPage() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="eyebrow">{CONTACTO_COPY.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-bold text-ink">{CONTACTO_COPY.titulo}</h1>
        <p className="mt-4 text-body/70">{CONTACTO_COPY.descripcion}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {CONTACTO_ITEMS.map((item) => {
            const Icono = ICONOS[item.tipo];
            return (
              <div key={item.tipo} className="rounded-2xl border border-border p-6">
                <Icono className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-medium">{item.valor}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
