import type { Page, ResolvedPage, ServerPage } from '@vitebook/core';
import type { MarkdownData } from '@vitebook/plugin-markdown';
import type { Component } from 'vue';

export type VueMarkdownPage = Page<VueMarkdownPageModule> & {
  type: 'vue:md';
};

export type VueMarkdownPageModule<Data extends MarkdownData = MarkdownData> = {
  default: Component;
  data: Data;
};

export type ServerVueMarkdownPage = ServerPage & {
  type: 'vue:md';
};

export type ResolvedVueMarkdownPage = ResolvedPage & {
  type: 'vue:md';
};
