# Vitebook Svelte

This package adds [Svelte](https://svelte.dev) support to Vitebook.

```bash
npm install @vitebook/svelte
```

```js
// vite.config.js
import vitebook from '@vitebook/core/node';
import svelte from '@vitebook/svelte/node';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vitebook(), svelte()],
});
```
