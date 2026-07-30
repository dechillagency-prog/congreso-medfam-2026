import { Mail, Phone, MapPin } from "lucide-react";

export const metadata = { title: "Contacto" };

export default function ContactoPage() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="eyebrow">Contacto</p>
        <h1 className="mt-4 text-4xl font-bold text-ink">¿Tienes dudas?</h1>
        <p className="mt-4 text-body/70">
          Escríbenos y el comité organizador te responderá a la brevedad.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border p-6">
            <Mail className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-3 text-sm font-medium">contacto@congresomedfam2026.mx</p>
          </div>
          <div className="rounded-2xl border border-border p-6">
            <Phone className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-3 text-sm font-medium">(871) 000 0000</p>
          </div>
          <div className="rounded-2xl border border-border p-6">
            <MapPin className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-3 text-sm font-medium">Torreón, Coahuila</p>
          </div>
        </div>
      </div>
    </section>
  );
}
