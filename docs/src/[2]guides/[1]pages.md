<script>
import { Tabs, TabPanel } from '@vitebook/client/components/tabs';

const langs = ['Markdown', 'Preact', 'Svelte', 'Vue'];
</script>

# Pages

The files you'd like to declare as pages are configured in the Vitebook configuration file
as shown [here](../introduction/configuration.html#pages). Pages can be markdown files (`.md`),
or component files (`.vue,.svelte,.jsx,.tsx`), depending on the plugins you've setup.

It's important to note that a plugin _must_ resolve a file as a page via the `resolvePage` hook,
otherwise you'll see a warning in your terminal. If a file is _not_ resolved as a page by any
plugin but it's included in your configuration, it is assumed to not be supported and ultimately
not included in your application.

## Routing

Every file you declare as a page, is used to do something called file-based routing. This simply
means the path to your file determines the application route to that page in your browser. The
[`<srcDir>`](../introduction/configuration.html#directories) is used to determine the root of
all routes.

:::info
The example mappings below of file path to application routes is assuming your `<srcDir>` is
the default, which is `<rootDir>/src`.
:::

<Tabs values={langs} groupId="lang">
<TabPanel value="Markdown">

```md:no-line-numbers
src/index.md                 -> site.com/
src/intro.md                 -> site.com/intro
src/button/index.md          -> site.com/button
src/button/usage.md          -> site.com/button/usage
src/Button/Button.story.md   -> site.com/button/button
```

</TabPanel>

<TabPanel value="Preact">

```md:no-line-numbers
src/index.jsx                 -> site.com/
src/intro.jsx                 -> site.com/intro
src/button/index.jsx          -> site.com/button
src/button/usage.jsx          -> site.com/button/usage
src/Button/Button.story.jsx   -> site.com/button/button
```

</TabPanel>

<TabPanel value="Svelte">

```md:no-line-numbers
src/index.svelte                -> site.com/
src/intro.svelte                -> site.com/intro
src/button/index.svelte         -> site.com/button
src/button/usage.svelte         -> site.com/button/usage
src/Button/Button.story.svelte  -> site.com/button/button
```

</TabPanel>

<TabPanel value="Vue">

```md:no-line-numbers
src/index.vue                -> site.com/
src/intro.vue                -> site.com/intro
src/button/index.vue         -> site.com/button
src/button/usage.vue         -> site.com/button/usage
src/Button/Button.story.vue  -> site.com/button/button
```

</TabPanel>
</Tabs>

### 404 Page

Coming soon.

## Page Meta

Coming soon.
