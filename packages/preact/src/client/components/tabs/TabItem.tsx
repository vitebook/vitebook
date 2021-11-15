import { toTitleCase } from '@vitebook/client';
import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { get } from 'svelte/store';

import styles from './TabItem.module.css';
import { useTabsRegistry } from './useTabsRegistry';

export type TabItemProps = {
  value: string;
  label?: string;
  children?: ComponentChildren;
};

function TabItem({
  value,
  label = value ? toTitleCase(value) : 'Unknown',
  children,
}: TabItemProps) {
  const hasAddedTab = useRef(false);
  const { addTab, selectTab, currentValue } = useTabsRegistry();
  const [$currentValue, $setCurrentValue] = useState(get(currentValue));

  if (!hasAddedTab.current) {
    addTab({ value, label });
  }

  useEffect(() => {
    return currentValue.subscribe((v) => {
      $setCurrentValue(v);
    });
  });

  const selected = $currentValue === value;

  function onSelect() {
    selectTab(value);
  }

  return (
    <li
      class={`${styles.tab}${selected ? ` ${styles.selected}` : ''} __vbk__`}
      role="tab"
      aria-selected={selected ? 'true' : 'false'}
      tabIndex={0}
      onPointerDown={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      {children ?? label}
    </li>
  );
}

TabItem.displayName = 'TabItem';

export default TabItem;
