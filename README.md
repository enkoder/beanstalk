# beanstalk

## Running the applications

```shell
# Install pnpm however you'd like, then
pnpm install
pnpm --stream run start
```

## Environment Variables

Move the .dev.vars.example file to .dev.vars and edit any secrets to test certain features
like OAauth w/ NRDB which requires a specific client secret and token.

```shell
mv api/.dev.vars.example api/.dev.vars
```

## Linting

This repo has some pre-commits installed to help ensure the repo stays looking fresh. To install and
setup pre-commit, run the following. If you are on Linux, you can install pre-commit w/ pip.

```shell
brew install pre-commit
pre-commit isntall
```

We also expect to run eslint & tsc on the codebase to ensure a healthy and safe repo.

```shell
npx tsc
npx eslint --fix sr
```
