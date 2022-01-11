<script>
import { Tabs, TabPanel } from '@vitebook/client/components/tabs';

const frameworks = ['Preact', 'Svelte', 'Vue'];
</script>

# Stories

[Storybook](storybook.js.org) popularized the concept of story files, which are used to capture
the rendered states of a UI component. In Vitebook, story files are simply [pages](./pages.md). The
decision of how to display certain pages and any addons is left to theme builders. However, the
default theme is built with developers wanting to build and design UI components in mind, so
you'll find the notion of "stories" baked right in.

If you'd like to follow the convention of using `.story` files, simply include it in your
Vitebook configuration file...

<Tabs values={frameworks} groupId="jsFramework">
<TabPanel value="Preact">

```js {4}
import { defineConfig } from '@vitebook/client/node';

export default defineConfig({
  include: ['src/**/*.story.tsx'],
  // ...
});
```

</TabPanel>

<TabPanel value="Svelte">

```js {4}
import { defineConfig } from '@vitebook/client/node';

export default defineConfig({
  include: ['src/**/*.story.svelte'],
  // ...
});
```

</TabPanel>

<TabPanel value="Vue">

```js {4}
import { defineConfig } from '@vitebook/client/node';

export default defineConfig({
  include: ['src/**/*.story.vue'],
  // ...
});
```

</TabPanel>
</Tabs>

## App File

An app file should be present inside your Vitebook config folder, which can be used for
application level configuration such as setting context providers, or adding plugins in Vue.

<Tabs values={frameworks} groupId="jsFramework">
<TabPanel value="Preact">

```js {9}
import { defineConfig } from '@vitebook/client/node';
import { preactPlugin } from '@vitebook/preact/node';

export default defineConfig({
  include: ['src/**/*.story.tsx'],
  plugins: [
    // ...
    preactPlugin({
      appFile: './App.tsx',
    }),
  ],
});
```

</TabPanel>

<TabPanel value="Svelte">

```js {8}
import { defineConfig, clientPlugin } from '@vitebook/client/node';

export default defineConfig({
  include: ['src/**/*.story.svelte'],
  plugins: [
    // ...
    clientPlugin({
      appFile: './App.svelte',
    }),
  ],
});
```

</TabPanel>

<TabPanel value="Vue">

```js {9}
import { defineConfig } from '@vitebook/client/node';
import { vuePlugin } from '@vitebook/vue/node';

export default defineConfig({
  include: ['src/**/*.story.vue'],
  plugins: [
    // ...
    vuePlugin({
      appFile: './App.vue',
    }),
  ],
});
```

</TabPanel>
</Tabs>

## Writing a Story

A story file is no different to creating a component in your favourite framework. We
recommend creating a companion `.story` file next to each component in your app. For example, a
`Button` component will contain an adjacent `Button.story.{svelte,tsx,vue}` file.

<Tabs values={frameworks} groupId="jsFramework">
<TabPanel value="Preact">

```js
import Button from './Button';

function ButtonStory() {
  return <Button>{/** ... */}</Button>;
}

export default ButtonStory;
```

</TabPanel>

<TabPanel value="Svelte">

```svelte
<script>
import Button from './Button.svelte'
</script>

<Button>
  <!-- ... -->
</Button>
```

</TabPanel>

<TabPanel value="Vue">

```vue
<script setup>
import Button from './Button.vue';
</script>

<template>
  <Button>
    <!-- ... -->
  </Button>
</template>
```

</TabPanel>
</Tabs>

## Variants

Story variants are a way to showcase your component in different states. This is supported
by the default theme by showing a dropdown in the component preview pane to select the desired
variant.

<Tabs values={frameworks} groupId="jsFramework">
<TabPanel value="Preact">

```js
import Button from './Button';
import { Variant } from '@vitebook/preact';

function ButtonStory() {
  function onEnterVariant(variant) {
    // ...
  }

  function onExitVariant(variant) {
    // ...
  }

  return (
    <>
      <Variant
        name="Default"
        description="The default button."
        onEnter={onEnterVariant}
        onExit={onExitVariant}
      >
        <Button />
      </Variant>

      <Variant name="Disabled" description="The disabled button.">
        <Button disabled />
      </Variant>
    </>
  );
}

export default ButtonStory;
```

</TabPanel>

<TabPanel value="Svelte">

```svelte
<script>
import Button from './Button.svelte'
import { Variant } from '@vitebook/client';

function onEnterVariant({ detail: variant }) {
  // ...
}

function onExitVariant({ detail: variant }) {
  // ...
}
</script>

<Variant
  name="Default"
  description="The default button."
  on:enter={onEnterVariant}
  on:exit={onExitVariant}
>
  <Button />
</Variant>

<Variant name="Disabled" description="The disabled button.">
  <Button disabled />
</Variant>
```

</TabPanel>

<TabPanel value="Vue">

```vue
<script setup>
import Button from './Button.vue';
import { Variant } from '@vitebook/vue';

function onEnterVariant(variant) {
  // ...
}

function onExitVariant(variant) {
  // ...
}
</script>

<template>
  <Variant
    name="Default"
    description="The default button."
    @enter="onEnterVariant"
    @exit="onExitVariant"
  >
    <Button />
  </Variant>

  <Variant name="Disabled" description="The disabled button.">
    <Button disabled />
  </Variant>
</template>
```

</TabPanel>
</Tabs>
