import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

const ROUTES = ["", "/programa", "/ponentes", "/costos", "/hospedaje", "/patrocinadores", "/registro", "/contacto"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
