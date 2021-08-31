import { accessSync, PathLike } from 'fs';
import * as path from 'upath';

export { path };

/**
 * Returns `true` if given `path` exists.
 */
export function pathExists(
  path: PathLike,
  handleError?: (e: unknown) => void
): boolean {
  try {
    accessSync(path);
    return true;
  } catch (e) {
    handleError?.(e);
    return false;
  }
}

export const resolveRelativePathIfNotAbs = (
  base: string,
  filePath: string
): string =>
  path.isAbsolute(filePath) ? filePath : path.resolve(base, filePath);

/**
 * Resolve absolute and relative paths according to the `base` and `filePathRelative`.
 */
export const resolvePaths = (
  rawPath: string,
  base: string,
  filePathRelative: string | null
): {
  absolutePath: string;
  relativePath: string;
} => {
  let relativePath: string;
  let absolutePath: string;

  if (rawPath.startsWith('/')) {
    // If raw path is absolute.
    absolutePath = rawPath;
    relativePath = path.relative(base, absolutePath);
  } else {
    // If raw path is relative.
    if (filePathRelative) {
      // If `filePathRelative` is available.

      // Resolve relative path according to `filePathRelative`.
      relativePath = path.join(
        // File path may contain non-ASCII characters.
        path.dirname(encodeURI(filePathRelative)),
        rawPath
      );
      // Resolve absolute path according to `base`.
      absolutePath = path.join(base, relativePath);
    } else {
      // If `filePathRelative` is not available.

      // Remove leading './'.
      relativePath = rawPath.replace(/^(?:\.\/)?(.*)$/, '$1');
      // Just take relative link as absolute link.
      absolutePath = relativePath;
    }
  }

  return {
    absolutePath,
    relativePath
  };
};

/**
 * Ensure a url `string` has an ending slash `/`.
 */
export const ensureEndingSlash = (str: string): string =>
  /(\.html|\/)$/.test(str) ? str : str + '/';

/**
 * Ensure a url `string` has a leading slash `/`.
 */
export const ensureLeadingSlash = (str: string): string =>
  str.replace(/^\/?/, '/');

/**
 * Remove leading slash `/` from a `string`.
 */
export const removeLeadingSlash = (str: string): string =>
  str.replace(/^\//, '');

/**
 * Remove ending slash `/` from a `string`.
 */
export const removeEndingSlash = (str: string): string =>
  str.replace(/\/$/, '');
