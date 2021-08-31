import { fs } from '../../utils/fs.js';
import { logger } from '../../utils/logger.js';
import { isArray, isFunction } from '../../utils/unit.js';
import type { ClientFilesPluginHook } from './PluginHooks.js';

export const normalizeClientFilesHook =
  (
    hook: ClientFilesPluginHook['exposed']
  ): ClientFilesPluginHook['normalized'] =>
  async (app) => {
    // Resolve clientFiles result.
    const clientFilesResult = isFunction(hook) ? await hook(app) : hook;

    const clientFiles = isArray(clientFilesResult)
      ? clientFilesResult
      : [clientFilesResult];

    // Filter files that do not exist.
    const result: string[] = [];

    for (const filePath of clientFiles as string[]) {
      const exists = await fs.pathExists(filePath);

      if (exists) {
        result.push(filePath);
      } else {
        throw logger.createError(`client file does not exist: ${filePath}`);
      }
    }

    return result;
  };
