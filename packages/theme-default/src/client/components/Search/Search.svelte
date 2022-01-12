<script>
  // @ts-ignore: Search type issue
  import docsearch from '@docsearch/js';
  import { onDestroy, onMount, tick } from 'svelte';
  import { localizedThemeConfig } from '../../stores/localizedThemeConfig';

  import Enter from ':virtual/vitebook/icons/enter?raw';
  import SearchIcon from ':virtual/vitebook/icons/search?raw';
  import { sidebarItems } from '../sidebar/sidebarItems';

  import '@docsearch/css';

  let ref,
    query = '',
    searchResult = [],
    activeIndex = '0-0',
    show = false;

  const search = (e) => {
    searchResult = [];
    if (query) {
      $sidebarItems.map((v) => {
        if (v.text) {
          v.children.map((c) => {
            if (c.text.toLowerCase().indexOf(query) !== -1) {
              let idx = searchResult.find((x) => x.title === v.text);
              if (idx) {
                idx.children.push(c);
              } else {
                searchResult = [
                  ...searchResult,
                  { title: v.text, children: [c] },
                ];
              }
            }
          });
        }
      });
    } else searchResult = [];
  };

  const onKeydown = (e) => {
    if (!ref) return;
    if (e.target === document.body && e.metaKey && e.code === 'KeyK') {
      e.preventDefault();
      show = true;
      tick().then(() => {
        ref.focus();
      });
    }
  };

  const changeActive = (e) => {
    activeIndex = e;
  };

  const showModel = () => {
    searchResult = [];
    show = !show;
  };

  if ($localizedThemeConfig.search) {
    onMount(() => {
      document.addEventListener('keydown', onKeydown);
    });

    onDestroy(() => {
      document.removeEventListener('keydown', onKeydown);
    });
  }

  if ($localizedThemeConfig.algolia) {
    onMount(() => {
      let link = document.createElement('link');
      link.setAttribute('rel', 'preconnect');
      link.setAttribute('crossorigin', '');
      link.setAttribute(
        'href',
        `https://${$localizedThemeConfig.algolia.appId}-dsn.algolia.net`,
      );
      document.head.appendChild(link);

      docsearch({
        container: '#docsearch',
        ...$localizedThemeConfig.algolia,
      });
    });
  }
</script>

