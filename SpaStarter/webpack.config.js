const path = require('path');
const bundleFileName = 'bundle';
const WebpackCdnPlugin = require('webpack-cdn-plugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
var webpack = require("webpack");
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
//const ImageminPlugin = require('imagemin-webpack-plugin').default;

module.exports = (env = {}, argv = {}) => {
    console.log(env);
    console.log(argv);
    const isDevBuild = !(process.env.NODE_ENV ==='production' || env && env.prod);
    const outputDir = env && env.publishDir
        ? env.publishDir
        : __dirname;
    console.log(outputDir);
    return [{
        mode: isDevBuild ? 'development' : 'production',
        devtool: isDevBuild ? 'inline-source-map' : 'source-map',
        stats: { modules: false },
        entry: {
            'bundle': ['./src/index.ts', './src/sass/index.scss']
        },
        output: {
            filename: bundleFileName + '.js',
            path: path.resolve(__dirname, 'wwwroot'),
            publicPath: isDevBuild ? "/" :"./"
        },
        watchOptions: {
            ignored: /node_modules/
        },
        devServer: {
            hot: isDevBuild,
            historyApiFallback: {
                index: '/index.html'
            },
            compress: true,
            port: 8085,
            contentBase: path.resolve(__dirname, "wwwroot")
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"]
        },
        module: {
            rules: [{
                test: /\.scss$/,
                use: [

                    {
                        loader: isDevBuild ? 'style-loader' : MiniCssExtractPlugin.loader//puts css inline
                    },
                    {
                        loader: "css-loader",
                        options: {
                            minimize: true || {/* or CSSNano Options */ }
                        }
                    },
                    {
                        loader: "sass-loader"
                    }
                ]
            },
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.tsx?$/,
                include: /src/,
                loader: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            useCache: true,
                            useBabel: true
                        }
                    }
                ]
            },
                {
                    test: /\.(png|jpg|jpeg|gif|svg)$/, use: [
                     
                        {
                        loader: 'url-loader',
                        options: {
                            limit:2500,
                            outputPath: './img/'
                        }
                    }

                    ]
                },
            {
                test: /\.(woff|woff2|eot|ttf|svg)(\?|$)/, use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: './fonts/'
                    }
                }]
            },
                {
                    test: /\.html$/, use: {
                        loader: 'html-loader',
                        options: {
                            interpolate: true
                        }
                    }
                }

            ]
        },
        plugins: [
            new CleanWebpackPlugin([path.join(outputDir, 'wwwroot', 'img'), path.join(outputDir, 'wwwroot', 'fonts'), path.join(outputDir, 'wwwroot', 'bundle.*'), path.join(outputDir, 'wwwroot', '*.html')]),
            new CopyWebpackPlugin([{ from: './src/video/stock', to: path.resolve(__dirname, 'wwwroot/video/stock')}]),
            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[id].css"
            }),
            new HtmlWebpackPlugin({
                hash: true,
                template: './src/index.html',
                filename: './index.html' 
            }),
            new HtmlWebpackPlugin({
                hash: true,
                template: './src/hasher.html',
                filename: './hasher.html'
            }),
            //new BundleAnalyzerPlugin(),
            //new ImageminPlugin({ test: /\.(png|jpg|gif)$/ }),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            new WebpackCdnPlugin({
                modules: [
                    {
                        name: 'moment',
                        var: 'moment',
                        path: 'min/moment.min.js'
                    },
                    {
                        name: 'jquery',
                        var: 'jQuery',
                        path: 'dist/jquery.min.js'
                    },
                    {
                        name: 'bootstrap',
                        var: 'bootstrap',
                        path: 'dist/js/bootstrap.min.js',
                        style: 'dist/css/bootstrap.min.css'
                    },
                    {
                        name: 'toastr',
                        var: 'toastr',
                        path: 'build/toastr.min.js',
                        style: 'build/toastr.min.css'
                    }
                ],
                publicPath: '/node_modules'
            }),
            new CheckerPlugin()

        ]
    }];
};