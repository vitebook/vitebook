<script>
  import { languageLinks } from '../../stores/languageLinks';
  import { repoLink } from '../../stores/repoLink';
  import { hasNavbarItems } from './hasNavbarItems';
  import { navbarConfig } from './navbarConfig';
  import NavItemLink from './NavItemLink.svelte';
  import NavItemWithMenu from './NavItemWithMenu.svelte';
</script>

{#if $hasNavbarItems}
  <nav class="navbar__links">
    <ul class="navbar__links__list">
      {#each $navbarConfig?.items ?? [] as item (item.text)}
        <li class="navbar__links__list-item">
          {#if 'menu' in item}
            <NavItemWithMenu {item} />
          {:else}
            <NavItemLink {item} />
          {/if}
        </li>
      {/each}

      {#if $languageLinks}
        <li class="navbar__links__list-item">
          <NavItemWithMenu item={$languageLinks} />
        </li>
      {/if}

      {#if $repoLink}
        <li class="navbar__links__list-item">
          <NavItemLink item={$repoLink} />
        </li>
      {/if}
    </ul>
  </nav>
{/if}

<style>
  .navbar__links {
    display: none;
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
  }
</style>
