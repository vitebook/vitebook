import { build as esbuild, BuildOptions } from 'esbuild';
import LRUCache from 'lru-cache';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

import { isObject } from '../shared/index.js';
import { fs } from './fs.js';
import { path } from './path.js';

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

const loadModuleCache = new LRUCache({ max: 1024 });

export type LoadModuleOptions = BuildOptions & {
  cache?: boolean;
};

const esmRequireCode = [
  "import { createRequire } from 'module';",
  'const require = createRequire(import.meta.url);',
  'var __require = function(x) { return require(x); };',
  '__require.__proto__.resolve = require.resolve;',
  '\n'
].join('\n');

/** Bundle with ESBuild and import as an ESM module. */
export const loadModule = async <T>(
  filePath: string,
  options: LoadModuleOptions = {}
): Promise<T> => {
  const { cache, ...buildOptions } = options;

  // Super basic in-memory LRU cache. Good enough for our needs atm.
  if (cache && loadModuleCache.has(filePath)) {
    return loadModuleCache.get(filePath) as T;
  }

  if (!tmpDir) {
    tmpDir = path.join(
      path.dirname(esmRequire.resolve('@vitebook/core')),
      '.temp'
    );

    await fs.ensureDir(tmpDir);
    await fs.emptyDir(tmpDir);
  }

  const code = await bundle(filePath, buildOptions);
  const fileExt = path.extname(filePath);

  const tmpModulePath =
    path
      .resolve(tmpDir, filePath.replace(/(\\|\/)/g, '_'))
      .slice(0, -fileExt.length) + '.mjs';

  await fs.writeFile(tmpModulePath, esmRequireCode + code);

  const mod = import(tmpModulePath + `?t=${Date.now()}`) as unknown as T;
  loadModuleCache.set(filePath, mod);

  return mod;
};

export async function bundle(
  filePath: string,
  options: BuildOptions
): Promise<string | undefined> {
  const { outputFiles } = await esbuild({
    ...options,
    entryPoints: [filePath],
    platform: options.platform ?? 'node',
    format: options.format ?? 'esm',
    target: options.target ?? 'es2020',
    allowOverwrite: options.allowOverwrite ?? true,
    bundle: options.bundle ?? true,
    preserveSymlinks: options.preserveSymlinks ?? true,
    splitting: options.splitting ?? false,
    treeShaking: options.treeShaking ?? true,
    write: false,
    plugins: [
      {
        name: 'mark-unresolvable-as-external',
        setup(build) {
          // Must not start with "/" or "./" or "../"
          // eslint-disable-next-line no-useless-escape
          const filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/;
          build.onResolve({ filter }, (args) => {
            try {
              esmRequire.resolve(args.path);
              return;
            } catch (e) {
              return { external: true };
            }
          });
        }
      }
    ]
  });

  return outputFiles[0]?.text;
}
