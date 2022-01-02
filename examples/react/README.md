# Vitebook + React

This directory contains a simple example demonstrating how to setup Vitebook with
[React](https://reactjs.org). Feel free to explore the [`.vitebook`](./.vitebook) and
[`src`](./src) directories.

Bear in mind that the React package uses [Preact](https://preactjs.com) under the hood. The
`@vitebook/preact` package aliases `react` and `react-dom` to `preact/compat`, which you can find
more information about [here](https://preactjs.com/guide/v10/switching-to-preact/).

**TL;DR: `preact/compat`**

> This lets you continue writing React/ReactDOM code without any changes to your workflow or
> codebase. preact/compat adds somewhere around 2kb to your bundle size, but has the advantage
> of supporting the vast majority of existing React modules you might find on npm. The
> `preact/compat` package provides all the necessary tweaks on top of Preact's core to make it
> work just like react and react-dom, in a single module.

**Why are we using Preact for React?**

We don't support an official React package for Vitebook because:

1. It reduces the amount of code we need to maintain and distribute.
2. Thanks to `preact/compat` you get all the functionality of React for ~6kB minzipped instead of
   ~45kB.
3. Preact has much better native HTML support for things like `class="..."`, `style="..."`, web
   components, etc. This leads to a better developer experience (DX), _and_ it helped us write a
   much simpler markdown package, since we don't have to do any juggling between React JSX and
   standard HTML.

## Commands

```bash
# run dev server
npm run vitebook:dev

# build for production
npm run vitebook:build

# serve production build
npm run vitebook:preview
```
