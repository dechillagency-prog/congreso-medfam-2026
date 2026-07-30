"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function CerrarSesionButton() {
  const router = useRouter();

  async function handleClick() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-body hover:border-primary hover:text-primary"
    >
      Cerrar sesión
    </button>
  );
}
