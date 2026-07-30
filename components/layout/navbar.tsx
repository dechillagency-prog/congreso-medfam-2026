"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/programa", label: "Programa" },
  { href: "/ponentes", label: "Ponentes" },
  { href: "/patrocinadores", label: "Patrocinadores" },
  { href: "/hospedaje", label: "Hospedaje" },
  { href: "/contacto", label: "Contacto" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-white/85 backdrop-blur-lg border-b border-border" : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-20 max-w-8xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            <Stethoscope className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">Congreso Med. Familiar</span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-body transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:block">
          <Link href="/registro">
            <Button size="default">Inscribirme</Button>
          </Link>
        </div>

        <button
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-white px-6 py-6 lg:hidden">
          <div className="flex flex-col gap-4">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-ink"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/registro" onClick={() => setOpen(false)}>
              <Button className="mt-2 w-full">Inscribirme</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
