export type ResolvedClientConfig = {
  /**
   * Application module ID or file path relative to `<root>`.
   */
  app: string;
};

export type ClientConfig = Partial<ResolvedClientConfig>;
