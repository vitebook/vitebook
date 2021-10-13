<script>
  import { isExplorerGroup } from './explorerItems';

  export let item;

  let icon = null;

  function getIcon() {
    const type = item.type.replace(/^\w+:/, '');
    switch (type) {
      case 'js':
      case 'jsx':
        return import('./icons/js.svg?raw');
      case 'ts':
      case 'tsx':
        return import('./icons/ts.svg?raw');
      case 'png':
      case 'jpeg':
        return import('./icons/image.svg?raw');
      case 'mp4':
        return import('./icons/video.svg?raw');
      case 'md':
        return import('./icons/md.svg?raw');
      case 'vue':
        return import('./icons/vue.svg?raw');
      case 'svelte':
        return import('./icons/svelte.svg?raw');
      case 'html':
        return import('./icons/html.svg?raw');
      case 'svg':
        return import('./icons/svg.svg?raw');
      default:
        return import('./icons/file.svg?raw');
    }
  }

  async function loadIcon(_ = '') {
    icon = item.type ? await getIcon() : null;
  }

  $: loadIcon(item.type);
</script>

{#if !isExplorerGroup(item)}
  <li>
    <a href={item.link} class={{}}>
      {@html icon?.default}{item.text}
    </a>
  </li>
{:else}
  <ul>
    <span>{item.text}/</span>
    {#each item.children as child}
      <svelte:self item={child} />
    {/each}
  </ul>
{/if}
