import { EventsAddon } from '@vitebook/client/addons';
import type { SvelteComponent } from 'svelte';
import { defineComponent, h, onBeforeUnmount, ref, watchEffect } from 'vue';

let hasInitialized = false;

export default defineComponent({
  name: 'EventsAddon',
  props: {
    title: String,
    icon: String,
  },
  setup({ title, icon }) {
    if (hasInitialized) return { setAddonRef: null };

    const addonRef = ref(null);

    function setAddonRef(v) {
      addonRef.value = v;
    }

    let component: SvelteComponent;
    watchEffect(() => {
      if (addonRef.value && !component) {
        component = new EventsAddon({
          target: addonRef.value,
          props: { title, icon },
        });
      } else {
        component?.$destroy();
      }
    });

    onBeforeUnmount(() => {
      component?.$destroy();
      addonRef.value = null;
      hasInitialized = false;
    });

    hasInitialized = true;

    return { setAddonRef };
  },
  render({ setAddonRef }) {
    return setAddonRef ? h('div', { ref: setAddonRef }) : null;
  },
});
