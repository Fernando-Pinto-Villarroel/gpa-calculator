import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/core/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default withNextIntl(nextConfig);
