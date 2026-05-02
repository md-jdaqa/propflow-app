/** @type {import('next').NextConfig} */
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

const nextConfig = {
  ...(isGitHubActions && {
    output: "export",
    basePath: "/propflow-app",
  }),
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {},
};

export default nextConfig;
