export type ResolvedClientConfig = {
  /**
   * Application module ID or file path relative to `<root>`.
   */
  app: string;
  /**
   * Array of module ids that will be imported to configure the client-side application. The
   * module must export a `configureApp()` function.
   */
  configFiles: string[];
};

export type ClientConfig = Partial<ResolvedClientConfig>;
