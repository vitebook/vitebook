<script>
  import { PageView, currentPage, variants } from '@vitebook/client';
  import VariantsMenu from '../components/VariantsMenu.svelte';
  import { darkMode } from '../stores/darkMode';
  import { localizedThemeConfig } from '../stores/localizedThemeConfig';

  $: noNavbar = $localizedThemeConfig.navbar === false;
  $: isMarkdownPage = $currentPage?.type?.endsWith('md');
  $: hasVariants = Object.values($variants).length > 0;
  $: showTopBar = hasVariants;
</script>

<main
  class={`page ${$currentPage?.type ? `type-${$currentPage.type}` : ''}`}
  class:no-navbar={noNavbar}
  class:dark={$darkMode}
>
  <div class="page__container">
    {#if showTopBar}
      <div class="page__top-bar">
        {#if noNavbar}
          <div style="flex-grow: 1;" />
        {/if}
        <VariantsMenu />
        <div style="flex-grow: 1;" />
      </div>
    {/if}

    <slot name="start" />

    <div class="page__view">
      <div class="page__view__container">
        <PageView />
      </div>
      {#if isMarkdownPage}
        {#await import('../components/Markdown/MarkdownFooter.svelte') then c}
          <svelte:component this={c.default} />
        {/await}
      {/if}
    </div>

    <slot name="end" />
  </div>
</main>

<style>
  main {
    display: block;
  }

  .page {
    position: relative;
    margin: 0;
    min-height: 100vh;
    padding-top: var(--vbk--navbar-height);
    flex: none;
    flex-direction: column;
    width: 100%;
  }

  .page[class*='md'] {
    background-color: var(--vbk--page-md-bg-color);
  }

  .page[class*='type-']:not([class*='md']) {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .page__top-bar {
    position: sticky;
    display: flex;
    padding: 1rem;
    top: 0;
    flex-grow: 0;
    flex-shrink: 0;
    margin: 0;
    width: 100%;
    background-color: var(--vbk--body-bg-color);
    z-index: calc(var(--vbk--navbar-z-index) - 10);
  }

  .page__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    flex: 1 0 0;
  }

  .page__view {
    width: 100%;
  }

  .page__view__container {
    transform: translateY(-2rem);
  }

  .page[class*='md'] .page__view {
    margin: 0 auto;
    max-width: 48rem;
    padding: 0 2rem 4rem;
    padding-top: 1rem;
  }

  .page[class*='type-']:not([class*='md']) .page__view {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1 0 0;
  }

  @media (min-width: 992px) {
    .page {
      flex: 1 0 0;
      width: auto;
    }

    .page.no-navbar[class*='md'] .page__view {
      margin-top: 1.5rem;
    }
  }
</style>
