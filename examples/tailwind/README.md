# Vitebook + Tailwind

This directory contains a simple example demonstrating how to setup Vitebook with
[Tailwind](https://tailwindcss.com).

## Steps

1. `npm install -D tailwindcss postcss autoprefixer`
2. `npx tailwindcss init -p`
3. Change the Tailwind configuration file name to `tailwind.config.cjs`.
4. Add content globs to `tailwind.config.cjs`, as shown [here](./tailwind.config.cjs).
5. Change PostCSS configuration file name to `postcss.config.cjs`.
6. Create a `global.css` file in the `.vitebook` directory, as shown [here](./.vitebook/global.css).
7. Import global styles into your App component at `.vitebook/App.svelte`, as shown [here](./.vitebook/App.svelte).
8. `npm run vitebook:dev` 🥳

## Commands

```bash
# run dev server
npm run vitebook:dev

# build for production
npm run vitebook:build

# serve production build
npm run vitebook:preview
```
