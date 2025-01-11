
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Change from 'export' to 'standalone'
  // ... other config options
  images: {
    domains: ['spdpay.in'],
  },
}

module.exports = nextConfig