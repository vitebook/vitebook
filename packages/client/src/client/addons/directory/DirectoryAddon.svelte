<script>
  import Addon from '../Addon.svelte';
  import FolderClosedIcon from ':virtual/vitebook/icons/sidebar-folder-closed?raw';
  import {activeVariant, variants} from "../../stores/variants.js";

  export let title = 'Directory';
  export let icon = FolderClosedIcon;

</script>

<Addon {title} {icon}>
  <div class="addon__directory">
    {#each Object.values($variants) as item (item.id)}
      <button
        class:active={$activeVariant?.id === item.id}
        on:click={()=>variants.setActive(item.id)}
      >
        {item.name}
      </button>
      {:else}
      <button>
        Nothing at all
      </button>
    {/each}
  </div>
</Addon>
<style>
  button {
    display: flex;
    align-items: center;
    width: 100%;
    padding: var(--vbk--sidebar-item-padding);
    border: 0;
    font-size: var(--vbk--sidebar-item-font-size);
    margin-top: var(--vbk--sidebar-item-spacing);
    font-weight: var(--vbk--sidebar-item-font-weight);
    border-radius: var(--vbk--sidebar-item-border-radius);
    color: var(--vbk--sidebar-item-color);
    white-space: nowrap;
    text-decoration: none;
    background-color: var(--vbk--sidebar-item-bg-color);
    text-align: left;
    cursor: var(--vbk--sidebar-item-cursor, pointer);
    line-height: var(--vbk--sidebar-item-line-height);
  }

  button.active {
    color: var(--vbk--color-primary);
    background-color: var(--vbk--sidebar-item-active-bg-color);
  }

  @media (min-width: 992px) {
    button {
      color: var(--vbk--nav-item-color);
      background-color: var(--vbk--nav-item-bg-color);
    }
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover {
      color: var(--vbk--color-primary);
      background-color: var(--vbk--sidebar-item-hover-bg-color);
    }
  }
</style>
