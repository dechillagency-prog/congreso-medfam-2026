"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const RECAP_VIDEO_SRC = "/videos/congreso-recap.mp4";

export function Recap() {
  const prefersReducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [videoAvailable, setVideoAvailable] = useState(true);

  return (
    <section className="section-pad bg-ink text-white">
      <div className="mx-auto max-w-8xl px-6">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="eyebrow !text-gold-light">Así se vivió</p>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            Un vistazo a la edición anterior
          </h2>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-12 aspect-video max-w-4xl overflow-hidden rounded-3xl border border-white/10 shadow-elevated"
        >
          {playing && videoAvailable ? (
            <video
              className="h-full w-full object-cover"
              controls
              autoPlay
              onError={() => {
                setVideoAvailable(false);
                setPlaying(false);
              }}
            >
              <source src={RECAP_VIDEO_SRC} type="video/mp4" />
            </video>
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              disabled={!videoAvailable}
              className={cn(
                "group relative block h-full w-full",
                !videoAvailable && "cursor-default"
              )}
              aria-label={videoAvailable ? "Reproducir video recap del congreso" : "Video recap próximamente"}
            >
              <Image
                src="/images/congreso-1.jpg"
                alt="Ponencia magistral del congreso anterior"
                fill
                sizes="(min-width: 1024px) 960px, 90vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/10" />

              {videoAvailable ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-ink shadow-elevated transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20">
                    <Play className="ml-1 h-6 w-6 sm:h-7 sm:w-7" fill="currentColor" />
                  </span>
                </span>
              ) : (
                <span className="absolute inset-x-0 bottom-0 flex justify-center pb-6">
                  <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/80 backdrop-blur-md">
                    Video próximamente
                  </span>
                </span>
              )}
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
