# Arquitectura de correos (pendiente de proveedor)

Por indicación del PRD, esta carpeta deja la estructura lista pero **no** conecta un
proveedor de correo todavía (Resend, SendGrid, Postmark, etc.).

## Correos a implementar

1. **Confirmación de registro** — disparar en `app/registro/actions.ts`, justo después
   de insertar el registro exitosamente (donde está el comentario `TODO`).
2. **Confirmación de pago** — disparar en `app/admin/dashboard/actions.ts`, dentro de
   `cambiarEstatusPago`, cuando el nuevo estatus sea `"confirmado"`.
3. **Carta congresista** — mismo punto que el correo anterior, o como acción manual
   desde el dashboard.

## Cuando se conecte un proveedor

Sugerencia de estructura:

```
lib/email/
  client.ts          // instancia del proveedor (p. ej. Resend)
  templates/
    confirmacion-registro.tsx
    confirmacion-pago.tsx
    carta-congresista.tsx
  send.ts             // funciones enviarConfirmacionRegistro(), enviarConfirmacionPago(), etc.
```

Con React Email (compatible con Resend) los templates pueden reusar los componentes
de `components/ui` para mantener consistencia visual con el sitio.
