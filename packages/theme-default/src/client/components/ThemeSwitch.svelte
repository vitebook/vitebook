<script>
  import DarkIcon from ':virtual/vitebook/icons/theme-switch-dark?raw';
  import LightIcon from ':virtual/vitebook/icons/theme-switch-light?raw';

  import { defaultThemeLocaleOptions } from '../../shared';

  import { darkMode } from '../stores/darkMode';
  import { localizedThemeConfig } from '../stores/localizedThemeConfig';

  let classes = '';

  export { classes as class };

  $: isDarkModeEnabled =
    $localizedThemeConfig.darkMode?.enabled ??
    defaultThemeLocaleOptions.darkMode.enabled;

  $: buttonAriaLabel =
    $localizedThemeConfig.darkMode?.buttonAriaLabel ??
    defaultThemeLocaleOptions.darkMode.buttonAriaLabel;

  function onToggle() {
    darkMode.update((d) => !d);
  }
</script>

{#if isDarkModeEnabled}
  <button
    class={'theme-switch ' + classes}
    role="switch"
    aria-label={buttonAriaLabel}
    aria-checked={$darkMode}
    on:pointerdown={onToggle}
    on:keydown={(e) => e.key === 'Enter' && onToggle()}
  >
    <span class="theme-switch__icon light-icon" class:dark={$darkMode}>
      {@html LightIcon}
    </span>
    <span class="theme-switch__icon dark-icon" class:dark={$darkMode}>
      {@html DarkIcon}
    </span>
  </button>
{/if}

<style>
  .theme-switch {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    margin: 0;
    padding: 0.5rem;
    font-size: 1.375rem;
    border-radius: 0.15rem;
    min-width: 2.649375rem;
    min-height: 2.649375rem;
    margin-left: var(--vbk-brand-link-spacing, 0);
    cursor: pointer;
    color: var(--vbk--toggle-color);
    background-color: var(--vbk--toggle-bg-color);
    transition: opacity 200ms ease, transform 200ms ease;
  }

  @media (hover: hover) and (pointer: fine) {
    .theme-switch:hover {
      outline: 0;
      color: var(--vbk--toggle-hover-color);
      background-color: var(--vbk--toggle-hover-bg-color);
    }
  }

  .theme-switch__icon {
    position: absolute;
    transition: transform 300ms ease, opacity 200ms ease-out;
  }

  .theme-switch__icon.light-icon {
    opacity: 1;
    transform: rotate(0deg);
  }

  .theme-switch__icon.dark.light-icon {
    opacity: 0;
    transform: rotate(45deg);
  }

  .theme-switch__icon.dark-icon {
    opacity: 0;
    transform: rotate(-45deg);
  }

  .theme-switch__icon.dark.dark-icon {
    opacity: 1;
    transform: rotate(0deg);
  }
</style>
