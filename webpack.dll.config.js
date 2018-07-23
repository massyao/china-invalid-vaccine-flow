const webpack = require("webpack");
const path = require("path");
const CleanWebpackPlugin = require('clean-webpack-plugin');

const Config = {
   buildDir: path.resolve(__dirname, "lib/vendors"),
};

module.exports = {
   entry: {
      vendors: [
         "d3",
         "react",
         "react-dom",
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