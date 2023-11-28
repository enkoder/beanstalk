import colors = require("tailwindcss/colors");
import type { Config } from "tailwindcss";

module.exports = {
  content: ["./public/index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        bunker: {
          "50": "#f5f7fa",
          "100": "#ebeef3",
          "200": "#d1d9e6",
          "300": "#aab9cf",
          "400": "#7b94b5",
          "500": "#5b779c",
          "600": "#475e82",
          "700": "#3a4c6a",
          "800": "#334259",
          "900": "#2e394c",
          "950": "#13171f",
        },
        beans: {
          "50": "#c5fbf4",
          "100": "#9bfdf2",
          "200": "#66f9ed",
          "300": "#2aefe5",
          "400": "#1cb5b2",
          "500": "#088787",
          "600": "#046f71",
          "700": "#064e51",
          "800": "#08383b",
          "900": "#1c212c",
          "950": "#13171f",
        },
        ...colors,
      },
      keyframes: {
        zoom: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.5)" },
        },
      },
      animation: {
        zoom: "zoom 100s alternate infinite",
      },
      transitionProperty: {
        width: "width",
        zoom: "zoom",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
