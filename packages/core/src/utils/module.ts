import { build as esbuild, BuildOptions } from 'esbuild';
import { createRequire } from 'module';
import { mkdirSync as mkTmpDirSync, track as trackTmpDir } from 'temp';
import { fileURLToPath } from 'url';

import { fs } from './fs.js';
import { path } from './path.js';
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
 * `__dirname` alternative for ESM.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const currentDirectory = (meta: any): string =>
  path.dirname(fileURLToPath(meta.url));

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

let tmpDir: string;
const loadModuleCache = new Map<string, unknown>();

export type LoadModuleOptions = BuildOptions & {
  cache?: boolean;
};

const esmRequireCode = [
  "import { createRequire } from 'module';",
  'const require = createRequire(import.meta.url)',
  ''
].join('\n');

/** Transpile with ESBuild and import as an ESM module. */
export const loadModule = async <T>(
  filePath: string,
  options: LoadModuleOptions = {}
): Promise<T> => {
  const { cache, ...buildOptions } = options;

  if (cache && loadModuleCache.has(filePath)) {
    return loadModuleCache.get(filePath) as T;
  }

  // Keep for occasional testing
  // tmpDir = path.resolve(process.cwd(), '.vitebook/.temp');
  // await fs.ensureDir(tmpDir);

  if (!tmpDir) {
    trackTmpDir();
    tmpDir = mkTmpDirSync();
  }

  const { outputFiles } = await esbuild({
    ...buildOptions,
    entryPoints: [filePath],
    platform: options.platform ?? 'node',
    format: options.format ?? 'esm',
    target: options.target ?? 'es2020',
    allowOverwrite: options.allowOverwrite ?? true,
    bundle: options.bundle ?? true,
    preserveSymlinks: options.preserveSymlinks ?? true,
    splitting: options.splitting ?? false,
    treeShaking: options.treeShaking ?? true,
    write: false
  });

  const fileExt = path.extname(filePath);
  const code = outputFiles[0]?.text;

  const tmpModulePath =
    path
      .resolve(tmpDir, filePath.replace(/(\\|\/)/g, '_'))
      .slice(0, -fileExt.length) + '.mjs';

  await fs.writeFile(tmpModulePath, esmRequireCode + code);
  const mod = import(tmpModulePath + `?t=${Date.now()}`) as unknown as T;

  loadModuleCache.set(filePath, mod);

  return mod;
};
