<script>
  import {
    currentRoute,
    localizedSiteOptions,
    OutboundLink,
  } from '@vitebook/client';
  import { getLinkProps } from '../../helpers/getLinkProps';
  import { darkMode } from '../../stores/darkMode';
  import { localizedThemeConfig } from '../../stores/localizedThemeConfig';
  import { multiSidebarStyleConfig } from './multiSidebarStyleConfig';
  import SidebarButton from './SidebarButton.svelte';

  export let item;

  let icon = null;

  $: linkProps = getLinkProps(item, $localizedSiteOptions, $currentRoute);
  $: iconColors =
    $multiSidebarStyleConfig.iconColors ??
    $localizedThemeConfig.sidebar?.iconColors;
  $: sidebarStyle =
    $multiSidebarStyleConfig?.style ?? $localizedThemeConfig.sidebar?.style;
  $: hasDocsStyle = sidebarStyle === 'docs';
  $: hasExplorerStyle = sidebarStyle === 'explorer';

  $: type = item.type
    ? item.type.replace(/^\w+:/, '')
    : item.link.match(/\.(\w+)$/)?.[1] ?? '';

  function getIcon() {
    switch (type) {
      case 'js':
      case 'jsx':
        return import('/:virtual/vitebook/icons/sidebar-file-js?raw');
      case 'ts':
      case 'tsx':
        return import('/:virtual/vitebook/icons/sidebar-file-ts?raw');
      case 'png':
      case 'jpeg':
        return import('/:virtual/vitebook/icons/sidebar-file-image?raw');
      case 'mp4':
        return import('/:virtual/vitebook/icons/sidebar-file-video?raw');
      case 'md':
        return import('/:virtual/vitebook/icons/sidebar-file-md?raw');
      case 'vue':
        return import('/:virtual/vitebook/icons/sidebar-file-vue?raw');
      case 'svelte':
        return import('/:virtual/vitebook/icons/sidebar-file-svelte?raw');
      case 'html':
        return import('/:virtual/vitebook/icons/sidebar-file-html?raw');
      case 'svg':
        return import('/:virtual/vitebook/icons/sidebar-file-svg?raw');
      default:
        return import('/:virtual/vitebook/icons/sidebar-file-file?raw');
    }
  }

  async function loadIcon(_ = '') {
    icon = await getIcon();
  }

  $: loadIcon(type);
</script>

<li
  class="sidebar-item"
  class:style-explorer={hasExplorerStyle}
  class:style-docs={hasDocsStyle}
>
  <SidebarButton
    href={linkProps.href}
    target={linkProps.target}
    rel={linkProps.rel}
    aria-label={linkProps['aria-label']}
    class="sidebar-link"
    active={linkProps.active}
    external={linkProps.external}
  >
    <span
      class="sidebar-link__text"
      class:active={linkProps.active}
      class:external={linkProps.external}
    >
      {#if hasExplorerStyle}
        <span
          class={'sidebar-link__icon' +
            (type.length > 0 ? ` type-${type}` : '')}
          class:dark={$darkMode}
          class:active={linkProps.active}
          class:color={iconColors}
        >
          {@html icon?.default ?? ''}
        </span>
      {/if}
      {item.text}
      {#if linkProps.external}
        <OutboundLink />
      {/if}
    </span>
  </SidebarButton>
</li>

<style>
  .sidebar-item {
    display: block;
    min-width: var(--vbk--sidebar-item-min-width);
    border-radius: var(--vbk--sidebar-item-border-radius);
    white-space: nowrap;
  }

  .sidebar-link__icon {
    display: flex;
    align-items: center;
    margin-right: 0.5rem;
  }

  .sidebar-link__text:not(.external) {
    display: flex;
    align-items: center;
  }

  .sidebar-link__icon.active {
    transition: var(--vbk--color-transition);
  }

  .sidebar-link__icon.color[class*='md'],
  .sidebar-link__icon.active[class*='md'] {
    color: var(--vbk--color-blue);
  }

  .sidebar-link__icon.color.type-vue,
  .sidebar-link__icon.active.type-vue {
    color: var(--vbk--color-green);
  }

  .sidebar-link__icon.color.type-svelte,
  .sidebar-link__icon.active.type-svelte {
    color: var(--vbk--color-red);
  }

  .sidebar-link__icon.color[class~='type-js'],
  .sidebar-link__icon.color[class~='type-jsx'],
  .sidebar-link__icon.color[class*=':js'],
  .sidebar-link__icon.active[class~='type-js'],
  .sidebar-link__icon.active[class~='type-jsx'],
  .sidebar-link__icon.active[class*=':js'] {
    color: var(--vbk--color-yellow);
  }

  .sidebar-link__icon.color[class~='type-ts'],
  .sidebar-link__icon.color[class~='type-tsx'],
  .sidebar-link__icon.color[class*=':ts'],
  .sidebar-link__icon.active[class~='type-ts'],
  .sidebar-link__icon.active[class~='type-tsx'],
  .sidebar-link__icon.active[class*=':ts'] {
    color: var(--vbk--color-blue);
  }

  .sidebar-link__icon.color[class~='type-html'],
  .sidebar-link__icon.color[class*=':html'],
  .sidebar-link__icon.active[class~='type-html'],
  .sidebar-link__icon.active[class*=':html'] {
    color: var(--vbk--color-red);
  }

  .sidebar-link__icon.color[class~='type-svg'],
  .sidebar-link__icon.color[class*=':svg'],
  .sidebar-link__icon.active[class~='type-svg'],
  .sidebar-link__icon.active[class*=':svg'] {
    color: var(--vbk--color-orange);
  }

  .sidebar-link__icon.color[class~='type-png'],
  .sidebar-link__icon.color[class*=':png'],
  .sidebar-link__icon.active[class~='type-png'],
  .sidebar-link__icon.active[class*=':png'] {
    color: var(--vbk--color-pink);
  }

  .sidebar-link__icon.color[class~='type-jpeg'],
  .sidebar-link__icon.color[class*=':jpeg'],
  .sidebar-link__icon.active[class~='type-jpeg'],
  .sidebar-link__icon.active[class*=':jpeg'] {
    color: var(--vbk--color-pink);
  }

  .sidebar-link__icon.color[class~='type-mp4'],
  .sidebar-link__icon.color[class*=':mp4'],
  .sidebar-link__icon.active[class~='type-mp4'],
  .sidebar-link__icon.active[class*=':mp4'] {
    color: var(--vbk--color-red);
  }

  .sidebar-link__icon.dark.active[class*='type'],
  .sidebar-link__icon.dark.color[class*='type'] {
    filter: brightness(140%);
  }
</style>
