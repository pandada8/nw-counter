var path = require("path")

var node_modules_folder = path.resolve(__dirname, "node_modules")

module.exports = {
  entry: "./src/index.jsx",
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
          "css-loader?modules&localIdentName=[name]__[local]___[hash:base64:5]",
          'postcss-loader',
        ]
      }
    ]
  },
  postcss: [
    require('postcss-nested')(),
    require('cssnext')(),
    require('autoprefixer')({ browsers: ['last 2 versions'] })
  ]
}