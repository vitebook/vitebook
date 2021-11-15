import { TabsRegistry } from '@vitebook/client';
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

export const TabsRegistryContext = createContext<TabsRegistry | null>(null);

export function useTabsRegistry() {
  return useContext(TabsRegistryContext)!;
}
