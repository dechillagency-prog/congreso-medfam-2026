// Misma pantalla para un token que no existe y para uno de un registro que
// ya no está confirmado — a propósito no distingue entre ambos casos.
export default function CartaNoDisponible() {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-2xl font-bold text-ink">Esta carta no está disponible</h1>
      <p className="mt-3 text-sm text-body/60">
        El enlace no es válido o el registro asociado ya no está confirmado. Si crees que esto es un
        error, contacta al comité organizador.
      </p>
    </section>
  );
}
