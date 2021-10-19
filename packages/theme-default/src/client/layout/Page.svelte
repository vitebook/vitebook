<script>
  import { Component, currentPage, currentRoute } from '@vitebook/client';
  import { localizedThemeConfig } from '../stores/localizedThemeConfig';

  $: noNavbar = $localizedThemeConfig.navbar === false;

  $: hasShadowRoot = $currentPage?.type
    ? !/(^md|:md)$/.test($currentPage.type ?? '')
    : false;

  $: isMarkdownPage = $currentPage?.type?.endsWith('md');
</script>

<main
  class={`page ${$currentPage?.type ? `type-${$currentPage.type}` : ''}`}
  class:no-navbar={noNavbar}
>
  <div class="page__container">
    <slot name="start" />
    <Component this={$currentRoute?.component} shadow={hasShadowRoot} />
    {#if isMarkdownPage}
      {#await import('../components/Markdown/MarkdownFooter.svelte') then c}
        <svelte:component this={c.default} />
      {/await}
    {/if}
    <slot name="end" />
  </div>
</main>

<style>
  .page {
    position: relative;
    margin: 0;
    min-height: 100vh;
    padding-top: var(--vbk--navbar-height);
    flex: none;
    width: 100%;
  }

  .page[class*='md'] {
    background-color: var(--vbk--page-md-bg-color);
  }

  .page[class*='type-']:not([class*='md']) {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
  }

  .page__container {
    width: 100%;
  }

  .page[class*='md'] > .page__container {
    margin: 0 auto;
    max-width: 48rem;
    padding: 0 2rem 4rem;
    padding-top: 1rem;
    padding-bottom: 103%;
  }

  .page[class*='type-']:not([class*='md']) > .page__container {
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateY(-2rem) translateZ(0);
  }

  @media (min-width: 992px) {
    .page {
      flex: 1 0 0;
      width: auto;
    }

    .page.no-navbar[class*='md'] > .page__container {
      margin-top: 1.5rem;
    }
  }
</style>
