<script>
  export let href;
  export let label;
  export let platform;
  export let hidden = false;
</script>

{#if !hidden}
  <a
    class={`brand-link ${platform.toLowerCase()}`}
    {href}
    aria-label={label}
    target="_blank"
  >
    <span class="brand-link__icon">
      <slot name="icon" />
    </span>
  </a>
{/if}

<style>
  .brand-link {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.4;
    border-radius: 0.15rem;
    margin-left: var(--vbk-brand-link-spacing, 0);
    padding: 0.5rem;
    background-color: transparent;
    color: var(--vbk--toggle-color);
    background-color: var(--vbk--toggle-bg-color);
  }

  @media (hover: hover) and (pointer: fine) {
    .brand-link:hover {
      outline: 0;
      color: var(--vbk--toggle-hover-color);
      background-color: var(--vbk--toggle-hover-bg-color);
    }
  }
</style>
