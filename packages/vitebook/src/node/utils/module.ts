import { createRequire } from 'module';

/**
 * Node CJS `require` equivalent for ESM.
 */
export const esmRequire = () => createRequire(import.meta.url);
