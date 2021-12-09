# Themes

:::info
Thanks to [VitePress](https://vitepress.vuejs.org) for the theming concept!
:::

A theme is simply the following interface:

```ts
interface Theme {
  Layout: SvelteComponent;
  NotFound?: SvelteComponent;
  configureRouter?(router: Router): void | Promise<void>;
}
```

The theme entry file should export the theme as the default binding:

```js
import Layout from './Layout.svelte';
import NotFound from './NotFound.svelte';

export default {
  Layout,
  NotFound,
  configureRouter(router) {
    // ...
  },
};
```

The most basic `<Layout>` component can look like this:

```svelte
<script>
  import { PageView } from '@vitebook/client';
</script>

<main>
  <PageView />
</main>
```

Where `<PageView />` is the contents of the current page.

To distribute a theme, simply export the object in your package entry. To consume an external
theme, import and re-export it from the theme entry:

```js
// .vitebook/theme/index.js
import Theme from 'an-awesome-theme';
export default Theme;
```

## Styling

It's critical that all your theme files live inside the theme folder `.vitebook/theme`,
_or_ are imported from files inside said folder. This is because Vitebook applies a CSS scoping
selector to all elements rendered from that directory. This is so you can style theme elements
without overwriting user-defined styles.

The only exception is markdown files. Vitebook will apply the CSS scoped class to all
elements that are not components (indicated by a capital letter such as `<Page />`) inside
`.md` files.

:::tip
The `__vbk__` CSS selector is used to target all theme specific elements. Use it to avoid
clashing with user defined styles. You do not have to apply it yourself, Vitebook will
automatically do so when transforming files.
:::

```css
/* ❌ Do not do this - it will potentially overwrite user-defined styles. */
p {
  font-size: 16px;
}

/* ✅ Do this - it will target only theme specific p tags. */
p.__vbk__ {
  font-size: 16px;
}
```
