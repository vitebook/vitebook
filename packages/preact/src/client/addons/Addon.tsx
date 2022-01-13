import { AddonEntry, addons, getAddonPortalId } from '@vitebook/client/addons';
import type { ComponentChildren, VNode } from 'preact';
import { createPortal } from 'preact/compat';
import { useEffect, useRef, useState } from 'preact/hooks';
import { get } from 'svelte/store';

export type AddonProps = {
  title: string;
  icon?: string;
  children: ComponentChildren;
};

function Addon({ title, icon, children }: AddonProps) {
  const addon = useRef<AddonEntry>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (addon.current) addons.delete(addon.current);
    addon.current = addons.add({ title, icon });
    return () => {
      if (addon.current) addons.delete(addon.current);
    };
  }, [title, icon]);

  useEffect(() => {
    return addons.ready.subscribe(($ready) => {
      setReady($ready);
    });
  });

  useEffect(() => {
    if (ready) {
      const searchParams = new URL(location.href).searchParams;
      const addonParam = searchParams?.get('addon');
      if (addonParam) {
        const addon = get(addons)[addonParam];
        if (addon) {
          addons.setActive(addon);
        }
      }
    }
  }, [ready]);

  return ready && addon.current ? (
    createPortal(
      children as VNode,
      document.getElementById(getAddonPortalId(addon.current))!,
    )
  ) : (
    <></>
  );
}

Addon.displayName = 'Addon';

export default Addon;
