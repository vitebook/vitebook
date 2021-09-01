import type { AppEnv } from '../App.js';
import type { AppOptions } from '../AppOptions.js';

export const createAppEnv = (
  options: AppOptions,
  isBuild: boolean
): AppEnv => ({
  isBuild,
  isDev: !isBuild,
  isDebug: options.debug
});
