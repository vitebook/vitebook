/**
 * Special prefix used throughout Vitebook to identify virtual modules (VM).
 */
export const VM_PREFIX = ':virtual' as const;

export const virtualModuleId = {
  noop: `${VM_PREFIX}/vitebook/noop`,
  siteOptions: `${VM_PREFIX}/vitebook/site`,
  pages: `${VM_PREFIX}/vitebook/pages`,
  themeEntry: `${VM_PREFIX}/vitebook/theme`,
  clientEntry: `${VM_PREFIX}/vitebook/client`
} as const;

export const virtualModuleRequestPath = Object.keys(virtualModuleId).reduce(
  (paths, key) => ({
    ...paths,
    [key]: `/${virtualModuleId[key]}`
  }),
  {} as { [P in keyof typeof virtualModuleId]: `/${typeof virtualModuleId[P]}` }
);
