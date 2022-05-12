/**
 * Special prefix used throughout Vitebook to identify virtual modules (VM).
 */
export const VM_PREFIX = ':virtual/vitebook' as const;

export const virtualModuleId = {
  app: `${VM_PREFIX}/app`,
  noop: `${VM_PREFIX}/noop`,
  pages: `${VM_PREFIX}/pages`,
  clientEntry: `${VM_PREFIX}/client`,
} as const;

export const virtualModuleRequestPath = Object.keys(virtualModuleId).reduce(
  (paths, key) => ({
    ...paths,
    [key]: `/${virtualModuleId[key]}`,
  }),
  {} as {
    [P in keyof typeof virtualModuleId]: `/${typeof virtualModuleId[P]}`;
  },
);
