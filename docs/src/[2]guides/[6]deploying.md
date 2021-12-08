# Deploying

Vitebook is a static-site generator, so it can be virtually deployed on any hosting provider that
supports Node.js version `>=16.10.0`. We recommend Netlify, but feel free to use whatever you like.

- Build command: `npm run vitebook:build`
- Output Directory: `.vitebook/dist`
- Minimum Node.js Version: `16.10.0`

## Netlify

You can configure the Netlify deployment either via the website, or with a local `netlify.toml`
file.

```toml
[build]
  command = "npm run vitebook:build"
  publish = ".vitebook/dist"

[build.environment]
  NODE_VERSION = "16"
```

## GitHub Pages

Set the correct `baseUrl`.

- If you are deploying to `https://<USERNAME>.github.io/`, you can omit this step as the base
  defaults to `/`.
- If you are deploying to `https://<USERNAME>.github.io/<REPO>/`, for example your repository is at
  `https://github.com/<USERNAME>/<REPO>`, then set base to `/<REPO>/`.

```js {6}
import { defineConfig } from '@vitebook/client/node';

export default defineConfig({
  // ...
  site: {
    baseUrl: '/<REPO>',
    // ...
  },
});
```

Create a GitHub workflow at `.github/workflows/vitebook.yml`...

```yaml
name: Vitebook

on:
  push:
    branches: [main]

jobs:
  vitebook:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16.10.0'

      - name: Cache node modules
        uses: actions/cache@v2
        env:
          cache-name: cache-node-modules
        with:
          path: ~/.npm
          key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-npm-

      - name: Install dependencies
        run: npm ci

      - name: Build Vitebook
        run: npm run vitebook:build

      - name: Deploy to GitHub Pages
        uses: crazy-max/ghaction-github-pages@v2
        with:
          target_branch: gh-pages
          build_dir: .vitebook/dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
