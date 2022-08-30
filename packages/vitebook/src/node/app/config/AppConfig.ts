import type { BuildConfig, ResolvedBuildConfig } from './BuildConfig';
import type { ClientConfig, ResolvedClientConfig } from './ClientConfig';
import type {
  DirectoriesConfig,
  ResolvedDirectoriesConfig,
} from './DirectoriesConfig';
import type { ResolvedEntryConfig } from './EntryConfig';
import type { MarkdownConfig, ResolvedMarkdownConfig } from './MarkdownConfig';
import type { ResolvedRoutesConfig, RoutesConfig } from './RoutesConfig';
import type { ResolvedSitemapConfig, SitemapConfig } from './SitemapConfig';

export type ResolvedAppConfig = {
  build: ResolvedBuildConfig;
  dirs: ResolvedDirectoriesConfig;
  entry: ResolvedEntryConfig;
  client: ResolvedClientConfig;
  routes: ResolvedRoutesConfig;
  markdown: ResolvedMarkdownConfig;
  sitemap: ResolvedSitemapConfig[];
  isDebug: boolean;
  isBuild: boolean;
  isSSR: boolean;
};

export type AppConfig = Omit<
  Partial<ResolvedAppConfig>,
  | 'build'
  | 'dirs'
  | 'entry'
  | 'client'
  | 'markdown'
  | 'routes'
  | 'sitemap'
  | 'isBuild'
  | 'isSSR'
> & {
  build?: BuildConfig;
  dirs?: DirectoriesConfig;
  entry?: ResolvedEntryConfig;
  client?: ClientConfig;
  routes?: RoutesConfig;
  markdown?: MarkdownConfig;
  sitemap?: SitemapConfig | SitemapConfig[];
};
