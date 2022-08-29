/// <reference types="vite/client" />
/// <reference types="vitebook/globals" />
/// <reference types="@vitebook/svelte/globals" />

interface ImportMetaEnv {
  // Declare client-side environment variables here: `PUBLIC_SOME_KEY=value`
  // Access them like so: `import.meta.env.PUBLIC_SOME_KEY`
  // Learn more: https://vitejs.dev/guide/env-and-mode.html#env-files
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
