import { ShieldAlert } from "lucide-react";
import { ConstanciaForm } from "@/components/forms/constancia-form";

// Página solo-admin para probar el recorrido real de la constancia
// (búsqueda, verificación, descarga) sin esperar a que
// `constancias_habilitadas` esté en true. Protegida en dos capas:
// 1) middleware.ts ya exige sesión de admin para cualquier /admin/:path*
//    (esta ruta incluida), igual que el resto del panel.
// 2) El propio endpoint que consume este formulario
//    (app/api/admin/constancias-prueba/route.ts) vuelve a verificar la
//    sesión por su cuenta — middleware no cubre rutas /api/admin/*, así
//    que la protección real vive en el servidor del endpoint, no aquí.
export default function ConstanciasPruebaPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="text-sm">
          <p className="font-semibold">Modo de prueba — solo administradores</p>
          <p className="mt-1 text-amber-800">
            Esta página usa el formulario y el generador de PDF reales, pero habla con un endpoint
            aparte que ignora el interruptor público <code>constancias_habilitadas</code>. La página
            pública <code>/constancias</code> sigue deshabilitada para todos los demás mientras esta
            prueba se usa.
          </p>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-ink">Prueba de Constancia Digital</h1>
      <p className="text-sm text-body/60">
        Busca un registro real por folio o nombre, verifica con su correo o celular, y descarga el PDF
        generado — exactamente lo que verá un congresista una vez habilitada la emisión pública.
      </p>

      <ConstanciaForm endpoint="/api/admin/constancias-prueba" />
    </section>
  );
}
