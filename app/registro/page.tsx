import { RegistroForm } from "@/components/forms/registro-form";

export const metadata = { title: "Registro" };

export default function RegistroPage() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-2xl px-6">
        <p className="eyebrow text-center">Inscripción</p>
        <h1 className="mt-4 text-center text-4xl font-bold text-ink">
          Regístrate al congreso
        </h1>
        <p className="mx-auto mt-4 max-w-md text-center text-body/70">
          Completa tus datos y sube tu comprobante de pago. Recibirás tu folio de confirmación
          al instante.
        </p>

        <div className="mt-12 rounded-2xl border border-border bg-white p-8 shadow-card">
          <RegistroForm />
        </div>
      </div>
    </section>
  );
}
