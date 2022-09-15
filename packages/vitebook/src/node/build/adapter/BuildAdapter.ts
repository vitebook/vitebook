import type { App } from 'node/app/App';
import type { PageFileRoute } from 'node/app/routes';
import type {
  ServerRedirect,
  ServerRenderResult,
  StaticLoaderOutputMap,
} from 'server/types';

import { type BuildBundles, type BuildData } from '../build';
import { type BuildAdapterUtils } from './BuildAdapterUtils';

export type BuildAdapterFactory = (
  app: App,
  bundles: BuildBundles,
  build: BuildData,
  utils: BuildAdapterUtils,
) => BuildAdapter | Promise<BuildAdapter>;

export type BuildAdapter = {
  name: string;

  // --- LOAD

  /** Started loading static data for page (includes layouts). */
  startLoadingStaticData?(
    pathname: string,
    route: PageFileRoute,
  ): void | Promise<void>;

  /** Finished loading static data for page (includes layouts). */
  finishLoadingStaticData?(
    pathname: string,
    route: PageFileRoute,
    data: StaticLoaderOutputMap,
    redirect?: string,
  ): void | Promise<void>;

  // --- RENDER (SSR)

  startRenderingPages?(): void | Promise<void>;

  startRenderingPage?(
    pathname: string,
    route: PageFileRoute,
  ): void | Promise<void>;

  finishRenderingPage?(
    pathname: string,
    route: PageFileRoute,
    result: {
      redirect?: ServerRedirect;
      ssr?: ServerRenderResult | null;
      dataAssetIds?: Set<string>;
    },
  ): void | Promise<void>;

  finishRenderingPages?(): void | Promise<void>;

  // --- WRITE

  /** Build data is ready and can be used to write to file system. */
  write?(): void | Promise<void>;

  // -- CLOSE

  close?(): void | Promise<void>;
};
