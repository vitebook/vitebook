import { useMarkdownPageMeta } from '@vitebook/client';
import { computed, ComputedRef } from 'vue';

import { defaultThemeLocaleOptions } from '../../../shared';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

export function useIsMarkdownFloatingTocEnabled(): ComputedRef<boolean> {
  const pageMeta = useMarkdownPageMeta();
  const theme = useLocalizedThemeConfig();

  return computed(
    () =>
      (pageMeta.value?.headers.length ?? 0) > 1 &&
      ((pageMeta.value?.frontmatter.toc as boolean) ??
        theme.value.markdown?.toc !== false ??
        defaultThemeLocaleOptions.markdown.toc !== false)
  );
}
