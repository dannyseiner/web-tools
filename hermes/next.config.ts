import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@webtools/error-kit"],
  outputFileTracingIncludes: {
    "/*": ["./messages/**/*"],
  },
};

export default nextConfig;
