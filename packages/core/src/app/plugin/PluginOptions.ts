import { AliasOptions, Plugin as VitePlugin, ResolveOptions } from 'vite';

export type PluginOptions = VitePlugin & {
  /**
   * Plugin name.
   */
  name: string;

  /**
   * Define global variable replacements. Entries will be defined on `window` during dev and
   * replaced during build.
   */
  define: Record<string, unknown>;

  /**
   * Configure resolver.
   */
  resolve: ResolveOptions & {
    alias: AliasOptions;
  };
};

export type PluginConfig = Partial<PluginOptions>;
