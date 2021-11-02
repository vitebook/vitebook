import { currentMarkdownPageMeta } from '@vitebook/client';
import { derived } from 'svelte/store';

import { defaultThemeLocaleOptions } from '../../../shared';
import { localizedThemeConfig } from '../../stores/localizedThemeConfig';

export const isMarkdownFloatingTocEnabled = derived(
  [currentMarkdownPageMeta, localizedThemeConfig],
  ([pageMeta, theme]) => {
    return (
      (pageMeta?.headers.length ?? 0) > 1 &&
      ((pageMeta?.frontmatter.toc as boolean) ??
        theme.markdown?.toc !== false ??
        defaultThemeLocaleOptions.markdown.toc !== false)
    );
  },
);
