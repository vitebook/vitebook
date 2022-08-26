export type ResolvedDirectoriesConfig = {
  /**
   * Path to application directory. The value can be either an absolute file system path or a path
   * relative to `<root>`.
   *
   * @default '<root>/app'
   */
  app: string;

  /**
   * Directory to serve as plain static assets. Files in this directory are served and copied to
   * build dist dir as-is without transform. The value can be either an absolute file system path
   * or a path relative to `<app>`.
   *
   * @default '<app>/public'
   */
  public: string;

  /**
   * The build output directory. The value can be either an absolute file system path or a path
   * relative to `<root>`.
   *
   * @default '<root>/build'
   */
  build: string;
};

export type DirectoriesConfig = Partial<ResolvedDirectoriesConfig>;
