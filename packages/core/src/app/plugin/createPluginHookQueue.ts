import debug from 'debug';
import kleur from 'kleur';

import { formatErrorMsg, logger } from '../../utils/logger.js';
import type {
  PluginHookItem,
  PluginHookNames,
  PluginHookQueue,
  PluginHooksResult
} from './PluginHooks.js';

const log = debug('vitebook:core/plugins');

export const createPluginHookQueue = <T extends PluginHookNames>(
  name: T
): PluginHookQueue<T> => {
  const items: PluginHookItem<T>[] = [];

  const PluginHookQueue: PluginHookQueue<T> = {
    name,
    items,
    add: (item) => {
      items.push(item);
    },
    process: async (...args) => {
      const results: PluginHooksResult[T][] = [];

      // Process all PluginHook items.
      for (const item of items) {
        log(
          `process ${kleur.magenta(name)} from ${kleur.magenta(
            item.pluginName
          )}`
        );

        try {
          // Process and get the result of the the PluginHook item.
          // @ts-expect-error - ?
          const result = (await item.PluginHook(
            ...args
          )) as PluginHooksResult[T];

          // push the result to results array
          if (result !== undefined) {
            results.push(result);
          }
        } catch (error) {
          logger.error(
            formatErrorMsg(
              `error in PluginHook ${kleur.magenta(name)} from ${kleur.magenta(
                item.pluginName
              )}`
            )
          );
          throw error;
        }
      }

      return results;
    }
  };

  return PluginHookQueue;
};
