var path = require("path")
var webpack = require("webpack")

var node_modules_folder = path.resolve(__dirname, "node_modules")

module.exports = {
  entry: "./src/index.jsx",
  devtool: "source-map",
  output: {
    filename: "bundle.js",
    path: __dirname + "/dist",
    publicPath: "/static"
  },
  minimize: true,
  plugins: [
    new webpack.DefinePlugin({"process.env": {NODE_ENV: '"production"'}}),
    new webpack.DedupePlugin(),
    new webpack.OccurenceOrderPlugin(),
    new webpack.UglifyJsPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.jsx$/,
        loader: "babel",
        query: {
          stage: 0
        },
        exclude: [node_modules_folder]
      }
    ]
  }
}