import type { NextConfig } from "next";

const legacyModuleRoutes = ["animals", "species", "devices", "geo-zones"];

const nextConfig: NextConfig = {
  async rewrites() {
    return legacyModuleRoutes.flatMap((module) => [
      {
        source: `/master-data/${module}`,
        destination: `/${module}`,
      },
      {
        source: `/master-data/${module}/:path*`,
        destination: `/${module}/:path*`,
      },
    ]);
  },
};

export default nextConfig;
