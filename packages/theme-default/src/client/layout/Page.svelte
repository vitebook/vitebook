<script>
  import { PageView, currentPage } from '@vitebook/client';
  import { localizedThemeConfig } from '../stores/localizedThemeConfig';
  import { isMarkdownFloatingTocEnabled } from '../components/markdown/isMarkdownFloatingTocEnabled';

  $: noNavbar = $localizedThemeConfig.navbar === false;
  $: isMarkdownPage = $currentPage?.type?.endsWith('md');
</script>

<main
  class={`page ${$currentPage?.type ? `type-${$currentPage.type}` : ''}`}
  class:no-navbar={noNavbar}
  class:with-toc={$isMarkdownFloatingTocEnabled}
>
  <div class="page__container">
    <slot name="start" />

    <PageView />

    {#if isMarkdownPage}
      {#await import('../components/markdown/MarkdownFooter.svelte') then c}
        <svelte:component this={c.default} />
      {/await}
    {/if}

    <slot name="end" />
  </div>
</main>

<style>
  .page {
    display: block;
    position: relative;
    margin: 0;
    width: 100%;
  }

  .page[class*='md'] {
    background-color: var(--vbk--page-md-bg-color);
  }

  .page[class*='type-']:not([class*='md']) {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;
  }

  .page__container {
    width: 100%;
  }

  .page[class*='md'] > .page__container {
    margin: 0 auto;
    max-width: 48rem;
    padding: 0 1rem 4rem;
    padding-top: 1rem;
  }

  .page[class*='type-']:not([class*='md']) > .page__container {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  @media (min-width: 768px) {
    .page[class*='md'] > .page__container {
      padding: 0 1.25rem 4rem;
    }
  }

  @media (min-width: 992px) {
    .page.no-navbar[class*='md'] > .page__container {
      padding-top: 1.5rem;
    }

    .page.no-navbar[class*='md'].with-toc > .page__container {
      padding-bottom: 100vh;
    }
  }

  @media (min-width: 1400px) {
    .page[class*='md'] > .page__container {
      padding-left: 0;
      padding-right: 0;
    }
  }
</style>
