import { clientPlugin, defineConfig } from '@vitebook/client/node';
import { svelteMarkdownPlugin } from '@vitebook/markdown-svelte/node';
import { defaultThemePlugin } from '@vitebook/theme-default/node';
import { shikiMarkdownPlugin } from '@vitebook/markdown-shiki/node';

export default defineConfig({
  include: ['src/**/*.md', 'src/**/*.svelte'],
  plugins: [
    svelteMarkdownPlugin({ include: /\.md/ }),
    shikiMarkdownPlugin(),
    clientPlugin({
      include: /\.svelte/,
      svelte: {
        extensions: ['.svelte', '.md'],
      },
    }),
    defaultThemePlugin(),
  ],
  site: {
    title: 'Vitebook',
    description:
      'Blazing fast static-site generator and alternative to Storybook.',
    /** @type {(import('@vitebook/theme-default/node').DefaultThemeConfig} */
    theme: {
      sidebar: {
        style: 'docs',
        categories: true,
        items: {
          '/': getMainSidebar(),
        },
      },
      markdown: {
        toc: true,
        editLink: true,
        editLinkText: 'Edit this page on GitHub',
        prevLink: true,
        nextLink: true,
        lastUpdated: true,
        remoteGitRepo: {
          dir: 'docs',
        },
      },
      remoteGitRepo: {
        url: 'vitebook/vitebook',
      },
    },
  },
});

/**
 * @returns {import('@vitebook/theme-default').SidebarItemsConfig}
 */
function getMainSidebar() {
  return [
    {
      text: 'Introduction',
      children: [
        {
          text: 'What is Vitebook?',
          link: '/introduction/what-is-vitebook.html',
        },
        {
          text: 'Getting Started',
          link: '/introduction/getting-started.html',
        },
        {
          text: 'Configuration',
          link: '/introduction/configuration.html',
        },
      ],
    },
    {
      text: 'Guides',
      children: [
        {
          text: 'Pages',
          link: '/guides/pages.html',
        },
        {
          text: 'Stories',
          link: '/guides/stories.html',
        },
        {
          text: 'Assets',
          link: '/guides/assets.html',
        },
        {
          text: 'Markdown',
          link: '/guides/markdown.html',
        },
        {
          text: 'I18n',
          link: '/guides/i18n.html',
        },
        {
          text: 'Deploying',
          link: '/guides/deploying.html',
        },
      ],
    },
    {
      text: 'Default Theme',
      children: [
        {
          text: 'Installation',
          link: '/default-theme/installation.html',
        },
        {
          text: 'Configuration',
          link: '/default-theme/configuration.html',
        },
        {
          text: 'Navbar',
          link: '/default-theme/navbar.html',
        },
        {
          text: 'Sidebar',
          link: '/default-theme/sidebar.html',
        },
        {
          text: 'Markdown',
          link: '/default-theme/markdown.html',
        },
        {
          text: 'Customization',
          link: '/default-theme/customization.html',
        },
      ],
    },
    {
      text: 'Advanced',
      children: [
        {
          text: 'Themes',
          link: '/advanced/themes.html',
        },
        {
          text: 'Plugins',
          link: '/advanced/plugins.html',
        },
      ],
    },
  ];
}
