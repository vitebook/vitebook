import type { ComponentChildren } from 'preact';

import Addon from './Addon';

export type ControlsAddonProps = {
  title?: string;
  icon?: string;
  children: ComponentChildren;
};

function ControlsAddon({
  title = 'Controls',
  icon,
  children,
}: ControlsAddonProps) {
  return (
    <Addon title={title} icon={icon}>
      {children}
    </Addon>
  );
}

ControlsAddon.displayName = 'ControlsAddon';

export default ControlsAddon;
