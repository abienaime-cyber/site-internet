import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Toutes les pages lisent la session ou la base : rendu à la requête.
  cacheComponents: false,
  // Le badge de développement de Next.js recouvrait la barre de navigation mobile.
  devIndicators: false,
  serverExternalPackages: ["stripe"],
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
