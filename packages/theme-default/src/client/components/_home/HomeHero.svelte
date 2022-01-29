<script>
  import { localizedSiteOptions } from '@vitebook/client';

  import ButtonLink from '../ButtonLink.svelte';
  import { homePageConfig } from './homePageConfig';

  $: shouldShowHero = $homePageConfig?.heroText;

  $: heroText = $homePageConfig?.heroText ?? $localizedSiteOptions.title;

  $: hasPrimaryButton =
    $homePageConfig?.primaryActionText && $homePageConfig?.primaryActionLink;

  $: hasSecondaryButton =
    $homePageConfig?.secondaryActionText &&
    $homePageConfig?.secondaryActionLink;
</script>

{#if shouldShowHero}
  <header class="home__hero">
    <h1 v-if="heroText" id="main-title" class="home__hero__title">
      {heroText}
    </h1>

    <div class="home__hero__actions">
      {#if hasPrimaryButton}
        <div class="home__hero__actions__primary">
          <ButtonLink
            type="primary"
            href={$homePageConfig?.primaryActionLink ?? ''}
          >
            {$homePageConfig?.primaryActionText}
          </ButtonLink>
        </div>
      {/if}

      {#if hasSecondaryButton}
        <div class="home__hero__actions__secondary">
          <ButtonLink
            type="secondary"
            href={$homePageConfig?.secondaryActionLink ?? ''}
          >
            {$homePageConfig?.secondaryActionText}
          </ButtonLink>
        </div>
      {/if}
    </div>
  </header>
{/if}

<style>
  .home__hero {
    padding: 0 1.5rem;
    text-align: center;
    padding-top: 2rem;
  }

  .home__hero__title {
    margin-top: 0;
    line-height: 1.5;
    font-size: 2.25rem;
    justify-content: center;
  }

  .home__hero__actions {
    margin-top: 3.5rem;
  }

  .home__hero__actions > div {
    display: inline-block;
  }

  .home__hero__actions > div + div {
    margin-left: 1rem;
  }

  @media (min-width: 576px) {
    .home__hero__actions > div + div {
      margin-left: 1.5rem;
    }

    .home__hero__title {
      font-size: 3.5rem;
    }
  }

  @media (min-width: 992px) {
    .home__hero {
      margin-bottom: 3rem;
      padding-top: 4rem;
    }
  }
</style>
