<script>
import { Tabs, TabPanel } from '@vitebook/client/components/tabs';

const jsLangs = ['JavaScript', 'TypeScript'];
</script>

# Configuration

By default, the Vitebook configuration can be found at `.vitebook/config.{js,cjs,mjs,ts}`. If you
followed the [getting started](./getting-started.md) guide then it will be set up for you
automatically. In the following sections we'll explore each of the configurable parts of
Vitebook.

## Usage

The configuration file is a JavaScript (JS) or TypeScript (TS) file that must contain a
`default` export binding to a plain JS object `export default { ... }`. The `@vitebook/client`
package exports a helper function `defineConfig` to ensure TypeScript type checking is applied.

```js:no-line-numbers
import { defineConfig } from '@vitebook/client/node';

export default defineConfig({
  // ...
});
```

The Vitebook configuration file is used in a Node environment, so ensure:

- No browser-specific API's are used.
- When importing from Vitebook packages, use the Node distribution by specifying the `/node`
  exports path, such as `import { ... } from '@vitebook/client/node'`.
- Vitebook is ESM only, however if you require CommonJS you can use a `.ts` file and ESBuild
  will transpile it correctly (we polyfill CommonJS globals such as `require`, `__dirname`, etc.).

## Directories

The following directories can be configured when using Vitebook:

- `root`: The project root directory path, defaults to `process.cwd()`. The path can be absolute
  or relative to the current working directory. During development Vitebook is a Node server, thus
  files are resovled from the root such as `/images/image.png`.
- `srcDir`: The source code directory path, defaults to `<root>/src`. The value can be either an
  absolute file system path, or a path relative to `<root>`. Currently, this is only used to
  auto-resolve page routes so instead of `/src/components/button.html`, we get
  `/components/button.html`.
- `configDir`: The Vitebook configuration directory path, defaults to `<root>/.vitebook`. The value
  can be either an absolute file system path, or a path relative to `<root>`.
- `publicDir`: Directory to serve as plain static assets, defaults to `<configDir>/public`. Files in
  this directory are served and copied to the `outDir` directory as-is without any transformations.
  The value can be either an absolute file system path, or a path relative to `<configDir>`.
- `outDir`: The production build output directory path, defaults to `<configDir>/dist`. The value
  can be either an absolute file system path, or a path relative to `<configDir>`.
