const path = require("path");
const rspack = require("@rspack/core");

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  entry: {
    main: "./src/index.tsx",
  },
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.png$/,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: "./public/index.html",
      favicon: "./public/favicon.ico",
    }),
  ],
  mode: isProduction ? "production" : "development",
  devServer: {
    hot: false,
    port: 8080,
    historyApiFallback: true,
  },
};
