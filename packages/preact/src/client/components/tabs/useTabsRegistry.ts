import type { TabsRegistry } from '@vitebook/client/components/tabs';
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

export const TabsRegistryContext = createContext<TabsRegistry | null>(null);

export function useTabsRegistry() {
  return useContext(TabsRegistryContext)!;
}
