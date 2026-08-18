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
  // Garantía explícita (además de __dirname en lib/pdf/*) de que las
  // fuentes/logos/firma que usa @react-pdf/renderer viajan con la Function
  // de Vercel que genera la Carta de Congresista — se sirve desde la
  // Server Action en app/admin/dashboard/actions.ts, invocada desde estas
  // rutas del panel admin.
  outputFileTracingIncludes: {
    "/admin/dashboard": ["./lib/pdf/fonts/**/*", "./lib/pdf/assets/**/*"],
    "/admin/dashboard/[id]": ["./lib/pdf/fonts/**/*", "./lib/pdf/assets/**/*"],
  },
};

export default nextConfig;
