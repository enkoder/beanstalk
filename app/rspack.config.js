const path = require("path");
const rspack = require("@rspack/core");

const isProduction = process.env.NODE_ENV === "production";

const postcssConfig = require("./postcss.config");

module.exports = {
  target: "web",
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
      {
        resource: path.resolve(__dirname, "../api/src/lib/ranking.ts"),
        type: "asset/source",
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: postcssConfig,
            },
          },
        ],
        type: "css",
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
    client: { logging: "info" },
    port: 8080,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
  },
  devtool: "source-map",
};
