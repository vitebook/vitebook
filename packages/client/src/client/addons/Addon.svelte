<script>
  import { onMount } from 'svelte';
  import { addons, getAddonPortalId } from './addons';

  let ref;
  let portal;
  let addon;

  export let title;
  export let icon = undefined;

  $: {
    if (addon) addons.delete(addon);
    addon = addons.add({ title, icon });
  }

  onMount(() => {
    const searchParams = new URL(location.href).searchParams;
    const addonParam = searchParams?.get('addon');
    if (addonParam) {
      const addon = $addons[addonParam];
      if (addon) {
        addons.setActive(addon);
      }
    }

    return () => {
      portal?.remove();
      addons.delete(addon);
    };
  });

  const { ready } = addons;
  $: if ($ready && addon && ref) {
    portal = document.createElement('div');
    document.getElementById(getAddonPortalId(addon))?.appendChild(portal);
    portal.appendChild(ref);
  } else {
    portal?.remove();
  }
</script>

<div class="portal-clone">
  <div bind:this={ref}>
    <slot />
  </div>
</div>

<style>
  .portal-clone {
    display: none;
  }
</style>
