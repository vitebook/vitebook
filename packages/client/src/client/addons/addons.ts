import { inBrowser } from '@vitebook/core';
import { writable } from 'svelte/store';

export function getAddonPortalId(addon: AddonEntry) {
  return `vbk-addon-portal-${addon.id}`;
}

export function getAddonSSRMarker(addon: AddonEntry) {
  return `<!--vbk-addon-ssr-${addon.id}-->`;
}

function updateSearchParam(addon: AddonEntry | null) {
  if (!inBrowser) return;

  const url = new URL(location.href);

  if (addon) {
    url.searchParams.set('addon', addon.id);
  } else {
    url.searchParams.delete('addon');
  }

  window.history.replaceState({}, '', url.toString());
}

export const addons = {
  ...writable<Addons>({}),
  ready: writable(false),
  add(addon: Omit<AddonEntry, 'id' | 'active'>) {
    const newAddon: AddonEntry = {
      ...addon,
      id: addon.title.toLowerCase(),
      active: false,
    };

    addons.update(($addons) => ({ ...$addons, [newAddon.id]: newAddon }));

    return newAddon;
  },
  delete(addon: AddonEntry) {
    addons.update(($addons) => {
      delete $addons[addon.id];
      return $addons;
    });
  },
  setActive(addon: AddonEntry | null) {
    addons.update(($addons) => {
      Object.values($addons).forEach((addon) => {
        addon.active = false;
      });

      if (addon) {
        $addons[addon.id].active = true;
      }

      updateSearchParam(addon);

      return $addons;
    });
  },
} as const;

// Name not to conflict with `Addon.svelte`.
export type AddonEntry = {
  id: string;
  title: string;
  icon?: string;
  active: boolean;
};

export type Addons = {
  [addonId: string]: AddonEntry;
};
