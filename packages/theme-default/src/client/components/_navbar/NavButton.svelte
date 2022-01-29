<script>
  export let ref = undefined;
  export let href = undefined;
  export let active = false;
  export let external = false;
</script>

{#if href}
  <a
    {href}
    {...$$restProps}
    class:active
    class:external
    on:pointerenter
    on:pointerdown
    on:pointerleave
    on:keydown
    bind:this={ref}
  >
    <slot />
  </a>
{:else}
  <button
    {...$$restProps}
    on:pointerenter
    on:pointerdown
    on:pointerleave
    on:keydown
    bind:this={ref}
  >
    <slot />
  </button>
{/if}

<style>
  a,
  button {
    display: flex;
    align-items: center;
    font-size: 1rem;
    border: 0;
    font-weight: 500;
    line-height: 1.4;
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0;
    color: var(--vbk--nav-item-color);
    white-space: nowrap;
    text-decoration: none;
    width: 100%;
    cursor: pointer;
    text-align: left;
    background-color: transparent;
  }

  @media (min-width: 992px) {
    a,
    button {
      color: var(--vbk--nav-item-color);
      background-color: var(--vbk--nav-item-bg-color);
    }
  }

  @media (hover: hover) and (pointer: fine) {
    a:hover {
      text-decoration: none;
    }

    a:hover,
    button:hover {
      color: var(--vbk--nav-item-hover-color);
      background-color: var(--vbk--nav-item-hover-bg-color);
    }
  }
</style>
