import { PageData } from './data/PageData.js';

export type BasePage<Data extends PageData = PageData> = PageData & {
  /**
   * Data of the page, which will be available in client code.
   */
  data: Data;

  /**
   * Raw Content of the page.
   */
  content: string;

  /**
   * Path of the page that inferred from file path. If the page does not come from a file, it
   * would be `null`
   *
   * @example '/guide/index.html'
   */
  pathInferred: string | null;

  /**
   * Locale path prefix of the page.
   *
   * @example '/getting-started.html' -> '/'
   * @example '/en/getting-started.html' -> '/en/'
   * @example '/zh/getting-started.html' -> '/zh/'
   */
  pathLocale: string;

  /**
   * Permalink of the page. If the page does not have a permalink, it would be `null`.
   */
  permalink: string | null;

  /**
   * Slug of the page.
   */
  slug: string;

  /**
   * Source file path.
   *
   * If the page does not come from a file, it would be `null`.
   */
  filePath: string | null;

  /**
   * Source file path relative to source directory.
   *
   * If the page does not come from a file, it would be `null`.
   */
  filePathRelative: string | null;

  /**
   * Component file path.
   */
  componentFilePath: string;

  /**
   * Component file path relative to temp directory.
   */
  componentFilePathRelative: string;

  /**
   * Page data file path.
   */
  dataFilePath: string;

  /**
   * Page data file path relative to temp directory.
   */
  dataFilePathRelative: string;

  /**
   * Rendered html file path.
   */
  htmlFilePath: string;

  /**
   * Rendered html file path relative to dest directory.
   */
  htmlFilePathRelative: string;
};
