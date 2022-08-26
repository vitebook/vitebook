/// <reference types="vite/client" />
/// <reference types="vitebook/globals" />
/// <reference types="@vitebook/svelte/globals" />

interface ImportMetaEnv {
  // Declare environment variables here.
  // Server-side env variables: `SOME_KEY=foo`
  // Client-side env variables: `PUBLIC_SOME_KEY=bar`
  // Access them like so: `import.meta.env.SOME_KEY`
  // Learn more: https://vitejs.dev/guide/env-and-mode.html#env-files
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
