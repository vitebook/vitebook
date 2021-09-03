// Special virtual files. We can't directly import them because:
// - they're not actual files so we can't use tsconfig paths to redirect
// - TS doesn't allow shimming a module that starts with '/'
export const virtualFileIds = {
  noop: '@vitebook_virtual/core/noop',
  siteData: '@vitebook_virtual/core/site-data',
  pages: '@vitebook_virtual/core/pages',
  clientEntry: '@vitebook_virtual/core/client'
} as const;

// eg => { noop: '/@vitbook/core/noop', ... }
export const virtualFileRequestPaths = Object.keys(virtualFileIds).reduce(
  (prev, id) => ({
    ...prev,
    [id]: '/' + virtualFileIds[id]
  }),
  {} as { [P in keyof typeof virtualFileIds]: string }
);

// eg => { '@vitebook/core/noop': '/@vitbook/core/noop', ... }
export const virtualFileAliases = Object.keys(virtualFileRequestPaths).reduce(
  (aliases, id) => ({
    ...aliases,
    [virtualFileIds[id]]: virtualFileRequestPaths[id]
  }),
  {}
);
