import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // ffmpeg-static resolves its binary path dynamically at runtime (based on
  // process.platform/arch), which Next's build-time file tracer can fail to
  // pick up automatically — force-include the package so the ffmpeg binary
  // actually ships with the generate-videos cron function.
  outputFileTracingIncludes: {
    "/api/cron/generate-videos": ["./node_modules/ffmpeg-static/**"],
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  disableLogger: true,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
