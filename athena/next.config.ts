import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  experimental: {},
};

const withNextIntl = createNextIntlPlugin("./lib/i18n.ts");
export default withNextIntl(nextConfig);
