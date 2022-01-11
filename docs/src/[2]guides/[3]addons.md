<script>
import { Tabs, TabPanel } from '@vitebook/client/components/tabs';

const frameworks = ['Preact', 'Svelte', 'Vue'];
</script>

# Addons

Vitebook takes a much more relaxed approach to addons compared to Storybook. Like everything
else you've seen, we try to encourage composition over configuration. The idea is that we leave the
complexity at the framework level, and simply provide you the tools to quickly scaffold addons.

This comes with a few advantages in that:

- You can customize the addons to suit your project's needs.
- You're not limited to the addons we provide you.
- You can use the same tools/knowledge you use to build components to build an addon.
- You can achieve true two-way binding between your components and addons.

## Custom Addon

<Tabs values={frameworks} groupId="jsFramework">
<TabPanel value="Preact">

```tsx {3,11-14}
// FILE: Button.story.tsx
import Button from './Button';
import { Addon } from '@vitebook/preact/addons';
import CustomAddonIcon from './custom-addon-icon.svg?raw';

function ButtonStory() {
  return (
    <>
      <Button>My Button</Button>

      <Addon title="Custom Addon" icon={CustomAddonIcon}>
        {/** Addon content here. **/}
        <div>...</div>
      </Addon>
    </>
  );
}

ButtonStory.displayName = 'ButtonStory';

export default ButtonStory;
```

</TabPanel>

<TabPanel value="Svelte">

```svelte {4,10-13}
<script lang="ts">
// FILE: Button.story.svelte
import Button from './Button.svelte';
import { Addon } from '@vitebook/client/addons';
import CustomAddonIcon from './custom-addon-icon.svg?raw';
</script>

<Button>My Button</Button>

<Addon title="Custom Addon" icon={CustomAddonIcon}>
  <!-- Addon content here. -->
  <div>...</div>
</Addon>
```

</TabPanel>

<TabPanel value="Vue">

```vue {4,11-14}
<script setup lang="ts">
// FILE: Button.story.vue
import Button from './Button.vue';
import { Addon } from '@vitebook/vue/addons';
import CustomAddonIcon from './custom-addon-icon.svg?raw';
</script>

<template>
  <Button>My Button</Button>

  <Addon title="Custom Addon" :icon="CustomAddonIcon">
    <!-- Addon content here. -->
    <div>...</div>
  </Addon>
</template>
```

</TabPanel>
</Tabs>

## Controls Addon

<Tabs values={frameworks} groupId="jsFramework">
<TabPanel value="Preact">

```tsx {5,15-28}
// FILE: Button.story.tsx
import { useState } from 'preact/hooks';

import Button from './Button';
import { ControlsAddon } from '@vitebook/preact/addons';

function ButtonStory() {
  const [title, setTitle] = useState('');
  const [disabled, setDisabled] = useState(false);

  return (
    <>
      <Button disabled={disabled}>{title}</Button>

      <ControlsAddon>
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        Disabled
        <input
          type="checkbox"
          checked={disabled}
          onChange={(e) => setDisabled(e.target.checked)}
        />
      </ControlsAddon>
    </>
  );
}

ButtonStory.displayName = 'ButtonStory';

export default ButtonStory;
```

</TabPanel>

<TabPanel value="Svelte">

```svelte {4,14-21}
<script lang="ts">
// FILE: Button.story.svelte
import Button from './Button.svelte';
import { ControlsAddon } from '@vitebook/client/addons';

let props = {
  title: '',
  disabled: false
}
</script>

<Button {...props} />

<ControlsAddon>
  <div>
    Title <input type="text" bind\:value={props.title} />
  </div>
  <div>
    Disabled <input type="checkbox" bind\:checked={props.disabled} />
  </div>
</ControlsAddon>
```

</TabPanel>

<TabPanel value="Vue">

```vue {6,15-18}
<script setup lang="ts">
// FILE: Button.story.vue
import { ref } from 'vue';

import Button from './Button.vue';
import { ControlsAddon } from '@vitebook/vue/addons';

const title = ref('');
const disabled = ref(false);
</script>

<template>
  <Button :disabled="disabled">{{ title }}</Button>

  <ControlsAddon>
    <div>Title <input type="text" v-model="title" /></div>
    <div>Disabled <input type="checkbox" v-model="disabled" /></div>
  </ControlsAddon>
</template>
```

</TabPanel>
</Tabs>

## Events Addon

:::tip
Clicking the event in the addon panel will log the event to your console for deeper
inspection :detective:
:::

<Tabs values={frameworks} groupId="jsFramework">
<TabPanel value="Preact">

```tsx {3,10}
// FILE: Button.story.tsx
import Button from './Button';
import { eventCallback, EventsAddon } from '@vitebook/preact/addons';

function ButtonStory() {
  return (
    <>
      <Button onClick={eventCallback}>My Button</Button>

      <EventsAddon />
    </>
  );
}

ButtonStory.displayName = 'ButtonStory';

export default ButtonStory;
```

</TabPanel>

<TabPanel value="Svelte">

```svelte {4,9}
<script lang="ts">
// FILE: Button.story.svelte
import Button from './Button.svelte';
import { eventCallback, EventsAddon } from '@vitebook/client/addons';
</script>

<Button on\:click={eventCallback}>My Button</Button>

<EventsAddon />
```

</TabPanel>

<TabPanel value="Vue">

```vue {4,10}
<script setup lang="ts">
// FILE: Button.story.vue
import Button from './Button.vue';
import { eventCallback, EventsAddon } from '@vitebook/vue/addons';
</script>

<template>
  <Button @click="eventCallback">My Button</Button>

  <EventsAddon />
</template>
```

</TabPanel>
</Tabs>
