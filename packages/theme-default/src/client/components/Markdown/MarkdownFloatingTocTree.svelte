<script>
  import { currentRoute } from '@vitebook/client';

  export let items;
</script>

<ul class="md-floating-toc__list">
  {#each items as item (item)}
    <li class="md-floating-toc__list-item">
      <a
        href={`#${item.slug}`}
        class="md-floating-toc__link"
        class:active={`#${item.slug}` ===
          decodeURIComponent($currentRoute.hash)}
      >
        {item.title}
      </a>

      {#if item.children.length > 0}
        <svelte:self items={item.children} />
      {/if}
    </li>
  {/each}
</ul>

<style>
  .md-floating-toc__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
  }

  .md-floating-toc__list:not(:first-child) {
    margin-top: 0.375rem;
    margin-left: 0.75rem;
  }

  .md-floating-toc__list-item {
    line-height: 1.08rem;
    padding: 0.375rem 0;
    margin-top: 0;
  }

  .md-floating-toc__list:not(:first-child) li:last-child {
    padding-bottom: 0;
  }

  .md-floating-toc__link {
    line-height: unset;
    font-size: 0.875rem;
    cursor: pointer;
    color: rgba(var(--vbk--color-text-rgb), 0.56);
  }

  .md-floating-toc__link.active {
    color: var(--vbk--color-primary);
  }
</style>
