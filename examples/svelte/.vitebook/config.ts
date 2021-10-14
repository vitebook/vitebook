import { defineConfig, clientPlugin } from '@vitebook/client/node';
import { svelteMarkdownPlugin } from '@vitebook/markdown-svelte/node';
import { shikiMarkdownPlugin } from '@vitebook/markdown-shiki/node';
import {
  DefaultThemeConfig,
  defaultThemePlugin
} from '@vitebook/theme-default/node';
import sveltePreprocess from 'svelte-preprocess';

export default defineConfig<DefaultThemeConfig>({
  include: ['src/**/*.{md,svelte}'],
  plugins: [
    shikiMarkdownPlugin(),
    svelteMarkdownPlugin({
      include: /\.md/
    }),
    clientPlugin({
      include: /\.(md|svelte)/,
      svelte: {
        preprocess: [sveltePreprocess({ typescript: true })],
        extensions: ['.svelte', '.md']
      }
    }),
    defaultThemePlugin()
  ],
  site: {
    title: 'Vitebook',
    description: 'Blazing fast Storybook alternative.',
    theme: {
      remoteGitRepo: {
        url: 'vitebook/vitebook'
      },
      homePage: {
        heroText: 'Document, test, and play with your components.',
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
