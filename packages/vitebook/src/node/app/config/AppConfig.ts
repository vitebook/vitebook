import type { BuildConfig, ResolvedBuildConfig } from './BuildConfig';
import type { ClientConfig, ResolvedClientConfig } from './ClientConfig';
import type {
  DirectoriesConfig,
  ResolvedDirectoriesConfig,
} from './DirectoriesConfig';
import type { MarkdownConfig, ResolvedMarkdownConfig } from './MarkdownConfig';
import type { ResolvedRoutesConfig, RoutesConfig } from './RoutesConfig';
import type { ResolvedSitemapConfig, SitemapConfig } from './SitemapConfig';

export type ResolvedAppConfig = {
  /** Application build options. */
  build: ResolvedBuildConfig;
  /** Application directory paths. */
  dirs: ResolvedDirectoriesConfig;
  /** Client options. */
  client: ResolvedClientConfig;
  /** Routing options. */
  routes: ResolvedRoutesConfig;
  /** Markdown options. */
  markdown: ResolvedMarkdownConfig;
  /** Sitemap options. */
  sitemap: ResolvedSitemapConfig[];
  /** Whether app is running in debug mode. */
  isDebug: boolean;
  /** Whether Vite is in build mode. */
  isBuild: boolean;
  /** Whether Vite is in SSR mode. */
  isSSR: boolean;
};

export type AppConfig = Omit<
  Partial<ResolvedAppConfig>,
  | 'build'
  | 'dirs'
  | 'client'
  | 'markdown'
  | 'routes'
  | 'sitemap'
  | 'isBuild'
  | 'isSSR'
> & {
  /** Application build options. */
  build?: BuildConfig;
  /** Application directory paths. */
  dirs?: DirectoriesConfig;
  /** Client options. */
  client?: ClientConfig;
  /** Routes options. */
  routes?: RoutesConfig;
  /** Markdown options. */
  markdown?: MarkdownConfig;
  /** One or many sitemap configurations. */
  sitemap?: SitemapConfig | SitemapConfig[];
};
