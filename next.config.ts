import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ===== Performance Optimizations =====
  experimental: {
    // Tree-shake UI components for smaller bundles
    optimizePackageImports: ["@/components/ui", "lucide-react"],
  },

  // ===== Turbopack Configuration (Next.js 16+) =====
  // Empty config to enable Turbopack with defaults
  turbopack: {},

  // ===== Image Optimization =====
  images: {
    // Modern formats for smaller file sizes
    formats: ["image/avif", "image/webp"],
    // Responsive breakpoints
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow external images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Minimize image quality for faster loading
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },

  // ===== Build Optimizations =====
  // Enable gzip/brotli compression
  compress: true,

  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // Strict mode for better debugging and future compatibility
  reactStrictMode: true,

  // ===== Module Optimization =====
  // Transpile specific packages for better compatibility
  transpilePackages: ["framer-motion"],

  // ===== Caching Headers for Performance =====
  async headers() {
    return [
      // API routes: short cache with stale-while-revalidate
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "private, s-maxage=10, stale-while-revalidate=59" },
        ],
      },
      // Static assets: aggressive caching (1 year)
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|woff|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // JavaScript/CSS: cache with revalidation
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Security headers
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },

  // ===== Redirects for better UX =====
  async redirects() {
    return [
      // Redirect /login to /auth/login
      {
        source: "/login",
        destination: "/auth/login",
        permanent: true,
      },
      // Redirect /signup to /auth/register
      {
        source: "/signup",
        destination: "/auth/register",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
