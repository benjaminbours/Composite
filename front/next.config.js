const version = require('./package.json').version;

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

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
    env: {
        APP_VERSION: version,
    },
    // productionBrowserSourceMaps: true,
};

module.exports = withBundleAnalyzer(nextConfig);
