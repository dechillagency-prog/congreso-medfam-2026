"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Conferencia, Ponente } from "@/types";
import { crearConferencia, actualizarConferencia, eliminarConferencia } from "@/app/admin/dashboard/conferencias/actions";

const DIAS = [
  { value: "miercoles", label: "Miércoles" },
  { value: "jueves", label: "Jueves" },
  { value: "viernes", label: "Viernes" },
  { value: "sabado", label: "Sábado" },
] as const;

type FormValues = {
  dia: Conferencia["dia"];
  hora_inicio: string;
  hora_fin: string;
  titulo: string;
  ponente_id: string;
  sala: string;
};

const VACIO: FormValues = { dia: "miercoles", hora_inicio: "09:00", hora_fin: "10:00", titulo: "", ponente_id: "", sala: "" };

export function ConferenciasManager({ conferencias, ponentes }: { conferencias: Conferencia[]; ponentes: Ponente[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [creando, setCreando] = useState(false);
  const [nuevo, setNuevo] = useState<FormValues>(VACIO);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<FormValues>(VACIO);
  const [error, setError] = useState<string | null>(null);

  const nombrePonente = (id: string | null) => ponentes.find((p) => p.id === id)?.nombre ?? "Sin asignar";

  function iniciarEdicion(c: Conferencia) {
    setEditandoId(c.id);
    setEditValues({
      dia: c.dia,
      hora_inicio: c.hora_inicio.slice(0, 5),
      hora_fin: c.hora_fin.slice(0, 5),
      titulo: c.titulo,
      ponente_id: c.ponente_id ?? "",
      sala: c.sala ?? "",
    });
  }

  function guardarNuevo() {
    setError(null);
    startTransition(async () => {
      const res = await crearConferencia({
        dia: nuevo.dia,
        hora_inicio: nuevo.hora_inicio,
        hora_fin: nuevo.hora_fin,
        titulo: nuevo.titulo,
        ponente_id: nuevo.ponente_id || null,
        sala: nuevo.sala || null,
      });
      if (!res.success) return setError(res.message ?? "No se pudo crear.");
      setNuevo(VACIO);
      setCreando(false);
      router.refresh();
    });
  }

  function guardarEdicion(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await actualizarConferencia(id, {
        dia: editValues.dia,
        hora_inicio: editValues.hora_inicio,
        hora_fin: editValues.hora_fin,
        titulo: editValues.titulo,
        ponente_id: editValues.ponente_id || null,
        sala: editValues.sala || null,
      });
      if (!res.success) return setError(res.message ?? "No se pudo guardar.");
      setEditandoId(null);
      router.refresh();
    });
  }

  function eliminar(id: string) {
    if (!confirm("¿Eliminar esta conferencia?")) return;
    startTransition(async () => {
      await eliminarConferencia(id);
      router.refresh();
    });
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Conferencias ({conferencias.length})</h2>
        <Button size="sm" onClick={() => setCreando((v) => !v)}>
          <Plus className="h-4 w-4" /> Nueva conferencia
        </Button>
      </div>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {creando && (
        <div className="mt-4 grid gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:grid-cols-2">
          <select className="input" value={nuevo.dia} onChange={(e) => setNuevo({ ...nuevo, dia: e.target.value as Conferencia["dia"] })}>
            {DIAS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <input className="input" placeholder="Sala" value={nuevo.sala} onChange={(e) => setNuevo({ ...nuevo, sala: e.target.value })} />
          <input className="input" type="time" value={nuevo.hora_inicio} onChange={(e) => setNuevo({ ...nuevo, hora_inicio: e.target.value })} />
          <input className="input" type="time" value={nuevo.hora_fin} onChange={(e) => setNuevo({ ...nuevo, hora_fin: e.target.value })} />
          <input className="input sm:col-span-2" placeholder="Título de la conferencia" value={nuevo.titulo} onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })} />
          <select className="input sm:col-span-2" value={nuevo.ponente_id} onChange={(e) => setNuevo({ ...nuevo, ponente_id: e.target.value })}>
            <option value="">Sin ponente asignado</option>
            {ponentes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <div className="flex gap-2 sm:col-span-2">
            <Button size="sm" onClick={guardarNuevo} disabled={isPending || !nuevo.titulo}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Guardar
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setCreando(false); setNuevo(VACIO); }}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-body/50">
            <tr>
              <th className="px-4 py-3">Día</th>
              <th className="px-4 py-3">Horario</th>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Ponente</th>
              <th className="px-4 py-3">Sala</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {conferencias.map((c) =>
              editandoId === c.id ? (
                <tr key={c.id} className="border-t border-border bg-primary/5">
                  <td className="px-4 py-2">
                    <select className="input" value={editValues.dia} onChange={(e) => setEditValues({ ...editValues, dia: e.target.value as Conferencia["dia"] })}>
                      {DIAS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      <input className="input" type="time" value={editValues.hora_inicio} onChange={(e) => setEditValues({ ...editValues, hora_inicio: e.target.value })} />
                      <input className="input" type="time" value={editValues.hora_fin} onChange={(e) => setEditValues({ ...editValues, hora_fin: e.target.value })} />
                    </div>
                  </td>
                  <td className="px-4 py-2"><input className="input" value={editValues.titulo} onChange={(e) => setEditValues({ ...editValues, titulo: e.target.value })} /></td>
                  <td className="px-4 py-2">
                    <select className="input" value={editValues.ponente_id} onChange={(e) => setEditValues({ ...editValues, ponente_id: e.target.value })}>
                      <option value="">Sin asignar</option>
                      {ponentes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2"><input className="input" value={editValues.sala} onChange={(e) => setEditValues({ ...editValues, sala: e.target.value })} /></td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button disabled={isPending} onClick={() => guardarEdicion(c.id)} className="text-primary"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setEditandoId(null)} className="text-body/50"><X className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 capitalize text-body/70">{c.dia}</td>
                  <td className="px-4 py-3 text-body/70">{c.hora_inicio.slice(0, 5)}–{c.hora_fin.slice(0, 5)}</td>
                  <td className="px-4 py-3 font-medium text-ink">{c.titulo}</td>
                  <td className="px-4 py-3 text-body/70">{nombrePonente(c.ponente_id)}</td>
                  <td className="px-4 py-3 text-body/70">{c.sala ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => iniciarEdicion(c)} className="text-body/50 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => eliminar(c.id)} className="text-body/50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              )
            )}
            {conferencias.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-body/50">Aún no hay conferencias en el programa.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
