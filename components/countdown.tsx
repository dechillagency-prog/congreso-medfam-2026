"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

// Inicio del congreso: 14 de octubre de 2026, 09:00 hora del centro (Torreón, Coahuila)
const EVENT_DATE = new Date("2026-10-14T09:00:00-06:00").getTime();

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft {
  const diff = Math.max(EVENT_DATE - Date.now(), 0);
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const UNITS: { key: keyof TimeLeft; label: string }[] = [
  { key: "days", label: "Días" },
  { key: "hours", label: "Horas" },
  { key: "minutes", label: "Minutos" },
  { key: "seconds", label: "Segundos" },
];

export function Countdown({ className }: { className?: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const display = timeLeft ?? { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const isPast = timeLeft !== null && EVENT_DATE - Date.now() <= 0;

  if (isPast) return null;

  return (
    <div
      className={cn(
        "inline-flex items-stretch gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md",
        className
      )}
      role="timer"
      aria-live="off"
      aria-label="Tiempo restante para el inicio del congreso"
    >
      {UNITS.map((unit, i) => (
        <div
          key={unit.key}
          className={cn(
            "flex min-w-[4.25rem] flex-col items-center justify-center px-3 py-3 sm:min-w-[5rem] sm:px-4",
            i !== 0 && "border-l border-white/10"
          )}
        >
          <span
            suppressHydrationWarning
            className="font-display text-2xl font-bold tabular-nums text-white sm:text-3xl"
          >
            {String(display[unit.key]).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-white/60">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
