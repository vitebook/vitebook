import type { MarkdownPage, MarkdownPageOptions } from './MarkdownPage.js';
import type { StoryPage, StoryPageOptions } from './StoryPage.js';

export type Page = MarkdownPage | StoryPage;

export type PageOptions = MarkdownPageOptions | StoryPageOptions;
