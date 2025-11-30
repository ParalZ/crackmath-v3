import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    resolveAlias: {
      "@cortex-js/compute-engine":
        "./node_modules/@cortex-js/compute-engine/dist/compute-engine.esm.js",
    },
  },
};

export default nextConfig;
