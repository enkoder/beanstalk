import colors = require("tailwindcss/colors");
import type { Config } from "tailwindcss";

module.exports = {
  content: ["./public/index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: { ...colors },
      transitionProperty: {
        width: "width",
      },
    },
  },
  plugins: [],
} satisfies Config;
