/** @type {import('next').NextConfig} */
// Force redeploy to pick up AWS environment variables - 2026-01-24
const nextConfig = {
  reactStrictMode: true,
  // Add experimental configuration for larger request bodies
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // Allow up to 50MB for API routes
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eyp-static.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [
      {
        source: '/dj-portal',
        destination: '/DJ',
        permanent: true,
      },
      {
        source: '/dj-portal/',
        destination: '/DJ',
        permanent: true,
      },
      {
        source: '/dj-portal/index.html',
        destination: '/DJ',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig

