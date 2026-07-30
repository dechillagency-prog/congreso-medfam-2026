import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TIPOS_INSCRIPCION } from "@/lib/validations/registro";

const INCLUYE: Record<string, string[]> = {
  federado: ["Acceso a las 4 sesiones", "Constancia con valor curricular", "Material del congreso", "Coffee breaks"],
  no_federado: ["Acceso a las 4 sesiones", "Constancia con valor curricular", "Material del congreso", "Coffee breaks"],
  residente: ["Acceso a las 4 sesiones", "Constancia con valor curricular", "Material del congreso"],
};

export default function CostosPage() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-6xl px-6">
        <p className="eyebrow text-center">Inversión</p>
        <h1 className="mt-4 text-center text-4xl font-bold text-ink">Costos de inscripción</h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-body/70">
          Precios en pesos mexicanos (MXN). Incluye acceso completo al congreso.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TIPOS_INSCRIPCION.map((tipo, i) => (
            <Card key={tipo.value} className={i === 1 ? "border-primary ring-1 ring-primary" : ""}>
              <CardContent className="flex h-full flex-col">
                <p className="eyebrow">{tipo.label}</p>
                <p className="mt-4 font-display text-4xl font-extrabold text-ink">
                  ${tipo.precio.toLocaleString("es-MX")}
                  <span className="text-base font-medium text-body/50"> MXN</span>
                </p>

                <ul className="mt-6 flex-1 space-y-3">
                  {INCLUYE[tipo.value].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-body/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {item}
                    </li>
                  ))}
                </ul>

                <Link href="/registro" className="mt-8">
                  <Button className="w-full" variant={i === 1 ? "primary" : "outline"}>
                    Registrarme
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
