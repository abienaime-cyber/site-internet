import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Toutes les pages lisent la session ou la base : rendu à la requête.
  cacheComponents: false,
  // Le badge de développement de Next.js recouvrait la barre de navigation mobile.
  devIndicators: false,
  serverExternalPackages: ["stripe"],
  images: {
    // Galerie : images locales uniquement, servies en WebP, 1200 px de large au plus.
    localPatterns: [{ pathname: "/galerie/images/**", search: "" }],
    deviceSizes: [640, 750, 828, 1080, 1200],
    qualities: [75],
    formats: ["image/webp"],
  },
  experimental: {
    serverActions: {
      // Photos d'annonces envoyées via Server Actions (6 photos max).
      bodySizeLimit: "30mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
