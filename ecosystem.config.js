module.exports = {
  apps: [
    {
      name: "app",
      watch: false,
      script: "pnpm --filter app exec rspack serve",
    },
    {
      name: "api",
      watch: false,
      script: "pnpm --filter api exec wrangler dev",
    },
    {
      name: "tailwind",
      watch: false,
      script:
        "pnpm --filter app exec tailwindcss -i ./src/input.css -o ./src/output.css --watch",
    },
    {
      name: "spec",
      watch: ["api/src/openapi.ts"],
      script: "pnpm run spec",
      autorestart: false,
      stop_exit_codes: [0],
    },
  ],
};
