import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { get } from 'svelte/store';

import { useTabsRegistry } from './useTabsRegistry';

export type TabPanelProps = {
  value: string;
  children: ComponentChildren;
};

function TabPanel({ value, children }: TabPanelProps) {
  const { currentValue } = useTabsRegistry();
  const [$currentValue, $setCurrentValue] = useState(get(currentValue));

  useEffect(() => {
    return currentValue.subscribe((v) => {
      $setCurrentValue(v);
    });
  });

  const selected = $currentValue === value;

  return (
    <div class="tabs__panel" role="tabpanel" hidden={!selected}>
      {children}
    </div>
  );
}

TabPanel.displayName = 'TabPanel';

export default TabPanel;
