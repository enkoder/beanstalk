# anrpc

## Running the applications

```shell
# Install pnpm however you'd like, then
pnpm install
pnpm --stream run start
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
