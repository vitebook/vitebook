import type {
  DefaultLoadedPage,
  DefaultPageModule,
  Page as DefaultPage
} from '@vitebook/core/shared';
import type { Component } from 'vue';

export type VueComponentPage = DefaultPage<VueComponentPageModule> & {
  type: 'vue';
};

export type VueComponentPageModule = DefaultPageModule<Component>;

export type LoadedVueComponentPage = DefaultLoadedPage<VueComponentPageModule>;

// User config
export type VuePageConfig = VueComponentPageModule['__pageMeta'];
