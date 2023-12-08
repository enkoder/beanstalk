const path = require("path");
const rspack = require("@rspack/core");

const isProduction = process.env.NODE_ENV === "production";

const postcssConfig = require("./postcss.config");

module.exports = {
  target: "web",
  context: __dirname,
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
        test: /\.(png|jpg|jpeg)$/,
        type: "asset/resource",
      },
      {
        test: /\.(pdf)$/i,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
        },
      },
      {
        resource: path.resolve(__dirname, "../api/src/lib/ranking.ts"),
        type: "asset/source",
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              typescript: true,
              ext: "tsx",
              icon: true,
            },
          },
        ],
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
