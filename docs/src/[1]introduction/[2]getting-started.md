# Getting Started

## Installation

It's super easy to get started with Vitebook, simply run the following command in your terminal...

```bash:no-line-numbers
# npm
$: npm init vitebook
# or (new directory)
$: npm init vitebook my-app

# yarn
$: yarn create vitebook
# or (new directory)
$: yarn create vitebook my-app

# pnpm
$: pnpm create vitebook
# or (new directory)
$: pnpm create vitebook my-app
```

### Extra Options

- `{TEMPLATE}`: replace with either `vue`, `svelte`, `preact`, or `react`.
- `{THEME}`: replace with either `blank`, `custom`, or `default`.
- `{FEATURES}`: replace with comma separated list such as `markdown,typescript`. Valid features
  are `markdown`, `typescript`, `eslint`, `prettier`, and `lint-staged`.

```bash:no-line-numbers
# npm 6.x
npm init vitebook my-app \
--template {TEMPLATE} \
--theme {THEME} \
--features {FEATURES}

# npm 7+, extra double-dash is needed:
npm init vitebook my-app -- --template vue

# yarn
yarn create vitebook my-app --template vue

# pnpm
pnpm create vitebook my-app -- --template vue
```

## Commands

:::tip
Vitebook CLI commands are an extension of [Vite commands](https://vitejs.dev/guide/#command-line-interface)
(all options are forwarded to Vite).
:::

Vitebook provides three commands out of the box:

- `vitebook dev`: Start the dev server.
- `vitebook build`: Create production build.
- `vitebook preview`: Locally preview production build.

The following are added to your `package.json` when using the installation method above...

```json:no-line-numbers
{
  "scripts": {
    "vitebook:dev": "vitebook dev",
    "vitebook:build": "vitebook build",
    "vitebook:preview": "vitebook preview"
  }
}
```

You can specify additional CLI options like `--port` or `--https`. For a full list of CLI options,
run `npx vitebook --help` in your project.

## Concepts

There are some important concepts and features to keep in mind while building with Vitebook that
are derived directly from Vite. As much as you should probably read through all of the Vite
documentation, here's some essentials:

- [Vite Project Root](https://vitejs.dev/guide/#index-html-and-project-root)
- [Vite Features](https://vitejs.dev/guide/features.html)
- [Static Assets](https://vitejs.dev/guide/assets.html)
- [Env Variables](https://vitejs.dev/guide/env-and-mode.html)

## Examples

You can find some basic [examples](https://github.com/vitebook/vitebook/tree/main/examples) in the
Vitebook GitHub repository:

- [Custom Theme](https://github.com/vitebook/vitebook/tree/main/examples/custom-theme)
- [Preact](https://github.com/vitebook/vitebook/tree/main/examples/preact)
- [React](https://github.com/vitebook/vitebook/tree/main/examples/react)
- [Svelte](https://github.com/vitebook/vitebook/tree/main/examples/svelte)
- [Vue](https://github.com/vitebook/vitebook/tree/main/examples/vue)
