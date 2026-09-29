import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/core/lib/i18n/request.ts");

const buildId =
  process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.APP_BUILD_ID ?? String(Date.now());

const nextConfig: NextConfig = {
  reactCompiler: true,
  env: {
    APP_BUILD_ID: buildId,
  },
};

export default withNextIntl(nextConfig);
