import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SITE_URL } from "@/lib/site-url";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "XXV Congreso Regional Noreste de Medicina Familiar 2026",
    template: "%s | Congreso Medicina Familiar 2026",
  },
  description:
    "XXV Congreso Regional Noreste de Medicina Familiar. La Medicina Familiar, eje de la Atención Primaria. 14–17 de octubre de 2026, Torreón, Coahuila.",
  keywords: [
    "congreso medicina familiar",
    "medicina familiar 2026",
    "congreso médico Torreón",
    "atención primaria",
    "CONAMFyC",
  ],
  authors: [{ name: "XXV Congreso Regional Noreste de Medicina Familiar" }],
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: SITE_URL,
    siteName: "Congreso Medicina Familiar 2026",
    title: "XXV Congreso Regional Noreste de Medicina Familiar 2026",
    description: "La Medicina Familiar, eje de la Atención Primaria. 14–17 de octubre de 2026, Torreón, Coahuila.",
    images: [{ url: "/images/og-cover.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "XXV Congreso Regional Noreste de Medicina Familiar 2026",
    description: "La Medicina Familiar, eje de la Atención Primaria.",
    images: ["/images/og-cover.jpg"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalConference",
  name: "XXV Congreso Regional Noreste de Medicina Familiar",
  startDate: "2026-10-14",
  endDate: "2026-10-17",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: {
    "@type": "Place",
    name: "Torreón, Coahuila",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Torreón",
      addressRegion: "Coahuila",
      addressCountry: "MX",
    },
  },
  description:
    "La Medicina Familiar, eje de la Atención Primaria. Congreso regional dirigido a médicos familiares, residentes y especialistas.",
  organizer: {
    "@type": "Organization",
    name: "XXV Congreso Regional Noreste de Medicina Familiar",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${manrope.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
      </head>
      <body className="font-sans">
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
