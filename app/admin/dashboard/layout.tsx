import Link from "next/link";
import { CerrarSesionButton } from "@/components/admin/cerrar-sesion-button";

const SECCIONES = [
  { href: "/admin/dashboard", label: "Registros" },
  { href: "/admin/dashboard/ponentes", label: "Ponentes" },
  { href: "/admin/dashboard/conferencias", label: "Conferencias" },
  { href: "/admin/dashboard/patrocinadores", label: "Patrocinadores" },
  { href: "/admin/dashboard/categorias", label: "Categorías" },
  { href: "/admin/dashboard/configuracion", label: "Configuración" },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface/40">
      <div className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-8xl items-center justify-between px-6 py-5">
          <div>
            <p className="font-display text-lg font-bold text-ink">Panel administrativo</p>
            <p className="text-xs text-body/50">XXV Congreso Regional Noreste de Medicina Familiar</p>
          </div>
          <CerrarSesionButton />
        </div>
        <nav className="mx-auto flex max-w-8xl gap-1 overflow-x-auto px-6 pb-3">
          {SECCIONES.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-body/70 hover:bg-primary/10 hover:text-primary"
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
