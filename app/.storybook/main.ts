import { dirname, join } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
const config = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/preset-create-react-app"),
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@storybook/addon-interactions"),
    "storybook-addon-react-router-v6",
  ],
  framework: "storybook-react-rspack",
  options: { fastRefresh: true },
  typescript: { reactDocgen: "react-docgen" },
  staticDirs: ["../public"],
};

export default config;
