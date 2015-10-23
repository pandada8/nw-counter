var path = require("path")

var node_modules_folder = path.resolve(__dirname, "node_modules")

module.exports = {
  entry: "./src/index.jsx",
  devtool: "source-map",
  output: {
    filename: "bundle.js",
    path: __dirname + "/dist",
    publicPath: "/static"
  },
  module: {
    loaders: [
      {
        test: /\.jsx$/,
        loader: "babel",
        query: {
          stage: 0
        },
        exclude: [node_modules_folder]
      },
      {
        test: /\.css$/,
        loaders: [
          "style-loader",
          "css-loader",
        ]
      }
    ]
  }
}