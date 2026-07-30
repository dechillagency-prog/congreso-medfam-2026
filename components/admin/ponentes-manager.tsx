"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Ponente } from "@/types";
import { crearPonente, actualizarPonente, eliminarPonente } from "@/app/admin/dashboard/ponentes/actions";

type FormValues = {
  nombre: string;
  especialidad: string;
  estado: string;
  foto_url: string;
  bio: string;
  orden: number;
};

const VACIO: FormValues = { nombre: "", especialidad: "", estado: "", foto_url: "", bio: "", orden: 0 };

export function PonentesManager({ ponentes }: { ponentes: Ponente[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [creando, setCreando] = useState(false);
  const [nuevo, setNuevo] = useState<FormValues>(VACIO);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<FormValues>(VACIO);
  const [error, setError] = useState<string | null>(null);

  function iniciarEdicion(p: Ponente) {
    setEditandoId(p.id);
    setEditValues({
      nombre: p.nombre,
      especialidad: p.especialidad,
      estado: p.estado,
      foto_url: p.foto_url ?? "",
      bio: p.bio ?? "",
      orden: p.orden,
    });
  }

  function guardarNuevo() {
    setError(null);
    startTransition(async () => {
      const res = await crearPonente({
        nombre: nuevo.nombre,
        especialidad: nuevo.especialidad,
        estado: nuevo.estado,
        foto_url: nuevo.foto_url || null,
        bio: nuevo.bio || null,
        orden: Number(nuevo.orden) || 0,
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
      const res = await actualizarPonente(id, {
        nombre: editValues.nombre,
        especialidad: editValues.especialidad,
        estado: editValues.estado,
        foto_url: editValues.foto_url || null,
        bio: editValues.bio || null,
        orden: Number(editValues.orden) || 0,
      });
      if (!res.success) return setError(res.message ?? "No se pudo guardar.");
      setEditandoId(null);
      router.refresh();
    });
  }

  function eliminar(id: string) {
    if (!confirm("¿Eliminar este ponente? Esta acción no se puede deshacer.")) return;
    startTransition(async () => {
      await eliminarPonente(id);
      router.refresh();
    });
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Ponentes ({ponentes.length})</h2>
        <Button size="sm" onClick={() => setCreando((v) => !v)}>
          <Plus className="h-4 w-4" /> Nuevo ponente
        </Button>
      </div>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {creando && (
        <div className="mt-4 grid gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:grid-cols-2">
          <input className="input" placeholder="Nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
          <input className="input" placeholder="Especialidad" value={nuevo.especialidad} onChange={(e) => setNuevo({ ...nuevo, especialidad: e.target.value })} />
          <input className="input" placeholder="Estado" value={nuevo.estado} onChange={(e) => setNuevo({ ...nuevo, estado: e.target.value })} />
          <input className="input" placeholder="Orden" type="number" value={nuevo.orden} onChange={(e) => setNuevo({ ...nuevo, orden: Number(e.target.value) })} />
          <input className="input sm:col-span-2" placeholder="URL de foto" value={nuevo.foto_url} onChange={(e) => setNuevo({ ...nuevo, foto_url: e.target.value })} />
          <textarea className="input sm:col-span-2 h-20" placeholder="Bio breve" value={nuevo.bio} onChange={(e) => setNuevo({ ...nuevo, bio: e.target.value })} />
          <div className="flex gap-2 sm:col-span-2">
            <Button size="sm" onClick={guardarNuevo} disabled={isPending || !nuevo.nombre}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Guardar
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setCreando(false); setNuevo(VACIO); }}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-body/50">
            <tr>
              <th className="px-4 py-3">Orden</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Especialidad</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ponentes.map((p) =>
              editandoId === p.id ? (
                <tr key={p.id} className="border-t border-border bg-primary/5">
                  <td className="px-4 py-2"><input className="input" type="number" value={editValues.orden} onChange={(e) => setEditValues({ ...editValues, orden: Number(e.target.value) })} /></td>
                  <td className="px-4 py-2"><input className="input" value={editValues.nombre} onChange={(e) => setEditValues({ ...editValues, nombre: e.target.value })} /></td>
                  <td className="px-4 py-2"><input className="input" value={editValues.especialidad} onChange={(e) => setEditValues({ ...editValues, especialidad: e.target.value })} /></td>
                  <td className="px-4 py-2"><input className="input" value={editValues.estado} onChange={(e) => setEditValues({ ...editValues, estado: e.target.value })} /></td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button disabled={isPending} onClick={() => guardarEdicion(p.id)} className="text-primary"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setEditandoId(null)} className="text-body/50"><X className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3 text-body/60">{p.orden}</td>
                  <td className="px-4 py-3 font-medium text-ink">{p.nombre}</td>
                  <td className="px-4 py-3 text-body/70">{p.especialidad}</td>
                  <td className="px-4 py-3 text-body/70">{p.estado}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => iniciarEdicion(p)} className="text-body/50 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => eliminar(p.id)} className="text-body/50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              )
            )}
            {ponentes.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-body/50">Aún no hay ponentes registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
