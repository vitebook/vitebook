import { defineComponent, h } from 'vue';

import Addon from './Addon';

export default defineComponent({
  name: 'ControlsAddon',
  props: {
    title: String,
    icon: String,
  },
  setup({ title, icon }) {
    return { title, icon };
  },
  render({ title, icon }) {
    return h(
      Addon,
      { title: title ?? 'Controls', icon },
      { default: () => this.$slots.default?.() },
    );
  },
});
