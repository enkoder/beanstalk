const path = require("path");
const rspack = require("@rspack/core");

const isProduction = process.env.NODE_ENV === "production";

const postcssConfig = require("./postcss.config");

const child_process = require('child_process');
function git(command) {
  return child_process.execSync(`git ${command}`, { encoding: 'utf8' }).trim();
}


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
				test: /\.(png|jpg|jpeg|webp)$/,
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
		new rspack.EnvironmentPlugin({
			GIT_BRANCH: process.env.CF_PAGES_BRANCH || git("branch --show-current"),
			GIT_COMMIT_HASH: git("describe --always"),
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
