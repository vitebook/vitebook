import { type AppContextMap, type ServerRenderResult } from '../../shared';

export type ViewModule = {
  readonly [id: string]: unknown;
};

export type ViewRenderer<
  ClientModule extends ViewModule = ViewModule,
  ServerModule extends ViewModule = ViewModule,
> = {
  name: string;

  attach(options: {
    target: HTMLElement;
    context: AppContextMap;
    module: ClientModule;
    hydrate: boolean;
  }): void | Promise<void>;

  detach(options: { target: HTMLElement }): void | Promise<void>;

  canRender(id: string, module: ViewModule): boolean;

  ssr(options: {
    module: ServerModule;
    context: AppContextMap;
  }):
    | Omit<ServerRenderResult, 'ssr'>
    | Promise<Omit<ServerRenderResult, 'ssr'>>;
};

export function findViewRenderer(
  id: string,
  module: ViewModule,
  renderers: ViewRenderer[],
): ViewRenderer | undefined {
  return renderers.find((renderer) => renderer.canRender(id, module));
}
