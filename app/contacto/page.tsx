import { Mail, Phone, Facebook, MapPin, MessageCircle, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACTO_COPY, CONTACTO_ITEMS, CONTACTO_CTA_WHATSAPP, type ContactoTipo } from "@/content/contacto";

export const metadata = { title: "Contacto" };

const ICONOS: Record<ContactoTipo, LucideIcon> = {
  correo: Mail,
  telefono: Phone,
  facebook: Facebook,
  ubicacion: MapPin,
};

export default function ContactoPage() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="eyebrow">{CONTACTO_COPY.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-bold text-ink">{CONTACTO_COPY.titulo}</h1>
        <p className="mx-auto mt-4 max-w-xl text-body/70">{CONTACTO_COPY.descripcion}</p>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACTO_ITEMS.map((item) => {
            const Icono = ICONOS[item.tipo];
            return (
              <a
                key={item.tipo}
                href={item.href}
                target={item.tipo === "facebook" ? "_blank" : undefined}
                rel={item.tipo === "facebook" ? "noopener noreferrer" : undefined}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-white p-6 text-center shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icono className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-body/50">
                  {item.etiqueta}
                </span>
                <span className="w-full break-words text-sm font-semibold text-ink">
                  {item.valor}
                </span>
              </a>
            );
          })}
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-primary/20 bg-primary/5 p-8 sm:p-10">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">{CONTACTO_CTA_WHATSAPP.titulo}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-body/70">{CONTACTO_CTA_WHATSAPP.texto}</p>
          <a
            href={CONTACTO_CTA_WHATSAPP.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block"
          >
            <Button size="lg">
              <MessageCircle className="h-4 w-4" /> {CONTACTO_CTA_WHATSAPP.boton}
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
