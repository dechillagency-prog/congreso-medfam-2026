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
  // Garantía explícita de que las fuentes/logos/firma/plantillas que usan
  // @react-pdf/renderer y pdf-lib (lib/pdf/fonts/, lib/pdf/assets/) viajan
  // con la Function de Vercel correspondiente. Necesaria porque el código
  // las lee con process.cwd() + fs, no con require()/import(), así que
  // Node File Trace no las detecta solo. Cada ruta listada aquí es una que
  // genera un PDF server-side: la Carta de Congresista (panel admin) o la
  // Constancia de Participación (/api/constancias, pública).
  outputFileTracingIncludes: {
    "/admin/dashboard": ["./lib/pdf/fonts/**/*", "./lib/pdf/assets/**/*"],
    "/admin/dashboard/[id]": ["./lib/pdf/fonts/**/*", "./lib/pdf/assets/**/*"],
    "/api/constancias": ["./lib/pdf/fonts/**/*", "./lib/pdf/assets/**/*"],
  },
};

export default nextConfig;
