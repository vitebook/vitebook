import { isFunction } from '../../utils/unit.js';
import type { ReturnObjectPluginHook } from './PluginHooks.js';

/**
 * Normalize hook that returns an object
 */
export const normalizeReturnObjectHook =
  (
    hook: ReturnObjectPluginHook['exposed']
  ): ReturnObjectPluginHook['normalized'] =>
  async (app) =>
    isFunction(hook) ? hook(app) : hook;
