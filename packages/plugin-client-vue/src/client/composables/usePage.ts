import type { Page as DefaultPage } from '@vitebook/core';
import type { MarkdownPage } from '@vitebook/plugin-markdown';
import type { VueMarkdownPage } from '@vitebook/plugin-markdown-vue';
import type { StoryPage } from '@vitebook/plugin-story';

export type Page = DefaultPage | MarkdownPage | VueMarkdownPage | StoryPage;

// determined by router??
