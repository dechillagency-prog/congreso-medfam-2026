import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { esUrlImagenValida, esImagenOptimizablePorNextImage } from "@/lib/utils/imagen";
import type { Ponente } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function PonentesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ponentes")
    .select("*")
    .order("orden", { ascending: true });

  const ponentes = (data as Ponente[]) ?? [];

  return (
    <section className="section-pad">
      <div className="mx-auto max-w-8xl px-6">
        <p className="eyebrow text-center">Ponentes</p>
        <h1 className="mt-4 text-center text-4xl font-bold text-ink">
          Especialistas que compartirán su experiencia
        </h1>

        <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {ponentes.map((ponente) => (
            <Card key={ponente.id}>
              <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-surface">
                {ponente.foto_url && esUrlImagenValida(ponente.foto_url) ? (
                  <Image
                    src={ponente.foto_url}
                    alt={ponente.nombre}
                    fill
                    sizes="240px"
                    unoptimized={!esImagenOptimizablePorNextImage(ponente.foto_url)}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-body/30">
                    <span className="text-4xl font-display font-bold">
                      {ponente.nombre.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <CardContent className="text-center">
                <h3 className="font-display font-bold text-ink">{ponente.nombre}</h3>
                <p className="mt-1 text-xs text-body/60">{ponente.especialidad}</p>
                <p className="text-xs text-body/40">{ponente.estado}</p>
                <Button variant="ghost" size="sm" className="mt-3 w-full">
                  Conocer más
                </Button>
              </CardContent>
            </Card>
          ))}

          {ponentes.length === 0 && (
            <p className="col-span-full text-center text-body/50">
              Próximamente anunciaremos a los ponentes.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
