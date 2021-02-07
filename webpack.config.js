const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const argv = require('minimist')(process.argv.slice(2)).mode;
const Config = {
   buildDir: path.resolve(__dirname, "build"),
};

module.exports = () => {
   return {
      entry: {
         index1: "./index.js",
      },
      output: {
         filename: "js/[name].[hash].js",
         path: Config.buildDir,
      },
      devServer: {
         contentBase: Config.buildDir,
         host: "0.0.0.0",
         port: 12345
      },
      module: {
         rules: [{
            test: /(\.jsx|\.js)$/,
            exclude: /node_modules/,
            use: {
               loader: "babel-loader",
            }
         }, {
            test: /\.scss$/,
            use: [{
               loader: "style-loader", // creates style nodes from JS strings
            }, {
               loader: "css-loader" // translates CSS into CommonJS
            }, {
               loader: "sass-loader" // compiles Sass to CSS
            }]
         }, {
            test: /\.css$/,
            use: [{
               loader: "style-loader",
            }, {
               loader: "css-loader",
            }]
         }, {
            test: /\.(gif|png|jpe?g)$/i,
            use: [{
               loader: 'url-loader',
               options: {
                  name: "img/[name].[hash].[ext]",
                  limit: 8192,
               }
            }]
         }, {
            test: /\.(woff|svg|eot|ttf)\??.*$/,
            loader: "url-loader",
            options: {
               name: "fonts/[name].[hash].[ext]",
               limit: 1
            }
         }, {
            test: require.resolve('topojson'),
            loader: "exports?topojson"
         }, {
            test: require.resolve('d3-geo-projection'),
            loader: "exports?geoProjection"
         }

         ],
      },
      plugins: [
         new CleanWebpackPlugin([Config.buildDir]),
         new CopyWebpackPlugin(
            [
               { context: __dirname, from: "lib/**/*" },
               { context: __dirname, from: "data/**/*" },
               { context: __dirname, from: "images/**" }
            ]
         ),
         new HtmlWebpackPlugin({
            template: "index.html",
            filename: "index.html"
         }),
         new webpack["DllReferencePlugin"]({
            context: __dirname,
            manifest: require("./lib/vendors/manifest.vendors.json"),
         }),
      ],
      node: {
         fs: "empty"
      }
   }
};