{#if $localizedThemeConfig.search}
  <div>
    <button class="Search Search-Button" on:click|stopPropagation={showModel}>
      {@html SearchIcon}
      <span class="Search-Button-Container"
        ><span class="Search-Button-Placeholder">Search</span></span
      >
      <span class="Search-Button-Keys">
        <span class="Search-Button-Key">⌘</span>
        <span class="Search-Button-Key">K</span></span
      ></button
    >
  </div>

  <div class="Model" class:hidden={!show}>
    <div class="Search-Header">
      <form class="Search-Form">
        <label class="Search-MagnifierLabel" for="Search-input">
          {@html SearchIcon}
        </label>
        <input
          bind:this={ref}
          bind:value={query}
          on:input={search}
          class="Search-Input"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          enterkeyhint="go"
          spellcheck="false"
          placeholder="搜索文档"
          maxlength="64"
          type="search"
        />
      </form>
    </div>
    <div class="Search-Dropdown">
      {#each searchResult as i (i)}
        <section class="Search-Hits">
          <div class="Search-Hit-source">{i.title}</div>
          <ul role="listbox" id="Search-list">
            {#each i.children as v, k}
              <li
                class="Search-Hit"
                role="option"
                on:mouseenter={() => changeActive(`${i.title}-${v.text}`)}
              >
                <a
                  href={v.link}
                  on:click={showModel}
                  class:Search-Hit-Selected={activeIndex ===
                    `${i.title}-${v.text}`}
                >
                  <div class="Search-Hit-Container">
                    <div class="Search-Hit-content-wrapper">
                      <span class="Search-Hit-title">{v.text}</span><span
                        class="Search-Hit-path"
                      />
                    </div>
                    <div class="Search-Hit-action">
                      <button
                        class:hidden={activeIndex !== `${i.title}-${v.text}`}
                        class="Search-Hit-action-button">{@html Enter}</button
                      >
                    </div>
                  </div></a
                >
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  </div>

  <div
    class="Search-Mask"
    class:hidden={!show}
    on:click|stopPropagation={showModel}
  />
{/if}
{#if $localizedThemeConfig.algolia}
  <div id="docsearch" />
{/if}

<style>
  .Search-Mask {
    background-color: #090a11cc;
    height: 100vh;
    left: 0;
    position: fixed;
    top: 0;
    width: 100vw;
    z-index: 200;
  }
  .hidden {
    display: none !important;
  }
  .Model {
    position: fixed;
    width: 50vw;
    background: var(--vbk--nav-item-bg-color);
    z-index: 300;
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 6px;
  }
  @media (min-width: 375px) {
    .Model {
      width: 80vw;
    }
  }

  .Search,
  .Search-Button-Keys {
    display: flex;
    align-items: center;
  }

  .Search-Button {
    align-items: center;
    background: var(--vbk--scrim-bg-color);
    color: var(--vbk--color-text);
    cursor: pointer;
    display: flex;
    border-radius: 40px !important;
    font-weight: 500;
    height: 36px;
    justify-content: space-between;
    padding: 0 8px;
    user-select: none;
    border: 2px solid transparent;
  }

  .Search-Button-Placeholder {
    padding: 0 12px;
  }

  .Search-Button-Key {
    align-items: center;
    background: var(--vbk--scrim-bg-color);
    color: var(--vbk--color-text);
    border-radius: 3px;
    box-shadow: inset 0 -2px 0 0 #282d55, inset 0 0 1px 1px #51577d,
      0 2px 2px 0 rgba(3, 4, 9, 0.3);
    display: flex;
    height: 20px;
    justify-content: center;
    margin-right: 0.4em;
    width: 20px;
    font-size: 0.9rem;
  }

  .Search-Header {
    padding: 12px 12px 0;
  }

  .Search-Form {
    align-items: center;
    background: var(--vbk--scrim-bg-color);
    border-radius: 4px;
    box-shadow: inset 0 0 0 2px var(--vbk--color-primary);
    display: flex;
    height: 50px;
    margin: 0;
    padding: 0 12px;
    position: relative;
    width: 100%;
  }

  .Search-MagnifierLabel {
    align-items: center;
    display: flex;
    justify-content: center;
  }

  .Search-Input {
    appearance: none;
    background: 0 0;
    border: 0;
    flex: 1;
    font: inherit;
    font-size: 1.2em;
    height: 100%;
    outline: 0;
    padding: 0 0 0 8px;
    width: 80%;
  }

  .Search-Dropdown {
    max-height: 60vh;
    overflow-y: overlay;
    padding: 12px;
  }

  .Search-Hit-source {
    background: var(--vbk--nav-item-bg-color);
    color: var(--vbk--color-primary);
    font-size: 0.85em;
    font-weight: 600;
    line-height: 32px;
    margin: 0 -4px;
    padding: 8px 4px 0;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .Search-Dropdown ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .Search-Hit {
    border-radius: 4px;
    display: flex;
    padding-bottom: 4px;
    position: relative;
  }

  .Search-Hit a {
    border-radius: 4px;
    display: block;
    padding-left: 12px;
    width: 100%;
    text-decoration: none;
  }

  .Search-Hit-Container {
    align-items: center;
    color: var(--vbk--nav-item-color);
    display: flex;
    flex-direction: row;
    height: 60px;
    padding: 0 12px 0 0;
  }

  .Search-Hit-content-wrapper {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    font-weight: 500;
    justify-content: center;
    line-height: 1.2em;
    margin: 0 8px;
    overflow-x: hidden;
    position: relative;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 80%;
  }

  .Search-Hit-Selected {
    background-color: var(--vbk--sidebar-item-hover-bg-color);
  }

  .Search-Hit-action {
    align-items: center;
    display: flex;
    height: 22px;
    width: 22px;
  }

  .Search-Hit-action + .Search-Hit-action {
    margin-left: 6px;
  }

  .Search-Hit-action-button {
    appearance: none;
    background: 0 0;
    border: 0;
    border-radius: 50%;
    color: inherit;
    cursor: pointer;
    padding: 2px;
  }

  .Search-Input:focus {
    box-shadow: none !important;
  }

  .Search-Button:hover,
  .Search-Button:active {
    border: 2px solid var(--vbk--color-primary);
  }

  .Search-Hit-action-button:focus,
  .Search-Hit-action-button:hover {
    background: rgba(0, 0, 0, 0.2);
    transition: background-color 0.1s ease-in;
  }
</style>
