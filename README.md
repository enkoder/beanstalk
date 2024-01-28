# Beanstalk

<img src="./app/assets/ai_beanstalk_royalties.jpeg" alt="beanstalk" width="400"/>

---

Welcome to [The Beanstalk](https://netrunner-beanstalk.net)!

## Architecture

This application is entirely build and deployed using
the [Cloudflare Worker](https://developers.cloudflare.com/workers/) platform. Wrangler & Miniflare power the local
development environment making it trivial to iterate on the UI and APIs. Pricing is also quite generous at just $5 a
month for their standard tier.

### OpenAPI

The API is using Cloudflare's awesome [itty-router-openapi](https://github.com/cloudflare/itty-router-openapi) project,
which makes it trivial to create an [OpenAPI](https://spec.openapis.org/oas/v3.1.0) spec directly from
Typescript + [Zod](https://github.com/colinhacks/zod) objects. Using this project works great with the CF workers and
trivializes keeping the OpenAPI spec up to date.

You can see the Beanstalk's API spec at https://netrunner-beanstalk.net/api/docs
or [redoc](https://netrunner-beanstalk.net/api/redoc).

Using this OpenAPI spec, we entirely generate our Typescript based UI clients
using https://github.com/ferdikoomen/openapi-typescript-codegen, allowing us to just write the API once and immediately
use it on the UI. This client is fully take safe and enables us to import shared types between the API and the UI.
This technical design choice has seriously saved some time and effort.

### UI

The UI is built with modern [React](https://react.dev/) and [TailwindCSS](https://tailwindcss.com/) for styling. Various
components and design system elements can be viewed and developed without needing the run the API and depend upon real
data. The Webapp is built using [rspack](https://www.rspack.dev/) which is a replacement for webpack written in Rust.
It's crazy fast and only going to get so much better. Yes, this is a small app, but I wanted to try out the new hotness.

### API & Infrastructure

The API, deployed entirely as Cloudflare workers, means we're confined to the Cloudflare Workers platform. Fortunately,
these days it has everything you would expect,
including [async cron scheduled handler](https://developers.cloudflare.com/workers/configuration/cron-triggers/),
a [pub-sub based queue](https://developers.cloudflare.com/queues/),
a [key-value blob store](https://developers.cloudflare.com/kv/), and even
a [relational database](https://developers.cloudflare.com/d1/) product that works perfectly with their worker platform.
Like I said, Beanstalk is all-in on the CF Worker platform, and it's been great _so far_.
Take a look at the [wrangler.toml](/api/wrangler.toml) file which has the full configuration of the API, showing you
what Cloudflare products are set up.

Cloudflare has [some limitations](https://developers.cloudflare.com/workers/platform/limits/) which is why there's a
decent amount of logic in the [background.ts](api/src/background.ts). There's a CPU time limit as well as a concurrency
limit.

### Sentry & Error Reporting

At Beanstalk we have a free-tier Sentry domain up and running and we should try hard to keep it free. Currently, this is
set up using
Cloudflare's [Sentry Integration](https://developers.cloudflare.com/workers/observability/sentry-integration/)
configured to create issues for every 400, 4xx (!401), and every 5xx.

If you become a collaborator on the project, I'm happy to grant access to our Sentry
project -> https://netrunner-beanstalk.sentry.io/issues/

## Developer Environment

This project uses [pnpm](https://pnpm.io/) as it's package manager which is again, the new hotness. Symlinks ftw!

There are number of things that all need to running in order to have a smooth developer experience. We are
using [PM2](https://pm2.keymetrics.io/) to help facilitate the local dev orchestration.

- api: the cf worker api that uses the wrangler cli under the hood
- app: the main React app that uses rspack to bundle and serve the webapp during development
- tailwind: the CSS framework/utility we use to create automatically generated css
- spec: Using the OpenAPI spec we codegen a client for the react app to use. This will run whenever openapi.ts changes.

```shell
# Install pnpm however you'd like, then run the following
pnpm install

# To start all of the things run and open a PM2 monit view run
pnpm start

# To start individual sub-systems run the following
pnpm start-tailwind
pnpm start-api
pnpm start-app
pnpm spec
```

### PM2

[PM2](https://pm2.keymetrics.io/) is an alternative to [supervisord](http://supervisord.org/) if you are familiar with
that product. Based upon a [config file](./ecosystem.config.js) PM2 can orchestrate running these "apps" locally for you
w/o needing to open N number of terminal windows. This means once you stand it all up, it will stay running. There's a
few pnpm commands that abstract away the need to learn PM2 commands directly, but it's certainly recommended to read up
on the product.

```shell
# starts all of the services and runs the monit command
pnpm start
# tails logs and formats the lines with the name of the app
pnpm logs
# brings all of the service down
pnpm stop
# to run a specific PM2 command
pnpm exec pm2 <command>
```

### Tests

Be sure to write them! We use Miniflare locally to test the http handlers. Unfortunately, Miniflare requires a fully
built and packaged app, so you need to run a full build prior to running the tests. You can run all the tests with the
command below.

```shell
pnpm -r test
```

### Environment Variables

Move the [.dev.vars.example](/api/.dev.vars.example) file to api/.dev.vars and edit any secrets to test certain features
like OAauth w/ NRDB which requires a specific client secret and token.

```shell
mv api/.dev.vars.example api/.dev.vars
```

### Linting, Formatting, and Import Order

This repo has some pre-commits installed to help ensure the repo stays looking fresh. These should come pre-installed
and ready to go out of the box after a `pnpm install`.

We use [Biomejs](https://biomejs.dev/) as our linter & formatter. Install the BiomeJS plugin into your editor, and you
will get autoformatting out of the box. To run all lints run

```shell
pnpm lint
```

### IDE Configuration

VSCode workspace file is very minimal. All your really need to do is run `pnpm install` and ensure the Biome plugin is
installed. Jest should also come ready out of the box.

### CI

[Github Actions](.github/workflows/tests.yaml) are set up for this repo. The CI job will install dependencies, run
lints, and run any tests configured in any of the pnpm workspaces. Tests will run on your Pull Requests and give and
post test statuses. We expect tests to pass prior to merging.
