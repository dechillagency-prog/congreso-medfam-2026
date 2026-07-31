"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Calendar, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Countdown } from "@/components/countdown";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion) return;
    if (video.readyState >= 3) setVideoReady(true);
  }, [prefersReducedMotion]);

  return (
    <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden bg-ink text-white">
      {/* Fondo: video si está disponible y el usuario no pide movimiento reducido; imagen real como fallback */}
      <div className="absolute inset-0 -z-20">
        {!prefersReducedMotion && (
          <video
            ref={videoRef}
            className={`h-full w-full object-cover transition-opacity duration-1000 ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/congreso-1.jpg"
            onCanPlay={() => setVideoReady(true)}
          >
            <source src="/videos/congreso-hero.mp4" type="video/mp4" />
          </video>
        )}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/images/congreso-1.jpg)",
            opacity: prefersReducedMotion || !videoReady ? 1 : 0,
            transition: "opacity 1s ease",
          }}
          aria-hidden
        />
      </div>

      {/* Overlay para contraste y legibilidad del texto */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/80 via-ink/70 to-ink/95" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-transparent to-transparent" />

      <div className="mx-auto w-full max-w-8xl px-6 py-24">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <Badge className="border-white/20 bg-white/10 text-white">
            XXV Congreso Regional Noreste
          </Badge>

          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Medicina Familiar
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">
            &ldquo;La Medicina Familiar, eje de la Atención Primaria&rdquo;
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm font-medium text-white/85">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gold-light" /> 14–17 Octubre 2026
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold-light" /> Torreón, Coahuila
            </span>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/registro">
              <Button size="lg">Inscribirme</Button>
            </Link>
            <Link href="/programa">
              <Button
                size="lg"
                variant="outline"
                className="border-white/25 bg-white/5 text-white hover:border-white hover:bg-white hover:text-ink"
              >
                Ver Programa
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
            Comienza en
          </p>
          <Countdown />
        </motion.div>
      </div>
    </section>
  );
}
