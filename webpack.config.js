const path = require("path");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const ouputPath = path.resolve(__dirname, "./dist/");

module.exports = {
    context: path.resolve(__dirname, "./src"),
    devtool: "source-map",
    entry: {
        "app": "./App.tsx",
    },
    module: {
        rules: [
            {
                exclude: [/node_modules/],
                loader: "ts-loader",
                test: /\.(ts|tsx|js|jsx)$/,
            },
            {
                test: /\.(sass|scss)$/,
                use: [
                    "style-loader",
                    MiniCssExtractPlugin.loader,
                    { loader: "css-loader", options: { importLoaders: 1 } },
                    {
                        loader: "postcss-loader",
                        options: {
                            ident: "postcss",
                            plugins: (loader) => [
                                require("autoprefixer"),
                                require("cssnano"),
                            ],
                        },
                    },
                    "sass-loader",
                ],
            },
            {
                loader: "file-loader?limit=20000&name=images/[name].[ext]",
                test: /\.(png|jpg|jpeg|svg)$/,
            },
            // {
            //     test: /\.(woff|woff2|eot|ttf)$/,
            //     loader: "url-loader?limit=20000&name=fonts/[name].[ext]"
            // },
        ],
    },
    output: {
        chunkFilename: "[name].chunk.js",
        filename: "[name].bundle.js",
        path: ouputPath,
        publicPath: "dist/",
    },
    plugins: [
        // new BundleAnalyzerPlugin(),
        new MiniCssExtractPlugin({
            filename: "stylesheets/style.css",
        }),
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
    },
};
