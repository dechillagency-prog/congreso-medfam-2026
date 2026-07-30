"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Patrocinador, CategoriaPatrocinio } from "@/types";
import { crearPatrocinador, actualizarPatrocinador, eliminarPatrocinador } from "@/app/admin/dashboard/patrocinadores/actions";

type FormValues = { nombre: string; categoria_id: string; logo_url: string; url: string; orden: number };

export function PatrocinadoresManager({ patrocinadores, categorias }: { patrocinadores: Patrocinador[]; categorias: CategoriaPatrocinio[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const vacio: FormValues = { nombre: "", categoria_id: categorias[0]?.id ?? "", logo_url: "", url: "", orden: 0 };
  const [creando, setCreando] = useState(false);
  const [nuevo, setNuevo] = useState<FormValues>(vacio);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<FormValues>(vacio);
  const [error, setError] = useState<string | null>(null);

  const nombreCategoria = (id: string) => categorias.find((c) => c.id === id)?.nombre ?? "—";

  function guardarNuevo() {
    setError(null);
    startTransition(async () => {
      const res = await crearPatrocinador({
        nombre: nuevo.nombre,
        categoria_id: nuevo.categoria_id,
        logo_url: nuevo.logo_url,
        url: nuevo.url || null,
        orden: Number(nuevo.orden) || 0,
      });
      if (!res.success) return setError(res.message ?? "No se pudo crear.");
      setNuevo(vacio);
      setCreando(false);
      router.refresh();
    });
  }

  function guardarEdicion(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await actualizarPatrocinador(id, {
        nombre: editValues.nombre,
        categoria_id: editValues.categoria_id,
        logo_url: editValues.logo_url,
        url: editValues.url || null,
        orden: Number(editValues.orden) || 0,
      });
      if (!res.success) return setError(res.message ?? "No se pudo guardar.");
      setEditandoId(null);
      router.refresh();
    });
  }

  function eliminar(id: string) {
    if (!confirm("¿Eliminar este patrocinador?")) return;
    startTransition(async () => {
      await eliminarPatrocinador(id);
      router.refresh();
    });
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Patrocinadores ({patrocinadores.length})</h2>
        <Button size="sm" onClick={() => setCreando((v) => !v)} disabled={categorias.length === 0}>
          <Plus className="h-4 w-4" /> Nuevo patrocinador
        </Button>
      </div>

      {categorias.length === 0 && (
        <p className="mt-3 text-sm text-body/60">Crea al menos una categoría antes de agregar patrocinadores.</p>
      )}
      {error && <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {creando && (
        <div className="mt-4 grid gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:grid-cols-2">
          <input className="input" placeholder="Nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
          <select className="input" value={nuevo.categoria_id} onChange={(e) => setNuevo({ ...nuevo, categoria_id: e.target.value })}>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <input className="input sm:col-span-2" placeholder="URL del logo" value={nuevo.logo_url} onChange={(e) => setNuevo({ ...nuevo, logo_url: e.target.value })} />
          <input className="input" placeholder="Sitio web (opcional)" value={nuevo.url} onChange={(e) => setNuevo({ ...nuevo, url: e.target.value })} />
          <input className="input" type="number" placeholder="Orden" value={nuevo.orden} onChange={(e) => setNuevo({ ...nuevo, orden: Number(e.target.value) })} />
          <div className="flex gap-2 sm:col-span-2">
            <Button size="sm" onClick={guardarNuevo} disabled={isPending || !nuevo.nombre || !nuevo.logo_url}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Guardar
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setCreando(false); setNuevo(vacio); }}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-body/50">
            <tr>
              <th className="px-4 py-3">Orden</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Logo</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {patrocinadores.map((p) =>
              editandoId === p.id ? (
                <tr key={p.id} className="border-t border-border bg-primary/5">
                  <td className="px-4 py-2 w-16"><input className="input" type="number" value={editValues.orden} onChange={(e) => setEditValues({ ...editValues, orden: Number(e.target.value) })} /></td>
                  <td className="px-4 py-2"><input className="input" value={editValues.nombre} onChange={(e) => setEditValues({ ...editValues, nombre: e.target.value })} /></td>
                  <td className="px-4 py-2">
                    <select className="input" value={editValues.categoria_id} onChange={(e) => setEditValues({ ...editValues, categoria_id: e.target.value })}>
                      {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2"><input className="input" value={editValues.logo_url} onChange={(e) => setEditValues({ ...editValues, logo_url: e.target.value })} /></td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button disabled={isPending} onClick={() => guardarEdicion(p.id)} className="text-primary"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setEditandoId(null)} className="text-body/50"><X className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3 text-body/50">{p.orden}</td>
                  <td className="px-4 py-3 font-medium text-ink">{p.nombre}</td>
                  <td className="px-4 py-3 text-body/70">{nombreCategoria(p.categoria_id)}</td>
                  <td className="px-4 py-3"><a href={p.logo_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">Ver</a></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => { setEditandoId(p.id); setEditValues({ nombre: p.nombre, categoria_id: p.categoria_id, logo_url: p.logo_url, url: p.url ?? "", orden: p.orden }); }} className="text-body/50 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => eliminar(p.id)} className="text-body/50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              )
            )}
            {patrocinadores.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-body/50">Aún no hay patrocinadores.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
