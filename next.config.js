
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Change from 'export' to 'standalone'
  images: {
    domains: ['spdpay.in'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: true, // Ensures correct paths for static hosting
}

module.exports = nextConfig
