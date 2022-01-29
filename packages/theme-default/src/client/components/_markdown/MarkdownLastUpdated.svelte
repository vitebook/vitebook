<script>
  import { currentMarkdownPageMeta } from '@vitebook/client';
  import { onMount } from 'svelte';
  import { defaultThemeLocaleOptions } from '../../../shared';

  import { darkMode } from '../../stores/darkMode';
  import { localizedThemeConfig } from '../../stores/localizedThemeConfig';

  let datetime = '';

  $: lastUpdated = $currentMarkdownPageMeta?.lastUpdated;

  $: isEnabled =
    $currentMarkdownPageMeta?.frontmatter.lastUpdated ??
    $localizedThemeConfig.markdown?.lastUpdated ??
    defaultThemeLocaleOptions.markdown.lastUpdated;

  $: lastUpdatedText =
    $localizedThemeConfig.markdown?.lastUpdatedText ??
    defaultThemeLocaleOptions.markdown.lastUpdatedText;

  onMount(() => {
    // Locale string might be different based on end user and will lead to potential hydration
    // mismatch if calculated at build time.
    datetime = new Date(lastUpdated ?? 0).toLocaleDateString('en-US', {});
  });
</script>

{#if lastUpdated && isEnabled}
  <p class="md-footer__last-updated" class:dark={$darkMode}>
    <span class="md-footer__last-updated__text">{lastUpdatedText}</span>
    <span class="md-footer__last-updated__date">{datetime}</span>
  </p>
{/if}

<style>
  .md-footer__last-updated {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin: 0;
    line-height: 1.5rem;
    font-size: 1rem;
    color: var(--vbk--color-gray-800);
    opacity: 0.6;
  }

  .md-footer__last-updated.dark {
    color: var(--vbk--color-gray-200);
  }

  .md-footer__last-updated__text {
    display: inline-block;
  }

  .md-footer__last-updated__date {
    display: inline-block;
    margin-left: 6px;
  }
</style>
