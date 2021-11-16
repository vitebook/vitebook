import type { TabsRegistry } from '@vitebook/client/components/tabs';
import { inject, InjectionKey, provide } from 'vue';

export const TabsRegistryKey: InjectionKey<TabsRegistry> = Symbol(
  import.meta.env.DEV ? 'TABS_REGISTRY' : '',
);

export function provideTabsRegistry(registry: TabsRegistry) {
  return provide(TabsRegistryKey, registry);
}

export function useTabsRegistry(): TabsRegistry {
  return inject(TabsRegistryKey)!;
}