- `cacheDir`: The Vitebook cache directory path, defaults to `<configDir>/.cache`. Mainly used
  by Vite for [dependency prebundling](https://vitejs.dev/guide/dep-pre-bundling.html). The value
  can be either an absolute file system path, or a path relative to `<configDir>`.
- `tmpDir`: The Vitebook temporary directory path, defaults to `<configDir>/.temp`. As the name
  suggests, used to store temporary files. This directory is reset if it becomes larger than 10MB.
  The value can be either an absolute file system path, or a path relative to `<configDir>`.

```js:no-line-numbers {4-10}
import { defineConfig } from '@vitebook/client/node';

export default defineConfig({
  root: '.',
  srcDir: 'src',
  configDir: '.vitebook',
  publicDir: '.vitebook/public',
  outDir: '.vitebook/dist',
  cacheDir: '.vitebook/.cache',
  tmpDir: '.vitebook/.temp',
});
```

## Pages

The `include` configuration option specifies the files you'd like to include in your Vitebook
application. The option accepts a list of [globs][do-glob-tool] that point to files that should be
resolved to a page. The page resolution happens via [plugins](.../advanced/plugins.md), see
the [pages guide](../guides/pages.md) for more information.

```js:no-line-numbers {4}
import { defineConfig } from '@vitebook/client/node';

export default defineConfig({
  include: ['src/**/*.md']
});
```

[do-glob-tool]: https://www.digitalocean.com/community/tools/glob?comments=true&glob=%2F%2A%2A%2F%2A.js&matches=false&tests=%2F%2F%20This%20will%20match%20as%20it%20ends%20with%20%27.js%27&tests=%2Fhello%2Fworld.js&tests=%2F%2F%20This%20won%27t%20match%21&tests=%2Ftest%2Fsome%2Fglobs

## Site

Site-wide options for setting the base language, document title, description, locales, etc. This
metadata is available to all themes via the `@vitebook/client` package.

```js:no-line-numbers {4-16}
import { defineConfig } from '@vitebook/client/node';

export default defineConfig({
  site: {
    baseUrl: '/',
    lang: 'en-US',
    title: 'Vitebook',
    description: 'Blazing fast alternative to Storybook.',
    head: [],
    theme: {
      // ...
    },
    locales: {
      // ...
    },
  }
});
```

### Site Head

Site configuration option for specifying HTML tags to be inserted in the document `<head>`. Each
tag is described as a tuple with the first index being the tag name, the second an object
of attributes denoted by `{ [attrName]: attrValue } `, and the third index (optional) being any
inner HTML.

:::tip
If the head tags you're inserting don't require dynamic processing, simply include them in the
`index.html` file present in your Vitebook configuration directory.
:::

```js:no-line-numbers {5-9}
import { defineConfig } from '@vitebook/client/node';

export default defineConfig({
  site: {
    head: [
      ['link', { rel: 'icon', href: '/logo.png' }],
      ['script', { src: 'https://site.com/script.js', type: 'module' }],
      ['style', { type: 'text/css' }, 'p { color: red; }'],
    ],
  }
});
```

### Site Theme

The `theme` configuration object depends on the specific theme being used. Vitebook provides a
default theme out of the box, see the [documentation](../default-theme/configuration.md) on it
for more information.

<Tabs values={jsLangs} groupId="jsLang">
<TabPanel value="JavaScript">

```js:no-line-numbers {5-8}
import { defineConfig } from '@vitebook/client/node';

export default defineConfig({
  site: {
    /** @type {(import('@vitebook/theme-default/node').DefaultThemeConfig} */
    theme: {
      // ...
    },
  }
});
```

</TabPanel>

<TabPanel value="TypeScript">

```ts:no-line-numbers {6-8}
import { defineConfig } from '@vitebook/client/node';
import { DefaultThemeConfig } from '@vitebook/theme-default/node';

export default defineConfig<DefaultThemeConfig>({
  site: {
    theme: {
      // ...
    },
  }
});
```

</TabPanel>
</Tabs>

### Site Locales

The `locales` option is used to specify locale specific site settings.

```js:no-line-numbers {5-20}
import { defineConfig } from '@vitebook/client/node';

export default defineConfig({
  site: {
    locales: {
      '/': {
        lang: 'en-US',
        langLabel: 'English',
        title: 'Vitebook',
        description: 'Storybook alternative.',
        head: [],
      },
      '/zh': {
        lang: 'zh-CN',
        langLabel: 'Chinese',
        title: '快速地 书',
        description: 'Storybook 选择.',
        head: [],
      }
    },
  }
});
```

## Alias

Specifies an object, or an array of objects, which defines aliases used to replace values
in `import` or `require` statements. With either format, the order of the entries is important,
in that the first defined rules are applied first.

- This is simply shorthand for `vite.resolve.alias`.
- This is passed to `@rollup/plugin-alias` as the "entries" field.

See the [@rollup/plugin-alias](https://github.com/rollup/plugins/tree/master/packages/alias#entries)
documentation for more information.

```js:no-line-numbers {6-9}
import path from 'path';

import { defineConfig } from '@vitebook/client/node';

export default defineConfig({
  alias : {
    '~src': path.resolve(__dirname, '../src'),
    // ...
  }
});
```

## Vite

Used to set [Vite configuration](https://vitejs.dev/config) options.

:::tip
You can configure Vite as usual by placing a `vite.config.{js,ts}` file at the project root. If
you require overriding some configuration options, simply import the Vite config into the
Vitebook config file and override as needed.
:::

```js:no-line-numbers {7-10}
// Import any existing vite configuration and override if needed.
import viteConfig from '../vite.config.js';

import { defineConfig } from '@vitebook/client/node';

export default defineConfig({
  vite: {
    ...viteConfig,
    // ...
  }
});
```

## Plugins

The `plugins` property specifies the plugins to be used. Similarly to Vite and Rollup, falsy
plugins are ignored, and arrays of plugins are flattened. Vitebook, Vite, and Rollup plugins are
accepted.

A client plugin is the only required plugin for Vitebook to function as it sets up a client/server
entry file. The Vitebook client plugin is exported from the `@vitebook/client` package.

Important to keep in mind that Vitebook plugins are simply an extension of Vite plugins which are
an extension of Rollup plugins. By extension, we simply mean additional plugin hooks are
available. The following resources are perfect for diving deeper into plugins:

- [Vitebook Plugins](../advanced/plugins.md)
- [Vite Plugins](https://vitejs.dev/guide/api-plugin.html)
- [Rollup Plugins](https://rollupjs.org/guide/en/#plugins-overview)

```js:no-line-numbers {5-8}
import { clientPlugin, defineConfig } from '@vitebook/client/node';
import { defaultThemePlugin } from '@vitebook/theme-default/node';

export default defineConfig({
  plugins: [
    clientPlugin(),
    defaultThemePlugin(),
  ]
});
```

## Routes

By default, Vitebook handles file path to application route resolution. You can use the `resolveRoute`
option to override routing to specific, or all file paths.

- The `resolveRoute` function maps file paths to client routes such as `src/button/button.story.ts`
  to `button/button.html`.
- The `resolveRoute` function can return `null` or `undefined` to fallback to the default Vitebook
  route resolver.
- The returned route must end with `.html`.
- Plugins can override application-level routing provided by Vitebook, or values returned from the
  `resolveRoute` function.

```js:no-line-numbers {4-6}
import { defineConfig } from '@vitebook/client/node';

export default defineConfig({
  resolveRoute({ filePath, relativeFilePath }) {
    // ...
  }
});
```
