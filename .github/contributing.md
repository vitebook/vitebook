# Contributing Guide

First off, thank you for taking the time to contribute to Vitebook. You'll find instructions below
on how to get yourself up and running so you can create your first PR.

## 🎒 Getting Started

### Prerequisites

Let's setup our machine. The only software you'll need to install is:

- [node](https://nodejs.org/en/download)
- [git](https://git-scm.com/downloads)
- [pnpm](https://pnpm.io/installation)
- [volta](https://docs.volta.sh/guide) or [nvm](https://github.com/nvm-sh/nvm)
  (we recommend volta)

They're very easy to install, just follow the links and you should be up and running in no time.

### Fork & Clone

Next, head over to the [Vitebook repository on GitHub][vitebook] and click the `Fork` button in the
top right corner. After the project has been forked, run the following commands in your terminal...

```bash
# Replace {github-username} with your GitHub username.
$: git clone https://github.com/{github-username}/vitebook --depth=1

$: cd vitebook

$: pnpm install
```

**OPTIONAL:** Now it'll help if we keep our `main` branch pointing at the original repository and make
pull requests from the forked branch.

```bash
# Add the original repository as a "remote" called "upstream".
$: git remote add upstream git@github.com:vitebook/vitebook.git

# Fetch the git information from the remote.
$: git fetch upstream

# Set your local main branch to use the upstream main branch whenver you run `git pull`.
$: git branch --set-upstream-to=upstream/main main

# Run this when we want to update our version of main.
$: git pull
```

### Node

Once you're done simply set your Node version to match the required version by Vitebook. If you've
installed `volta` then it will automatically pin it, and if you're using `nvm` simply run `nvm use`
from the project root.

## 💼 Package Manager (PNPM)

```bash
# Install all dependenices and symlink packages in the workspace (see `pnpm-workspace.yaml`).
$: pnpm install

# Install dependency for a single package.
$: pnpm install vite --filter core

# Update a dependency for a single package.
$: pnpm up vite@2.6.13 --filter core

# Update a dependency for all packages.
$: pnpm up vite@2.6.13 -r
```

## 📝 Documentation Site

The documentation site can be found in the `docs/` directory at the root of the project. It's
simply a Vitebook application, refer to the docs itself if you need any guidance.

```bash
# run development environment
$: pnpm docs:dev

# build for production
$: pnpm docs:build

# preview production site
$: pnpm docs:preview
```

## 💻 Scripts

```bash
# Run eslint and prettier to lint files and look for any code type/style/format issues.
$: pnpm lint

# Run eslint and prettier to lint files and also auto-fix any issues.
$: pnpm format

# Run build in any of the packages in the `packages/` directory.
$: pnpm build client

# Run build and watch for changes to rebuild in any of the packages in the `packages/` directory.
$: pnpm build client -- --watch

# Build all packages in the `packages/` directory.
$: pnpm build:all

# Run a script located inside an example in the `examples/` directory.
$: pnpm example

# Shorthand without running through prompts.
$: pnpm example svelte -- --script dev

# Run a script located inside a sandbox application in the `sandbox/` directory.
$: pnpm sandbox

# Shorthand without running through prompts.
$: pnpm sandbox svelte -- --script dev
```

## 🧪 Sandbox

The `sandbox/` directory at the root of the Vitebook project is where we build and test Vitebook
applications locally. It's safe to include anything inside of this directory as it's ignored
by Git.

We can quickly scaffold applications for local development via the `create-vitebook` package which
can also handle symlinking the `@vitebook/*` packages.

> We're using either NPM or Yarn in the example below because, Vitebook uses a PNPM workspace which
> will only get in the way when running commands inside the sandbox.

```bash
# 1. - make sure all local packages are built.
$: yarn build:all
# 2. - scaffold an application for local development.
$: yarn create vitebook sandbox/svelte --template svelte --theme default --link ../../packages
# 3.
$: yarn --cwd sandbox/svelte
# 4.
$: yarn dev --cwd sandbox/svelte
# 5. - run in another terminal session/window if we need to hack on a package.
$: yarn build theme-default --watch
```

The `--link ../../packages` CLI option will link any `@vitebook/*` packages based on the link path
provided. For example, `@vitebook/core` will be linked to `../../packages/core`.

## ✍️ Commit

This project uses [semantic commit messages][semantic-commit-style] to automate generating
changelogs and releases. Simply refer to the link, and also see existing commits to get an idea
of how to write your message.

If you've made changes to a specific package, simply include the package name without the
`@vitebook` prefix in the commit scope (see example below).

```bash
# Commit general changes.
$: git commit -m 'chore: your commit message'

# Commit changes made to a specific package (eg: @vitebook/client).
$: git commit -m 'fix(client): your commit message identifying fix'
```

## 🎉 Pull Request

**Working on your first Pull Request?** You can learn how from this free series
[How to Contribute to an Open Source Project on GitHub][pr-beginner-series].

Preferably create an issue first on GitHub, and then checkout a branch matching the issue number
(see example below). Once you're done, commit your changes, push to your forked repo, and create
a PR (see link above for more information if it's your first time).

```bash
# Create a branch for your PR, replace {issue-no} with the GitHub issue number.
$: git checkout -b issue-{issue-no}
```

[vitebook]: https://github.com/vitebook/vitebook
[npm]: https://www.npmjs.com
[monorepo]: https://en.wikipedia.org/wiki/Monorepo
[semantic-commit-style]: https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716
[pr-beginner-series]: https://app.egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github
