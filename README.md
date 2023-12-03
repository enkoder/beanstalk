# Beanstalk

<img src="./app/assets/ai_beanstalk_royalties.jpeg" alt="beanstalk" width="400"/>

---

Welcome to [The Beanstalk](https://netrunner-beanstalk.net)!

## Architecture

This application is entirely build and deployed using
the [Cloudflare Worker](https://developers.cloudflare.com/workers/) platform. Wrangler & Miniflare
power the local development environment making it trivial to iterate on the UI and APIs. Pricing is
also quite generous at just $5 a month for their standard tier.

### OpenAPI

The API is using Cloudflare's awesome [itty-router-openapi](https://github.com/cloudflare/itty-router-openapi) project,
which makes it trivial to create an [OpenAPI](https://spec.openapis.org/oas/v3.1.0) spec directly from
Typescript + [Zod](https://github.com/colinhacks/zod) objects. Using this project works great with the CF workers and
trivializes keeping the OpenAPI spec up to date.

You can see the Beanstalk's API spec at https://beanstalk-api.enkoder.workers.dev/docs.

Using this OpenAPI spec, we entirely generate our Typescript based UI clients
using https://github.com/ferdikoomen/openapi-typescript-codegen, allowing us to just write the API once and immediately
use it on the UI. This client is fully take safe and enables us to import shared types between the API and the UI.
This technical design choice has seriously saved some time and effort.

### UI

The UI is built with modern [React](https://react.dev/) and [TailwindCSS](https://tailwindcss.com/) for styling.
Various components and design system elements can be viewed and developed without needing the run the API and depend
upon real data.

_There's currently an issue with building Storybook with rspack, so don't expect much here until things are fully
functional again._

The Webapp is built using [rspack](https://www.rspack.dev/) which is a replacement for webpack written in Rust. It's
crazy fast and only going to get so much better. Yes, this is a small app, but I wanted to try out the new hotness.

### API & Infrastructure

The API, deployed entirely as Cloudflare workers, means we're confined to the Cloudflare Workers platform. Fortunately,
these days it has everything you would expect,
including [async cron scheduled handler](https://developers.cloudflare.com/workers/configuration/cron-triggers/),
a [pub-sub based queue](https://developers.cloudflare.com/queues/),
a [key-value blob store](https://developers.cloudflare.com/kv/),
and even
a [relational database](https://developers.cloudflare.com/d1/) product that works perfectly with their worker platform.
Like I said, Beanstalk is all-in on the CF Worker platform, and it's been great _so far_.

Take a look at the [wrangler.toml](/api/wrangler.toml) file which has the full configuration of the API, showing you
what Cloudflare products are set up.

Cloudflare has [some limitations](https://developers.cloudflare.com/workers/platform/limits/) which is why there's a
decent amount of logic in the [background.ts](api/src/background.ts). There's a CPU time limit as well as a concurrency
limit.

## Developer Environment

This project uses [pnpm](https://pnpm.io/) as it's package manager which is again, the new hotness. Symlinks ftw!

```shell
# Install pnpm however you'd like, then run the following
pnpm install

# To start the API and the UI run the following
pnpm start-api
pnpm start-app

# To start tailwind run the following
pnpm start-tailwind
```

### Tests

You will not find many tests at the Beanstalk. But if you do want to run them locally, you can with.

```shell
pnpm -r test
```

### Environment Variables

Move the [.dev.vars.example](/api/.dev.vars.example) file to api/.dev.vars and edit any secrets to test certain features
like OAauth w/ NRDB which requires a specific client secret and token.

```shell
mv api/.dev.vars.example api/.dev.vars
```

### Linting

This repo has some pre-commits installed to help ensure the repo stays looking fresh. To install and
setup pre-commit, run the following. If you are on Linux, you can install pre-commit w/ pip

```shell
brew install pre-commit
pre-commit isntall
```

We also expect to run eslint & tsc on the codebase to ensure a healthy and safe repo.

```shell
pnpm -r lint
```

### IDE Configuration

-[ ] Setup VSCode config -[ ] Setup Webstorm config

### CI

[Github Actions](.github/workflows/tests.yaml) are set up for this repo. The CI job will install dependencies, run
lints,
and any tests configured in any of the pnpm workspaces. You will receive during development on PRs.
