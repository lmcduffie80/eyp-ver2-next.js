/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eyp-static.vercel.app',
      },
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig

