<script>
  import { defaultThemeLocaleOptions } from '../../../shared';

  import { localizedThemeConfig } from '../../stores/localizedThemeConfig';

  $: hasPrevOrNextLinks =
    $localizedThemeConfig.markdown?.prevLink ||
    $localizedThemeConfig.markdown?.nextLink ||
    defaultThemeLocaleOptions.markdown.prevLink ||
    defaultThemeLocaleOptions.markdown.nextLink;

  $: hasEditLink =
    $localizedThemeConfig.markdown?.editLink ||
    defaultThemeLocaleOptions.markdown.editLink;

  $: hasLastUpdated =
    $localizedThemeConfig.markdown?.lastUpdated ||
    defaultThemeLocaleOptions.markdown.lastUpdated;
</script>

<div class="md-footer">
  {#if hasPrevOrNextLinks}
    {#await import('./MarkdownPrevAndNextLinks.svelte') then c}
      <svelte:component this={c.default} />
    {/await}
  {/if}

  {#if hasEditLink}
    {#await import('./MarkdownEditPageLink.svelte') then c}
      <svelte:component this={c.default} />
    {/await}
  {/if}

  {#if hasLastUpdated}
    {#await import('./MarkdownLastUpdated.svelte') then c}
      <svelte:component this={c.default} />
    {/await}
  {/if}
</div>

<style>
  .md-footer {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-top: 3.5rem;
  }
</style>
