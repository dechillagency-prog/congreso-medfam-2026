"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CategoriaPatrocinio } from "@/types";
import { crearCategoria, actualizarCategoria, eliminarCategoria } from "@/app/admin/dashboard/categorias/actions";

export function CategoriasManager({ categorias }: { categorias: CategoriaPatrocinio[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nombre, setNombre] = useState("");
  const [orden, setOrden] = useState(0);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editOrden, setEditOrden] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function crear() {
    setError(null);
    startTransition(async () => {
      const res = await crearCategoria({ nombre, orden });
      if (!res.success) return setError(res.message ?? "No se pudo crear.");
      setNombre("");
      setOrden(0);
      router.refresh();
    });
  }

  function guardar(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await actualizarCategoria(id, { nombre: editNombre, orden: editOrden });
      if (!res.success) return setError(res.message ?? "No se pudo guardar.");
      setEditandoId(null);
      router.refresh();
    });
  }

  function eliminar(id: string) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    startTransition(async () => {
      const res = await eliminarCategoria(id);
      if (!res.success) setError(res.message ?? "No se pudo eliminar.");
      router.refresh();
    });
  }

  return (
    <div className="mt-6 max-w-2xl">
      <h2 className="text-lg font-bold text-ink">Categorías de patrocinio ({categorias.length})</h2>
      {error && <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 flex gap-2">
        <input className="input" placeholder="Nombre (p. ej. Platinum)" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input className="input w-24" type="number" placeholder="Orden" value={orden} onChange={(e) => setOrden(Number(e.target.value))} />
        <Button size="sm" onClick={crear} disabled={isPending || !nombre}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <tbody>
            {categorias.map((c) =>
              editandoId === c.id ? (
                <tr key={c.id} className="border-t border-border bg-primary/5">
                  <td className="px-4 py-2 w-16"><input className="input" type="number" value={editOrden} onChange={(e) => setEditOrden(Number(e.target.value))} /></td>
                  <td className="px-4 py-2"><input className="input" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} /></td>
                  <td className="px-4 py-2 w-20">
                    <div className="flex gap-2">
                      <button disabled={isPending} onClick={() => guardar(c.id)} className="text-primary"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setEditandoId(null)} className="text-body/50"><X className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={c.id} className="border-t border-border first:border-t-0">
                  <td className="px-4 py-3 text-body/50">{c.orden}</td>
                  <td className="px-4 py-3 font-medium text-ink">{c.nombre}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => { setEditandoId(c.id); setEditNombre(c.nombre); setEditOrden(c.orden); }} className="text-body/50 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => eliminar(c.id)} className="text-body/50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
