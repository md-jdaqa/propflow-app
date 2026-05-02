/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/propflow-app",
  images: {
    unoptimized: true,
  },
  // Suppress build warnings about server-only features during static export
  experimental: {},
};

export default nextConfig;
