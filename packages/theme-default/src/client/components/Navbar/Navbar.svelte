<script>
  import { useRouter } from '@vitebook/client';
  import { darkMode } from '../../stores/darkMode';

  import { onMount } from 'svelte';

  import NavbarTitle from './NavbarTitle.svelte';
  import NavLinks from './NavLinks.svelte';

  const router = useRouter();

  onMount(() => {
    // Trigger a re-scroll to hash after navbar has mounted.
    router.go(location.href, { replace: true });
  });
</script>

<header class="navbar" class:dark={$darkMode}>
  <div class="navbar__container">
    <slot name="start" />

    <NavbarTitle />

    <div style="flex-grow: 1;" />

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
    border-bottom: 0.125rem solid var(--vbk--color-divider);
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
