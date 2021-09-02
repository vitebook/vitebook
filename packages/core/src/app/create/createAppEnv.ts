import type { AppEnv } from '../App.js';

export const createAppEnv = ({
  command = 'serve',
  isDebug = false,
  isDev = true,
  isProd = false,
  mode = 'serve'
}: Partial<AppEnv>): AppEnv => ({
  command,
  isProd,
  isDev,
  isDebug,
  mode
});
