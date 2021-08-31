export type BasePageData = {
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
   * Language of the page.
   */
  lang: string;
};
