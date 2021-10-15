<script>
  import NavbarTitle from './NavbarTitle.svelte';
  import NavLinks from './NavLinks.svelte';
</script>

<header class="navbar">
  <div class="navbar__container">
    <slot name="start" />

    <NavbarTitle />

    <div class="flex-grow" />

    <NavLinks />

    <slot name="end" />
  </div>
</header>

<style>
  .navbar {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    width: 100vw;
    z-index: var(--vbk--navbar-z-index);
    height: var(--vbk--navbar-height);
    background-color: var(--vbk--navbar-bg-color);
    box-shadow: var(--vbk--elevation-small);
  }

  .navbar__container {
    width: 100%;
    height: var(--vbk--navbar-height);
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* @see https://css-tricks.com/elegant-fix-jumping-scrollbar-issue/ */
    padding-right: calc(calc(100vw - 100%) + 1.35rem);
  }

  @media (min-width: 992px) {
    .navbar__container {
      padding-left: 1.25rem;
    }
  }
</style>
