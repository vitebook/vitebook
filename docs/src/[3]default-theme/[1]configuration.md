<script>
import { Tabs, TabPanel } from '@vitebook/client/components/tabs';

const jsLangs = ['JavaScript', 'TypeScript'];
</script>

# Default Theme Configuration

<Tabs values={jsLangs} groupId="jsLang">
<TabPanel value="JavaScript">

```js {2,8,12-15}
import { defineConfig } from '@vitebook/client/node';
import { defaultThemePlugin } from '@vitebook/theme-default/node';

export default defineConfig({
  // ...
  plugins: [
    // ...
    defaultThemePlugin(),
  ],
  site: {
    // ...
    /** @type {(import('@vitebook/theme-default/node').DefaultThemeConfig} */
    theme: {
      // ...
    },
  },
});
```

</TabPanel>

<TabPanel value="TypeScript">

```ts {2-5,11,15-17}
import { defineConfig } from '@vitebook/client/node';
import {
  defaultThemePlugin,
  DefaultThemeConfig,
} from '@vitebook/theme-default/node';

export default defineConfig<DefaultThemeConfig>({
  // ...
  plugins: [
    // ...
    defaultThemePlugin(),
  ],
  site: {
    // ...
    theme: {
      // ...
    },
  },
});
```

</TabPanel>
</Tabs>

## Dark Mode

`@type DarkModeConfig | undefined`

### `enabled`

`@type boolean | undefined`
`@default true`

