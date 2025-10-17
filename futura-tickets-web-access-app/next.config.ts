import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,

  // Configuración para mejor rendimiento en móviles
  images: {
    formats: ['image/webp', 'image/avif'],
  },

  // Optimizaciones
  swcMinify: true,
};

export default nextConfig;
