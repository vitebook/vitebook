<script>
  import CaretIcon from ':virtual/vitebook/icons/menu-caret?raw';

  import Addon from '../Addon.svelte';
  import { events } from './events';
  import { onDestroy } from 'svelte';

  export let title = 'Events';
  export let icon = undefined;

  let open = {};

  // Try to hide from the minifier.
  const l = window['console'];

  let lastLogged;
  function openEvent(event) {
    const isOpen = open[event.id] ?? false;

    open = { ...open, [event.id]: !isOpen };

    if (!isOpen && lastLogged !== event.ref) {
      l.log(event.ref);
      lastLogged = event.ref;
    }
  }

  onDestroy(() => {
    open = {};
    events.set([]);
  });
</script>

<Addon {title} {icon}>
  <div class="addon__events">
    <div class="addon__events__header">
      <button
        class="addon__events__clear"
        on:pointerdown={() => events.set([])}
        on:keydown={(e) => e.key === 'Enter' && events.set([])}>Clear</button
      >
    </div>

    {#each $events as event (event.id)}
      <div class="addon__event">
        <button
          class="addon__event__detail"
          on:pointerdown={() => openEvent(event)}
          on:keydown={(e) => e.key === 'Enter' && openEvent(e)}
        >
          <span class="addon__event__caret" class:open={open[event.id]}>
            {@html CaretIcon}
          </span>

          <span class="addon__event__type">{event.ref.type}</span>
        </button>

        <pre class:open={open[event.id]}>
        <code>
          {#if open}
              {event.stringify()}
            {/if}
        </code>
      </pre>
      </div>
    {/each}
  </div>
</Addon>

<style>
  .addon__events__header {
    display: flex;
    align-items: center;
    justify-content: end;
  }

  .addon__events__clear {
    padding: 0.375rem 0.5rem;
  }

  .addon__event {
    margin-top: 0.5rem;
  }

  .addon__event__detail {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0.375rem 0.5rem;
  }

  .addon__event__type {
    font-size: 1rem;
    display: inline-block;
    font-weight: 500;
    letter-spacing: 0.025rem;
  }

  .addon__event__caret {
    margin-top: 0.25rem;
    margin-right: 0.25rem;
    display: inline-block;
    transform: rotate(-90deg);
    transition: transform 0.1s linear;
  }

  .addon__event__caret.open {
    transform: rotate(0deg);
  }

  pre {
    margin: 0.75rem;
    display: none;
  }

  pre.open {
    display: block;
  }

  code {
    display: block;
    white-space: pre-wrap;
    max-height: 14rem;
    overflow-y: auto;
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover {
      text-decoration: none;
    }

    button:hover {
      color: var(--vbk--sidebar-item-hover-color);
      background-color: var(--vbk--sidebar-item-hover-bg-color);
    }
  }
</style>
