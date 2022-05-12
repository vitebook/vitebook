import type { Plugin } from './Plugin';

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
};
