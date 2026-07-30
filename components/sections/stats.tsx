// Números centralizados aquí — editar estos 4 valores actualiza todo el sitio.
const STATS = [
  { value: "25", label: "años de tradición" },
  { value: "20+", label: "ponentes nacionales" },
  { value: "4", label: "días de actividades" },
  { value: "300+", label: "asistentes esperados" },
];

export function Stats() {
  return (
    <section className="border-y border-border bg-white">
      <div className="mx-auto grid max-w-8xl grid-cols-2 gap-8 px-6 py-16 md:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center md:text-left">
            <p className="font-display text-4xl font-extrabold text-primary sm:text-5xl">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-body/70">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
