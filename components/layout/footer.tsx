import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-ink text-white/70">
      <div className="mx-auto max-w-8xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-xl font-bold text-white">
              XXV Congreso Regional Noreste
            </p>
            <p className="mt-1 text-sm">de Medicina Familiar</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              La Medicina Familiar, eje de la Atención Primaria. 14–17 de octubre de 2026,
              Torreón, Coahuila.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
              Navegación
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/programa" className="hover:text-white">Programa</Link></li>
              <li><Link href="/ponentes" className="hover:text-white">Ponentes</Link></li>
              <li><Link href="/costos" className="hover:text-white">Costos</Link></li>
              <li><Link href="/registro" className="hover:text-white">Registro</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
              Contacto
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" /> Torreón, Coahuila, México
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" /> contacto@congresomedfam2026.mx
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" /> (871) 000 0000
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 XXV Congreso Regional Noreste de Medicina Familiar. Todos los derechos reservados.</p>
          <p>Torreón, Coahuila · México</p>
        </div>
      </div>
    </footer>
  );
}
