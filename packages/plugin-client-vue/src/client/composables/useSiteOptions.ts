import siteOptions from '@virtual/vitebook/core/site';
import type { SiteOptions, ThemeConfig } from '@vitebook/core';
import { readonly, Ref, ref } from 'vue';

export type SiteOptionsRef<Theme extends ThemeConfig = ThemeConfig> = Ref<
  SiteOptions<Theme>
>;

const siteOptionsRef = ref(readonly(siteOptions)) as SiteOptionsRef;

export function useSiteOptions<
  Theme extends ThemeConfig = ThemeConfig
>(): SiteOptionsRef<Theme> {
  return siteOptionsRef as SiteOptionsRef<Theme>;
}

if (import.meta.hot) {
  import.meta.hot.accept('/@virtual/vitebook/core/site', (m) => {
    siteOptionsRef.value = readonly(m.default);
  });
}
