import { AliasOptions, Plugin as VitePlugin, ResolveOptions } from 'vite';

export interface App {
  config: ResolvedAppConfig;
  rawConfig: AppConfig;
  locales: string[];

  loadModule(): Promise<unknown>;
  resolveSiteConfig(): Promise<void>;
  resolveUserConfig(): Promise<ResolvedUserConfig>;
}

export interface Plugin extends VitePlugin {
  name: string;

  /**
   * Define global variable replacements. Entries will be defined on `window` during dev and
   * replaced during build.
   */
  define?: Record<string, unknown>;
  /**
   * Configure resolver.
   */
  resolve?: ResolveOptions & {
    alias?: AliasOptions;
  };
  /**
   *
   */
  cliDevCommand({ app }): Promise<void>;
  cliBuildCommand({ app }): Promise<void>;
  cliServerCommaand({ app }): Promise<void>;
  configureClientApp({ app, router }): Promise<void>;
  configureMarkdown({
    markdownIt: MarkdownIt,
    app: App,
    locale: string
  }): Promise<void>;
  configureSidebarData({
    data: SidebarData,
    app: App,
    locale: string
  }): Promise<void>;
  configurePageData({
    data: PageData,
    app: App,
    locale: string
  }): Promise<void>;
}

export interface ThemePlugin extends Plugin {
  extends?: string;

  layouts: string | Layouts;

  plugins?: Plugin[];
}

export interface AddonPlugin extends Plugin {
  layout: string;
  icon: string;
  iconDark: string;
}

export interface ClientPlugin extends Plugin {
  clientEntry: string;
  serverEntry: string;
}
