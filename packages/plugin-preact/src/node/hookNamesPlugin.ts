import { transformAsync } from '@babel/core';
import { createFilter, FilterPattern } from '@rollup/pluginutils';
import babelTransformHookNames from 'babel-plugin-transform-hook-names';
import type { Plugin, ResolvedConfig } from 'vite';

export const PLUGIN_NAME = '@vitebook/plugin-preact:hook-names' as const;

export type HookNamesPluginOptions = {
  /**
   * Filter out which files to be included.
   *
   * @default undefined
   */
  include?: FilterPattern;

  /**
   * Filter out which files to _not_ be included.
   *
   * @default undefined
   */
  exclude?: FilterPattern;
};

export function hookNamesPlugin(options: HookNamesPluginOptions): Plugin {
  const filter = createFilter(options.include, options.exclude);

  let config: ResolvedConfig;

  return {
    name: PLUGIN_NAME,
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    async transform(code, id) {
      if (config.isProduction || !filter(id)) return;

      const res = await transformAsync(code, {
        plugins: [babelTransformHookNames],
        filename: id,
        sourceMaps: true
      });

      // TODO: When does this happen? The babel documentation isn't clear about this.
      if (res === null) return;

      return {
        code: res.code || code,
        map: res.map
      };
    }
  };
}
