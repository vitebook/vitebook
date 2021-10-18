<script>
  import { languageLinks } from '../../stores/languageLinks';
  import { repoLink } from '../../stores/repoLink';
  import { hasNavbarItems } from './hasNavbarItems';
  import { navbarConfig } from './navbarConfig';
  import NavLink from './NavLink.svelte';
  import NavMenu from './NavMenu.svelte';

  export let active = undefined;
</script>

{#if $hasNavbarItems}
  <nav class="navbar__links" class:active>
    <ul class="navbar__links__list">
      {#each $navbarConfig?.items ?? [] as item (item)}
        <li class="navbar__links__list-item">
          {#if 'menu' in item}
            <NavMenu {item} />
          {:else}
            <NavLink {item} />
          {/if}
        </li>
      {/each}

      {#if $languageLinks}
        <li class="navbar__links__list-item">
          <NavMenu item={$languageLinks} />
        </li>
      {/if}

      {#if $repoLink}
        <li class="navbar__links__list-item">
          <NavLink item={$repoLink} />
        </li>
      {/if}
    </ul>
  </nav>
{/if}

<style>
  .navbar__links {
    display: none;
  }

  .navbar__links.active {
    display: block;
  }

  .navbar__links__list {
    margin: 0;
    padding: 0;
  }

  @media (min-width: 992px) {
    .navbar__links {
      display: block;
    }

    .navbar__links__list {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .navbar__links__list-item {
      margin: 0 0.125rem;
    }
  }
</style>
