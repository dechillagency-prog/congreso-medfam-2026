import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface">
      <div className="mx-auto grid max-w-8xl items-center gap-12 px-6 pb-16 pt-16 md:pb-24 md:pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:pt-28">
        {/* Copy */}
        <div className="animate-fade-up [animation-delay:0ms]">
          <Badge>XXV Congreso Regional Noreste</Badge>

          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Medicina
            <br />
            Familiar
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-body">
            &ldquo;La Medicina Familiar, eje de la Atención Primaria&rdquo;
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm font-medium text-body">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> 14–17 Octubre 2026
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Torreón, Coahuila
            </span>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/registro">
              <Button size="lg">Inscribirme</Button>
            </Link>
            <Link href="/programa">
              <Button size="lg" variant="outline">Ver Programa</Button>
            </Link>
          </div>
        </div>

        {/* Collage — reemplazar los src por fotografías reales del congreso */}
        <div className="relative hidden animate-fade-in [animation-delay:200ms] lg:block">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative mt-10 aspect-[3/4] overflow-hidden rounded-2xl shadow-elevated">
              <Image
                src="/images/congreso-1.jpg"
                alt="Ponencia magistral del congreso anterior"
                fill
                sizes="320px"
                className="object-cover"
                priority
              />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-elevated">
              <Image
                src="/images/congreso-2.jpg"
                alt="Asistentes del congreso en sala plenaria"
                fill
                sizes="320px"
                className="object-cover"
              />
            </div>
          </div>
          <div className="absolute -left-6 bottom-8 flex items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-elevated">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-body/60">Edición número</p>
              <p className="font-display text-lg font-bold text-ink">XXV</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
