import { defineConfig } from '@vitebook/core';
import { vueClientPlugin } from '@vitebook/vue';
import { vueMarkdownPlugin } from '@vitebook/plugin-markdown-vue';
import { storyPlugin } from '@vitebook/plugin-story';
import { defaultVueThemePlugin } from '@vitebook/theme-vue-default';
import type { DefaultThemeConfig } from '@vitebook/core/shared';

export default defineConfig<DefaultThemeConfig>({
  include: ['src/**/*.{md,vue}'],
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
        heroText: 'Document, test, and play with your components.',
        primaryActionText: 'Get Started',
        primaryActionLink: '/something.html',
        secondaryActionText: 'Learn More',
        secondaryActionLink: '/learn.html',
        features: [
          {
            icon: '/icons/box-icon.svg',
            iconDark: '/icons/box-icon-dark.svg',
            iconAlt: 'Box',
            title: 'Instant Server Start',
            body: 'On demand file serving over native ESM, no bundling required!'
          },
          {
            icon: '/icons/box-icon.svg',
            iconDark: '/icons/box-icon-dark.svg',
            iconAlt: 'Box',
            title: 'Lightning Fast HMR',
            body: 'Hot Module Replacement (HMR) that stays fast regardless of app size.'
          },
          {
            icon: '/icons/box-icon.svg',
            iconDark: '/icons/box-icon-dark.svg',
            iconAlt: 'Box',
            title: 'Rich Features',
            body: 'Out-of-the-box support for TypeScript, JSX, CSS and more.'
          },
          {
            icon: '/icons/box-icon.svg',
            iconDark: '/icons/box-icon-dark.svg',
            iconAlt: 'Box',
            title: 'Optimized Build',
            body: 'Pre-configured rollup build with multi-page and library mode support.'
          },
          {
            icon: '/icons/box-icon.svg',
            iconDark: '/icons/box-icon-dark.svg',
            iconAlt: 'Box',
            title: 'Universal Plugins',
            body: 'Rollup-superset plugin interface shared between dev and build.'
          },
          {
            icon: '/icons/box-icon.svg',
            iconDark: '/icons/box-icon-dark.svg',
            iconAlt: 'Box',
            title: 'Fully Typed APIs',
            body: 'Flexible programmatic APIs with full TypeScript typing.'
          }
        ],
        footer: 'MIT Licensed | Copyright © 2021 - Vitebook'
      }
    }
  },
  plugins: [
    vueMarkdownPlugin({
      pages: /.md$/
    }),
    storyPlugin({
      pages: /\.(story\.)?vue$/
    }),
    vueClientPlugin({
      // pages: /\.vue$/,
      vue: {
        include: [/\.vue$/, /\.md$/]
      }
    }),
    defaultVueThemePlugin()
  ]
});
