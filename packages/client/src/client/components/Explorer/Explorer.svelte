<script>
  import { explorerItems } from './explorerItems';

  import ExplorerTree from './ExplorerTree.svelte';

  const isDev = import.meta.env.DEV;
</script>

<div class="explorer">
  <header>
    Pages Explorer
    {#if isDev}
      <p>This page is shown when no index file is present.</p>
    {/if}
  </header>

  <main>
    <ul>
      {#each $explorerItems as item (item)}
        <ExplorerTree {item} />
      {/each}
    </ul>
  </main>

  {#if isDev}
    <footer>
      You can turn this page off by setting `explorer: false` in
      `.vitebook/theme/index`
    </footer>
  {/if}
</div>

<style>
  .explorer {
    width: 100vw;
    height: 100vh;
  }

  header {
    width: 100%;
    padding: 1rem;
    font-size: 1.25rem;
  }

  p {
    margin-top: 0.5rem;
    color: #999;
    font-size: 0.75rem;
  }

  main {
    width: auto;
    display: inline-block;
    padding: 0 0.5rem;
    margin-top: 0.5rem;
  }

  footer {
    color: #999;
    font-size: 0.625rem;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: 0;
    padding: 2rem;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
