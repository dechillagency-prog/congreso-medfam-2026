/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Garantía explícita de que las fuentes/logos/firma que usa
  // @react-pdf/renderer (lib/pdf/fonts/, lib/pdf/assets/) viajan con la
  // Function de Vercel que genera la Carta de Congresista. Necesaria
  // porque el código las lee con process.cwd() + fs, no con
  // require()/import(), así que Node File Trace no las detecta solo.
  // La Server Action que genera la carta (app/admin/dashboard/actions.ts)
  // solo se invoca desde estas dos rutas del panel admin — son todas las
  // que la necesitan.
  outputFileTracingIncludes: {
    "/admin/dashboard": ["./lib/pdf/fonts/**/*", "./lib/pdf/assets/**/*"],
    "/admin/dashboard/[id]": ["./lib/pdf/fonts/**/*", "./lib/pdf/assets/**/*"],
  },
};

export default nextConfig;
