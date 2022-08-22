export type ResolvedDirectoriesConfig = {
  /**
   * Directory to serve as plain static assets. Files in this directory are served and copied to
   * build dist dir as-is without transform. The value can be either an absolute file system path
   * or a path relative to `<root>`.
   *
   * @default '<root>/public'
   */
  public: string;

  /**
   * Path to application directory. The value can be either an absolute file system path
   * or a path relative to `<root>`.
   *
   * @default '<root>/app'
   */
  app: string;

  /**
   * The build output directory. The value can be either an absolute file system path or a path
   * relative to `<root>`.
   *
   * @default '<root>/build'
   */
  output: string;
};

export type DirectoriesConfig = Partial<ResolvedDirectoriesConfig>;
