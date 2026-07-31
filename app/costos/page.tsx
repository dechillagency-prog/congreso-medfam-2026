import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { COSTOS_COPY, PLANES_COSTOS } from "@/content/costos";

export default function CostosPage() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-6xl px-6">
        <p className="eyebrow text-center">{COSTOS_COPY.eyebrow}</p>
        <h1 className="mt-4 text-center text-4xl font-bold text-ink">{COSTOS_COPY.titulo}</h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-body/70">{COSTOS_COPY.descripcion}</p>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PLANES_COSTOS.map((tipo, i) => (
            <Card key={tipo.value} className={i === 1 ? "border-primary ring-1 ring-primary" : ""}>
              <CardContent className="flex h-full flex-col">
                <p className="eyebrow">{tipo.label}</p>
                <p className="mt-4 font-display text-4xl font-extrabold text-ink">
                  ${tipo.precio.toLocaleString("es-MX")}
                  <span className="text-base font-medium text-body/50"> MXN</span>
                </p>

                <ul className="mt-6 flex-1 space-y-3">
                  {tipo.incluye.map((item) => (
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
