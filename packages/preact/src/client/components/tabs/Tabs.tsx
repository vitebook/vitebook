import { isString } from '@vitebook/client';
import {
  createTabsRegistry,
  TabsRegistryItem,
} from '@vitebook/client/components/tabs';
import type { ComponentChildren } from 'preact';
import { useRef } from 'preact/hooks';

import { useOnDestroy } from '../../hooks/useOnDestroy';
import { useOnMount } from '../../hooks/useOnMount';
import TabItem from './TabItem';
import styles from './Tabs.module.css';
import { TabsRegistryContext } from './useTabsRegistry';

export type TabsProps = {
  values?: TabsRegistryItem[];
  defaultValue?: string | null;
  groupId?: string | null;
  tabList?: ComponentChildren;
  children: ComponentChildren;
};

function Tabs({
  values = [],
  defaultValue = null,
  groupId = null,
  tabList = null,
  children,
}: TabsProps) {
  const onMount = useOnMount();
  const onDestroy = useOnDestroy();

  const registry = useRef(
    createTabsRegistry(values, {
      defaultValue,
      groupId,
      onMount,
      onDestroy,
    }),
  );

  return (
    <TabsRegistryContext.Provider value={registry.current}>
      <div class={styles.tabs}>
        <ul
          class={styles['tabs__list']}
          role="tablist"
          aria-orientation="horizontal"
        >
          {values.filter(isString).map((value) => (
            <TabItem value={value} key={value} />
          ))}

          {tabList}
        </ul>

        <div class={styles['tabs__panels']}>{children}</div>
      </div>
    </TabsRegistryContext.Provider>
  );
}

Tabs.displayName = 'Tabs';

export default Tabs;
