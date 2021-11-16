<script>
  import { withBaseUrl } from '@vitebook/client';

  import { defaultThemeLocaleOptions } from '../../../shared';

  import { localizedThemeConfig } from '../../stores/localizedThemeConfig';

  import { useNextAndPrevLinks } from './useNextAndPrevLinks';

  const links = useNextAndPrevLinks();

  $: prevLinkText =
    $localizedThemeConfig.markdown?.prevLinkText ??
    defaultThemeLocaleOptions.markdown.prevLinkText;

  $: nextLinkText =
    $localizedThemeConfig.markdown?.nextLinkText ??
    defaultThemeLocaleOptions.markdown.nextLinkText;
</script>

{#if $links.hasLinks}
  <div class="md-footer__pagination-nav">
    <div class="md-footer__pagination-nav-item prev">
      {#if $links.prev}
        <a
          href={withBaseUrl($links.prev.link)}
          class="md-footer__pagination-nav-item__link"
        >
          <span class="md-footer__pagination-nav-item__title">
            {prevLinkText}
          </span>
          <span class="md-footer__pagination-nav-item__text">
            « {$links.prev.text}
          </span>
        </a>
      {/if}
    </div>

    <div class="md-footer__pagination-nav-item next">
      {#if $links.next}
        <a
          href={withBaseUrl($links.next.link)}
          class="md-footer__pagination-nav-item__link"
        >
          <span class="md-footer__pagination-nav-item__title">
            {nextLinkText}
          </span>
          <span class="md-footer__pagination-nav-item__text">
            {$links.next.text} »
          </span>
        </a>
      {/if}
    </div>
  </div>
{/if}

<style>
  .md-footer__pagination-nav {
    display: flex;
    width: 100%;
    margin-bottom: 3rem;
  }

  .md-footer__pagination-nav-item {
    flex: 1 50%;
    max-width: 50%;
  }

  .md-footer__pagination-nav-item.next {
    margin-left: 0.75rem;
  }

  .md-footer__pagination-nav-item.prev .md-footer__pagination-nav-item__link {
    align-items: flex-start;
  }

  .md-footer__pagination-nav-item__link {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    border: var(--vbk--menu-border);
    border-radius: 0.15rem;
    padding: 1.25rem;
    height: 100%;
    box-shadow: var(--vbk--elevation-small) !important;
    transition: transform 150ms ease;
  }

  .md-footer__pagination-nav-item__link:focus {
    box-shadow: var(--vbk--focus-box-shadow) !important;
  }

  .md-footer__pagination-nav-item__link:not(:focus-visible) {
    box-shadow: none !important;
  }

  .md-footer__pagination-nav-item__link:hover {
    text-decoration: none;
  }

  .md-footer__pagination-nav-item__title {
    display: block;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
    color: var(--vbk--color-text);
  }

  .md-footer__pagination-nav-item__text {
    display: flex;
    align-items: center;
    margin-top: 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    word-break: break-word;
  }

  @media (min-width: 576px) {
    .md-footer__pagination-nav-item.next {
      margin-left: 0.875rem;
    }

    .md-footer__pagination-nav-item__title {
      font-size: 0.875rem;
    }

    .md-footer__pagination-nav-item__text {
      font-size: 1.1rem;
    }
  }

  @media (min-width: 1200px) {
    .md-footer__pagination-nav-item.next {
      margin-left: 1.25rem;
    }
  }

  @media (hover: hover) and (pointer: fine) {
    .md-footer__pagination-nav-item__link:hover {
      backface-visibility: hidden;
      transform: scale(1.02) translateZ(0);
      text-decoration: none;
      box-shadow: var(--vbk--elevation-medium) !important;
    }
  }
</style>
