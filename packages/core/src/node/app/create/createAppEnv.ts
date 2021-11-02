import type { AppEnv } from '../App';

export const createAppEnv = ({
  command = 'dev',
  isDebug = false,
  isDev = process.env.NODE_ENV === 'development',
  isProd = !isDev,
  mode,
}: Partial<AppEnv>): AppEnv => ({
  command,
  isProd,
  isDev,
  isDebug,
  mode,
});
