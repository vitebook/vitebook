<script>
  import MenuIcon from ':virtual/vitebook/icons/menu?raw';
  import { createEventDispatcher } from 'svelte';
  import { defaultThemeLocaleOptions } from '../../../shared';
  import { localizedThemeConfig } from '../../stores/localizedThemeConfig';

  const dispatch = createEventDispatcher();

  $: toggleAriaLabel =
    $localizedThemeConfig.sidebar?.toggleAriaLabel ??
    defaultThemeLocaleOptions.sidebar.toggleAriaLabel;

  function onToggle() {
    dispatch('toggle');
  }
</script>

<button
  class="sidebar-toggle"
  :aria-label={toggleAriaLabel}
  on:pointerdown={onToggle}
  on:keydown={(e) => e.key === 'Enter' && onToggle()}
>
  <div class="sidebar-toggle__container">
    {@html MenuIcon}
  </div>
</button>

<style>
  .sidebar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    margin-right: 0.375rem;
    padding-left: 0.75rem;
    font-size: 1.5rem;
    border: 0;
    border-radius: 0.15rem;
    cursor: pointer;
    overflow: hidden;
    background-color: var(--vbk--toggle-bg-color);
  }

  .sidebar-toggle > div {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    border-radius: 0.15rem;
  }

  @media (hover: hover) and (pointer: fine) {
    .sidebar-toggle:hover > div {
      color: var(--vbk--toggle-hover-color);
      background-color: var(--vbk--toggle-hover-bg-color);
    }
  }

  @media (min-width: 992px) {
    .sidebar-toggle {
      display: none;
      padding-left: 1.25rem;
    }
  }
</style>
