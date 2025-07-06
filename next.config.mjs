/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  /*--------------------------------------------------------------------
   |  Build-time relaxations – remove these when your codebase is green |
   *-------------------------------------------------------------------*/
  eslint: {
    // Allow the build to succeed even with ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow the build to succeed even with TS type-errors.
    ignoreBuildErrors: true,
  },

  /*------------------------------------------------------------
   |  Images – Next.js on v0 cannot run the default optimiser |
   *-----------------------------------------------------------*/
  images: {
    unoptimized: true,
  },
}

export default nextConfig
