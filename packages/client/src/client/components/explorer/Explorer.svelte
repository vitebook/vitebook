<script>
  import { explorerItems } from './explorerItems';

  import ExplorerTree from './ExplorerTree.svelte';
</script>

<div class="explorer">
  <main>
    <ul>
      {#each $explorerItems as item (item)}
        <ExplorerTree {item} />
      {/each}
    </ul>
  </main>
</div>

<style>
  .explorer {
    width: 100vw;
    height: 100vh;
  }

  main {
    width: auto;
    display: inline-block;
    padding: 0 0.5rem;
    margin-top: 0.5rem;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
