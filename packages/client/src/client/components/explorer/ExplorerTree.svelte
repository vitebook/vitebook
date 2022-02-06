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
    <a href={item.link}>
      <span class="icon">{@html icon?.default ?? ''}</span>
      {item.text}
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

<style>
  ul {
    margin: 0.5rem 0;
    padding: 0;
    padding-left: 0.375rem;
    margin-left: 0.5rem;
    list-style: none;
    border-left: 0.5px solid hsl(0, 0%, 87.5%);
    border-radius: 4px;
  }

  ul > span {
    display: inline-block;
    font-size: 1rem;
    font-weight: bold;
  }

  li {
    padding: 0.25rem 0;
    margin-top: 0;
  }

  a {
    margin-left: 0.5rem;
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    color: hsl(0, 0%, 12.3%);
    text-decoration: underline;
  }

  a > .icon {
    font-size: 0.8125rem;
    margin-right: 0.25rem;
  }

  a:hover {
    color: #610fe6;
  }
</style>
