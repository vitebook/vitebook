import type {
  DefaultLoadedPage,
  DefaultPageModule,
  Page,
  ServerPage
} from '@vitebook/core/shared';
import type { Component as VueComponent } from 'vue';

export type VuePageType = 'vue' | 'vue:svg' | 'vue:html';

export type VuePage = Page<VuePageModule, VuePageContext> & {
  type: VuePageType;
};

export type VueServerPage = ServerPage<VueServerPageContext> & {
  type: VuePageType;
};

export type VuePageModule = DefaultPageModule<VueComponent>;

export type LoadedVuePage = DefaultLoadedPage<VuePageModule, VuePageContext>;

export type VueLoaderModule = DefaultPageModule<VueComponent>;

export type VuePageContext = {
  loader: () => Promise<VueLoaderModule>;
};

export type VueServerPageContext = {
  loader: string;
};

export type ResolvedVueServerPage = Partial<VueServerPage>;
