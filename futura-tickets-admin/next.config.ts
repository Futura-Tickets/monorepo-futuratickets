import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  output: 'standalone',

  // Enable TypeScript validation in build
  typescript: {
    ignoreBuildErrors: false,
  },

  // Enable ESLint during builds
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Optimize images
  images: {
    unoptimized: false,
    domains: [
      'futurastorage.blob.core.windows.net',
      'futuratickets.blob.core.windows.net',
      'lh3.googleusercontent.com', // For Google OAuth profile pictures
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Enable experimental instrumentation
  experimental: {
    instrumentationHook: true,
  },
};

// Sentry webpack plugin options
const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT || 'futura-tickets-admin',

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Upload source maps in production only
  disableServerWebpackPlugin: process.env.NODE_ENV !== 'production',
  disableClientWebpackPlugin: process.env.NODE_ENV !== 'production',
};

// Wrap config with Sentry
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
