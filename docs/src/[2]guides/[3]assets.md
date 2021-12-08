# Assets

All assets are processed by Vite, see ["Features"](https://vitejs.dev/guide/features.html) and
["Static Asset Handling"](https://vitejs.dev/guide/assets.html).

- You can reference static assets either using an absolute path from the project root `<rootDir>`,
  or a relative path from any given file.
- Image, media, and font filetypes are detected and included as assets automatically.
- All referenced assets, including those using absolute paths, will be copied to the `dist` folder
  with a hashed file name in the production build.
- Media assets smaller than `4kb` will be `base64` inlined.
- You can import assets as a string by appending `?raw` to the import specifier.
- The `public` directory in the Vitebook config folder can be used to provide static assets that
  either are never referenced in source code (e.g. `robots.txt`), or must retain the exact same
  file name (no hashing).
