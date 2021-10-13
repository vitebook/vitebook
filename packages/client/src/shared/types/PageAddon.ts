import type { LocaleConfig } from '@vitebook/core/shared';
import type { SvelteComponent } from 'svelte';

export type PageAddon<
  AddonMeta = unknown,
  Component = typeof SvelteComponent
> = PageAddonLocaleData & {
  /** Page addon name. */
  name?: string;
  /** Returns client-side addon component (it can be dynamically imported).  */
  component: Component | (() => Promise<Component>);
  /** Localization config.  */
  locales?: PageAddonLocaleConfig;
  /** Page addon meta.  */
  __addonMeta: AddonMeta;
};

export type PageAddonLocaleData = {
  /** Title of the page addon.  */
  title: string;
  /** Description of the page addon.  */
  description: string;
};

export type PageAddonLocaleConfig = LocaleConfig<PageAddonLocaleData>;

export type PageAddonModule<
  AddonMeta = unknown,
  Component = typeof SvelteComponent
> = {
  default: PageAddon<AddonMeta, Component>;
};

export type VirtualPageAddonsModule<
  Module extends PageAddonModule = PageAddonModule
> = {
  default: { loader: () => Promise<Module> }[];
};
