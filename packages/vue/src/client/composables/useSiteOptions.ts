import siteOptions from '@virtual/vitebook/core/site';
import type {
  DefaultThemeConfig,
  SiteOptions,
  ThemeConfig,
  VirtualSiteDataModule
} from '@vitebook/core/shared';
import { Ref, ref, shallowReadonly } from 'vue';

export type SiteOptionsRef<Theme extends ThemeConfig = DefaultThemeConfig> =
  Ref<Readonly<SiteOptions<Theme>>>;

const siteOptionsRef: SiteOptionsRef = ref(shallowReadonly(siteOptions));

export function useSiteOptions<
  Theme extends ThemeConfig = DefaultThemeConfig
>(): Readonly<SiteOptionsRef<Theme>> {
  return shallowReadonly(siteOptionsRef) as Readonly<SiteOptionsRef<Theme>>;
}

if (import.meta.hot) {
  import.meta.hot.accept(
    '/@virtual/vitebook/core/site',
    (mod: VirtualSiteDataModule) => {
      siteOptionsRef.value = shallowReadonly(mod.default);
    }
  );
}
