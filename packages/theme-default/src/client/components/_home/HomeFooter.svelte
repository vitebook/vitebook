<script>
  import { currentMarkdownPageMeta } from '@vitebook/client';
  import { homePageConfig } from './homePageConfig';

  $: footerText =
    $currentMarkdownPageMeta?.frontmatter.footer ?? $homePageConfig?.footer;
</script>

{#if footerText}
  <footer class="home__footer">
    <div class="home__footer__container">
      <p class="home__footer-text">{footerText}</p>
    </div>
  </footer>
{/if}

<style>
  .home__footer {
    margin: 0 auto;
    max-width: 960px;
  }

  .home__footer__container {
    padding: 4rem 1.5rem 5rem;
  }

  .home__footer-text {
    margin: 0;
    text-align: center;
    line-height: 1.4;
    font-size: 0.9rem;
  }

  @media (min-width: 768px) {
    .home__footer__container {
      padding: 6rem 1.5rem 4rem;
    }
  }
</style>
