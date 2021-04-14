const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  mode: "production",
  entry: ["./web/index.tsx"],
  output: {
    path: "/static/",
    filename: "app.js",
  },
  resolve: {
    modules: ["node_modules"],
    alias: {
      "react-dom": "@hot-loader/react-dom",
    },
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: ["html-loader"],
      },
      {
        test: /\.(j|t)s(x)?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            babelrc: false,
            presets: [
              [
                "@babel/preset-env",
                { targets: { browsers: "last 2 versions" } }, // or whatever your project requires
              ],
              "@babel/preset-typescript",
              "@babel/preset-react",
            ],
            plugins: [
              ["@babel/plugin-proposal-class-properties", { loose: true }],
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./web/index.html",
    }),
  ],
}
