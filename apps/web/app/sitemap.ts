import type { MetadataRoute } from "next";

const publicRoutes = ["", "/product", "/truth", "/memory", "/context", "/agents", "/developers", "/how-it-works", "/pricing", "/security", "/about", "/login", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://harikos-ai.vercel.app";
  return publicRoutes.map((path, index) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : path === "/product" ? 0.9 : 0.7,
  }));
}
