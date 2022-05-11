import type { AppEnv } from '../App';

export const createAppEnv = ({ isDebug = false }: Partial<AppEnv>): AppEnv => ({
  isDebug,
});
