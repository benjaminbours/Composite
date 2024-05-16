const version = require('./package.json').version;

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, options) => {
        config.module.rules.push({
            test: /\.glsl/,
            loader: 'webpack-glsl-loader',
        });
        return config;
    },
    reactStrictMode: true,
    productionBrowserSourceMaps: true,
    env: {
        APP_VERSION: version,
    },
    // productionBrowserSourceMaps: true,
};

// Injected content via Sentry wizard below

let config = withBundleAnalyzer(nextConfig);

if (process.env.NEXT_PUBLIC_STAGE !== 'development') {
    config = withSentryConfig(
        config,
        {
            // For all available options, see:
            // https://github.com/getsentry/sentry-webpack-plugin#options

            // Suppresses source map uploading logs during build
            silent: true,
            org: 'benjamin-bours',
            project: 'composite',
        },
        {
            // For all available options, see:
            // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

            // Upload a larger set of source maps for prettier stack traces (increases build time)
            widenClientFileUpload: true,

            // Transpiles SDK to be compatible with IE11 (increases bundle size)
            transpileClientSDK: true,

            // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
            tunnelRoute: '/monitoring',

            // Hides source maps from generated client bundles
            hideSourceMaps: true,

            // Automatically tree-shake Sentry logger statements to reduce bundle size
            disableLogger: true,

            // Enables automatic instrumentation of Vercel Cron Monitors.
            // See the following for more information:
            // https://docs.sentry.io/product/crons/
            // https://vercel.com/docs/cron-jobs
            automaticVercelMonitors: true,
        },
    );
}

module.exports = config;
