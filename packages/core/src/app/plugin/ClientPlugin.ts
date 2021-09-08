import type { Plugin } from './Plugin.js';

/**
 * A special type of plugin that contains the client-side code for running the application in
 * the browser.
 */
export type ClientPlugin = Plugin & {
  /**
   * Absolute paths to client/server entry files.
   */
  entry: {
    client: string;
    server: string;
  };
  /**
   * Default theme information.
   */
  theme: {
    pkg: string;
    path: string;
  };
};
