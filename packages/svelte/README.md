# Vitebook Svelte

This package adds [Svelte](https://svelte.dev) support to Vitebook.

```bash
npm install @vitebook/svelte
```

```js
// vite.config.js
import { vbkSvelte } from '@vitebook/svelte/node';

export default {
  vitebook: {
    plugins: [vbkSvelte()],
  },
};
```
