import type {
  ServerLoadedOutputMap,
  ServerPage,
  ServerRenderResult,
} from '../../../../shared';
import { type App } from '../../App';
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

  /** Started loading data for page (includes any layouts). */
  startLoadingPage?(pathname: string, page: ServerPage): void | Promise<void>;
  /** Finished loading data for page (includes any layouts). */
  finishLoadingPage?(
    pathname: string,
    page: ServerPage,
    data: ServerLoadedOutputMap,
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
