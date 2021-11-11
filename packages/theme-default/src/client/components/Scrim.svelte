<script>
  export let active = false;
</script>

<button
  class="scrim"
  class:active
  aria-label="Close scrim"
  on:pointerdown
  on:keydown
/>

<style>
  .scrim {
    border: 0;
    margin: 0;
    padding: 0;
    position: fixed;
    inset: 0;
    z-index: var(--vbk--scrim-z-index);
    display: block;
    width: 100vw;
    height: 100vh;
    background-color: var(--vbk--scrim-bg-color);
    opacity: 0;
    visibility: hidden;
    transition: opacity 350ms ease-out, visibility 350ms ease-out;
  }

  .scrim.active {
    opacity: 0.8;
    visibility: visible;
  }
</style>
