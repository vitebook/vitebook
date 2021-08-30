import { createRequire } from 'module';

import { isObject } from './unit.js';

/**
 * Check if a given module is an esm module with a default export.
 */
export const hasDefaultExport = <T = unknown>(
  mod: unknown
): mod is { default: T } =>
  isObject(mod) &&
  !!mod.__esModule &&
  Object.prototype.hasOwnProperty.call(mod, 'default');

/**
 * Node CJS `require` equivalent for ESM.
 */
export const esmRequire = createRequire(import.meta.url);

/**
 * `require.resolve` wrapper. Returns `null` if the module cannot be resolved instead of throwing
 * an error.
 */
export const requireResolve = (request: string): string | null => {
  try {
    return esmRequire.resolve(request);
  } catch {
    return null;
  }
};
