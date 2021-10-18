<script>
  import {
    currentRoute,
    localizedSiteOptions,
    OutboundLink
  } from '@vitebook/client';
  import { getLinkProps } from '../../helpers/getLinkProps';
  import NavButton from './NavButton.svelte';

  export let item;

  let hover = false;

  $: linkProps = getLinkProps(item, $localizedSiteOptions, $currentRoute);
</script>

<NavButton
  href={linkProps.href}
  target={linkProps.target}
  rel={linkProps.rel}
  aria-label={linkProps['aria-label']}
  class="nav-item nav-link"
  active={linkProps.active}
  external={linkProps.external}
  on:pointerenter={() => {
    hover = true;
  }}
  on:pointerleave={() => {
    hover = false;
  }}
>
  <span class="nav-link__text" class:active={linkProps.active} class:hover>
    {item.text}
    {#if linkProps.external}
      <OutboundLink />
    {/if}
  </span>
</NavButton>

<style>
  .nav-link__text.active {
    color: var(--vbk--nav-link-active-color);
    background-color: var(--vbk--nav-link-active-bg-color);
    border-bottom: var(--vbk--nav-link-active-border);
    transition: border-color var(--vbk--color-transition-duration)
      var(--vbk--color-transition-timing);
  }

  @media (hover: hover) and (pointer: fine) and (min-width: 992px) {
    .nav-link__text:not(.active).hover {
      color: var(--vbk--nav-item-hover-color);
      border-bottom: var(--vbk--nav-link-hover-border);
    }
  }
</style>
