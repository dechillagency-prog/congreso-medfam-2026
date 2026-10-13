import { FileCheck2 } from "lucide-react";

export const metadata = { title: "Constancias" };

// Ruta pública y permanente — pensada para el QR impreso en los gafetes.
// No requiere autenticación: cualquier persona debe poder abrirla desde el
// QR. Por ahora es solo un mensaje informativo; a partir del 17 de octubre
// de 2026 esta misma URL (sin cambiar) alojará el buscador y la descarga
// de la constancia en PDF.
export default function ConstanciasPage() {
  return (
    <section className="section-pad">
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FileCheck2 className="h-7 w-7" />
        </span>

        <p className="eyebrow mt-6">Constancias de participación</p>
        <h1 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">
          XXV Congreso Regional Noreste de Medicina Familiar 2026
        </h1>
        <p className="mx-auto mt-5 max-w-md text-body/70">
          Las constancias de participación estarán disponibles a partir del sábado 17 de octubre de
          2026.
        </p>
      </div>
    </section>
  );
}
