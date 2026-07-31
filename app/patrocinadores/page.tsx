import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { esUrlImagenValida, esImagenOptimizablePorNextImage } from "@/lib/utils/imagen";
import type { PatrocinadorConCategoria, CategoriaPatrocinio } from "@/types";

export default async function PatrocinadoresPage() {
  const supabase = await createClient();

  const [{ data: categorias }, { data: patrocinadores }] = await Promise.all([
    supabase.from("categorias_patrocinio").select("*").order("orden", { ascending: true }),
    supabase
      .from("patrocinadores")
      .select("*, categoria:categorias_patrocinio(*)")
      .order("orden", { ascending: true }),
  ]);

  const cats = (categorias as CategoriaPatrocinio[]) ?? [];
  const items = (patrocinadores as unknown as PatrocinadorConCategoria[]) ?? [];

  return (
    <section className="section-pad">
      <div className="mx-auto max-w-6xl px-6">
        <p className="eyebrow text-center">Patrocinadores</p>
        <h1 className="mt-4 text-center text-4xl font-bold text-ink">
          Aliados que hacen posible el congreso
        </h1>

        <div className="mt-14 space-y-14">
          {cats.map((cat) => {
            const itemsCat = items.filter((p) => p.categoria_id === cat.id);
            if (itemsCat.length === 0) return null;

            return (
              <div key={cat.id}>
                <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-body/40">
                  {cat.nombre}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-10">
                  {itemsCat.map((p) => (
                    <a
                      key={p.id}
                      href={p.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative flex h-16 w-40 items-center justify-center"
                    >
                      {p.logo_url && esUrlImagenValida(p.logo_url) ? (
                        <Image
                          src={p.logo_url}
                          alt={p.nombre}
                          fill
                          sizes="160px"
                          unoptimized={!esImagenOptimizablePorNextImage(p.logo_url)}
                          className="object-contain grayscale transition-all hover:grayscale-0"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-border bg-surface px-3 text-center">
                          <span className="line-clamp-1 text-xs font-semibold text-ink">{p.nombre}</span>
                          <span className="text-[10px] uppercase tracking-wide text-body/40">Logo pendiente</span>
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <p className="text-center text-body/50">
              Próximamente anunciaremos a nuestros patrocinadores.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
