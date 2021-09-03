/**
 * Special prefix used throughout Vitebook to identify virtual modules (VM).
 */
export const VM_PREFIX = '@virtual' as const;

// Special virtual files. We can't directly import them because:
// - they're not actual files so we can't use tsconfig paths to redirect
// - TS doesn't allow shimming a module that starts with '/'
export const virtualFileIds = {
  noop: `${VM_PREFIX}/vitebook/core/noop`,
  siteData: `${VM_PREFIX}/vitebook/core/site-data`,
  pages: `${VM_PREFIX}/vitebook/core/pages`,
  clientEntry: `${VM_PREFIX}/vitebook/core/client`
} as const;

export const virtualFileRequestPaths = Object.keys(virtualFileIds).reduce(
  (prev, id) => ({
    ...prev,
    [id]: '/' + virtualFileIds[id]
  }),
  {} as { [P in keyof typeof virtualFileIds]: string }
);

export const virtualFileAliases = Object.keys(virtualFileRequestPaths).reduce(
  (aliases, id) => ({
    ...aliases,
    [virtualFileIds[id]]: virtualFileRequestPaths[id]
  }),
  {}
);
