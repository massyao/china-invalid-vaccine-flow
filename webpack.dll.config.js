const webpack = require("webpack");
const path = require("path");
const CleanWebpackPlugin = require('clean-webpack-plugin');

const Config = {
   buildDir: path.resolve(__dirname, "lib/vendors"),
};

module.exports = {
   entry: {
      vendors: [
        "accounting",
        "bluebird",
        "c3",
        "classnames",
        "console-browserify",
        "core-js",
        "d3",
        "d3-geo-projection",
        "exports-loader",
        "i18n-iso-countries",
        "lodash.throttle",
        "moment",
        "pixi.js",
        "point-in-polygon",
        "polygon",
        "query-string",
        "randgen",
        "react",
        "react-dom",
        "sha.js",
        "sprintf-js",
        "topojson",
        "underscore",
        "url",
        "vec2"
      ]
   },
   target: "web",
   output: {
      path: Config.buildDir,
      filename: "[name].[hash].js",
      library: "[name]",
   },
   plugins: [
      new CleanWebpackPlugin([Config.buildDir]),
      new webpack["DllPlugin"]({
         context: __dirname,
         name: "[name]",
         path: path.join(Config.buildDir, "manifest.[name].json"),
      }),
   ],
   node: {
      fs: "empty"
   }
};