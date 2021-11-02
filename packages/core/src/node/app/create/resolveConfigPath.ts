import { globby } from '../../utils/fs';

export function resolveConfigPath(configDir: string): string | undefined {
  const [configPath] = globby.sync('config.{js,mjs,cjs,ts}', {
    absolute: true,
    cwd: configDir,
    deep: 1,
  });

  return configPath;
}
