/**
 * Special prefix used throughout Vitebook to identify virtual modules (VM).
 */
export const VM_PREFIX = ':virtual/vitebook' as const;

export const virtualModuleId = {
  noop: `${VM_PREFIX}/noop`,
  pages: `${VM_PREFIX}/pages`,
  layouts: `${VM_PREFIX}/layouts`,
  client: `${VM_PREFIX}/client`,
  app: `${VM_PREFIX}/app`,
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

export const virtualAliases = Object.keys(virtualModuleId).reduce(
  (alias, key) => ({
    ...alias,
    [virtualModuleId[key]]: virtualModuleRequestPath[key],
  }),
  {},
);
