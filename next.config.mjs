/** @type {import('next').NextConfig} */
const nextConfig = {
  // Expose selected environment variables to the client
  env: {
    NEXT_PUBLIC_HAS_TC_USERNAME:
      process.env.TRAVEL_COMPOSITOR_USERNAME ? 'true' : 'false',
    NEXT_PUBLIC_HAS_TC_PASSWORD:
      process.env.TRAVEL_COMPOSITOR_PASSWORD ? 'true' : 'false',
    NEXT_PUBLIC_HAS_TC_MICROSITE:
      process.env.TRAVEL_COMPOSITOR_MICROSITE_ID ? 'true' : 'false',
  },

  // React & build optimisation
  reactStrictMode: true,
  swcMinify: true,

  // Keep experimental flags here if you need them
  experimental: {
    serverComponentsExternalPackages: [],
  },

  /* -------------------------------------------------
   *  Build-time tolerances (required by deployment)
   * -------------------------------------------------*/
  eslint: {
    ignoreDuringBuilds: true, // prevent ESLint from blocking the build
  },
  typescript: {
    ignoreBuildErrors: true, // allow production build even with TS errors
  },

  /* -------------------------------------------------
   *  Image handling
   * -------------------------------------------------*/
  images: {
    domains: ['placeholder.svg'],
    unoptimized: true, // disable Image Optimization (same as before)
  },

  /* -------------------------------------------------
   *  Webpack tweaks (client-only fallbacks)
   * -------------------------------------------------*/
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  /* -------------------------------------------------
   *  Compiler options
   * -------------------------------------------------*/
  compiler: {
    // Strip console.* in production bundles
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
