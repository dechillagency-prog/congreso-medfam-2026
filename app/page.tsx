import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/sections/stats";
import { About } from "@/components/sections/about";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <About />

      {/* Aviso rápido de registro */}
      <section className="section-pad bg-primary">
        <div className="mx-auto flex max-w-8xl flex-col items-center gap-6 px-6 text-center text-white md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Asegura tu lugar en el XXV Congreso
            </h2>
            <p className="mt-2 text-white/80">
              Cupo limitado. Registro con tarifa preferencial por tiempo limitado.
            </p>
          </div>
          <Link href="/registro">
            <Button variant="secondary" size="lg" className="whitespace-nowrap">
              Inscribirme ahora <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Accesos rápidos */}
      <section className="section-pad bg-white">
        <div className="mx-auto max-w-8xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Link href="/programa">
              <Card className="h-full">
                <CardContent>
                  <p className="eyebrow">Programa</p>
                  <h3 className="mt-3 text-xl font-bold text-ink">4 días de actividad académica</h3>
                  <p className="mt-2 text-sm text-body/70">
                    Revisa el timeline completo por día, del miércoles al sábado.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/ponentes">
              <Card className="h-full">
                <CardContent>
                  <p className="eyebrow">Ponentes</p>
                  <h3 className="mt-3 text-xl font-bold text-ink">Más de 20 especialistas</h3>
                  <p className="mt-2 text-sm text-body/70">
                    Conoce a los médicos que compartirán su experiencia clínica.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/hospedaje">
              <Card className="h-full">
                <CardContent>
                  <p className="eyebrow">Hospedaje</p>
                  <h3 className="mt-3 text-xl font-bold text-ink">Hoteles oficiales</h3>
                  <p className="mt-2 text-sm text-body/70">
                    Tarifas preferenciales en Holiday Inn Express y Crowne Plaza.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
