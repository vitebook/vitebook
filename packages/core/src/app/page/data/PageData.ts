export type PageData = {
  /**
   * Page type.
   */
  type: 'markdown' | 'story';

  /**
   * Identifier of the page. It'll also be used as the component name.
   *
   * @example 'v-foobar'
   */
  key: string;

  /**
   * Route path of the page.
   *
   * @example '/guide/index.html'
   */
  path: string;

  /**
   * Title of the page.
   */
  title: string;

  /**
   * Excerpt of the page.
   */
  excerpt: string;

  /**
   * Language of the page.
   */
  lang: string;
};
