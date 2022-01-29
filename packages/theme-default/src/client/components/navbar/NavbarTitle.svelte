<script>
  import Logo from ':virtual/vitebook/logo.svg';
  import { currentRouteLocale, localizedSiteOptions } from '@vitebook/client';
  import { defaultThemeLocaleOptions } from '../../../shared';
  import { localizedThemeConfig } from '../../stores/localizedThemeConfig';

  $: goHomeText =
    $localizedThemeConfig.notFoundPage?.goHomeText ??
    defaultThemeLocaleOptions.notFoundPage.goHomeText;
</script>

<a
  class="navbar__title"
  href={$currentRouteLocale}
  aria-label={`${$localizedSiteOptions.title}, ${goHomeText}`}
>
  <div class="navbar__logo">
    {@html Logo}
  </div>
  {$localizedSiteOptions.title}
</a>

<style>
  .navbar__title {
    display: flex;
    align-items: center;
    font-size: 1.3rem;
    font-weight: 500;
    letter-spacing: 0.01rem;
    color: var(--vbk--navbar-title-color);
    transition: transform 150ms ease;
    padding-top: 0.2rem;
    padding-right: 0.2rem;
    text-decoration: none;
  }

  @media (hover: hover) and (pointer: fine) {
    .navbar__title:hover {
      text-decoration: none;
      backface-visibility: hidden;
      transform: scale(1.05) translateZ(0);
    }
  }

  .navbar__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.2rem;
    vertical-align: middle;
    transition: var(--vbk--navbar-logo-transition);
    color: var(--vbk--navbar-logo-color);
  }
</style>
