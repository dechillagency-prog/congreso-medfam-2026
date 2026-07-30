import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
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
                      className="relative h-16 w-40 grayscale transition-all hover:grayscale-0"
                    >
                      <Image src={p.logo_url} alt={p.nombre} fill sizes="160px" className="object-contain" />
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
