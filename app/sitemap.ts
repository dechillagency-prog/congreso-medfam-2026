import type { MetadataRoute } from "next";

const BASE_URL = "https://congresomedfam2026.mx";
const ROUTES = ["", "/programa", "/ponentes", "/costos", "/hospedaje", "/patrocinadores", "/registro", "/contacto"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
