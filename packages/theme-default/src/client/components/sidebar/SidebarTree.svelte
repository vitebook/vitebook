<script>
  import { isSidebarMenu } from '../../../shared';
  import SidebarMenu from './SidebarMenu.svelte';
  import SidebarLink from './SidebarLink.svelte';

  export let items;
  export let depth = 0;
</script>

{#each items as item (item.text + item.link + '__' + depth)}
  {#if !isSidebarMenu(item)}
    <SidebarLink {item} />
  {:else}
    <SidebarMenu {item} {depth}>
      <svelte:self items={item.children} depth={depth + 1} />
    </SidebarMenu>
  {/if}
{/each}
