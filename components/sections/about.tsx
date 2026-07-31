"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export function About() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="section-pad overflow-hidden bg-surface">
      <div className="mx-auto grid max-w-8xl items-center gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-elevated">
            <Image
              src="/images/congreso-2.jpg"
              alt="Asistentes del congreso en sala plenaria"
              fill
              sizes="(min-width: 1024px) 480px, 90vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 hidden aspect-square w-32 rounded-2xl bg-gold/15 ring-1 ring-gold/20 sm:block" />
          <div className="absolute -left-6 -top-6 hidden aspect-square w-20 rounded-2xl bg-primary/10 ring-1 ring-primary/15 sm:block" />
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="eyebrow">Sobre el congreso</p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Un espacio de actualización para el médico familiar
          </h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-body">
            <p>
              Durante 25 años, el Congreso Regional Noreste de Medicina Familiar ha reunido a
              especialistas, residentes y profesionales de la atención primaria del noreste de
              México para actualizar conocimientos, compartir evidencia clínica y fortalecer la
              práctica de la Medicina Familiar como eje del sistema de salud.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
