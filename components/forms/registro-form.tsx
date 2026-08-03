"use client";

import { useActionState, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampoArchivo } from "@/components/forms/campo-archivo";
import {
  registroSchema,
  type RegistroFormValues,
  ESTADOS_MX,
  TIPOS_INSCRIPCION,
  validarComprobante,
  validarCartaFederada,
} from "@/lib/validations/registro";
import { registrarAsistente, type RegistroActionState } from "@/app/registro/actions";

const initialState: RegistroActionState = { success: false, message: "" };

export function RegistroForm() {
  const [state, formAction, pending] = useActionState(registrarAsistente, initialState);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoError, setArchivoError] = useState<string | null>(null);
  const [carta, setCarta] = useState<File | null>(null);
  const [cartaError, setCartaError] = useState<string | null>(null);

  const {
    register,
    formState: { errors },
    trigger,
    watch,
  } = useForm<RegistroFormValues>({
    resolver: zodResolver(registroSchema),
    mode: "onBlur",
  });

  const tipoInscripcion = watch("tipo_inscripcion");
  const esFederado = tipoInscripcion === "federado";

  if (state.success) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <h3 className="mt-4 text-xl font-bold text-ink">{state.message}</h3>
        {state.folio && (
          <p className="mt-2 text-sm text-body/70">
            Tu folio de registro es <span className="font-mono font-semibold text-ink">{state.folio}</span>.
            Guárdalo, lo necesitarás para futuras referencias.
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={async (e) => {
  const valid = await trigger();
  const fileErr = validarComprobante(archivo);
  const cartaErr = validarCartaFederada(carta, tipoInscripcion ?? "");

  setArchivoError(fileErr);
  setCartaError(cartaErr);

  if (!valid || fileErr || cartaErr) {
    e.preventDefault();
  }
}}
      className="space-y-6"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Nombre completo" error={errors.nombre?.message}>
          <input {...register("nombre")} name="nombre" className="input" placeholder="Dr. Juan Pérez López" />
        </Field>

        <Field label="Correo electrónico" error={errors.correo?.message}>
          <input {...register("correo")} name="correo" type="email" className="input" placeholder="tu@correo.com" />
        </Field>

        <Field label="Celular (10 dígitos)" error={errors.celular?.message}>
          <input {...register("celular")} name="celular" className="input" placeholder="8711234567" />
        </Field>

        <Field label="Estado" error={errors.estado?.message}>
          <select {...register("estado")} name="estado" className="input" defaultValue="">
            <option value="" disabled>Selecciona tu estado</option>
            {ESTADOS_MX.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </Field>

        <Field label="Especialidad" error={errors.especialidad?.message}>
          <input {...register("especialidad")} name="especialidad" className="input" placeholder="Medicina Familiar" />
        </Field>

        <Field label="Tipo de inscripción" error={errors.tipo_inscripcion?.message}>
          <select {...register("tipo_inscripcion")} name="tipo_inscripcion" className="input" defaultValue="">
            <option value="" disabled>Selecciona una opción</option>
            {TIPOS_INSCRIPCION.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label} — ${t.precio.toLocaleString("es-MX")} MXN
              </option>
            ))}
          </select>
        </Field>
      </div>

      {esFederado && (
        <CampoArchivo
          name="carta_federada"
          accept="application/pdf"
          label="Carta Federada (PDF, máx. 5MB)"
          dropzoneTexto="Arrastra tu Carta Federada o haz clic para subirla"
          archivo={carta}
          error={cartaError}
          onSeleccionar={(file) => {
            setCarta(file);
            setCartaError(validarCartaFederada(file, tipoInscripcion ?? ""));
          }}
        />
      )}

      <CampoArchivo
        name="comprobante"
        accept="image/jpeg,image/png,application/pdf"
        label="Comprobante de pago (JPG, PNG o PDF, máx. 5MB)"
        dropzoneTexto="Arrastra tu archivo o haz clic para subirlo"
        archivo={archivo}
        error={archivoError}
        onSeleccionar={(file) => {
          setArchivo(file);
          setArchivoError(validarComprobante(file));
        }}
      />

      {/* PENDIENTE: falta crear la página /aviso-privacidad con el texto legal real.
          Mientras tanto el checkbox queda como texto plano, sin enlace roto. */}
      <label className="flex items-start gap-3 text-sm text-body/70">
        <input {...register("aceptaPrivacidad")} name="aceptaPrivacidad" type="checkbox" className="mt-1" />
        <span>He leído y acepto el aviso de privacidad.</span>
      </label>
      {errors.aceptaPrivacidad && (
        <p className="text-xs text-red-600">{errors.aceptaPrivacidad.message}</p>
      )}

      {state.message && !state.success && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.message}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {pending ? "Enviando..." : "Enviar Registro"}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
