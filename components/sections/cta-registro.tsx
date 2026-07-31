"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CtaRegistro() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="bg-white px-6 py-16 md:py-20">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-8xl overflow-hidden rounded-3xl bg-ink px-8 py-14 text-white shadow-elevated sm:px-14 sm:py-16"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-gold/15" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <p className="eyebrow !text-gold-light">Registro abierto</p>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              Asegura tu lugar en el XXV Congreso
            </h2>
            <p className="mt-2 text-white/70">
              Cupo limitado. Registro con tarifa preferencial por tiempo limitado.
            </p>
          </div>
          <Link href="/registro">
            <Button variant="gold" size="lg" className="whitespace-nowrap">
              Inscribirme ahora <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
