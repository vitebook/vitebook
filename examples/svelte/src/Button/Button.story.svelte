<script lang="ts" context="module">
  import type { PageMeta } from '@vitebook/client';

  export const __pageMeta: PageMeta = {
    title: 'Button',
    description: 'My awesome button.',
  };
</script>

<script>
  import { Variant } from '@vitebook/client';
  import {
    ControlsAddon,
    EventsAddon,
    eventCallback,
  } from '@vitebook/client/addons';
  import Button from './Button.svelte';

  let title = 'Click Me';
  let disabled = false;
</script>

<Variant name="Default" description="The default button.">
  <Button {disabled} on:click={eventCallback}>{title}</Button>
</Variant>

<Variant
  name="Disabled"
  description="The disabled button."
  on:enter={() => {
    disabled = true;
  }}
  on:exit={() => {
    disabled = false;
  }}
>
  <Button {disabled}>{title}</Button>
</Variant>

<ControlsAddon>
  <label>
    Title <input type="text" bind:value={title} />
  </label>
  <label style="margin-top: 24px;">
    Disabled <input type="checkbox" bind:checked={disabled} />
  </label>
</ControlsAddon>

<EventsAddon />
