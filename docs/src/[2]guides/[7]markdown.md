<script>
import { Tabs, TabPanel } from '@vitebook/client/components/tabs';

const frameworks = ['Preact', 'Svelte', 'Vue'];
</script>

# Markdown

Markdown files are processed by [markdown-it](https://github.com/markdown-it/markdown-it), and the
output is transformed into a framework component. This means you can freely use JSX, Svelte,
and Vue syntax inside markdown files. Vitebook will ensure anything that will break during
parsing markdown to HTML is safely handled such as curly braces, template syntax, code blocks, etc.

## Installation

<Tabs values={frameworks} groupId="jsFramework">
<TabPanel value="Preact">

```bash {3,4,9,10,13}
npm install @vitebook/markdown-preact -D
```

</TabPanel>

<TabPanel value="Svelte">

```bash
npm install @vitebook/markdown-svelte -D
```

</TabPanel>
<TabPanel value="Vue">

```bash {4}
npm install @vitebook/markdown-vue -D
```

</TabPanel>
</Tabs>

If you'd like to include beautiful syntax highlighting via [Shiki](https://shiki.matsu.io)...

```bash {4}
npm install @vitebook/markdown-shiki -D
```

## Configuration

<Tabs values={frameworks} groupId="jsFramework">
<TabPanel value="Preact">

```js {1,4-5,8,10-11,13}
import preact from '@preact/preset-vite';
import { defineConfig } from '@vitebook/client/node';
import { preactPlugin } from '@vitebook/preact/node';
import { preactMarkdownPlugin } from '@vitebook/markdown-preact/node';
import { shikiMarkdownPlugin } from '@vitebook/markdown-shiki/node';

export default defineConfig({
  include: ['src/**/*.md', 'src/**/*.story.tsx'],
  plugins: [
    preactMarkdownPlugin(),
    shikiMarkdownPlugin(),
    preactPlugin({ appFile: 'App.tsx' }),
    preact({ include: /\.([j|t]sx?|md)$/ }),
  ],
});
```

</TabPanel>

<TabPanel value="Svelte">

```js {1,3-4,7,9-10,12}
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig, clientPlugin } from '@vitebook/client/node';
import { svelteMarkdownPlugin } from '@vitebook/markdown-svelte/node';
import { shikiMarkdownPlugin } from '@vitebook/markdown-shiki/node';

export default defineConfig({
  include: ['src/**/*.md', 'src/**/*.story.svelte'],
  plugins: [
    svelteMarkdownPlugin(),
    shikiMarkdownPlugin(),
    clientPlugin({ appFile: 'App.svelte' }),
    svelte({ extensions: ['.svelte', '.md'] }),
  ],
});
```

</TabPanel>

<TabPanel value="Vue">

```js {1,4-5,8,10-11,13}
import vue from '@vitejs/plugin-vue';
import { defineConfig } from '@vitebook/client/node';
import { vuePlugin } from '@vitebook/vue/node';
import { vueMarkdownPlugin } from '@vitebook/markdown-vue/node';
import { shikiMarkdownPlugin } from '@vitebook/markdown-shiki/node';

export default defineConfig({
  include: ['src/**/*.md', 'src/**/*.story.vue'],
  plugins: [
    vueMarkdownPlugin(),
    shikiMarkdownPlugin(),
    vuePlugin({ appFile: 'App.vue' }),
    vue({ include: /\.(md|vue)/ }),
  ],
});
```

</TabPanel>
</Tabs>

### Options

The following options can be passed into the markdown plugin (eg: `svelteMarkdownPlugin(...)`).
Note that setting any extension to `false` will disable it. Feel free to explore the options
in your IDE by pressing `CTRL/CMD + CLICK` on the markdown plugin and following any types.

```ts
interface MarkdownOptions {
  include?: FilterPattern;
  exclude?: FilterPattern;
  anchor?: false | AnchorPluginOptions;
  code?: false | CodePluginOptions;
  customContainers?: false;
  customComponent?: false | CustomComponentPluginOptions;
  emoji?: false | EmojiPluginOptions;
  extractHeaders?: false | ExtractHeadersPluginOptions;
  extractTitle?: false;
  importCode?: false | ImportCodePluginOptions;
  links?: false | LinksPluginOptions;
  toc?: false | TocPluginOptions;
  configureParser?(parser: MarkdownParser): void | Promise<void>;
}
```

## Extensions

Pretty much all markdown extensions were derived from [VitePress](https://github.com/vuejs/vitepress)
and [VuePress](https://github.com/vuepress/vuepress-next), so just a thank you to the authors
and contributors :clap:

### Components

:::info
The `<script context="module">` and `<script>` tags shown below can be used more than once in
markdown files, Vitebook will merge them together.
:::

<Tabs values={frameworks} groupId="jsFramework">
<TabPanel value="Preact">

```md
<script context="module">
  import { useState } from 'preact/hooks';
  import Button from './Button';
</script>

<script>
  const [count, setCount] = useState(0)
</script>

Click Me -> <Button onClick={setCount}>Clicked {count}</Button>.
```

will be transformed into...

```jsx
// <script context="module">
import { useState } from 'preact/hooks';
import Button from './Button';

function Markdown() {
  // <script>
  const [count, setCount] = useState(0);

  return (
    <span>
      Click Me -> <Button onClick={setCount}>Clicked {count}</Button>.
    </span>
  );
}

export default Markdown;
```

</TabPanel>

<TabPanel value="Svelte">

```md
<script context="module">
  import Button from './Button.svelte';
</script>

<script>
  let clicked = 0;

  function onClick() {
    clicked += 1;
  }
</script>

Click Me -> <Button on:click={onClick}>Clicked {count}</Button>.
```

will be transformed into...

```svelte
<script context="module">
  import Button from './Button.svelte';
</script>

<script>
  let clicked = 0;

  function onClick() {
    clicked += 1;
  }
</script>

<span>
  Click Me -> <Button on\:click={onClick}>Clicked {count}</Button>.
</span>
```

</TabPanel>
<TabPanel value="Vue">

```md
<script setup>
  import Button from './Button.vue';
  import { ref } from 'vue'

  let clicked = ref(0);

  function onClick() {
    clicked.value = clicked.value + 1;
  }
</script>

Click Me -> <Button @click="onClick">Clicked {{count}}</Button>.
```

will be transformed into...

```vue
<script setup>
import Button from './Button.vue';
import { ref } from 'vue';

let clicked = ref(0);

function onClick() {
  clicked.value = clicked.value + 1;
}
</script>

<template>
  <span>
    Clicked Me -> <Button @click="onClick">Clicked {{ count }}</Button
    >.
  </span>
</template>
```

</TabPanel>
</Tabs>

### Header Anchors

Header tags such as `# H1`, `## H2`, and so on will automatically include anchor tags so that when
they're clicked it'll jump to that section. Try hovering over the title "Header Anchors" above
and clicking the `#`.

### Links

Vitebook will handle ensuring any links that refer to client-side routes are handled via
SPA navigation (no page reload). External links will be opened in a new tab.

```md
<!-- Examples -->

[home](/index.html)
[foo index](/foo/)
[heading](#heading)
[relative file with .md ext](../foo/bar.md)
[relative file with .html ext](../foo/bar.html)
[external](https://vitebook.dev)
```

### Frontmatter

[YAML](https://yaml.org) frontmatter is supported.

```md
---
title: Page Title
description: My awesome page description.
---

...
```

You can access the frontmatter in your markdown file inside of a script block via the
[page meta](./pages.md#page-meta) object.

```md
<script>
console.log(__pageMeta.frontmatter);
</script>
```

<script>
console.log(__pageMeta.frontmatter);
</script>

### Tables

**Input**

```md
| Tables        |      Are      |  Cool |
| ------------- | :-----------: | ----: |
| col 3 is      | right-aligned | $1600 |
| col 2 is      |   centered    |   $12 |
| zebra stripes |   are neat    |    $1 |
```

**Output**

| Tables        |      Are      |  Cool |
| ------------- | :-----------: | ----: |
| col 3 is      | right-aligned | $1600 |
| col 2 is      |   centered    |   $12 |
| zebra stripes |   are neat    |    $1 |

### Table of Contents

**Input**

```md
[[toc]]
```

**Output**

[[toc]]

### Admonitions

**Input**

```md
:::note
A noteworthy message.
:::

:::note Custom Title
A noteworthy message.
:::

:::tip
A helpful tip.
:::

:::info
Informative message.
:::

:::warning
Warning message.
:::

:::danger
Oh no.
:::
```

**Output**

:::note
A noteworthy message.
:::

:::note Custom Title
A noteworthy message.
:::

:::tip
A helpful tip.
:::

:::info
Informative message.
:::

:::warning
Warning message.
:::

:::danger
Oh no.
:::

### Emojis

You can find a list of all available emojis [here](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.json).

**Input**

```md
Emojis are awesome :tada:
```

**Output**

Emojis are awesome :tada:

### Code Blocks

If you've installed `@vitebook/markdown-shiki`, then you'll find beautiful syntax highlighting
applied to your code blocks. In short, [Shiki](https://shiki.matsu.io) generates HTML that looks
exactly like your code in VS Code.

You can find all supported languages [here](https://github.com/shikijs/shiki/blob/main/docs/languages.md).

**Input**

```md:no-line-numbers
\`\`\`js
const myConst = 1;

function aFunction() {
  // ...
}
\`\`\`
```

**Output**

```js
const myConst = 1;

function aFunction() {
  // ...
}
```

#### Line Numbers

Line numbers are displayed on the left-hand side of code blocks by default, you can disable it
in your config. You can add the `:line-numbers` or `:no-line-numbers` mark to your fenced code
blocks to override the value set in your config.

**Input**

```md:no-line-numbers
Without line numbers.

\`\`\`js:no-line-numbers
const myConst = 1;

function aFunction() {
  // ...
}
\`\`\`

With line numbers.

\`\`\`js
const myConst = 1;

function aFunction() {
  // ...
}
\`\`\`
```

**Output**

Without line numbers.

```js:no-line-numbers
const myConst = 1;

function aFunction() {
  // ...
}
```

With line numbers.

```js:line-numbers
const myConst = 1;

function aFunction() {
  // ...
}
```

#### Line Highlighting

You can highlight specified lines of your code blocks by adding line markers to your fenced
code blocks.

- Single Line: `{1}`
- Line Ranges: `{2-6}`
- Multiple Lines: `{2,4-10,12,14,16-20}`

**Input**

```md:no-line-numbers
\`\`\`js {1,3-5}
const myConst = 1;

function aFunction() {
  // ...
}
\`\`\`
```

**Output**

```js {1,3-5}
const myConst = 1;

function aFunction() {
  // ...
}
```

### Import Code Blocks

You can import code blocks from files with the following syntax...

```md
@[code](../foo.js)
```

If you want to partially import the file...

```md
@[code{1-10}](../foo.js)
```

The code language is inferred from the file extension, however, you can specify it like so...

```md
@[code js](../foo.js)
```

In fact, the second part inside the `[]` will be treated as the mark of the code fence, so it
supports all the syntax mentioned in the above [Code Blocks](#code-blocks) section:

```md
@[code js{2,4-5}](../foo.js)
```

Thanks to [VuePress](https://v2.vuepress.vuejs.org) again for this awesome feature :tada:

### Tabs

<Tabs values={frameworks} groupId="jsFramework">
<TabPanel value="Preact">

```md
<script context="module">
import { Tabs, TabPanel } from '@vitebook/preact/components/tabs';

const frameworks = ['Preact', 'Svelte', 'Vue'];
</script>

<Tabs values={frameworks}>
  <TabPanel value="Preact">Content</TabPanel>
  <TabPanel value="Svelte">Content</TabPanel>
  <TabPanel value="Vue">Content</TabPanel>
</Tabs>
```

</TabPanel>

<TabPanel value="Svelte">

```md
<script context="module">
import { Tabs, TabPanel } from '@vitebook/client/components/tabs';

const frameworks = ['Preact', 'Svelte', 'Vue'];
</script>

<Tabs values={frameworks}>
  <TabPanel value="Preact">Content</TabPanel>
  <TabPanel value="Svelte">Content</TabPanel>
  <TabPanel value="Vue">Content</TabPanel>
</Tabs>
```

</TabPanel>
<TabPanel value="Vue">

```md
<script setup>
import { Tabs, TabPanel } from '@vitebook/vue/components/tabs';

const frameworks = ['Preact', 'Svelte', 'Vue'];
</script>

<Tabs :values="frameworks">
  <TabPanel value="Preact">Content</TabPanel>
  <TabPanel value="Svelte">Content</TabPanel>
  <TabPanel value="Vue">Content</TabPanel>
</Tabs>
```

</TabPanel>
</Tabs>

:::warning
When using code fences inside a `<TabPanel>` ensure there is an empty line above _and_ below it,
otherwise the parser will ignore it...

```md{2,6}
<TabPanel>

\`\`\`md
...
\`\`\`

</TabPanel>
```

:::

#### Default Value

The first value is selected as the default, if you'd like to change that then simply set the
`defaultValue` property.

```
<Tabs defaultValue="Svelte">
...
</Tabs>
```

#### Syncing Tabs

You may want choices of the same kind of tabs to sync with each other. To achieve that, you can
give all related tabs the same `groupId` property. Note that doing this will persist the choice in
`localStorage` and all `<Tab>` instances with the same `groupId` will update automatically
when the value of one of them is changed.

```
<Tabs groupId="js-frameworks">
...
</Tabs>

<Tabs groupId="js-frameworks">
...
</Tabs>
```

## Markdown Plugin

A markdown plugin is simply a standard Vitebook [plugin](../advanced/plugins.md) that can also
configure the underlying `markdown-it` parser.

```ts
import type { MarkdownPlugin } from '@vitebook/markdown/node';

export function myMarkdownPlugin(): MarkdownPlugin {
  return {
    name: 'my-markdown-plugin',
    async configureMarkdownParser(parser) {
      // ...
    },
  };
}
```
