import { addons, getAddonPortalId } from '@vitebook/client/addons';
import { get } from 'svelte/store';
import {
  defineComponent,
  h,
  onBeforeUnmount,
  ref,
  Teleport,
  watchEffect,
} from 'vue';

export default defineComponent({
  name: 'Addon',
  props: {
    title: {
      type: String,
      required: true,
    },
    icon: String,
  },
  setup({ title, icon }) {
    const addon = addons.add({ title, icon });
    const teleportId = getAddonPortalId(addon);
    const ready = ref(false);

    const readyUnsub = addons.ready.subscribe(($ready) => {
      ready.value = $ready;
    });

    watchEffect(() => {
      if (ready.value) {
        const searchParams = new URL(location.href).searchParams;
        const addonParam = searchParams?.get('addon');
        if (addonParam) {
          const addon = get(addons)[addonParam];
          if (addon) {
            addons.setActive(addon);
          }
        }
      }
    });

    onBeforeUnmount(() => {
      readyUnsub();
      addons.delete(addon);
    });

    return { ready, teleportId };
  },
  render({ ready, teleportId }) {
    return ready
      ? h(Teleport, { to: `#${teleportId}` }, [this.$slots.default?.()])
      : null;
  },
});
