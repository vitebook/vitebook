<script>
  import { withBaseUrl, useRouter } from '@vitebook/client';
  import { inBrowser } from '@vitebook/core';
  import { darkMode } from '../stores/darkMode';

  export let href;
  export let type = 'primary';

  const router = useRouter();

  function onClick(event) {
    if (href === '_back') {
      event.preventDefault();
      router.back();
    }
  }
</script>

<a
  class="button"
  class:dark={$darkMode}
  class:secondary={type === 'secondary'}
  href={(href === '_back' && inBrowser) ? document.referrer : withBaseUrl(href)}
  on:click={onClick}
>
  <slot />
</a>

<style>
  .button {
    display: inline-block;
    padding: 1rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 0.15rem;
    color: var(--vbk--color-white);
    background-color: var(--vbk--color-primary);
    box-shadow: var(--vbk--elevation-small);
    text-decoration: none;
    transition: transform 150ms ease, var(--vbk--color-transition),
      background-color var(--vbk--color-transition-duration)
        var(--vbk--color-transition-timing) !important;
  }

  .button:not(.secondary) {
    padding: 1.14rem 1.5rem;
  }

  .button.dark:not(.secondary) {
    color: var(--vbk--color-black);
    background-color: var(--vbk--color-primary);
  }

  .button.secondary {
    background-color: transparent;
    color: var(--vbk--color-text);
    border: 0.12rem solid var(--vbk--color-text);
  }

  @media (hover: hover) {
    .button:hover {
      backface-visibility: hidden;
      transform: scale(1.05) translateZ(0);
      text-decoration: none;
      box-shadow: var(--vbk--elevation-medium);
    }
  }

  @media (min-width: 420px) {
    .button {
      padding: 1rem 2rem;
    }

    .button:not(.secondary) {
      padding: 1.14rem 2rem;
    }
  }

  @media (min-width: 576px) {
    .button {
      font-size: 1.1rem;
      padding: 1rem 2.2rem;
    }

    .button:not(.secondary) {
      padding: 1.14rem 2.2rem;
    }
  }
</style>
