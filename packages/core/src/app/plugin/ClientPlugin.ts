import type {
  Plugin,
  PluginConfig,
  PluginFunction,
  PluginObject
} from './Plugin.js';

/**
 * Used to catch if the user hasn't provided a client plugin. An error will be thrown to ensure
 * the user does.
 */
export const NO_CLIENT_PLUGIN = Symbol('no-client-plugin');

/**
 * A Vitebook client is a special type of plugin which can be:
 *
 * - an object (`ClientPluginObject`)
 * - a function that returns an object (`ClientPluginFunction`)
 *
 * A client package should have a `Client` as the default export.
 */
export type ClientPlugin<T extends ClientPluginConfig = ClientPluginConfig> =
  Plugin<T, ClientPluginObject>;

export type ClientPluginFunction<
  T extends ClientPluginConfig = ClientPluginConfig
> = PluginFunction<T, ClientPluginObject>;

export type ClientPluginObject = PluginObject &
  Omit<ClientPluginInfo, 'plugins'> & {
    /**
     * Client specific plugins.
     */
    plugins?: PluginConfig[];
  };

/**
 * Resolved client info.
 */
export type ClientPluginInfo = {
  /**
   * Client plugin name.
   *
   * @example 'client-vue'
   */
  name: string;

  /**
   * Absolute paths to `index.html` files for development and SSR.
   */
  indexTemplate: {
    dev: string;
    ssr: string;
  };

  /**
   * Absolute paths to client/server entry files.
   */
  entry: {
    client: string;
    server: string;
  };

  /**
   * Package import path to the global layout component. Must provide a default component
   * export.
   *
   * @example '@vitebook/vue/client/components/Vitebook'
   */
  vitebookImportSpecifier: string;

  /**
   * Plugins, including client itself and plugins used by it.
   */
  plugins: PluginObject[];
};

/**
 * Client config to be used in user config file. It will be used by the Client itself, but not by
 * Vitebook, we will only transfer this config to the Client.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClientPluginConfig = Record<string, any>;
