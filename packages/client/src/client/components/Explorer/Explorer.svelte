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
    {#each $explorerItems as item (item)}
      <ExplorerTree {item} />
    {/each}
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
    padding: 16px;
    font-size: 32px;
  }

  p {
    margin-top: 1rem;
    color: #999;
    font-size: 16px;
  }

  main {
    width: auto;
    display: inline-block;
    padding: 0 8px;
  }

  footer {
    color: #999;
    font-size: 14px;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: 0;
    padding: 2rem;
  }

  :global(.explorer ul) {
    margin: 0;
    padding: 0;
    margin-left: 12px;
    list-style: none;
  }

  :global(.explorer ul > span) {
    display: inline-block;
    margin: 8px 0;
    font-size: 20px;
    font-weight: bold;
  }

  :global(.explorer li) {
    padding: 4px 0;
  }

  :global(.explorer a) {
    margin-left: 12px;
    display: flex;
    align-items: center;
    font-size: 18px;
    color: hsl(0, 0%, 12.3%);
    text-decoration: underline;
  }

  :global(.explorer a > svg) {
    font-size: 13px;
    margin-right: 4px;
  }

  :global(.explorer a:hover) {
    color: #610fe6;
  }
</style>
