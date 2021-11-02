/**
 * Special prefix used throughout Vitebook to identify virtual modules (VM).
 */
export const VM_PREFIX = ':virtual/vitebook' as const;

export const virtualModuleId = {
  noop: `${VM_PREFIX}/noop`,
  siteOptions: `${VM_PREFIX}/site`,
  pages: `${VM_PREFIX}/pages`,
  themeEntry: `${VM_PREFIX}/theme`,
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
