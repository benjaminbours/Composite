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
};

module.exports = nextConfig;
