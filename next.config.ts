import type { NextConfig } from "next";

const legacyModuleRoutes = ["animals", "species", "devices", "geo-zones"];

const legacyEditRoutes = [
  "animals",
  "species",
  "devices",
  "geo-zones",
  "incidents",
];

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      ...legacyModuleRoutes.flatMap((module) => [
        {
          source: `/master-data/${module}`,
          destination: `/${module}`,
        },
        {
          source: `/master-data/${module}/:path*`,
          destination: `/${module}/:path*`,
        },
      ]),
      ...legacyEditRoutes.map((module) => ({
        source: `/${module}/:id/update`,
        destination: `/${module}/:id/edit`,
      })),
    ];
  },
};

export default nextConfig;
