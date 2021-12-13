<script>
  import { derived } from 'svelte/store';
  import { currentMarkdownPageMeta } from '@vitebook/client';

  import { navbarHeight } from '../navbar/navbarHeight';
  import { localizedThemeConfig } from '../../stores/localizedThemeConfig';
  import MarkdownFloatingTocTree from './MarkdownFloatingTocTree.svelte';
  import { useActiveHeaderLinks } from './useActiveHeaderLinks';

  $: noNavbar = $localizedThemeConfig.navbar === false;

  useActiveHeaderLinks({
    headerLinkSelector: '.md-floating-toc__link',
    headerAnchorSelector: 'a.header-anchor',
    delay: 100,
    offset: derived(navbarHeight, (height) => height + 16),
  });
</script>

<div class="md-floating-toc" class:no-navbar={noNavbar}>
  <MarkdownFloatingTocTree items={$currentMarkdownPageMeta?.headers ?? []} />
</div>

<style>
  .md-floating-toc {
    position: sticky;
    top: 0;
    right: 0;
    max-width: 11rem;
    max-height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    padding-top: calc(var(--vbk--navbar-height) + 2rem);
    padding-left: 0.5rem;
    padding-right: 1.25rem;
    display: none;
  }

  .md-floating-toc {
    scrollbar-width: none;
  }

  .md-floating-toc::-webkit-scrollbar {
    display: none;
  }

  .md-floating-toc.no-navbar {
    padding-top: 2rem;
  }

  @media (min-width: 1200px) {
    .md-floating-toc {
      display: block;
    }
  }
</style>
