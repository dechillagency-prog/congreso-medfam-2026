import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/sections/stats";
import { About } from "@/components/sections/about";
import { Recap } from "@/components/sections/recap";
import { CtaRegistro } from "@/components/sections/cta-registro";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <About />
      <Recap />
      <CtaRegistro />

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
