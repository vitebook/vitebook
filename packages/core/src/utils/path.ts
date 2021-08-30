import { accessSync, PathLike } from 'fs';

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
