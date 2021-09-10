import type { Plugin } from '@vitebook/core';

export const PLUGIN_NAME = 'vitebook/theme-vue-default';

export type DefaultVueThemePluginOptions = {
  /**
   * Whether to _not_ include the default fonts.
   *
   * @default false
   */
  removeFonts?: boolean;
};

export function defaultVueThemePlugin({
  removeFonts = false
}: DefaultVueThemePluginOptions = {}): Plugin {
  return {
    name: PLUGIN_NAME,
    siteData(site) {
      if (!removeFonts) {
        site.head.push(
          ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
          [
            'link',
            {
              rel: 'preconnect',
              href: 'https://fonts.gstatic.com',
              crossorigin: true
            }
          ],
          [
            'link',
            {
              rel: 'stylesheet',
              href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500&family=Source+Code+Pro&display=swap'
            }
          ]
        );
      }
    }
  };
}
