module.exports = {
  apps: [
    {
      name: "app",
      script: "pnpm --filter app start",
    },
    {
      name: "api",
      script: "pnpm --filter api start",
    },
    {
      name: "tailwind",
      script:
        "pnpm --filter app exec tailwindcss -i ./src/input.css -o ./src/output.css --watch",
    },
    {
      name: "spec",
      script: "pnpm exec nodemon --exec 'pnpm spec' --watch api/src/openapi.ts",
    },
  ],
};
