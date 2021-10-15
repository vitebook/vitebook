<script>
  import {
    currentRoute,
    localizedSiteOptions,
    OutboundLink
  } from '@vitebook/client';
  import { getLinkProps } from '../../helpers/getLinkProps';

  export let item;

  $: linkProps = getLinkProps(item, $localizedSiteOptions, $currentRoute);
</script>

<!-- svelte-ignore a11y-missing-attribute - set by linkProps -->
<a class:nav-item={true} class:nav-link={true} {...linkProps}>
  <span class="nav-link__text">
    {item.text}
    {#if linkProps.class.includes('external')}
      <OutboundLink />
    {/if}
  </span>
</a>

<style>
  /** No mobile styles because a nav item is a sidebar item <992px. **/

  @media (hover: hover) and (min-width: 992px) {
    .nav-link:hover {
      text-decoration: none;
    }

    .nav-item:hover {
      color: var(--vbk--nav-item-hover-color);
      background-color: var(--vbk--nav-item-hover-bg-color);
    }

    .nav-link:hover > .nav-link__text {
      color: var(--vbk--nav-item-hover-color);
      border-bottom: var(--vbk--nav-link-hover-border);
    }
  }

  @media (min-width: 992px) {
    .nav-item {
      color: var(--vbk--nav-item-color);
      background-color: var(--vbk--nav-item-bg-color);
    }

    .nav-link {
      display: flex;
      align-items: center;
      font-size: 1rem;
      border: 0;
      font-weight: 500;
      line-height: 1.4;
      margin-top: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0;
      color: var(--vbk--nav-item-color);
      white-space: nowrap;
      text-decoration: none;
      width: 100%;
      cursor: pointer;
      text-align: left;
      background-color: transparent;
    }

    .nav-link.active .nav-link__text {
      color: var(--vbk--nav-link-active-color);
      background-color: var(--vbk--nav-link-active-bg-color);
      border-bottom: var(--vbk--nav-link-active-border);
      transition: border-color var(--vbk--color-transition-duration)
        var(--vbk--color-transition-timing);
    }
  }
</style>
