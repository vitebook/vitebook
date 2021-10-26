<script>
  import Illustration from ':virtual/vitebook/404.svg';

  import { currentRouteLocale } from '@vitebook/client';
  import { defaultThemeLocaleOptions } from '../../shared';

  import ButtonLink from '../components/ButtonLink.svelte';
  import { localizedThemeConfig } from '../stores/localizedThemeConfig';

  const homeLink = currentRouteLocale;

  $: notFoundText =
    $localizedThemeConfig.notFoundPage?.message ??
    defaultThemeLocaleOptions.notFoundPage.message;

  $: goHomeText =
    $localizedThemeConfig.notFoundPage?.goHomeText ??
    defaultThemeLocaleOptions.notFoundPage.goHomeText;

  $: goBackText =
    $localizedThemeConfig.notFoundPage?.goBackText ??
    defaultThemeLocaleOptions.notFoundPage.goBackText;
</script>

<div class="not-found">
  <div class="not-found__container">
    <div class="not-found__img-container">
      {@html Illustration.replace(/width=".*?"/, 'width="100%"')}
    </div>

    <h1 class="not-found__title">{notFoundText}</h1>

    <div class="not-found__actions">
      <div class="not-found__actions__primary">
        <ButtonLink href={$homeLink}>
          {goHomeText}
        </ButtonLink>
      </div>

      <div class="not-found__actions__secondary">
        <ButtonLink href="_back" type="secondary">
          {goBackText}
        </ButtonLink>
      </div>
    </div>
  </div>
</div>

<style>
  .not-found {
    width: 100%;
    min-height: 100%;
    padding: 0 2rem;
  }

  .not-found__container {
    width: 100%;
    padding-top: 0.5rem;
    margin: 0 auto;
    max-width: 960px;
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  .not-found__title {
    margin: 0;
    padding: 0;
    font-size: 1.75rem;
    line-height: 1.5;
    margin-top: 1rem;
    margin-bottom: 3.5rem;
    text-align: center;
    justify-content: center;
  }

  .not-found__img-container {
    max-width: 400px;
    color: var(--vbk--color-primary);
  }

  .not-found__actions {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: -0.2rem;
  }

  .not-found__actions > div + div {
    margin-left: 1rem;
  }

  @media (min-width: 420px) {
    .not-found__title {
      font-size: 1.75rem;
      margin-top: 2.5rem;
    }

    .not-found__container {
      padding-top: 2rem;
    }
  }

  @media (min-width: 576px) {
    .not-found__container {
      padding-top: 4rem;
    }

    .not-found__img-container {
      max-width: 500px;
    }

    .not-found__title {
      font-size: 2rem;
      margin-top: 3.5rem;
      margin-bottom: 3.5rem;
    }
  }
</style>
