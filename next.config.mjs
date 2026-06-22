/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["unpdf", "mammoth"],
  // Pin the workspace root so Turbopack doesn't pick a parent lockfile.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
