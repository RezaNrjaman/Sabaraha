import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    // Enam bagian dashboard kini menempati satu halaman `/?bagian=...`.
    // Tautan lama diarahkan ke tabnya; nilai query diteruskan otomatis oleh Next.
    return [
      { source: "/tren", destination: "/?bagian=tren", permanent: true },
      { source: "/periode", destination: "/?bagian=periode", permanent: true },
      { source: "/volatilitas", destination: "/?bagian=volatilitas", permanent: true },
      { source: "/ketersediaan", destination: "/?bagian=ketersediaan", permanent: true },
      { source: "/prediksi", destination: "/?bagian=prediksi", permanent: true },
    ];
  },
};

export default nextConfig;
