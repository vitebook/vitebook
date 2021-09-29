import { defineConfig } from '@vitebook/core/node';
import { clientPlugin, withIncludeMarkdown } from '@vitebook/client/node';
import { vueMarkdownPlugin } from '@vitebook/plugin-markdown-vue/node';
import { shikiMarkdownPlugin } from '@vitebook/plugin-markdown-shiki/node';
// import { prismjsMarkdownPlugin } from '@vitebook/plugin-markdown-prismjs/node';
import type { DefaultThemeConfig } from '@vitebook/theme-default/node';

export default defineConfig<DefaultThemeConfig>({
  include: ['src/**/*.{html,md,svg,vue}'],
  plugins: [
    shikiMarkdownPlugin(),
    // prismjsMarkdownPlugin(),
    vueMarkdownPlugin(),
    clientPlugin({
      include: withIncludeMarkdown()
    })
  ],
  site: {
    title: 'Vitebook',
    description: 'Yessir',
    locales: {
      '/': {
        lang: 'en-US',
        langLabel: 'English',
        description: 'My site'
      },
      '/zh': {
        lang: 'zh-CN',
        langLabel: 'Chinese',
        description: 'My Chinese Site'
      }
    },
    theme: {
      remoteGitRepo: {
        url: 'vitebook/vitebook'
      },
      navbar: {
        items: [
          {
            text: 'Components',
            link: '/components.html'
          },
          {
            text: 'Docs',
            link: '/docs.html'
          },
          {
            text: 'Community',
            menu: [
              {
                text: 'Learn More',
                link: '/learn-more.html'
              },
              {
                text: 'Discord',
                link: 'https://discord.com'
              },
              {
                text: 'Twitter',
                link: 'https://twitter.com'
              }
            ]
          },
          {
            text: 'Twitch',
            link: 'https://twitch.com'
          }
        ]
      },
      homePage: {
        heroText: 'Document, design, and play with components.',
        primaryActionText: 'Get Started',
        primaryActionLink: '/something.html',
        secondaryActionText: 'Learn More',
        secondaryActionLink: '/learn.html',
        features: [
          {
            title: 'Instant Server Start',
            body: 'On demand file serving over native ESM, no bundling required!'
          },
          {
            title: 'Lightning Fast HMR',
            body: 'Hot Module Replacement (HMR) that stays fast regardless of app size.'
          },
          {
            title: 'Rich Features',
            body: 'Out-of-the-box support for TypeScript, JSX, CSS and more.'
          },
          {
            title: 'Optimized Build',
            body: 'Pre-configured rollup build with multi-page and library mode support.'
          },
          {
            title: 'Universal Plugins',
            body: 'Rollup-superset plugin interface shared between dev and build.'
          },
          {
            title: 'Fully Typed APIs',
            body: 'Flexible programmatic APIs with full TypeScript typing.'
          }
        ],
        footer: 'MIT Licensed | Copyright © 2021 - Vitebook'
      }
    }
  }
});
