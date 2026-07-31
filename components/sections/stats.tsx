"use client";

import { motion, useReducedMotion } from "framer-motion";

// Números centralizados aquí — editar estos 4 valores actualiza todo el sitio.
const STATS = [
  { value: "25", label: "años de tradición" },
  { value: "20+", label: "ponentes nacionales" },
  { value: "4", label: "días de actividades" },
  { value: "300+", label: "asistentes esperados" },
];

export function Stats() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="border-y border-border bg-white">
      <div className="mx-auto grid max-w-8xl grid-cols-2 gap-8 px-6 py-16 md:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="text-center md:text-left"
          >
            <p className="font-display text-4xl font-extrabold text-primary sm:text-5xl">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-body/70">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
