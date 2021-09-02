// Special virtual files. We can't directly import them because:
// - they're not actual files so we can't use tsconfig paths to redirect
// - TS doesn't allow shimming a module that starts with '/'
export const virtualFileIds = {
  noop: '@vitebook/core/noop',
  siteData: '@vitebook/core/site-data',
  pages: '@vitebook/core/pages',
  clientEntry: '@vitebook/core/client'
} as const;

export const virtualFileRequestPaths = Object.values(virtualFileIds).reduce(
  (prev, id) => ({
    ...prev,
    [id]: '/' + id
  }),
  {} as { [P in keyof typeof virtualFileIds]: string }
);
