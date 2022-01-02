# Default Theme Customization

## Styling

You can find all CSS variables used by the default theme declared on GitHub:

- [Light Theme](https://github.com/vitebook/vitebook/blob/main/packages/theme-default/src/client/styles/vars.css)
- [Dark Theme](https://github.com/vitebook/vitebook/blob/main/packages/theme-default/src/client/styles/vars-dark.css)

Feel free to explore the variables and override any as desired by first creating a CSS file
in the `theme` directory (default: `.vitebook/theme`), and importing it into the theme
`index.{js,ts}` file.

```css
.theme.__vbk__ {
  --vbk--color-primary: #610fe6;
  --vbk--color-primary-rgb: 97, 15, 230;
}

html.dark .theme.__vbk__ {
  --vbk--color-primary: #ffc107;
  --vbk--color-primary-rgb: 255, 193, 7;
}
```

:::tip
The `__vbk__` CSS selector is used to target all theme specific elements. Use it to avoid
clashing with user defined styles. It is automatically applied to all elements inside theme files.
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

## Icons

You can customize all the icons used by the default theme via the `icons` config option on the
default theme plugin...

- `menu`
- `menu-caret`
- `back-arrow`
- `edit-page`
- `forward-arrow`
- `external-link`
- `theme-switch-light`
- `theme-switch-dark`
- `home-feature-${number}` - Replace `${number}` with the index of the home feature (eg: `1`).
- `brand-${string}` - Replace `${string}` with either `discord`, `twitter`, `github`, `gitlab`,
  or `bitbucket`.
- `sidebar-file-${string}` Replace `${string}` with either `js`, `ts`, `image`, `video`, `md`,
  `vue`, `svelte`, `html`, `svg`, or `file`.
- `sidebar-folder-open`
- `sidebar-folder-closed`

```js{11,14,21}
import path from 'path';
import { defineConfig } from '@vitebook/client/node';
import { defaultThemePlugin } from '@vitebook/theme-default/node';

const iconsDir = path.resolve(__dirname, 'icons');
const resolveIcon = (icon) => path.resolve(iconsDir, '${icon}.svg');

export default defineConfig({
  plugins: [
    defaultThemePlugin({
      // Option 1: Disable all icons.
      icons: false,

      // Option 2: Use an object to define individual icons.
      icons: {
        menu: false, // Disable menu icon.
        'theme-switch-light': resolveIcon('theme-switch-light'),
        // ...
      },

      // Option 3: Use a function - return null to use default, false to disable.
      icons: (icon) => {
        // icon is a string as mentioned above (eg: 'theme-switch-light').
        return resolveIcon(icon);
      },
    }),
  ],
});
```

## Slots

The default theme `Layout` component exposes slots you can override:

- `navbar`
- `navbar-start`
- `navbar-end`
- `sidebar`
- `sidebar-start`
- `sidebar-end`
- `preview-top-bar-start`
- `preview-top-bar-end`
- `page`
- `page-start`
- `page-end`
- `root`
- `scrim`

Inside your `.vitebook/theme` directory create a `Layout.svelte` file and simply import the
default theme `Layout` component, and override the desired slots...

```svelte
<script>
import Theme from '@vitebook/default-theme';
</script>

<Theme.Layout>
  <svelte:fragment slot="sidebar">
    <!-- ... -->
  </svelte:fragment>
</Theme.Layout>
```

Finally, import the new `Layout` component into `.vitebook/theme/index.{js,ts}`...

```js
import Theme from '@vitebook/theme-default';
import Layout from './Layout.svelte';

export default {
  ...Theme,
  Layout,
};
```
