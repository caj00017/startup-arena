import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["@electric-sql/pglite"],
  experimental: {
    useTypeScriptCli: false
  }
};

export default nextConfig;
