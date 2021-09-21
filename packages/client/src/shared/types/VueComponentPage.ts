import type {
  DefaultPageModule,
  Page as DefaultPage
} from '@vitebook/core/shared';
import type { Component } from 'vue';

export type VueComponentPage = DefaultPage<VueComponentPageModule> & {
  type: 'vue';
};

export type VueComponentPageModule = DefaultPageModule<Component>;

// User config
export type VuePageConfig = VueComponentPageModule['__pageMeta'];
