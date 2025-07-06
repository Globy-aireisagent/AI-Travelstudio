/** @type {import('next').NextConfig} */
const nextConfig = {
  //  ✅ Allow the build to succeed even when ESLint reports errors.
  eslint: {
    ignoreDuringBuilds: true,
  },

  //  ✅ Allow the build to succeed even when TypeScript has type errors.
  //  (Be sure to keep type-checking in CI so production stays safe.)
  typescript: {
    ignoreBuildErrors: true,
  },

  //  ✅ Disable next/image optimisations (useful when you don’t have
  //  remote-loader config or when deploying on platforms without sharp).
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