If set to `true`, a button to switch dark mode will be displayed in the navbar, and the initial
mode will be automatically set according to the
[prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
property.

```js
theme: {
  darkMode: {
    enabled: true,
  }
}
```

### `buttonAriaLabel`

`@type string | undefined`
`@default 'Toggle dark mode'`

A11y text for dark mode toggle button.

```js
theme: {
  darkMode: {
    buttonAriaLabel: 'Toggle dark mode',
  }
}
```

## Remote Git Repo

`@type RemoteGitRepoConfig | undefined`

### `url`

`@type string | undefined`

Specify the repository URL of your project. This will be used as the `href` of the repository
link, which will be displayed as the last item of the navbar.

```js
theme: {
  remoteGitRepo: {
    // Short-hand for GitHub (org/repo).
    url: 'vitebook/vitebook',

    // GitHub URL
    // url: 'https://github.com/vitebook/vitebook',

    // GitLab URL
    // url: 'https://gitlab.com/gitlab-org/gitlab',
  }
}
```

### `label`

`@type string | undefined`

Specify the repository label of your project. If you don't set this option explicitly, it
will be automatically inferred from the `url` option.

```js
theme: {
  remoteGitRepo: {
    label: 'GitHub',
  }
}
```

## Socials

`@type SocialsConfig | undefined`

Social links to be displayed in the main navbar or sidebar depending on your configuration.

```js
theme: {
  social: {
    discord: 'https://discord.gg/{CODE}',
    twitter: 'https://twitter.com/vitebook',
  }
}
```

_or_

```js
theme: {
  social: {
    // Include label for ally.
    twitter: {
      label: 'Vitebook Twitter',
      link: 'https://twitter.com/vitebook',
    }
  }
}
```

## Navbar

`@type NavbarConfig | false | undefined`

The top navbar is disabled by default, you can enable it by simply setting it to an empty
object `{}`. If you enable the navbar, a main menu option will appear in the sidebar on mobile.

### `items`

`@type (NavLink | NavMenu)[]`

```ts
interface NavLink {
  text: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  activeMatch?: string;
  link: string;
}

interface NavMenu {
  text: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  activeMatch?: string;
  menu: NavLink[];
}
```

```js
theme: {
  navbar: {
    items: [
      // NavLink
      {
        text: 'API',
        link: '/api.html',
      },
      // NavMenu
      {
        text: 'Products',
        menu: [
          {
            text: 'Product A',
            link: '/products/a.html',
          },
          {
            text: 'Product B',
            link: '/products/b.html',
          },
        ],
      },
    ];
  }
}
```

### `languageMenu`

The select language menu will appear next to the repository button in the navbar when you set
[multiple locales](../guides/i18n.md#) in your site config.

```js
theme: {
  navbar: {
    languageMenu: {
      // ...
    }
  }
}
```

#### `selectLanguageText`

`@type string | undefined`

Specify the text of the select language menu.

```js
theme: {
  navbar: {
    languageMenu: {
      selectLanguageText: 'Languages',
    }
  }
}
```

#### `selectLanguageAriaLabel`

`@type string | undefined`

Specify the aria-label attribute of the select language menu. This is mainly for a11y purposes.

```js
theme: {
  navbar: {
    languageMenu: {
      selectLanguageAriaLabel: 'Pick a language',
    }
  }
}
```

#### `selectLanguageName`

`@type string | undefined`

Specify the name of the language of a locale. This option will only take effect inside the
`locales` of your theme config. It will be used as the language name of the locale, which will
be displayed in the select language menu.

```js
theme: {
  navbar: {
    languageMenu: {
      selectLanguageName: 'English';
    }
  }
}
```

## Sidebar

`@type SidebarConfig | undefined`

The sidebar is automatically built by Vitebook, include this property to take control.

### `items`

`@type SidebarItemsConfig | MultiSidebarItemsConfig`

```ts
export type SidebarItemsConfig = SidebarItem[] | 'auto' | false;

export type SidebarItem = SidebarLink | SidebarMenu;

export type SidebarLink = {
  text: string;
  link: string;
  type?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  activeMatch?: string;
};

export type SidebarMenu = {
  text: string;
  collapsible?: boolean;
  children: SidebarItem[];
};
```

#### Example 1

A simple sidebar menu.

```js
theme: {
  sidebar: {
    items: [
      // SidebarLink
      {
        text: 'Sidebar Item A',
        link: '/path-to-item-a.html',
      },
      // SidebarMenu
      {
        text: 'Sidebar Menu',
        children: [
          {
            text: 'Sidebar Item B',
            link: '/path-to-item-b.html',
          },
          {
            text: 'Sidebar Item C',
            link: '/path-to-item-c.html',
          },
        ],
      },
    ];
  }
}
```

#### Example 2

A multi-sidebar configuration depending on the route.

```js
theme: {
  sidebar: {
    // Auto-resolve sidebar items by default.
    '/' : 'auto',
    // Custom sidebar when path starts with  '/api'.
    '/api': {},
    // Disable sidebar when path starts with '/playground'.
    '/playground': false,
  }
}
```

#### Example 3

Change the [sidebar style](#style) depending on the route.

```js
theme: {
  sidebar: {
    '/docs': {
      items: 'auto',
      style: 'docs',
      categories: true,
    },
    '/playground': {
      items: [
        // ...
      ],
      style: 'explorer',
      iconColors: true,
    },
  }
}
```

#### Example 4

Another way to control the ordering of sidebar items is by using ordered pages. Vitebook will
ignore numbers inside square brackets in the file path (eg: `[1]introduction/[1]what-is-vitebook.md`),
so you can use this to control the order of the sidebar items.

```
src
├─ [1]introduction
   ├─ [1]what-is-vitebook.md
   └─ [2]getting-started.md
└─ [2]guides
   ├─ [1]pages.md
   ├─ [2]stories.md
   └─ [3]assets.md
```

You can still link to pages as normal whilst ignoring the square brackets. The routes
for the above examples would be...

```
/introduction/what-is-vitebook.html
/introduction/getting-started.html
/guides/pages.html
/guides/stories.html
/guides/assets.html
```

### `style`

`@type 'explorer' | 'docs'`
`@default 'explorer'`

Specify the style of the sidebar. The `explorer` style is similar to what you'd see in VSCode with
folders and file icons, and the `docs` style is for documentation purposes, just like what you
see here on the Vitebook site.

```js
theme: {
  sidebar: {
    style: 'explorer',
  }
}
```

### `categories`

`@type boolean | undefined`

Whether root folders in `<srcDir>` should be treated as categories. This will simply create
sections in the sidebar.

```js
theme: {
  sidebar: {
    categories: true,
  }
}
```

### `backToMainMenuText`

`@type string | undefined`
`@default 'Back to main menu'`

Specify the text to be displayed inside the back to main menu button in the sidebar.

```js
theme: {
  sidebar: {
    backToMainMenuText: 'Back to main menu',
  }
}
```

### `iconColors`

`@type boolean | undefined`
`@default false`

Whether to enable sidebar icon colors. By default they're only set when the sidebar item is active.
This only applies if the [sidebar style](#style) is set to `explorer`.

```js
theme: {
  sidebar: {
    iconColors: true,
  }
}
```

### `toggleAriaLabel`

`@type string | undefined`
`@default 'Toggle sidebar menu'`

A11y text for sidebar menu toggle button.

```js
theme: {
  sidebar: {
    toggleAriaLabel: 'Toggle sidebar menu',
  }
}
```

## Markdown

`@type MarkdownConfig | undefined`

### `toc`

`@type boolean | undefined`
`@default false`

Whether the floating table of contents to the right of markdown pages should be enabled by
default. This can be configured on a page-by-page basis via the `toc` frontmatter property.

```js
theme: {
  markdown: {
    toc: true,
  }
}
```

### `editLink`

`@type boolean | undefined`
`@default false`

Whether to show edit links at the bottom of documents. When clicked they'll take the user
to the respective document in the provided repo. This can be configured on a page-by-page basis
via the `editLink` frontmatter property.

```js
theme: {
  markdown: {
    editLink: true,
  }
}
```

### `editLinkPattern`

`@type string | undefined`
`@default ':repo/edit/:branch/:path'`

Specify the pattern of the edit this page link. This will be used for generating the edit this
page link. This can be configured on a page-by-page basis via the `editLinkPattern` frontmatter
property.

**Patterns:**

- `:repo` - The repo URL.
- `:branch` - The repo branch.
- `:path` - The path of the source file.

```js
theme: {
  markdown: {
    editLinkPattern: ':repo/edit/:branch/:path',
  }
}
```

### `editLinkText`

`@type string | undefined`
`@default 'Edit this page'`

The text to be displayed for edit links. If you're setting localized text then set this
inside the `locales` property. This can be configured on a page-by-page basis via the `editLinkText`
frontmatter property.

```js
theme: {
  markdown: {
    editLinkText: 'Edit this page on GitHub',
  }
}
```

### `lastUpdated`

`@type boolean | undefined`
`@default false`

Enable the last updated timestamp or not. This can be configured on a page-by-page basis via the
`lastUpdated` frontmatter property.

```js
theme: {
  markdown: {
    lastUpdated: true,
  }
}
```

### `lastUpdatedText`

`@type string | undefined`
`@default 'Last updated on'`

Specify the text of the last updated timestamp label. This can be configured on a page-by-page
basis via the `lastUpdatedText` frontmatter property.

```js
theme: {
  markdown: {
    lastUpdatedText: 'Last updated on',
  }
}
```

### `prevLink`

`@type boolean | undefined`
`@default false`

Whether the previous page link at the bottom of markdown pages is enabled. This can be configured
on a page-by-page basis via the `prevLink` frontmatter property.

```js
theme: {
  markdown: {
    prevLink: true,
  }
}
```

### `prevLinkText`

`@type string | undefined`
`@default 'Previous'`

Specify text to be displayed inside the previous page link at the bottom of markdown pages. This
can be configured on a page-by-page basis via the `prevLinkText` frontmatter property.

```js
theme: {
  markdown: {
    prevLinkText: 'Previous',
  }
}
```

### `nextLink`

`@type boolean | undefined`
`@default false`

Whether the next page link at the bottom of markdown pages is enabled. This can be configured on
a page-by-page basis via the `nextLink` frontmatter property.

```js
theme: {
  markdown: {
    nextLink: true,
  }
}
```

### `nextLinkText`

`@type string | undefined`
`@default 'Next'`

Specify text to be displayed inside the next page link at the bottom of markdown pages. This can
be configured on a page-by-page basis via the `nextLinkText` frontmatter property.

```js
theme: {
  markdown: {
    nextLinkText: 'Next',
  }
}
```

### `remoteGitRepo`

Remote Git repository configuration for generating the 'Edit this page' link.

#### `url`

`@type string | undefined`

Specify the repository URL of your documentation files. This will be used for
generating the edit this page link. If you don't set this option, it will be
inferred from the root [remoteGitRepo.url](#url) option.

```js
theme: {
  markdown: {
    remoteGitRepo: {
      url: 'https://github.com/vitebook/vitebook',
    }
  }
}
```

#### `branch`

`@type string | undefined`
`@default 'main'`

Specify the repository branch of your documentation files. This will be
used for generating the edit this page link.

```js
theme: {
  markdown: {
    remoteGitRepo: {
      branch: 'main',
    }
  }
}
```

#### `dir`

`@type string | undefined`
`@default ''`

Specify the directory of your documentation files in the repository. This
will be used for generating the edit this page link.

```js
theme: {
  markdown: {
    remoteGitRepo: {
      dir: 'docs',
    }
  }
}
```

## Home Page

`@type HomePageConfig | false | undefined`

By default, the home page is either the `<srcDir>/index` file, or the very first page in your
`<srcDir>`. You can use this configuration option to build a more welcoming home page (`/`). If
you have included a `index` file in the `<srcDir>`, then the default theme home page will not
be shown.

### `heroText`

`@type string | undefined`

Large text displayed at the top of the page in the hero.

```js
theme: {
  homePage: {
    heroText: 'Next Generation Frontend Tooling',
  }
}
```

### `primaryActionText`

`@type string | undefined`

Text to be displayed inside the primary button link in the hero.

```js
theme: {
  homePage: {
    primaryActionText: 'Get Started',
  }
}
```

### `primaryActionLink`

`@type string | undefined`

URL of the primary button link.

```js
theme: {
  homePage: {
    primaryActionLink: '/docs/getting-started.html',
  }
}
```

### `secondaryActionText`

`@type string | undefined`

Text to be displayed inside the secondary button link in the hero.

```js
theme: {
  homePage: {
    secondaryActionText: 'Learn More',
  }
}
```

### `secondaryActionLink`

`@type string | undefined`

URL of the secondary button link.

```js
theme: {
  homePage: {
    secondaryActionLink: '/docs/learn-more.html',
  }
}
```

### `features`

`@type Feature[] | undefined`

Feature items to be displayed below the hero.

```js
theme: {
  homePage: {
    features: [
      {
        title: 'Instant Server Start',
        body: 'On demand file serving over native ESM, no bundling required!',
      },
      {
        title: 'Lightning Fast HMR',
        body: 'Hot Module Replacement (HMR) that stays fast regardless of app size.',
      },
      {
        title: 'Rich Features',
        body: 'Out-of-the-box support for TypeScript, JSX, CSS and more.',
      },
    ];
  }
}
```

### `footer`

`@type string | undefined`

Text to be displayed in the footer.

```js
theme: {
  homePage: {
    footer: 'MIT Licensed | Copyright © 2021-present',
  }
}
```

## Not Found Page

`@type NotFoundPageConfig | undefined`

You can choose to customize the default 404 page, or [include your own](../guides/pages.md#_404-page).

### `message`

`@type string | undefined`
`@default 'Oops, something went wrong.'`

Main message displayed on 404 page.

```js
theme: {
  notFoundPage: {
    message: 'Oops, something went wrong.';
  }
}
```

### `goHomeText`

`@type string | undefined`
`@default 'Take me home'`

Displayed text inside back to home button.

```js
theme: {
  notFoundPage: {
    goHomeText: 'Take me home';
  }
}
```

### `goBackText`

`@type string | undefined`
`@default 'Go back'`

Displayed text inside the go back to previous page button.

```js
theme: {
  notFoundPage: {
    goBackText: 'Go back';
  }
}
```
