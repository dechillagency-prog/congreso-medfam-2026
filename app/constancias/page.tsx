import { FileCheck2 } from "lucide-react";
import { getConfiguracion } from "@/lib/config";
import { ConstanciaForm } from "@/components/forms/constancia-form";

export const metadata = { title: "Constancias" };

// Ruta pública y permanente — pensada para el QR impreso en los gafetes.
// No requiere autenticación: cualquier persona debe poder abrirla desde el
// QR. Qué se muestra (el formulario o el mensaje de "todavía no
// disponible") depende de la clave `constancias_habilitadas` en
// `configuraciones` (editable desde Admin > Configuración) — así el comité
// organizador puede habilitar la emisión sin necesitar un nuevo deploy.
// El valor por defecto (sin la fila en la base de datos) es `false`, es
// decir: deshabilitado hasta que alguien lo active a propósito.
export const dynamic = "force-dynamic";

export default async function ConstanciasPage() {
  const habilitado = await getConfiguracion<boolean>("constancias_habilitadas", false);

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

        {habilitado ? (
          <>
            <p className="mx-auto mt-5 max-w-md text-body/70">
              Busca tu registro para descargar tu constancia de participación en PDF.
            </p>
            <ConstanciaForm />
          </>
        ) : (
          <p className="mx-auto mt-5 max-w-md text-body/70">
            Estamos preparando la emisión de constancias de participación. Vuelve pronto a esta misma
            página para buscar tu registro y descargarla.
          </p>
        )}
      </div>
    </section>
  );
}
