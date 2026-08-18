import { redirect, notFound } from "next/navigation";
import { getCartaCongresistaSignedUrlPorToken } from "@/lib/supabase/storage";

// El resultado depende del estatus del registro EN ESTE MOMENTO (no se
// puede cachear ni pre-generar en build: si el registro se reabre, esta
// misma URL debe dejar de servir la carta en la siguiente petición).
export const dynamic = "force-dynamic";

export default async function CartaCongresistaPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ download?: string }>;
}) {
  const { token } = await params;
  const { download } = await searchParams;

  const signedUrl = await getCartaCongresistaSignedUrlPorToken(token, {
    descargar: download === "1",
  });

  if (!signedUrl) {
    notFound();
  }

  redirect(signedUrl);
}
