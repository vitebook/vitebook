import { fs, globby } from '../../utils/fs';

export function resolveThemePath(themeDir: string): string | undefined {
  if (!fs.ensureDir(themeDir)) return undefined;

  const [themePath] = globby.sync('index.{js,jsx,mjs,ts,tsx}', {
    absolute: true,
    cwd: themeDir,
    deep: 1,
  });

  return themePath;
}
