/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_HAS_TC_USERNAME: process.env.TRAVEL_COMPOSITOR_USERNAME ? 'true' : 'false',
    NEXT_PUBLIC_HAS_TC_PASSWORD: process.env.TRAVEL_COMPOSITOR_PASSWORD ? 'true' : 'false',
    NEXT_PUBLIC_HAS_TC_MICROSITE: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID ? 'true' : 'false',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['placeholder.svg'],
    unoptimized: true,
  },
}

export default nextConfig
