import { build as esbuild, BuildOptions } from 'esbuild';
import getFolderSize from 'get-folder-size';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';

import { isObject } from '../../shared';
import { checksumFile, fs } from './fs';
import { path } from './path';

/**
 * Check if a given module is an esm module with a default export.
 */
export const hasDefaultExport = <T = unknown>(
  mod: unknown,
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

export type LoadModuleOptions = BuildOptions;

const requireShim = [
  "import __vitebook__path from 'path';",
  "import { fileURLToPath as __vitebook__fileURLToPath } from 'url';",
  "import { createRequire as __vitebook__createRequire } from 'module';",
  'const require = __vitebook__createRequire(import.meta.url);',
  'var __require = function(x) { return require(x); };',
  '__require.__proto__.resolve = require.resolve;',
  'const __filename = __vitebook__fileURLToPath(import.meta.url);',
  'const __dirname = __vitebook__path.dirname(__filename);',
  '\n',
].join('\n');

/** Bundle with ESBuild and import as an ESM module. */
export const loadModule = async <T>(
  filePath: string,
  options: LoadModuleOptions = {},
): Promise<T> => {
  const { ...buildOptions } = options;

  if (!tmpDir) {
    tmpDir =
      options.outdir ??
      path.join(
        path.dirname(esmRequire.resolve('@vitebook/core/node')),
        '.temp',
      );

    if (fs.existsSync(tmpDir)) {
      // If greater than 5MB let's empty it.
      const { size } = await getFolderSize(tmpDir);
      if (size > 5000000) await fs.emptyDir(tmpDir);
    } else {
      await fs.ensureDir(tmpDir);
    }
  }

  const fileHash = await checksumFile('sha1', filePath);
  const outputPath = path.resolve(tmpDir, `${fileHash}.mjs`);

  const fileComment = `// FILE: ${filePath}\n\n`;
  const code = await bundle(filePath, buildOptions);
  await fs.writeFile(outputPath, fileComment + requireShim + code);
  const mod = import(pathToFileURL(outputPath).href + `?t=${Date.now()}`) as unknown as T;

  return mod;
};

export async function bundle(
  filePath: string,
  options: BuildOptions,
): Promise<string | undefined> {
  const { outputFiles } = await esbuild({
    ...options,
    entryPoints: [filePath],
    loader: options.loader ?? {
      '.svg': 'base64',
    },
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
        name: 'mark-externals',
        setup(build) {
          // Must not start with "/" or "./" or "../" or "C:/"
          // eslint-disable-next-line no-useless-escape
          build.onResolve({ filter: /[A-Z]:\/*/ }, async () => ({ external: false }));
          build.onResolve({ filter: /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/ }, async () => ({ external: true }));
        },
      },
    ],
  });

  return outputFiles[0]?.text;
}
