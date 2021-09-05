/**
 * Special prefix used throughout Vitebook to identify virtual modules (VM).
 */
export const VM_PREFIX = '@virtual' as const;

export const virtualModuleId = {
  noop: `${VM_PREFIX}/vitebook/core/noop`,
  siteData: `${VM_PREFIX}/vitebook/core/site-data`,
  pages: `${VM_PREFIX}/vitebook/core/pages`,
  clientEntry: `${VM_PREFIX}/vitebook/core/client`
} as const;
