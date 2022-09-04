import { type App } from 'node/app/App';
import type {
  ServerPage,
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

  /** Started loading static data for page (includes any layouts). */
  startLoadingStaticData?(
    pathname: string,
    page: ServerPage,
  ): void | Promise<void>;

  /** Finished loading static data for page (includes any layouts). */
  finishLoadingStaticData?(
    pathname: string,
    page: ServerPage,
    data: StaticLoaderOutputMap,
    redirect?: string,
  ): void | Promise<void>;

  // --- RENDER (SSR)

  startRenderingPages?(): void | Promise<void>;

  startRenderingPage?(pathname: string, page: ServerPage): void | Promise<void>;

  finishRenderingPage?(
    pathname: string,
    page: ServerPage,
    result: {
      redirect?: { path: string; statusCode: number };
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
